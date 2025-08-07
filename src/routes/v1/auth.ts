/**Node Modules */
import { Router } from "express";
import { body, cookie } from "express-validator";
import bcrypt from "bcrypt";

/** Controllers */
import register from "@/controllers/v1/auth/register";
import login from "@/controllers/v1/auth/login";
import refreshToken from "@/controllers/v1/auth/refresh_token";
import logout from "@/controllers/v1/auth/logout";

/** Middlewares */
import validationError from "@/middlewares/validationError";
import authenticate from "@/middlewares/authenticate";

/** Models */
import User from "@/models/user";

const router = Router();

router.post(
  "/register",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 charaters")
    .isEmail()
    .withMessage("Invalid email address.")
    .custom(async (value) => {
      const userExist = await User.exists({ email: value });
      if (userExist) {
        throw new Error("User already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 charaters long"),
  body("role")
    .optional()
    .isString()
    .withMessage("Role must be a string")
    .isIn(["admin", "user"])
    .withMessage("Role must be either admin or user"),
  validationError,
  register
);

router.post(
  "/login",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 charaters")
    .isEmail()
    .withMessage("Invalid email address.")
    .custom(async (value) => {
      const userExist = await User.exists({ email: value });
      if (!userExist) {
        throw new Error("User already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 charaters long")
    .custom(async (value, { req }) => {
      const { email } = req.body as { email: string };
      const user = await User.findOne({ email })
        .select("password")
        .lean()
        .exec();
      if (!user) {
        throw new Error("User email or password invalid");
      }

      const passwordMatch = await bcrypt.compare(value, user.password);

      if (!passwordMatch) {
        throw new Error("User email or password invalid");
      }
    }),
  validationError,
  login
);

router.post(
  "/refresh-token",
  cookie("refreshToken")
    .notEmpty()
    .withMessage("Refresh Token required")
    .isJWT()
    .withMessage("Invalid refresh token"),
  validationError,
  refreshToken
);

router.post("/logout", authenticate, logout);

export default router;

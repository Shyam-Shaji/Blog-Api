/**
 * Node Module
 */
import { Router } from "express";
import { param, query, body } from "express-validator";

/**
 * Middlewares
 */
import authenticate from "@/middlewares/authenticate";
import validationError from "@/middlewares/validationError";
import authorize from "@/middlewares/authorize";
import multer from "multer";
import uploadUserImages from "@/middlewares/uploadUserImages";
const upload = multer();

/**
 * Controllers
 */
import getCurrentUser from "@/controllers/v1/user/get_current_user";
import updateCurrentUser from "@/controllers/v1/user/update_current_user";
import deleteCurrentUser from "@/controllers/v1/user/delete_current_user";
import getAllUsers from "@/controllers/v1/user/get_all_users";
import getUser from "@/controllers/v1/user/get_user";
import deleteUser from "@/controllers/v1/user/delete_user";

/**
 * Models
 */
import User from "@/models/user";

const router = Router();

router.get(
  "/current",
  authenticate,
  authorize(["user", "admin"]),
  getCurrentUser
);

router.put(
  "/current",
  authenticate,
  authenticate,
  authorize(["user", "admin"]),
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_picture", maxCount: 1 },
  ]),
  uploadUserImages,
  body("username")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("User name must be less than 20 charaters")
    .custom(async (value) => {
      const userExits = await User.exists({ username: value });
      if (userExits) {
        throw Error("This username is already in use");
      }
    }),
  body("email")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Email must be less than 50 charaters")
    .isEmail()
    .withMessage("Invalid email address")
    .custom(async (value) => {
      const userExits = await User.exists({ email: value });
      if (userExits) {
        throw Error("This email is already in use");
      }
    }),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 charaters long"),
  body("first_name")
    .optional()
    .isLength({ max: 20 })
    .withMessage("First name must be less than 20 charaters"),
  body("last_name")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Last name must be less than 20 charaters"),
  body("profile_picture")
    .optional(),
  body("cover_picture")
    .optional(),
  body("bio")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Bio must be less than 100 charaters"),
  body(["website", "facebook", "instagram", "linkedin", "x", "youtube"])
    .optional()
    .isURL()
    .withMessage("Invalid URL")
    .isLength({ max: 100 })
    .withMessage("Url must be less than 100 charaters"),
  validationError,
  updateCurrentUser
);

router.delete(
  "/current",
  authenticate,
  authorize(["admin"]),
  deleteCurrentUser
);

router.get(
  "/",
  authenticate,
  authorize(["admin", "user"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 to 50"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a positive integer"),
  validationError,
  getAllUsers
);

router.get(
  "/:userId",
  authenticate,
  authorize(["user","admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  getUser
);

router.delete(
  "/:userId",
  authenticate,
  authorize(["admin"]),
  param("userId").notEmpty().isMongoId().withMessage("Invalid user ID"),
  validationError,
  deleteUser
);

export default router;

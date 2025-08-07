/**
 *Node Module
 */
import { Router } from "express";
import { param, query, body } from "express-validator";
import multer from "multer";

/**
 * Middleware
 */
import authenticate from "@/middlewares/authenticate";
import authorize from "@/middlewares/authorize";
import validationError from "@/middlewares/validationError";
import uploadBlogBanner from "@/middlewares/uploadBlogBanner";

/**
 * Controllers
 */
import createBlog from "@/controllers/v1/blog/create_blog";
import getAllBlogs from "@/controllers/v1/blog/get_all_blogs";

/**
 * Model
 */
import User from "@/models/user";

const upload = multer();

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  upload.single("banner_image"),
  uploadBlogBanner("post"),
  // body("banner_image").notEmpty().withMessage("Banner image required"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 180 })
    .withMessage("Title must be less than 180 charaters"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be one the value, draft or published"),
  validationError,

  createBlog
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
    .withMessage("Offset must be positive integer"),
  validationError,
  getAllBlogs
);

export default router;

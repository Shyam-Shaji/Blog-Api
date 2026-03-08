/**
 * Custom modules
 */
import { logger } from "@/lib/winston";

/**
 * Models
 */
import Blog from "@/models/blog";
import User from "@/models/user";

/**
 * Types
 */
import type { Request, Response } from "express";

const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const slug = req.params.slug;
    const user = await User.findById(userId).select("role").lean().exec();

    const blog = await Blog.findOne({slug})
    .select("-banner.publicId -_v")
    .populate("author", "-createdAt -updatedAt -_v")
    .lean()
    .exec();

    if(!blog){
      res.status(404).json({
        code: "NotFound",
        message: "Blog not found",
      });
      return;
    }

    if(blog.status === "draft" && user?.role === "user"){
      res.status(403).json({
        code: "AuthorizationError",
        message: "Access denied, insufficient permissions",
      });
      logger.warn("A user tried to access a draft blog", {
        userId,
        slug,
      });
      return;
    }

    res.status(200).json({
      blog,
    });
  } catch (err) {
    logger.error("Error while fetching blog by slug", err);
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
  }
};

export default getBlogBySlug;
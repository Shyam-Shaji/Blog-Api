/**
 * Custom Module
 */
import { logger } from "@/lib/winston";
import config from "@/config";

/**
 * Model
 */
import Blog from "@/models/blog";
import User from "@/models/user";

/**
 * Type
 */
import type { Request, Response } from "express";

interface QueryType {
  status?: "draft" | "published";
}

const getBlogsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset = parseInt(req.query.offset as string) || config.defaultResOffset;

    const currentUser = await User.findById(currentUserId).select("role").lean().exec();
    const query: QueryType = {};

    if (currentUser?.role === "user") {
      query.status = "published";
    }

    const total = await Blog.countDocuments({ author: userId, ...query });

    const blogs = await Blog.find({ author: userId, ...query })
      .select("-banner.publicId -_v")
      .populate("author", "-createdAt -updatedAt -_v")
      .limit(limit)
      .skip(offset)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    res.status(200).json({
      limit,
      offset,
      blogs,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error while fetching blogs by user", err);
  }
};

export default getBlogsByUser;
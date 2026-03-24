/**
 * Custom Module
 */
import { logger } from "@/lib/winston";

/**
 * Model
 */
import Blog from "@/models/blog";
import Comment from "@/models/comment";

/**
 * Types
 */
import { Request, Response } from "express";


const getCommentsByBlog = async (req: Request, res: Response): Promise<void> => {
    const {blogId} = req.params;
  try {
    const blog = await Blog.findById(blogId).select("_id").lean().exec();

    if(!blog){
        res.status(404).json({
            code: "BlogNotFound",
            message: "Blog not found",
        });
        return;
    }

    const allComments = await Comment.find({ blogId })
  .populate("userId", "firstName lastName")
  .sort({ createdAt: -1 })
  .lean()
  .exec();

    res.status(200).json({
        comments: allComments,
    });
    
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error retrieving comments", err);
  }
};

export default getCommentsByBlog;

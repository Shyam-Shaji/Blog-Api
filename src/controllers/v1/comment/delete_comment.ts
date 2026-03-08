import mongoose from "mongoose";

/**
 * Custom Module
 */
import { logger } from "@/lib/winston";

/**
 * Model
 */
import Comment from "@/models/comment";
import User from "@/models/user";
import Blog from "@/models/blog";

/**
 * Types
 */
import { Request, Response } from "express";


const deleteComment = async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.userId;
    const {commentId} = req.params;
  try {
    const comment = await Comment.findById(commentId).select("userId blogId").lean().exec();
    const user = await User.findById(currentUserId).select("role").lean().exec();
    
    if(!comment){
        res.status(404).json({
            code: "CommentNotFound",
            message: "Comment not found",
        });
        return;
    }

    const blog = await Blog.findById(comment.blogId).select("commentsCount").exec();

    if(!blog){
        res.status(404).json({
            code: "BlogNotFound",
            message: "Blog not found",
        });
        return;
    }
    
    if(!comment.userId?.equals(new mongoose.Types.ObjectId(currentUserId)) && user?.role !== "admin"){
        res.status(403).json({
            code: "AuthorizationError",
            message: "Access denied, insufficent permissions",
        });
        logger.warn('A user tried to delete a comment without permission',{
            userId: currentUserId,
            comment,
        });
        return;
    }
    
    await Comment.deleteOne({_id: commentId});
    logger.info('Comment delete successfully',{
        commentId,
    });

    
    blog.commentsCount--;
    await blog.save();

    logger.info('Blog comment count updated',{
        blogId: blog._id,
        commentsCount: blog.commentsCount,
    });

    res.sendStatus(204);

  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error deleting comment", err);
  }
};

export default deleteComment;

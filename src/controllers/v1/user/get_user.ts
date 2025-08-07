/**
 * Custom Module
 */
import { logger } from "@/lib/winston";

/**
 * Model
 */
import User from "@/models/user";

/**
 * Types
 */
import { Request, Response } from "express";

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-_v").exec();
    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }
    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error while getting a user");
  }
};

export default getUser;

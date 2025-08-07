/**
 * Custom Module
 */
import config from "@/config";
import { logger } from "@/lib/winston";
import user from "@/models/user";

/**
 * Model
 */
import User from "@/models/user";

/**
 * Types
 */
import type { Request, Response } from "express";

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offSet =
      parseInt(req.query.offset as string) || config.defaultResOffset;
    const total = await User.countDocuments();
    const users = await User.find()
      .select("-_v")
      .limit(limit)
      .skip(offSet)
      .lean()
      .exec();
    res.status(200).json({
      limit,
      offSet,
      total,
      users,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error while getting all users", err);
  }
};

export default getAllUsers;

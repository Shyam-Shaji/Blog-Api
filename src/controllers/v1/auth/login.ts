/**
 * Custom Modules
 */
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";
import config from "@/config";

/**
 * Models
 */
import User from "@/models/user";
import Token from "@/models/token";

/**
 * Types
 */
import type { Request, Response } from "express";
import type { IUser } from "@/models/user";

type userData = Pick<IUser, "email" | "password">;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as userData;
    const user = await User.findOne({ email })
      .select("username firstName lastName email password role")
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }

    //Generate acces token and refreshtoken for user
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    //store refreshtoken in db
    await Token.create({ token: refreshToken, userId: user._id });
    logger.info("Refresh token created for user", {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info("User registered successfully", user);
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error during user login", err);
  }
};

export default login;

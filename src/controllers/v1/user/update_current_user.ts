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
import type { Request, Response } from "express";

const updateCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  if (!req.body) {
    res.status(400).json({
      code: "BadRequest",
      message: "Request body is missing",
    });
    return;
  }

  const {
    username,
    email,
    password,
    first_name,
    last_name,
    profile_picture,
    cover_picture,
    bio,
    website,
    facebook,
    instagram,
    linkedin,
    x,
    youtube,
  } = req.body;

  try {
    const user = await User.findById(userId).select("-_v").exec();
    if (!user) {
      res.status(404).json({
        code: "NotFound",
        message: "User not found",
      });
      return;
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (first_name) user.firstName = first_name;
    if (last_name) user.lastName = last_name;
    if (profile_picture) user.profilePicture = profile_picture;
    if (cover_picture) user.coverPicture = cover_picture;
    if (bio) user.bio = bio;
    if (!user.socialLinks) {
      user.socialLinks = {};
    }
    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (instagram) user.socialLinks.instagram = instagram;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (x) user.socialLinks.x = x;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();

    logger.info("User update successfully", user);

    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });
    logger.error("Error while updating current user");
  }
};

export default updateCurrentUser;

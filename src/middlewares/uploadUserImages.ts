import { logger } from "@/lib/winston";
import uploadToCloudinary from "@/lib/cloudinary";
import type { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const uploadUserImages = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    next();
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  try {
    if (files.profile_picture) {
      const profileFile = files.profile_picture[0];
      if (profileFile.size > MAX_FILE_SIZE) {
        res.status(413).json({ code: "ValidationError", message: "Profile picture must be less than 2MB" });
        return;
      }
      const data = await uploadToCloudinary(profileFile.buffer);
      if (data) {
        req.body.profile_picture = data.secure_url;
      }
    }

    if (files.cover_picture) {
      const coverFile = files.cover_picture[0];
      if (coverFile.size > MAX_FILE_SIZE) {
        res.status(413).json({ code: "ValidationError", message: "Cover picture must be less than 2MB" });
        return;
      }
      const data = await uploadToCloudinary(coverFile.buffer);
      if (data) {
        req.body.cover_picture = data.secure_url;
      }
    }

    next();
  } catch (err: any) {
    logger.error("Error while uploading user images to cloudinary", err);
    res.status(500).json({ code: "ServerError", message: "Error uploading images" });
    return;
  }
};

export default uploadUserImages;

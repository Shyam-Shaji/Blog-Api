/**
 * Node Modules
 */
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
    youtube?: string;
  };
}

/**
 * User Schema
 */

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "User Name is required"],
      maxlength: [20, "Username must be less than 20 charaters"],
      unique: [true, "Username must be unique"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      maxlength: [50, "Email must be less than 50 charaters"],
      unique: [true, "Email must be unique"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "user"],
        message: "{VALUE} is not supported",
      },
      default: "user",
    },
    firstName: {
      type: String,
      maxlength: [20, "Firstname must be less than 20 charaters"],
    },
    lastName: {
      type: String,
      maxlength: [20, "Lastname must be less than 20 charaters"],
    },
    socialLinks: {
      website: {
        type: String,
        maxlength: [100, "Website address must be less than 100 charaters"],
      },
      facebook: {
        type: String,
        maxlength: [
          100,
          "Facebook profile url must be less than 100 charaters",
        ],
      },
      instagram: {
        type: String,
        maxlength: [
          100,
          "Instagram profile url must be less than 100 charaters",
        ],
      },
      linkedin: {
        type: String,
        maxlength: [
          100,
          "LinkedIn profile url must be less than 100 charaters",
        ],
      },
      x: {
        type: String,
        maxlength: [100, "X profile url must be less than 100 charaters"],
      },
      youtube: {
        type: String,
        maxlength: [100, "Youtube channel url must be less than 100 charaters"],
      },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  //Hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default model<IUser>("User", userSchema);

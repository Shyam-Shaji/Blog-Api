/**
 * Node Modules
 */
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

/**
 * Custom Module
 */

import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/lib/winston";

/**
 * Types
 */
import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";

/**
 *@functon authenticate
 *@description Middleware to verify the user's access token from the Autherization header
 *If the token is valid, the users ID is attached to the request object.
 *Otherwise, it return an appropriate error response.
 *@param {Request} req - Express request object. Expects a Bearer token in the Authorization header.
 *@param {Response} res -Express response object used to send error response if authentication fails.
 *@param {NextFunction} next - Express next function to pass control to the next middleware
 *@return {void}
 */

const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  //   console.log(authHeader);
  //if there is no bearer token, response with 401 Unauthorized
  if (!authHeader?.startsWith("Bearer")) {
    res.status(401).json({
      code: "AuthenticationError",
      message: "Access denied, no token provided",
    });
    return;
  }

  //split out the token from the 'Bearer' prefix
  const [_, token] = authHeader.split(" ");

  try {
    //verify the token and extract the userId from the payload
    const jwtPayload = verifyAccessToken(token) as { userId: Types.ObjectId };

    //Attach the userId to the request object for later use
    req.userId = jwtPayload.userId;

    //proeed to next middleware or route handler
    return next();
  } catch (err) {
    //handle expired token
    if (err instanceof TokenExpiredError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token expired, request a new one with refresh token",
      });
      return;
    }

    //handle invalid token error
    if (err instanceof JsonWebTokenError) {
      res.status(401).json({
        code: "AuthenticationError",
        message: "Access token invalid",
      });
      return;
    }

    //catch-all for other error
    res.status(500).json({
      code: "ServerError",
      message: "Internal server error",
      error: err,
    });

    logger.error("Error during authentication", err);
  }
};

export default authenticate;

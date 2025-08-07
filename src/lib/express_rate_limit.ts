/**Node Module */
import { rateLimit } from "express-rate-limit";

//configure rate-limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 60000, // 1 minutes time window for request limiting.
  limit: 60, // Limit each IP to 60 requests per `window` (here, per 1 minutes)./ Allow a maximum of 60 request per window per ip
  standardHeaders: "draft-8", // latest standard rate-limit header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers./ dissable deprecated x-ratelimit header.
  message: {
    error:
      "You have sent too many request in a given amount of time. Please try again later",
  },
});

export default limiter;

/** Node Modules */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

/** Custom Modules */
import config from "@/config";
import limiter from "@/lib/express_rate_limit";
import { connetToDatabse, disconnectFromDatabase } from "@/lib/mongoose";
import { logger } from "@/lib/winston";
import abc from "@/types/express";

/**Router */
import v1Routes from "@/routes/v1";

/**types */
import type { CorsOptions } from "cors";

/** Express app initial */
const app = express();

//configure CORS options
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === "development" ||
      !origin ||
      config.WHITELIST_ORGIINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS Error ${origin} is not allowded by CORS`),
        false
      );
      logger.warn(`CORS Error ${origin} is not allowded by CORS`);
    }
  },
};

//applay cors middleware
app.use(cors(corsOptions));

//Enable JSON request body parsing
app.use(express.json());

//Enable URL encoded request body parsing with extended mode
//'extended: true' allow rich object array via querystring library.
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//Enable response compression to reduce payload size and imporve performance
app.use(
  compression({
    threshold: 1024, //only compress response larger than 1KB
  })
);

//Use helment to enhance security by setting various HTTP headers
app.use(helmet());

//Apply rate limiting middleware to prevent excessive request and enhance security(express-rate-limit);
app.use(limiter);

//IIFE
(async () => {
  try {
    await connetToDatabse();

    app.use("/api/v1", v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server is running: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start the server", error);
    if (config.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

//Server shutdown
const handleServerShutDown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn("Server SHUTDOWN");
    process.exit(0);
  } catch (error) {
    logger.error("Error during server shutdown", error);
  }
};

process.on("SIGTERM", handleServerShutDown);
process.on("SIGINT", handleServerShutDown);

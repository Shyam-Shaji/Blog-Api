/** Node Module */
import mongoose from "mongoose";

/** Custom Modules */
import config from "@/config";
import { logger } from "@/lib/winston";

/** Types */
import type { ConnectOptions } from "mongoose";

/** Client option */
const clientOptions: ConnectOptions = {
  dbName: "blog-db",
  appName: "Blog API",
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

//Establish a connection to mongodb databse.
export const connetToDatabse = async (): Promise<void> => {
  if (!config.MONGO_URL) {
    throw new Error("MongoDB URI is not defined in the configuration");
  }

  try {
    await mongoose.connect(config.MONGO_URL, clientOptions);
    logger.info("Connected to the database successfully.", {
      uri: config.MONGO_URL, //mogouri
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    logger.error("Error connect to database");
  }
};

/** Disconnect from database */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnect from database successfully.", {
      uri: config.MONGO_URL, //mongouri
      options: clientOptions,
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    logger.error("Error disconnecting from database", err);
  }
};

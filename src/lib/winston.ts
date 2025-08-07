/** Node Modules */
import winston from "winston";

/** Custom Modules */
import config from "@/config";
const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

//Define the transports array to hold different logging transports
const transports: winston.transport[] = [];

if (config.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYY-MM-DD hh:mm:ss A" }),
        align(),
        printf(({ timestap, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : "";
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    })
  );
}

//create logger instance using winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL || "info", //set default log level to 'info'
  format: combine(timestamp(), errors({ stack: true }), json()), //use json format for log message
  transports,
  silent: config.NODE_ENV === "test", //disable logging in test environment
});

export { logger };

const winston = require("winston");
require("express-async-errors");

module.exports = function () {
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.printf((log) => log.message),
        handleExceptions: true,
      }),
      new winston.transports.File({
        filename: "combined.log",
        handleExceptions: true,
      }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: "rejections.log" }),
    ],
  });

  return logger;
};

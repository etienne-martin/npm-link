import { logger } from "./utils";

process.on("uncaughtException", err => {
  logger.error(err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err: any) => {
  logger.error(err?.message || err || "An unexpected error occurred.");
  process.exit(1);
});

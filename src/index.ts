import "./process-monitor";
import "./help";
import minimist from "minimist";
import { watch } from "chokidar";
import path from "path";
import { getIgnorePatterns, isIgnored } from "./ignore";
import { spawnWorker, terminateWorker } from "./worker";
import { logger } from "./utils";
import { getPackageJson } from "./utils/package-json";

const {
  _: [src, dest]
} = minimist(process.argv.slice(2));

const srcDir = path.resolve(src);
const destDir = path.resolve(dest);

getPackageJson(destDir);
require("console-clear")();

const watcher = watch(srcDir, {
  ignoreInitial: true,
  ignored: ["**/node_modules/**/*", "**/.git/**/*"],
  cwd: srcDir
});

const onChange = async (path: string) => {
  if ([".npmignore", ".gitignore"].includes(path)) {
    await getIgnorePatterns(srcDir);
  }

  if (isIgnored(path)) return;

  logger.event("detected change:", path);

  await terminateWorker();
  await spawnWorker({ srcDir, destDir });
};

watcher
  .on("add", onChange)
  .on("change", onChange)
  .on("unlink", onChange)
  .on("ready", () => logger.ready(`watching ${src} for changes`))
  .on("error", error => logger.error(`watcher error: ${error}`));

getIgnorePatterns(srcDir);
spawnWorker({ srcDir, destDir });

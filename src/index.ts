import "./process-monitor";
import minimist from "minimist";
import { watch } from "chokidar";
import path from "path";
import { getIgnorePatterns, isIgnored } from "./ignore";
import { spawnWorker } from "./worker";
import { logger } from "./utils";
import { getPackageJson } from "./utils/package-json";
import { help } from "./help";

const {
  _: [dest]
} = minimist(process.argv.slice(2));

if (!dest) help();

require("console-clear")();

const srcDir = process.cwd();
const destDir = path.resolve(dest);
const packageJson = getPackageJson(srcDir);

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

  await spawnWorker({ srcDir, destDir });
};

watcher
  .on("add", onChange)
  .on("change", onChange)
  .on("unlink", onChange)
  .on("ready", () =>
    logger.ready(
      `watching ${packageJson.name}@${packageJson.version} for changes`
    )
  )
  .on("error", error => logger.error(`watcher error: ${error}`));

getIgnorePatterns(srcDir);
spawnWorker({ srcDir, destDir });

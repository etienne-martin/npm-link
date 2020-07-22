import minimist from "minimist";
import { watch } from "chokidar";
import path from "path";
import { getIgnorePatterns, isIgnored } from "./ignore";
import { spawnWorker } from "./worker";

const {
  _: [dest]
} = minimist(process.argv.slice(2));
const srcDir = process.cwd();
const destDir = path.resolve(dest, "node_modules");

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

  console.log("detected change:", path);

  await spawnWorker({ srcDir, destDir });
};

watcher
  .on("add", onChange)
  .on("change", onChange)
  .on("unlink", onChange)
  .on("error", error => console.log(`Watcher error: ${error}`));

getIgnorePatterns(srcDir);
spawnWorker({ srcDir, destDir });

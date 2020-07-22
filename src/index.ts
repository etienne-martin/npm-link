import minimist from "minimist";
import { watch } from "chokidar";
import { debounce } from "ts-debounce";
import path from "path";
import fs from "fs-extra";
import PQueue from "p-queue";

import { execAsync, rmRf } from "./utils";
import { getIgnorePatterns, isIgnored } from "./ignore";

const {
  _: [dest]
} = minimist(process.argv.slice(2));
const srcDir = process.cwd();
const destDir = path.resolve(dest, "node_modules");
const queue = new PQueue({ concurrency: 1 });

// TODO: handle unhandledRejection and uncaughtException

const packageNameSelector = (archiveFilename: string) => {
  const parsedPath = path.parse(archiveFilename);

  return parsedPath.name
    .split("-")
    .slice(0, -1)
    .join("-");
};

const npmPack = async (srcDir: string) => {
  const stdout = await execAsync(`cd /tmp && npm pack ${srcDir}`);

  return stdout.trim();
};

// TODO: run that in a child process
const mirrorPackage = debounce(() => {
  return queue.add(async () => {
    console.log("------------------");
    console.log("Packing package...");
    const archiveFilename = await npmPack(srcDir);

    console.log("Packed");

    const archivePath = path.join("/tmp", archiveFilename);
    const packageName = packageNameSelector(archiveFilename);
    const destination = path.join(destDir, packageName);

    console.log("Mirroring package...");

    await rmRf(`${destination}`);
    await fs.mkdir(destination);
    await execAsync(`cd ${destination} && npm init -y`);

    console.log("Mirrored");

    console.log("Installing dependencies...");

    await execAsync(`cd ${destination} && \
npm install ${archivePath} \
--no-package-lock \
--only=prod \
--no-audit \
--no-save \
--force`);

    await fs.copy(
      path.join(destination, "node_modules", packageName),
      destination,
      {
        overwrite: true
      }
    );

    await rmRf(path.join(destination, "node_modules", packageName));

    console.log("Installed dependencies");
  });
}, 500);

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

  await mirrorPackage();
};

watcher
  .on("add", onChange)
  .on("change", onChange)
  .on("unlink", onChange)
  .on("error", error => console.log(`Watcher error: ${error}`));

getIgnorePatterns(srcDir);
mirrorPackage();

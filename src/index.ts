import minimist from "minimist";
import { watch } from "chokidar";
import { debounce } from "ts-debounce";
import path from "path";
import fs from "fs-extra";
import PQueue from "p-queue";
import { execAsync, rmRf } from "./utils";

const {
  _: [dest]
} = minimist(process.argv.slice(2));
const srcDir = process.cwd();
const destDir = path.resolve(dest, "node_modules");
const queue = new PQueue({ concurrency: 1 });

// TODO: handle unhandledRejection and uncaughtException

const mirrorPackage = () => {
  return queue.add(async () => {
    console.log("------------------");
    console.log("Packing package...");
    const archiveFilename = await execAsync(`cd /tmp && npm pack ${srcDir}`);

    console.log("Packed");

    const parsedPath = path.parse(archiveFilename.trim());
    const archivePath = path.join("/tmp", parsedPath.base);
    const packageName = parsedPath.name
      .split("-")
      .slice(0, -1)
      .join("-");
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
};

const watcher = watch(srcDir, {
  ignoreInitial: true
});

// TODO: ignore files that are in .npmignore
const onChange = debounce(mirrorPackage, 500);

watcher
  .on("add", onChange)
  .on("change", onChange)
  .on("unlink", onChange)
  .on("error", error => console.log(`Watcher error: ${error}`));

mirrorPackage();

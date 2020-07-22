import path, { sep } from "path";
import fs from "fs-extra";
import { execAsync, logger, rmRf } from "./utils";

const packageNameSelector = (archiveFilename: string) => {
  const parsedPath = path.parse(archiveFilename);

  return parsedPath.name
    .split("-")
    .slice(0, -1)
    .join("-");
};

const npmPack = async (srcDir: string) => {
  logger.wait("packaging...");

  const stdout = await execAsync(`cd /tmp && npm pack ${srcDir}`);

  logger.info("packaged successfully");

  return stdout.trim();
};

export const mirrorPackage = async ({
  srcDir,
  destDir
}: {
  srcDir: string;
  destDir: string;
}) => {
  const archiveFilename = await npmPack(srcDir);
  const archivePath = path.join("/tmp", archiveFilename);
  const packageName = packageNameSelector(archiveFilename);
  const destination = path.join(destDir, packageName);
  const destinationName = destDir.split(sep).slice(-2)[0];

  logger.wait(`installing package in ${destinationName}...`);

  await rmRf(`${destination}`);
  await fs.mkdir(destination);
  await execAsync(`cd ${destination} && npm init -y`);
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

  logger.info("installed successfully");
};

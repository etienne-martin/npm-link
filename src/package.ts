import path from "path";
import fs from "fs-extra";
import { execAsync, rmRf } from "./utils";

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

export const mirrorPackage = async ({
  srcDir,
  destDir
}: {
  srcDir: string;
  destDir: string;
}) => {
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
};

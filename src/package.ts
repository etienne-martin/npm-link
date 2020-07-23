import path from "path";
import fs from "fs-extra";
import { execAsync, logger } from "./utils";
import { getPackageJson } from "./utils/package-json";

const npmPack = async (srcDir: string) => {
  logger.wait("packaging...");

  const stdout = await execAsync(`cd /tmp && npm pack ${srcDir}`);

  logger.info("packaged successfully");

  const [packageName] = stdout
    .trim()
    .split("\n")
    .slice(-1);

  return path.join("/tmp", packageName);
};

export const mirrorPackage = async ({
  srcDir,
  destDir
}: {
  srcDir: string;
  destDir: string;
}) => {
  if (!(await fs.pathExists(path.join(srcDir, "package.json")))) {
    return logger.warn(`Could not locate a package.json at: ${srcDir}`);
  }

  const srcPackage = getPackageJson(srcDir);
  const destPackage = getPackageJson(destDir);
  const archivePath = await npmPack(srcDir);

  logger.wait(
    `installing ${srcPackage.name}@${srcPackage.version} in ${destPackage.name}@${destPackage.version}...`
  );

  await execAsync(`cd "${destDir}" && \
npm install "${archivePath}" \
--no-package-lock \
--only=prod \
--no-audit \
--no-save`);

  logger.ready("installed successfully");
};

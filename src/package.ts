import path from "path";
import fs from "fs-extra";
import { execAsync, logger, rmRf } from "./utils";
import { getPackageJson } from "./utils/package-json";

const npmPack = async (srcDir: string) => {
  logger.wait("packaging...");

  const stdout = await execAsync(`cd /tmp && npm pack ${srcDir}`);

  logger.info("packaged successfully");

  return path.join("/tmp", stdout.trim());
};

export const mirrorPackage = async ({
  srcDir,
  destDir
}: {
  srcDir: string;
  destDir: string;
}) => {
  const archivePath = await npmPack(srcDir);
  const srcPackage = getPackageJson(srcDir);
  const destPackage = getPackageJson(destDir);
  const destNodeModules = path.join(destDir, "node_modules");
  const installationPath = path.join(destDir, "node_modules", srcPackage.name);

  logger.wait(
    `installing ${srcPackage.name}@${srcPackage.version} in ${destPackage.name}@${destPackage.version}...`
  );

  await rmRf(`${installationPath}`);

  if (!(await fs.pathExists(destNodeModules))) {
    await fs.mkdir(destNodeModules);
  }

  await fs.mkdir(installationPath);
  await execAsync(`cd ${installationPath} && npm init -y`);
  await execAsync(`cd ${installationPath} && \
npm install ${archivePath} \
--no-package-lock \
--only=prod \
--no-audit \
--no-save \
--force`);

  await fs.copy(
    path.join(installationPath, "node_modules", srcPackage.name),
    installationPath,
    {
      overwrite: true
    }
  );

  await rmRf(path.join(installationPath, "node_modules", srcPackage.name));

  logger.ready("installed successfully");
};

import _parseGitIgnore from "parse-gitignore";
import minimatch from "minimatch";
import fs from "fs-extra";
import path from "path";

let ignorePatterns: string[] = [];

const parseIgnoreFile = async (path: string) => {
  return _parseGitIgnore(await fs.readFile(path, "utf8"));
};

// TODO: support the file property in package.json
// https://docs.npmjs.com/files/package.json#files
export const getIgnorePatterns = async (srcDir: string) => {
  const npmignorePath = path.join(srcDir, ".npmignore");
  const gitignorePath = path.join(srcDir, ".gitignore");

  if (await fs.pathExists(npmignorePath)) {
    ignorePatterns = await parseIgnoreFile(npmignorePath);
    return;
  }

  if (await fs.pathExists(gitignorePath)) {
    ignorePatterns = await parseIgnoreFile(gitignorePath);
    return;
  }
};

export const isIgnored = (path: string) => {
  for (const ignorePattern of ignorePatterns) {
    if (minimatch(path, ignorePattern)) return true;

    for (const filename of path.split("/")) {
      if (minimatch(filename, ignorePattern)) return true;
    }
  }

  return false;
};

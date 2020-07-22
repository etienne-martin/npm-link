import path from "path";
import { nodeRequire } from "./require";

export const getPackageJson = (dir: string) => {
  try {
    return nodeRequire(path.join(dir, "package.json"));
  } catch {
    throw new Error(`Could not locate a package.json at: ${dir}`);
  }
};

import rimraf from "rimraf";

export const rmRf = (path: string) => {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) return reject(err);

      resolve();
    });
  });
};

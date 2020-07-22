import { exec } from "child_process";

export const execAsync = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) return reject(stdout);

      resolve(stdout);
    });
  });
};

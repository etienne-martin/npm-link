import { exec } from "child_process";

export const execAsync = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(stdout || stderr);

      resolve(stdout);
    });
  });
};

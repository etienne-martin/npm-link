import "./process-monitor";
import { parentPort, Worker } from "worker_threads";
import path from "path";
import { debounce } from "ts-debounce";
import { mirrorPackage } from "./package";

const CWD = path.resolve(process.mainModule?.filename || "", "../../");
const WORKER_PATH = path.resolve(CWD, "dist/worker.js");
let worker: Worker | null = null;

export const terminateWorker = async () => {
  if (!worker) return;

  worker.removeAllListeners();

  await worker.terminate();
  worker = null;
};

export const spawnWorker = debounce(async ({ srcDir, destDir }) => {
  await terminateWorker();

  worker = new Worker(WORKER_PATH);

  worker.once("message", terminateWorker);
  worker.postMessage({ srcDir, destDir });
}, 500);

if (parentPort) {
  parentPort.once(
    "message",
    async ({ srcDir, destDir }: { srcDir: string; destDir: string }) => {
      await mirrorPackage({ srcDir, destDir });
      parentPort?.postMessage("job done");
    }
  );
}

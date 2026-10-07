import { execFile } from "node:child_process";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { checkPort, root } from "./setup.mjs";

const exec = promisify(execFile);

async function listeners(port) {
  try {
    const { stdout } = await exec("lsof", [
      "-nP",
      `-iTCP:${port}`,
      "-sTCP:LISTEN",
      "-t",
    ]);
    return [...new Set(stdout.trim().split(/\s+/).map(Number))];
  } catch (error) {
    if (error.code === 1 && !error.stdout && !error.stderr) return [];
    throw error;
  }
}

export async function releaseDevPorts(ports = [4321, 3001], cwd = root) {
  if (process.platform === "win32")
    throw new Error("dev:force requires macOS or Linux with lsof installed.");
  const allowed = await Promise.all(
    ["apps/web", "apps/cms"].map((dir) => realpath(path.join(cwd, dir))),
  );
  const pids = new Set();
  for (const port of ports) {
    for (const pid of await listeners(port)) {
      const { stdout } = await exec("lsof", [
        "-a",
        "-p",
        String(pid),
        "-d",
        "cwd",
        "-Fn",
      ]);
      const directory = stdout
        .split("\n")
        .find((line) => line.startsWith("n"))
        ?.slice(1);
      if (!directory || !allowed.includes(await realpath(directory)))
        throw new Error(
          `Port ${port} belongs to another project; stop it manually.`,
        );
      pids.add(pid);
    }
  }
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  }
  for (let attempt = 0; attempt < 100; attempt++) {
    const results = await Promise.allSettled(ports.map(checkPort));
    if (results.every((result) => result.status === "fulfilled")) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Development servers did not stop within 10 seconds.");
}

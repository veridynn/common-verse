process.env.ASTRO_NODE_AUTOSTART = "disabled";

const { startServer } = await import("../../apps/web/dist/server/entry.mjs");
const running = startServer();
await running.done;

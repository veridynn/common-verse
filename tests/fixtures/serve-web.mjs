// Production SSR must use the runtime secret, not the build-time value.
process.env.PREVIEW_SECRET =
  process.env.PLAYWRIGHT_PREVIEW_SECRET ?? "test-preview";
process.env.ASTRO_NODE_AUTOSTART = "disabled";

const { startServer } = await import("../../apps/web/dist/server/entry.mjs");
const running = startServer();
await running.done;

const { AgentClient } = require('agents/client'); // Node 22 supports require() of ES modules under certain flags or conditions if package is dual or dynamic import works. But wait, here we can use dynamic import to be absolutely safe.
(async () => {
  const { AgentClient } = await import('agents/client');
  console.log("Connecting using AgentClient...");
  const client = new AgentClient({
    host: "127.0.0.1:8787",
    agent: "EntropicCanvasAgent",
    name: "test-room"
  });

  client.addEventListener("open", () => {
    console.log("WebSocket connection opened!");
  });

  client.addEventListener("message", (e) => {
    console.log("Message received:", e.data);
  });

  client.addEventListener("error", (e) => {
    console.error("WebSocket error:", e);
  });

  client.addEventListener("close", (e) => {
    console.log("WebSocket closed:", e.code, e.reason);
  });

  console.log("Waiting for client to be ready...");
  try {
    await client.ready;
    console.log("Client is ready! Initial State:", client.state);
  } catch (err) {
    console.error("Failed to connect:", err);
  } finally {
    client.close();
  }
})();

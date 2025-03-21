import { exec } from "child_process";

// This script ensures that API routes are compiled and won't cause
// an unexpected page refresh from the frontend.

const routes = [
  "http://localhost:3000/api/communes/search?q=paris",
  "http://localhost:3000/api/auth/session",
];

async function waitForServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const check = () => {
      exec("curl -s http://localhost:3000/healthz", (error) => {
        if (!error) {
          resolve(true);
        } else {
          setTimeout(check, 1000);
        }
      });
    };
    check();
  });
}

async function warmRoutes() {
  console.log("⏳ Waiting for server to start...");
  await waitForServer();
  console.log("🔥 Warming up API routes...");

  for (const route of routes) {
    exec(`curl -s ${route} > /dev/null`, (error) => {
      if (!error) {
        console.log(`✓ Warmed up ${route}`);
      }
    });
  }
}

// Only run if called directly
if (require.main === module) {
  warmRoutes();
}

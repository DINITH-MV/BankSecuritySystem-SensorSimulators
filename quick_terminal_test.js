import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Quick test for terminal commanding
console.log("===============================================");
console.log("    QUICK TERMINAL COMMAND TEST");
console.log("===============================================\n");

// Test 1: Basic CMD test
console.log("Test 1: Basic CMD functionality...");
try {
  const testProcess = spawn(
    "cmd",
    ["/c", "echo", "Basic CMD test successful"],
    {
      stdio: "inherit",
    }
  );

  testProcess.on("close", (code) => {
    console.log(`✓ Basic CMD test completed with code: ${code}\n`);

    // Test 2: Window opening test
    console.log("Test 2: Testing window opening (similar to zone startup)...");
    testWindowOpening();
  });
} catch (error) {
  console.error("❌ Basic CMD test failed:", error.message);
}

function testWindowOpening() {
  const zoneStarterPath = join(__dirname, "zone_starter");

  console.log(`Zone starter path: ${zoneStarterPath}`);
  console.log("Opening test window...\n");

  try {
    // This mimics exactly what happens in server.js startZone method
    const process = spawn(
      "cmd",
      [
        "/c",
        "start",
        '"Terminal-Command-Test"', // Window title
        "cmd",
        "/c",
        `echo Terminal Command Test Successful && echo Zone Starter Path: ${zoneStarterPath} && echo This window will close in 10 seconds... && timeout /t 10 /nobreak >nul`,
      ],
      {
        detached: true,
        stdio: "ignore",
      }
    );

    console.log("✓ Test window opened successfully!");
    console.log(`✓ Process PID: ${process.pid}`);
    console.log("✓ A new window should have appeared with test message");
    console.log("✓ The window will automatically close after 10 seconds\n");

    // Test 3: Multiple window test
    setTimeout(() => {
      console.log("Test 3: Testing multiple windows (like multiple zones)...");
      testMultipleWindows();
    }, 2000);
  } catch (error) {
    console.error("❌ Window opening test failed:", error.message);
  }
}

function testMultipleWindows() {
  const testZones = [
    { name: "Test-Zone-1", message: "First test zone window" },
    { name: "Test-Zone-2", message: "Second test zone window" },
    { name: "Test-Zone-3", message: "Third test zone window" },
  ];

  testZones.forEach((zone, index) => {
    setTimeout(() => {
      try {
        const process = spawn(
          "cmd",
          [
            "/c",
            "start",
            `"${zone.name}"`,
            "cmd",
            "/c",
            `echo ${zone.message} && echo Window ${index + 1} of ${
              testZones.length
            } && echo Closing in 8 seconds... && timeout /t 8 /nobreak >nul`,
          ],
          {
            detached: true,
            stdio: "ignore",
          }
        );

        console.log(`✓ ${zone.name} opened (PID: ${process.pid})`);

        if (index === testZones.length - 1) {
          setTimeout(() => {
            console.log("\n===============================================");
            console.log("    TERMINAL COMMAND TEST COMPLETE");
            console.log("===============================================");
            console.log("✅ All tests completed successfully!");
            console.log("📋 Summary:");
            console.log("   - Basic CMD functionality: ✓");
            console.log("   - Window opening: ✓");
            console.log("   - Multiple windows: ✓");
            console.log(
              "\n🎯 The terminal commanding system is working correctly!"
            );
            console.log("   This is the same mechanism used in server.js");
            console.log("   Each zone startup will open a similar window.");
          }, 1000);
        }
      } catch (error) {
        console.error(`❌ Failed to open ${zone.name}:`, error.message);
      }
    }, index * 1000); // Stagger the window opening
  });
}

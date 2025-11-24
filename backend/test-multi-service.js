/**
 * BACKEND API TESTING SCRIPT
 *
 * This script tests the multi-service booking endpoints
 * Run this with: node backend/test-multi-service.js
 *
 * Make sure your backend server is running before executing this script.
 */

const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/bookings";

// Test scenarios
const testScenarios = [
  {
    name: "Valid: UV Graphene + Interior + Engine",
    services: [
      "UV Graphene Ceramic Coating",
      "Modernized Interior Detailing",
      "Modernized Engine Detailing",
    ],
    expectedValid: true,
    expectedDuration: 7, // 4 + 1.5 + 1.5
  },
  {
    name: "Invalid: UV Graphene + Powder Coating",
    services: ["UV Graphene Ceramic Coating", "Powder Coating"],
    expectedValid: false,
  },
  {
    name: "Invalid: VIP + SPA",
    services: ["Moto/Oto VIP", "Full Moto/Oto SPA"],
    expectedValid: false,
  },
  {
    name: "Valid: Powder + Interior",
    services: ["Powder Coating", "Modernized Interior Detailing"],
    expectedValid: true,
    expectedDuration: 3.5, // 2 + 1.5
  },
  {
    name: "Valid: Single Service - VIP",
    services: ["Moto/Oto VIP"],
    expectedValid: true,
    expectedDuration: 3,
  },
  {
    name: "Invalid: VIP + Interior + Engine",
    services: [
      "Moto/Oto VIP",
      "Modernized Interior Detailing",
      "Modernized Engine Detailing",
    ],
    expectedValid: false,
  },
];

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Test validation endpoint
async function testServiceValidation() {
  console.log(
    `\n${colors.cyan}=== TESTING SERVICE VALIDATION ENDPOINT ===${colors.reset}\n`
  );

  for (const scenario of testScenarios) {
    try {
      const response = await axios.post(`${BASE_URL}/validate-services`, {
        services: scenario.services,
      });

      const data = response.data.data;
      const passed = data.valid === scenario.expectedValid;

      if (passed && scenario.expectedValid) {
        const durationMatch = data.totalDuration === scenario.expectedDuration;
        if (durationMatch) {
          console.log(`${colors.green}✓ PASS:${colors.reset} ${scenario.name}`);
          console.log(`  Duration: ${data.totalDuration} hours`);
        } else {
          console.log(
            `${colors.yellow}⚠ PARTIAL:${colors.reset} ${scenario.name}`
          );
          console.log(
            `  Expected duration: ${scenario.expectedDuration}, Got: ${data.totalDuration}`
          );
        }
      } else if (passed && !scenario.expectedValid) {
        console.log(`${colors.green}✓ PASS:${colors.reset} ${scenario.name}`);
        console.log(`  Error: ${data.error}`);
      } else {
        console.log(`${colors.red}✗ FAIL:${colors.reset} ${scenario.name}`);
        console.log(
          `  Expected valid: ${scenario.expectedValid}, Got: ${data.valid}`
        );
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR:${colors.reset} ${scenario.name}`);
      console.log(`  ${error.message}`);
    }
  }
}

// Test services catalog endpoint
async function testServicesCatalog() {
  console.log(
    `\n${colors.cyan}=== TESTING SERVICES CATALOG ENDPOINT ===${colors.reset}\n`
  );

  try {
    const response = await axios.get(`${BASE_URL}/services-catalog`);
    const data = response.data.data;

    if (data.services && Array.isArray(data.services)) {
      console.log(
        `${colors.green}✓ PASS:${colors.reset} Services catalog retrieved`
      );
      console.log(`  Total services: ${data.services.length}`);
      console.log(
        `  Shop hours: ${data.shopHours.open} - ${data.shopHours.close}`
      );

      console.log(`\n  ${colors.blue}Available Services:${colors.reset}`);
      data.services.forEach((service) => {
        console.log(
          `    • ${service.name} (${service.duration}h) - ${service.category}`
        );
      });
    } else {
      console.log(
        `${colors.red}✗ FAIL:${colors.reset} Invalid response structure`
      );
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR:${colors.reset} ${error.message}`);
  }
}

// Test available slots endpoint
async function testAvailableSlots() {
  console.log(
    `\n${colors.cyan}=== TESTING AVAILABLE SLOTS ENDPOINT ===${colors.reset}\n`
  );

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split("T")[0];

  const testCases = [
    {
      name: "No services (legacy mode)",
      params: {},
      expectSlots: true,
    },
    {
      name: "Single service (2 hours)",
      params: { services: JSON.stringify(["Powder Coating"]) },
      expectSlots: true,
    },
    {
      name: "Multi-service (7 hours)",
      params: {
        services: JSON.stringify([
          "UV Graphene Ceramic Coating",
          "Modernized Interior Detailing",
          "Modernized Engine Detailing",
        ]),
      },
      expectSlots: true,
    },
  ];

  for (const testCase of testCases) {
    try {
      const response = await axios.get(
        `${BASE_URL}/available-slots/${dateString}`,
        {
          params: testCase.params,
        }
      );

      const data = response.data.data;

      if (data.availableSlots && Array.isArray(data.availableSlots)) {
        console.log(`${colors.green}✓ PASS:${colors.reset} ${testCase.name}`);
        console.log(`  Available slots: ${data.availableSlots.length}`);

        if (data.totalDuration) {
          console.log(`  Duration: ${data.totalDuration} hours`);
          if (
            data.availableSlots.length > 0 &&
            data.availableSlots[0].endTime
          ) {
            console.log(
              `  Sample slot: ${data.availableSlots[0].startTime} - ${data.availableSlots[0].endTime}`
            );
          }
        }
      } else {
        console.log(`${colors.red}✗ FAIL:${colors.reset} ${testCase.name}`);
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR:${colors.reset} ${testCase.name}`);
      console.log(`  ${error.message}`);
    }
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.yellow}`);
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║  MULTI-SERVICE BOOKING BACKEND API TESTS       ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log(colors.reset);

  try {
    await testServiceValidation();
    await testServicesCatalog();
    await testAvailableSlots();

    console.log(
      `\n${colors.yellow}═══════════════════════════════════════════════${colors.reset}\n`
    );
    console.log(`${colors.green}✓ All tests completed${colors.reset}\n`);
  } catch (error) {
    console.log(
      `\n${colors.red}✗ Test suite failed: ${error.message}${colors.reset}\n`
    );
  }
}

// Run tests
runTests();

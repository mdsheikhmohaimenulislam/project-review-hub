import "dotenv/config";
import config from "./config/index.ts";

import app from "./app.ts";
import { prisma } from "./libs/prisma.ts";
import { seedMENTOR } from "./utils/seed.ts";

const PORT = config.port;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    await seedMENTOR();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();

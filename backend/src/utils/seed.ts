import bcrypt from "bcryptjs";
import { prisma } from "../libs/prisma.ts";
import { UserRole } from "../../generated/prisma/enums.ts";
import config from "../config/index.ts";

// Create tester MENTOR
export const seedMENTOR = async (): Promise<void> => {
  const name = config.MENTOR_NAME?.trim();
  const email = config.MENTOR_EMAIL?.trim().toLowerCase();
  const password = config.MENTOR_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "MENTOR_NAME, MENTOR_EMAIL and MENTOR_PASSWORD are missing in the .env file",
    );
  }

  const existingMentor = await prisma.user.findFirst({
    where: {
      role: UserRole.MENTOR,
    },
    select: {
      id: true,
    },
  });

  if (existingMentor) {
    console.log("Mentor already exists!");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const mentor = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: UserRole.MENTOR,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Mentor account ready:", mentor);
};

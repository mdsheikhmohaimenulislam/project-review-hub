
import type { UserRole } from "../../../generated/prisma/enums.ts";

export interface ILoginUserPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface IRequestUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

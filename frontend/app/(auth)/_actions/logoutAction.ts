
"use server";

import { logout } from "@/lib/Logout";

export async function logoutAction() {
  return await logout();
}

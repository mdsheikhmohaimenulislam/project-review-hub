"use server";

import { cookies } from "next/headers";
import { getMe, login, register } from "@/lib/auth.service";
import type {
  LoginPayload,
  RegisterValues,
} from "@/lib/auth.service";

export async function loginAction(values: LoginPayload) {
  try {
    const result = await login(values);

    if (!result.success) {
      return result;
    }

    const accessToken = result.data?.accessToken;

    if (!accessToken) {
      return {
        ...result,
        success: false,
        message: "Access token missing from login response.",
      };
    }

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return result;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return {
      success: false,
      message: "Unable to connect to the server",
    };
  }
}

export async function registerAction(values: RegisterValues) {
  try {
    return await register(values);
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return {
      success: false,
      message: "Unable to connect to the server",
    };
  }
}

export async function getMeAction() {
  try {
    return await getMe();
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return {
      success: false,
      message: "Unable to connect to the server",
    };
  }
}
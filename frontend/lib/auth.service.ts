
import { cookies } from "next/headers";
import { serverUrl } from "./serverUrl";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

async function getErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data.message || "Something went wrong";
  } catch {
    return "Unable to connect to the server";
  }
}

export async function login(values: LoginPayload) {
  const res = await fetch(`${serverUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      success: false,
      message: await getErrorMessage(res),
    };
  }

  return res.json();
}

export async function register(values: RegisterValues) {
  const res = await fetch(`${serverUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      success: false,
      message: await getErrorMessage(res),
    };
  }

  return res.json();
}

export async function getMe() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return {
      success: false,
      message: "You are not logged in",
    };
  }

  const res = await fetch(`${serverUrl}/auth/me`, {
    method: "GET",
    headers: {
      Cookie: `accessToken=${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      success: false,
      message: await getErrorMessage(res),
    };
  }

  return res.json();
}

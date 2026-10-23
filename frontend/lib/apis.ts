
import { cookies } from "next/headers";
import { serverUrl } from "@/lib/serverUrl";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const response = await fetch(`${serverUrl}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `accessToken=${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = result as { message?: string } | null;
    throw new Error(error?.message || "Request failed");
  }

  return result as T;
}

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: {
    email: string;
    password: string;
  }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request("/auth/me"),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),
};
// submition & reviws sceion
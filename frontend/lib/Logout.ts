import { cookies } from "next/headers";
import { serverUrl } from "./serverUrl";

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  try {
    if (token) {
      await fetch(`${serverUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `accessToken=${token}`,
        },
        cache: "no-store",
      });
    }

    cookieStore.delete("accessToken");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    // Clear the local session even if the backend is unavailable.
    cookieStore.delete("accessToken");

    return {
      success: true,
      message: "Logged out from this session",
    };
  }
}

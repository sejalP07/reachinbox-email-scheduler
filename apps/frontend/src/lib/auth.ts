import { api } from "./api";
import type { CurrentUserResponse } from "@/types/user";

export async function getCurrentUser() {
  const response =
    await api.get<CurrentUserResponse>(
      "/api/auth/me",
    );

  return response.data.data;
}

export function loginWithGoogle() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000";

  window.location.href =
    `${apiUrl}/api/auth/google`;
}

export async function logout() {
  await api.post("/api/auth/logout");
}
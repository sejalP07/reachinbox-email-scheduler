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
  window.location.href = "/api/auth/google";
}

export async function logout() {
  await api.post("/api/auth/logout");
}
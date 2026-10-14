"use server";

import { signIn } from "@/auth";

export async function signUpWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

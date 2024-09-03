"use server";
import { x } from "../x";

export async function signInAction() {
  await x.auth.signIn();
}

export async function signOutAction() {
  await x.auth.signOut();
}

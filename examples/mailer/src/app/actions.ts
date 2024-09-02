"use server";
import { x } from "../x";

export async function signInAction() {
  await x.get("auth").signIn();
}

export async function signOutAction() {
  await x.get("auth").signOut();
}

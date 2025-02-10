"use client";

import { useEffect } from "react";
import { x } from "../x/client";

export function ClientPage() {
  console.log("client x", x);

  useEffect(() => {
    console.log("effect x", x);
  });
  return <p>Hello from the client</p>;
}

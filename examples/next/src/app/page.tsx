import { x } from "../x/server";
import { ClientPage } from "./page.client";

export default async function Home() {
  console.log("server x", x);
  return (
    <main>
      <h1>Hello world</h1>
      <ClientPage />
    </main>
  );
}

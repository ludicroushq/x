import { x } from "../x";

export default async function Home() {
  await x.get("db").pageLoad.create({});
  const totalVisits = await x.get("db").pageLoad.count();
  return (
    <main>
      <h1>Hello Prisma</h1>
      <p>
        Total visits:
        {totalVisits}
      </p>
    </main>
  );
}

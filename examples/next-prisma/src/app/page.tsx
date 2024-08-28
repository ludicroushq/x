import { x } from "../x";

export default async function Home() {
  await x.db.pageLoad.create({});
  const totalVisits = await x.db.pageLoad.count();
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

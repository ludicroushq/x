import PgBoss from "pg-boss";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const boss = new PgBoss(process.env.DATABASE_URL!);

import { drizzle } from "drizzle-orm/better-sqlite3";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import Database from "better-sqlite3";
import { expect, it, beforeEach, afterEach } from "vitest";
import { createX } from "@xframework/x";
import { DrizzleAdapter } from "../index";

// Test schema
const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content"),
  authorId: integer("author_id").references(() => users.id),
});

const schema = { users, posts };

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

beforeEach(() => {
  // Create in-memory SQLite database for testing
  sqlite = new Database(":memory:");
  db = drizzle(sqlite, { schema });

  // Create tables
  sqlite.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    );

    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      author_id INTEGER REFERENCES users(id)
    );
  `);
});

afterEach(() => {
  sqlite.close();
});

it("should work with basic Drizzle setup", async () => {
  const x = createX()
    .syncAdapter("db", () => new DrizzleAdapter({ db }))
    .build();

  // Test that we can access the database
  expect(x.db).toBeDefined();
  expect(x._.adapters.db).toBeInstanceOf(DrizzleAdapter);
});

it("should allow database operations through the adapter", async () => {
  const x = createX()
    .syncAdapter("db", () => new DrizzleAdapter({ db }))
    .build();

  // Insert a user
  const insertedUser = await x.db
    .insert(users)
    .values({
      name: "John Doe",
      email: "john@example.com",
    })
    .returning();

  expect(insertedUser).toHaveLength(1);
  expect(insertedUser[0]?.name).toBe("John Doe");
  expect(insertedUser[0]?.email).toBe("john@example.com");

  // Query the user
  const queriedUsers = await x.db
    .select()
    .from(users)
    .where(eq(users.name, "John Doe"));
  expect(queriedUsers).toHaveLength(1);
  expect(queriedUsers[0]?.name).toBe("John Doe");
});

it("should work with schema and relations", async () => {
  const x = createX()
    .syncAdapter("db", () => new DrizzleAdapter({ db }))
    .build();

  // Insert a user
  const user = await x.db
    .insert(users)
    .values({
      name: "Jane Doe",
      email: "jane@example.com",
    })
    .returning();

  // Insert a post for that user
  const post = await x.db
    .insert(posts)
    .values({
      title: "My First Post",
      content: "Hello, world!",
      authorId: user[0]?.id,
    })
    .returning();

  expect(post).toHaveLength(1);
  expect(post[0]?.title).toBe("My First Post");
  expect(post[0]?.authorId).toBe(user[0]?.id);

  // Query posts with user data
  const postsWithUsers = await x.db
    .select({
      postTitle: posts.title,
      postContent: posts.content,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id));

  expect(postsWithUsers).toHaveLength(1);
  expect(postsWithUsers[0]?.postTitle).toBe("My First Post");
  expect(postsWithUsers[0]?.authorName).toBe("Jane Doe");
});

it("should work with transactions", async () => {
  const x = createX()
    .syncAdapter("db", () => new DrizzleAdapter({ db }))
    .build();

  // Test transaction
  const result = await x.db.transaction(async (tx) => {
    const user = await tx
      .insert(users)
      .values({
        name: "Transaction User",
        email: "transaction@example.com",
      })
      .returning();

    const post = await tx
      .insert(posts)
      .values({
        title: "Transaction Post",
        content: "This was created in a transaction",
        authorId: user[0]?.id,
      })
      .returning();

    return { user: user[0], post: post[0] };
  });

  expect(result.user?.name).toBe("Transaction User");
  expect(result.post?.title).toBe("Transaction Post");
  expect(result.post?.authorId).toBe(result.user?.id);

  // Verify data was committed
  const usersCount = await x.db.select().from(users);
  const postsCount = await x.db.select().from(posts);

  expect(usersCount).toHaveLength(1);
  expect(postsCount).toHaveLength(1);
});

it("should preserve Drizzle's type safety", () => {
  const x = createX()
    .syncAdapter("db", () => new DrizzleAdapter({ db }))
    .build();

  // TypeScript should infer the correct types
  type DbType = typeof x.db;

  // This is a compile-time test - if it compiles, the types are working
  const _typeTest: DbType = x.db;
  expect(_typeTest).toBeDefined();
});

import { Hono } from "hono";
import { db } from "../../db";

export const hono = new Hono();

console.log(db);

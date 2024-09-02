import { X } from "@xframework/core";
import { prisma } from "../db";
import { PrismaModule } from "@xframework/db/prisma";

export const x = new X().module("db", () => new PrismaModule(prisma));

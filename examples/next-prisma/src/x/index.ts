import { X } from "@xframework/core";
import { PrismaModule } from "@xframework/db/prisma";
import { prisma } from "../db";

export const x = new X().module("db", () => new PrismaModule(prisma)).start();

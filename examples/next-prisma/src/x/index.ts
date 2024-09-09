import { XFramework } from "@xframework/core";
import { PrismaModule } from "@xframework/db/prisma";
import { prisma } from "../db";

export const x = new XFramework()
  .module("db", () => new PrismaModule(prisma))
  .build();

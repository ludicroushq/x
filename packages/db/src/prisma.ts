import { DbModule } from ".";

export class PrismaModule<T> extends DbModule {
  private prisma: T;

  constructor(db: T) {
    super();
    this.prisma = db;
  }

  install(): T {
    return this.prisma;
  }
}

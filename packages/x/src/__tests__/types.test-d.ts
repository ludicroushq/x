import { expectType, expectError } from "tsd";
import { createX } from "../";
import { SyncAdapter, AsyncAdapter } from "../adapter";

// Test basic adapter types
class StringAdapter extends SyncAdapter<string> {
  export() {
    return "test";
  }
}

class NumberAdapter extends AsyncAdapter<number> {
  export() {
    return 42;
  }
}

// Test sync factory types
const syncFactory = createX().syncAdapter("string", () => new StringAdapter());

// Exported type should be string
expectType<string>(syncFactory.string);
// Raw adapter should be available
expectType<StringAdapter>(syncFactory._.adapters.string);

// Test async factory types
const asyncFactory = createX().asyncAdapter(
  "number",
  () => new NumberAdapter(),
);

// Should be Promise containing number
expectType<
  Promise<{ number: number; _: { adapters: { number: NumberAdapter } } }>
>(asyncFactory);

// Test composition types
const composedSync = syncFactory.use(
  createX().syncAdapter("another", () => new StringAdapter()),
);

expectType<string>(composedSync.string);
expectType<string>(composedSync.another);

// Test type constraints
class InvalidAdapter {
  __type!: "sync";
  export() {
    return "test";
  }
}

// Should error when using non-adapter class
expectError(createX().syncAdapter("invalid", () => new InvalidAdapter()));

// Should error when accessing non-existent adapter
expectError(
  // @ts-expect-error
  createX().syncAdapter("test", () => new StringAdapter()).nonexistent,
);

// Should error when export type doesn't match usage
class MismatchAdapter extends SyncAdapter<string> {
  // @ts-expect-error
  export(): number {
    return 42;
  }
}

expectError(createX().syncAdapter("mismatch", () => new MismatchAdapter()));

// Test container type inference
const _container = createX()
  .syncAdapter("str", () => new StringAdapter())
  .asyncAdapter("num", (container) => {
    expectType<string>(container.str);
    expectType<StringAdapter>(container._.adapters.str);
    return new NumberAdapter();
  });

// Test nested dependencies
class DependentAdapter extends SyncAdapter<boolean> {
  constructor(container: { str: string; num: number }) {
    super();
    expectType<string>(container.str);
    expectType<number>(container.num);
  }

  export() {
    return true;
  }
}

const _dependentFactory = createX()
  .syncAdapter("str", () => new StringAdapter())
  .asyncAdapter("num", () => new NumberAdapter())
  .syncAdapter("dependent", (container) => new DependentAdapter(container));

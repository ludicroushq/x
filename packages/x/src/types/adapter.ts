export type AdapterType = "sync" | "async";

/**
 * Base interface for adapter configuration
 */
export interface AdapterConfig<ConfigType = unknown> {
  config: ConfigType;
}

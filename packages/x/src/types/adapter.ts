export type AdapterType = "sync" | "async";

/**
 * Base interface for adapter configuration
 * @template ConfigType - Type of the configuration object
 */
export interface AdapterConfig<ConfigType = unknown> {
  config: ConfigType;
}

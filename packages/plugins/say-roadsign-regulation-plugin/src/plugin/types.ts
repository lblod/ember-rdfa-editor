export type RoadsignRegulationPluginOptions = {
  endpoint: string;
  imageBaseUrl: string;
  /**
   * Instead of finding a decision node in the document, pass the relevant URI and type. If type is
   * specified, the plugin is only active if this type is a valid place for roadsign regulations. If
   * type is not specified, the plugin is always active.
   */
  decisionContext?: {
    decisionUri: string;
    decisionType?: string;
  };
} & (
  | {
      articleUriGenerator?: never;
      /** @deprecated use `articleUriGenerator` instead */
      articleUriGenrator?: () => string;
    }
  | {
      articleUriGenerator?: () => string;
      /** @deprecated use `articleUriGenerator` instead */
      articleUriGenrator?: never;
    }
);

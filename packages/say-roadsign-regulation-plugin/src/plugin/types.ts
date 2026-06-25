export type RoadsignRegulationPluginOptions = {
  endpoint: string;
  imageBaseUrl: string;
  /** Instead of finding a decision node in the document, pass the relevant URI and type */
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

import { ZONALITY_OPTIONS } from '#root/plugin/constants.ts';

export type Option = {
  uri: string;
  label: string;
};

export type Zonality = {
  uri: (typeof ZONALITY_OPTIONS)[keyof typeof ZONALITY_OPTIONS];
  label: string;
};
export type TypeOption = Option;
export type Code = Option;
export type Category = Option;

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

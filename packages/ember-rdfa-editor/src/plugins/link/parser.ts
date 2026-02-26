import { find as linkifyFind, test as linkifyTest } from 'linkifyjs';


export type LinkParserResult =
  | {
      isSuccessful: true;
      value: string;
      errors?: never;
    }
  | {
      isSuccessful: false;
      value?: never;
      errors: [string, ...string[]];
    };
export type LinkParser = (input?: string) => LinkParserResult;

export const defaultLinkParser: LinkParser = (input?: string) => {
  let link = input?.trim();
  if (!link) {
    return { isSuccessful: false, errors: ['URL mag niet leeg zijn'] };
  }
  if (!linkifyTest(link)) {
    return {
      isSuccessful: false,
      errors: ['De ingegeven URL is niet geldig'],
    };
  }
  link = linkifyFind(link)[0].href;
  return {
    isSuccessful: true,
    value: link,
  };
};

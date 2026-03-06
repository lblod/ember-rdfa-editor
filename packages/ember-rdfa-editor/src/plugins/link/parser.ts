import { find as linkifyFind, test as linkifyTest } from 'linkifyjs';
import parsePhoneNumber from 'libphonenumber-js';

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
  const link = input?.trim();
  if (!link) {
    return { isSuccessful: false, errors: ['URL mag niet leeg zijn'] };
  }

  const isURL = linkifyTest(link);
  if (isURL) {
    const url = linkifyFind(link)[0].href;
    return {
      isSuccessful: true,
      value: url,
    };
  }

  const phoneNumber = parsePhoneNumber(link, 'BE');
  if (phoneNumber) {
    const phoneNumberUri = phoneNumber.getURI();
    const value = link.startsWith('sms:')
    // libphonenumber-js transforms sms: automatically to tel:, so revert this transform if necessary
      ? phoneNumberUri.replace('tel:', 'sms:')
      : phoneNumberUri;
    return {
      isSuccessful: true,
      value,
    };
  }

  return {
    isSuccessful: false,
    errors: ['De ingegeven URL/link is niet geldig'],
  };
};

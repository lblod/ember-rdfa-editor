import { find as linkifyFind, test as linkifyTest } from 'linkifyjs';
import parsePhoneNumber, {
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';

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

type DefaultLinkParserOptions = {
  defaultCountryCode?: CountryCode;
  supportedProtocols?: string[];
};

export const defaultLinkParser = ({
  defaultCountryCode = 'BE',
  supportedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'],
}: DefaultLinkParserOptions = {}): LinkParser => {
  return (input?: string) => {
    const link = input?.trim();
    if (!link) {
      return { isSuccessful: false, errors: ['URL mag niet leeg zijn'] };
    }

    let href: string | undefined;

    if (linkifyTest(link)) {
      href = linkifyFind(link)[0].href;
    }

    if (!href) {
      const isPhoneNumber = isValidPhoneNumber(link, defaultCountryCode);
      const phoneNumber = parsePhoneNumber(link, defaultCountryCode);
      if (isPhoneNumber && phoneNumber) {
        const phoneNumberUri = phoneNumber.getURI();
        const value = link.startsWith('sms:')
          ? // libphonenumber-js transforms sms: automatically to tel:, so revert this transform if necessary
            phoneNumberUri.replace('tel:', 'sms:')
          : phoneNumberUri;
        href = value;
      }
    }
    if (!href) {
      return {
        isSuccessful: false,
        errors: ['De ingegeven URL/link is niet geldig'],
      };
    }

    if (!hasSupportedProtocol(href, supportedProtocols)) {
      return {
        isSuccessful: false,
        errors: ['de ingegeven URL/link is niet toegestaan'],
      };
    }

    return {
      isSuccessful: true,
      value: href,
    };
  };
};

const hasSupportedProtocol = (href: string, supportedProtocols: string[]) => {
  try {
    const protocol = new URL(href).protocol;
    return supportedProtocols.includes(protocol);
  } catch {
    return false;
  }
};

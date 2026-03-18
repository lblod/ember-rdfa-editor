import { find as linkifyFind, test as linkifyTest } from 'linkifyjs';
import parsePhoneNumber, {
  isValidPhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';
import isEmail from 'validator/lib/isEmail';
import isURL from 'validator/lib/isURL';

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
  customProtocolValidatorMapping?: ProtocolValidatorMapping;
};

const INVALID_LINK_RESULT: LinkParserResult = {
  isSuccessful: false,
  errors: ['De ingegeven URL/link is niet geldig'],
};

export const defaultLinkParser = ({
  defaultCountryCode = 'BE',
  supportedProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'],
  customProtocolValidatorMapping,
}: DefaultLinkParserOptions = {}): LinkParser => {
  return (input?: string) => {
    const trimmedInput = input?.trim();
    if (!trimmedInput) {
      return { isSuccessful: false, errors: ['URL mag niet leeg zijn'] };
    }

    /**
     * First step: parsing/detection of link
     * `linkifyjs` and `libphonenumber-js` will check if the input text has the form of a link, and will add a protocol if necessary
     * Note: e.g. `mailto:test` or `http://test` will be seen as valid by this step, so a second validation step is also necessary
     */
    const href = detectLink(trimmedInput, defaultCountryCode);

    if (!href) {
      return INVALID_LINK_RESULT;
    }

    /**
     * Second step: link validation
     * Using `isURL`/`isEmail`/custom validators from the validator.js library, we check if the produced href is valid
     */
    if (
      !isValidHref(href, supportedProtocols, customProtocolValidatorMapping)
    ) {
      return INVALID_LINK_RESULT;
    }

    return {
      isSuccessful: true,
      value: href,
    };
  };
};

const detectLink = (
  input: string,
  defaultCountryCode: CountryCode,
): string | undefined => {
  if (linkifyTest(input)) {
    const matches = linkifyFind(input);
    return matches[0].href;
  }

  const phoneNumber = parsePhoneNumber(input, defaultCountryCode);
  if (phoneNumber) {
    const phoneUri = phoneNumber.getURI();
    return input.startsWith('sms:')
      ? phoneUri.replace('tel:', 'sms:')
      : phoneUri;
  }

  return;
};

type URLValidator = (url: URL) => boolean;

type ProtocolValidatorMapping = Record<string, URLValidator>;

const BUILT_IN_VALIDATORS: ProtocolValidatorMapping = {
  'mailto:': (url) => isEmail(url.pathname),
  'tel:': (url) => isValidPhoneNumber(url.pathname),
  'sms:': (url) => isValidPhoneNumber(url.pathname),
  'http:': (url) =>
    isURL(url.href, { require_protocol: true, require_tld: true }),
  'https:': (url) =>
    isURL(url.href, { require_protocol: true, require_tld: true }),
};

const isValidHref = (
  href: string,
  supportedProtocols: string[],
  customProtocolValidatorMapping?: ProtocolValidatorMapping,
) => {
  try {
    const url = new URL(href);
    if (!supportedProtocols.includes(url.protocol)) {
      return false;
    }
    const protocolValidatorMapping = {
      ...BUILT_IN_VALIDATORS,
      ...(customProtocolValidatorMapping ?? {}),
    };
    const validationFn = protocolValidatorMapping[url.protocol];
    return validationFn ? validationFn(url) : true;
  } catch {
    return false;
  }
};

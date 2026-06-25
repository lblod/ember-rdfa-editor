import { formatWithOptions } from 'date-fns/fp';
import { nlBE } from 'date-fns/locale';

export type RegexpMatchArrayWithIndices = RegExpMatchArray & {
  indices: Array<[number, number]> & {
    groups: { [key: string]: [number, number] };
  };
};

const TIME_CHAR_REGEX = new RegExp('[abBhHkKmsStTp]');

export function formatDate(date: Date, format: string) {
  try {
    return formatWithOptions({ locale: nlBE }, format)(date);
  } catch (e) {
    return '';
  }
}

export function formatContainsTime(format: string) {
  return TIME_CHAR_REGEX.test(format.replace(/'[^']*'|"[^"]*"/g, ''));
}

type ValidationErrorType =
  | 'date'
  | 'locale'
  | 'use-yyyy'
  | 'use-yy'
  | 'use-d'
  | 'use-dd'
  | 'character'
  | 'required'
  | 'fractions'
  | 'unknown';

interface ValidationOk {
  type: 'ok';
  value: string;
}

export interface ValidationError {
  type: 'error';
  error: ValidationErrorType;
  payload?: Record<string, string>;
}

type ValidationResult = ValidationOk | ValidationError;
const INVALID_CHAR_REGEX = new RegExp('Format string.*`(?<char>\\S+)`');
const FRACTIONS_REGEX = new RegExp('[ST]');

export function validateDateFormat(format?: string): ValidationResult {
  try {
    if (!format || format.length === 0) {
      return { type: 'error', error: 'required' };
    }
    if (FRACTIONS_REGEX.test(format)) {
      return { type: 'error', error: 'fractions' };
    }
    const value = formatWithOptions({ locale: nlBE }, format)(new Date());
    return { type: 'ok', value };
  } catch (e) {
    if (e instanceof RangeError) {
      const msg = e.message;

      if (msg.startsWith('Use `yyyy`')) {
        return { type: 'error', error: 'use-yyyy' };
      } else if (msg.startsWith('Use `yy`')) {
        return { type: 'error', error: 'use-yy' };
      } else if (msg.startsWith('Use `d`')) {
        return { type: 'error', error: 'use-d' };
      } else if (msg.startsWith('Use `dd`')) {
        return { type: 'error', error: 'use-dd' };
      } else {
        const match = INVALID_CHAR_REGEX.exec(
          msg,
        ) as RegexpMatchArrayWithIndices | null;
        if (match) {
          const invalidCharacters = match.groups?.['char'];
          if (invalidCharacters) {
            return {
              type: 'error',
              error: 'character',
              payload: { invalidCharacters },
            };
          }
        }
      }
      return { type: 'error', error: 'unknown' };
    } else {
      throw e;
    }
  }
}

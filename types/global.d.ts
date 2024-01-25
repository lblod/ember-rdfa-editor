import { AnyObject, Flags, Maybe } from 'yup';

interface CurieOptions {
  allowEmpty?: boolean;
}
declare module 'yup' {
  interface CurieOptions {
    allowEmpty?: boolean;
  }
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext = AnyObject,
    TDefault = undefined,
    TFlags extends Flags = '',
  > {
    curie(options?: CurieOptions): this;
  }
}

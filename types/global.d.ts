//@eslint-ignore
import { AnyObject, Flags, Maybe } from 'yup';

interface CurieOptions {
  allowEmpty?: boolean;
}
declare module 'yup' {
  interface CurieOptions {
    allowEmpty?: boolean;
  }
  interface StringSchema<
    TType extends Maybe<string> = string | undefined, //eslint-disable-line @typescript-eslint/no-unused-vars
    TContext = AnyObject, //eslint-disable-line @typescript-eslint/no-unused-vars
    TDefault = undefined, //eslint-disable-line @typescript-eslint/no-unused-vars
    TFlags extends Flags = '', //eslint-disable-line @typescript-eslint/no-unused-vars
  > {
    curie(options?: CurieOptions): this;
  }
}

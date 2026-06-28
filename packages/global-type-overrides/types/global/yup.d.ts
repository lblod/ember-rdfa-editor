import { AnyObject, Flags, Maybe } from 'yup';


// pay attention to the placing of the import statements, inside or outside the module definition
// with any top-level import or export statements, the declaration file acts as a module augmentation
// without, it acts as a replacement for the module definition
//
// here, we want to augment, since we're adding a type to yup's already existing types

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

import { AnyObject, Flags, Maybe } from 'yup';

// Types for compiled templates
declare module '@lblod/ember-rdfa-editor/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}
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

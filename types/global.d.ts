// Types for compiled templates
declare module '@lblod/ember-rdfa-editor/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module 'ember-get-config' {
  const environment: string;
}

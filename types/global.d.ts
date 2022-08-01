// Types for compiled templates
declare module '@lblod/ember-rdfa-editor/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module 'ember-get-config' {
  const environment: string;
}

declare module '@lblod/ember-rdfa-editor' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Commands {}
  export type CommandName = keyof Commands;
  export type ExecuteReturn<C extends CommandName> = ReturnType<
    Commands[C]['execute']
  >;
  export type ExecuteArgs<C extends CommandName> = Parameters<
    Commands[C]['execute']
  >[1];
  export type CanExecuteArgs<C extends CommandName> = Parameters<
    Commands[C]['canExecute']
  >[1];
}

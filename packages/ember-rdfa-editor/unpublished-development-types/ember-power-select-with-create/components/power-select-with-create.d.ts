// Types for ember-power-select-with-create
declare module 'ember-power-select-with-create/components/power-select-with-create' {
  import Component from '@glimmer/component';
  import type {
    PowerSelectArgs,
    Select,
  } from 'ember-power-select/components/power-select';

  export interface PowerSelectWithCreateArgs extends PowerSelectArgs {
    onCreate: (term: string) => unknown;
    powerSelectComponent?: Component;
    showCreateWhen?: (term: string, options: unknown[]) => boolean;
    showCreatePosition?: 'bottom' | 'top';
    buildSuggestion?: (term: string) => string;
  }
  // Copied from PS 8.0 types
  type PowerSelectWithCreateSig = {
    Element: HTMLElement;
    Args: PowerSelectWithCreateArgs;
    Blocks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      default: [option: any, select: Select];
    };
  };
  export default class PowerSelectWithCreateComponent extends Component<PowerSelectWithCreateSig> {}
}

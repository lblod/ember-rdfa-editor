// pay attention to the placing of the import statements, inside or outside the module definition
// with any top-level import or export statements, the declaration file acts as a module augmentation
// without, it acts as a replacement for the module definition
//
// here, we want to replace, as the power-select-with-create module doesn't have a type definition

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
  const PowerSelectWithCreateComponent: Component<PowerSelectWithCreateSig>;
  export default PowerSelectWithCreateComponent;
}

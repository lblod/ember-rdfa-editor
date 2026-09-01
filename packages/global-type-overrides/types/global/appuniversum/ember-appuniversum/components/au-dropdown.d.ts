import Component from '@glimmer/component';
import type { AuButtonSignature } from './au-button';

// pay attention to the placing of the import statements, inside or outside the module definition
// with any top-level import or export statements, the declaration file acts as a module augmentation
// without, it acts as a replacement for the module definition
//
// here, we want to augment, cause AU does provide types. So in case they'd add an extra export
// to this file, we don't want to clobber that.

// Copied from AU 3.5.0 to avoid needing to upgrade AU and potentially break backwards compatibility
declare module '@appuniversum/ember-appuniversum/components/au-dropdown' {
  export interface AuDropdownSignature {
    Args: {
      alignment?: 'left' | 'right';
      alert?: boolean;
      hideText?: boolean;
      icon?: AuButtonSignature['Args']['icon'];
      iconAlignment?: AuButtonSignature['Args']['iconAlignment'];
      onClose?: () => unknown;
      size?: AuButtonSignature['Args']['size'];
      skin?: AuButtonSignature['Args']['skin'];
      title?: string;
    };
    Blocks: {
      default: [];
    };
    Element: HTMLDivElement;
  }
  const AuDropdown: Component<AuDropdownSignature>;
  export default AuDropdown;
}

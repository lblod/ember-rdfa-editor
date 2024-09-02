// Copied from AU 3.5.0 to avoid needing to upgrade AU and potentially break backwards compatibility
declare module '@appuniversum/ember-appuniversum/components/au-dropdown' {
  import Component from '@glimmer/component';
  import type { AuButtonSignature } from './au-button';

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
  export default class AuDropdown extends Component<AuDropdownSignature> {}
}

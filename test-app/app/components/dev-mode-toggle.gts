import { on } from '@ember/modifier/on';
import Component from '@glimmer/component';
import AuNativeToggle from '@lblod/ember-rdfa-editor/components/au-native-toggle';

type Signature = {
  Args: {
    onToggle: (enabled: boolean) => unknown;
    enabled: boolean;
  };
};

export default class DevModeToggle extends Component<Signature> {
  onChange = (event: Event) => {
    this.args.onToggle((event.target as HTMLInputElement).checked);
  };

  <template>
    <div class="say-rdfa-toggle" title="Dev Mode">
      <AuNativeToggle {{on "change" this.onChange}} checked={{@enabled}}>
        Dev Mode
      </AuNativeToggle>
    </div>
  </template>
}

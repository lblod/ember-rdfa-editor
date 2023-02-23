import Component from '@glimmer/component';

type Args = {
  optionsIcon: string;
};

export default class ToolbarButton extends Component<Args> {
  get optionsIcon() {
    return this.args.optionsIcon ?? 'chevron-down';
  }
}

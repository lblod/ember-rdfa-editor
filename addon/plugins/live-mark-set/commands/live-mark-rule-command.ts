import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import LiveMarkSetPlugin, { LiveMarkRule } from '../live-mark-set';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    addLiveMarkRule: LiveMarkRuleCommand;
    removeLiveMarkRule: LiveMarkRuleCommand;
  }
}
export interface LiveMarkRuleCommandArgs {
  rule: LiveMarkRule;
}

export default class LiveMarkRuleCommand
  implements Command<LiveMarkRuleCommandArgs, void>
{
  pluginInstance: LiveMarkSetPlugin;
  deleteRule: boolean;

  constructor(pluginInstance: LiveMarkSetPlugin, deleteRule: boolean) {
    this.pluginInstance = pluginInstance;
    this.deleteRule = deleteRule;
  }
  canExecute(): boolean {
    return true;
  }

  execute(_context: CommandContext, { rule }: LiveMarkRuleCommandArgs): void {
    if (this.deleteRule) {
      this.pluginInstance.removeRule(rule);
    } else {
      this.pluginInstance.addRule(rule);
    }
  }
}

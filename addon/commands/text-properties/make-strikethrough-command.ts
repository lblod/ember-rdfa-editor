import SetPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class MakeStrikethroughCommand extends SetPropertyCommand {
  name = 'make-strikethrough';
  @logExecute
  execute() {
    super.setProperty('strikethrough', true);
  }
}

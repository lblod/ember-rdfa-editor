import Command from '@lblod/ember-rdfa-editor/commands/command';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { parseXmlSiblings } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import setNodeAndChildDirty from '@lblod/ember-rdfa-editor/model/util/set-node-and-child-dirty';

/**
 * Allows you to insert model nodes from an xml string.
 * Particularly useful for testing and debugging.
 */
export default class InsertXmlCommand extends Command {
  name = 'insert-xml';
  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(
    xml: string,
    range: ModelRange | null = this.model.selection.lastRange
  ): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const parsedModelNodes = parseXmlSiblings(xml);
    this.model.change((mutator) => {
      //All nodes are marked as dirty by default when inserted but not in the xml writer
      // as we need to set dirtiness statuses in the tests, in order to solve bugs related to
      // nodes not being properly inserted we set them all dirty in this function below
      parsedModelNodes.forEach((node) => setNodeAndChildDirty(node));
      const newRange = mutator.insertNodes(range, ...parsedModelNodes);
      this.model.selectRange(newRange);
    });
  }
}

import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import { MarkSet } from '../mark';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlAdjacentTextWriter
  implements Writer<ModelText[], Node[]>
{
  handleSplit(
    streak: ModelText[],
    marksInCommon: MarkSet,
    marksToIgnore: MarkSet
  ): { views: Node[]; parent: HTMLElement } {
    const viewsRec = this.write(streak, marksToIgnore.union(marksInCommon));
    const differentViewRoots: Set<Node> = new Set(viewsRec);
    let parent!: HTMLElement;
    let children: Iterable<Node> = differentViewRoots;
    [...marksInCommon]
      .sort((a, b) => (a.priority >= b.priority ? 1 : -1))
      .forEach((mark) => {
        parent = mark.write(...children);
        children = [parent];
      });
    return { views: viewsRec, parent: parent };
  }

  write(
    modelNodes: ModelText[],
    marksToIgnore: MarkSet = new MarkSet()
  ): Node[] {
    const result: Node[] = [];
    let marksInCommon = new MarkSet();
    let streak: ModelText[] = [];
    modelNodes.forEach((modelNode) => {
      const contentRoot: Text = new Text(modelNode.content);
      const marks = modelNode.marks.difference(marksToIgnore);
      const intersection = marksInCommon.intersection(marks);
      const highestPriorityMarks = Math.max(
        ...[...marks].map((mark) => mark.priority)
      );
      const highestPriorityCommonMarks = Math.max(
        ...[...marksInCommon].map((mark) => mark.priority)
      );
      if (
        intersection.size === 0 ||
        highestPriorityMarks !== highestPriorityCommonMarks
      ) {
        if (marksInCommon.size > 0) {
          const { parent, views } = this.handleSplit(
            streak,
            marksInCommon,
            marksToIgnore
          );
          views.forEach(() => {
            result.push(parent);
          });
        }
        marksInCommon = new MarkSet();
        marksInCommon.add(...marks);
        if (marks.size === 0) {
          streak = [];
          // Handle a textnode without marks
          result.push(contentRoot);
        } else {
          streak = [modelNode];
        }
      } else {
        marksInCommon = intersection;
        streak.push(modelNode);
      }
    });
    if (streak.length > 0) {
      //handle last streak
      const { parent, views } = this.handleSplit(
        streak,
        marksInCommon,
        marksToIgnore
      );
      views.forEach(() => {
        result.push(parent);
      });
    }

    return result;
  }
}

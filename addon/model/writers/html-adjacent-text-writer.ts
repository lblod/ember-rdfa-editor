import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { TextView } from '@lblod/ember-rdfa-editor/model/node-view';
import { Mark, MarkSet } from '../mark';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlAdjacentTextWriter
  implements Writer<ModelText[], TextView[]>
{
  constructor(protected model: Model) {}

  handleSplit(
    streak: ModelText[],
    marksInCommon: MarkSet,
    marksToIgnore: MarkSet
  ): { views: TextView[]; parent: HTMLElement } {
    const viewsRec = this.write(streak, marksToIgnore.union(marksInCommon));
    const differentViewRoots: Set<Node> = new Set(
      viewsRec.map((view) => view.viewRoot)
    );
    let parent!: HTMLElement;
    let children: Iterable<Node> = differentViewRoots;
    marksInCommon.forEach((mark) => {
      parent = mark.writeMultiple(children);
      children = [parent];
    });
    return { views: viewsRec, parent: parent };
  }

  write(
    modelNodes: ModelText[],
    marksToIgnore: MarkSet = new MarkSet()
  ): TextView[] {
    const result: TextView[] = [];
    let marksInCommon = new MarkSet();
    let streak: ModelText[] = [];
    modelNodes.forEach((modelNode) => {
      const contentRoot: Text = new Text(modelNode.content);
      const marks = modelNode.marks.difference(marksToIgnore);
      const intersection = marksInCommon.intersection(marks);

      if (intersection.size === 0) {
        if (marksInCommon.size > 0) {
          const { parent, views } = this.handleSplit(
            streak,
            marksInCommon,
            marksToIgnore
          );
          views.forEach((view) => {
            result.push({
              viewRoot: parent,
              contentRoot: view.contentRoot,
            });
          });
        }
        marksInCommon = new MarkSet();
        marksInCommon.add(...marks);
        if (marks.size === 0) {
          streak = [];
          // Handle a textnode without marks
          result.push({ viewRoot: contentRoot, contentRoot: contentRoot });
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
      views.forEach((view) => {
        result.push({
          viewRoot: parent,
          contentRoot: view.contentRoot,
        });
      });
    }

    return result;
  }
}

import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { TextView } from '@lblod/ember-rdfa-editor/model/node-view';
import {
  isTextOrElement,
  TextOrElement,
} from '@lblod/ember-rdfa-editor/model/util/types';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import { MarkSet } from '../mark';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlAdjacentTextWriter
  implements Writer<ModelText[], TextView[]>
{
  constructor(protected model: Model) {}

  // write(modelNodes: ModelText[]): TextView[] {
  //   const textviews: TextView[] = modelNodes.map((modelNode) => {
  //     const contentRoot: Text = new Text(modelNode.content);
  //     let current: TextOrElement = contentRoot;

  //     for (const entry of [...modelNode.marks].sort((a, b) =>
  //       a.priority >= b.priority ? 1 : -1
  //     )) {
  //       const rendered = entry.write(current);
  //       if (isTextOrElement(rendered)) {
  //         current = rendered;
  //       } else {
  //         throw new NotImplementedError(
  //           'Mark is trying to render as something other than an element or a text node'
  //         );
  //       }
  //     }
  //     return { viewRoot: current, contentRoot: contentRoot };
  //   });
  //   return textviews;
  // }

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
      if (marks.size === 0) {
        if (marksInCommon.size > 0) {
          // handle streak until now
          const viewsRec = this.write(
            streak,
            marksToIgnore.union(marksInCommon)
          );
          const differentViewRoots: Set<Node> = new Set(
            viewsRec.map((view) => view.viewRoot)
          );
          let parent: HTMLElement;
          let children: Iterable<Node> = differentViewRoots;
          marksInCommon.forEach((mark) => {
            parent = mark.writeMultiple(children);
            children = [parent];
          });
          viewsRec.forEach((view) => {
            result.push({ viewRoot: parent, contentRoot: view.contentRoot });
          });
          marksInCommon = new MarkSet();
          streak = [];
        }
        // Handle a textnode without marks
        result.push({ viewRoot: contentRoot, contentRoot: contentRoot });
      } else if (intersection.size === 0) {
        // no common marks with streak until now
        // handle streak until now
        if (streak.length > 0) {
          const viewsRec = this.write(
            streak,
            marksToIgnore.union(marksInCommon)
          );
          const differentViewRoots: Set<Node> = new Set(
            viewsRec.map((view) => view.viewRoot)
          );
          let parent: HTMLElement;
          let children: Iterable<Node> = differentViewRoots;
          marksInCommon.forEach((mark) => {
            parent = mark.writeMultiple(children);
            children = [parent];
          });
          viewsRec.forEach((view) => {
            result.push({ viewRoot: parent, contentRoot: view.contentRoot });
          });
        }

        //create new streak
        marksInCommon = new MarkSet();
        marksInCommon.add(...marks);
        streak = [modelNode];
      } else {
        marksInCommon = intersection;
        streak.push(modelNode);
      }
    });
    if (streak.length > 0) {
      //handle last streak
      const viewsRec = this.write(streak, marksToIgnore.union(marksInCommon));
      const differentViewRoots: Set<Node> = new Set(
        viewsRec.map((view) => view.viewRoot)
      );
      let parent: HTMLElement;
      let children: Iterable<Node> = differentViewRoots;
      marksInCommon.forEach((mark) => {
        parent = mark.writeMultiple(children);
        children = [parent];
      });
      viewsRec.forEach((view) => {
        result.push({ viewRoot: parent, contentRoot: view.contentRoot });
      });
    }

    return result;
  }
}

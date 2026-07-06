import type { VirtualElement } from '@floating-ui/dom';
import type { EditorState, Selection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

type Coords = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type GetPositionFromSelectionCoords = (
  selectionFromCoords?: Coords,
  selectionToCoords?: Coords,
) => number;

type GetReferenceElementArgs = {
  editorState: EditorState;
  editorView: EditorView;
  getLeft?: GetPositionFromSelectionCoords;
  getRight?: GetPositionFromSelectionCoords;
  getBottom?: GetPositionFromSelectionCoords;
  getTop?: GetPositionFromSelectionCoords;
  selection?: Selection
};

/**
 * Get a VirtualElement based on the current editor selection.
 * Defaults to the bounding box of the selection.
 * @returns VirtualElement
 */
export function getReferenceElementFromSelection({
  editorState,
  editorView,
  getLeft,
  getRight,
  getBottom,
  getTop,
  selection,
}: GetReferenceElementArgs) {
  const _selection = selection ?? editorState.selection;
  const virtualElement: VirtualElement = {
    getBoundingClientRect: () => {
      const coordsFrom = editorView.coordsAtPos(_selection.from, -1);
      const coordsTo = editorView.coordsAtPos(_selection.to, -1);
      const left =
        getLeft?.(coordsFrom, coordsTo) ??
        Math.min(coordsFrom.left, coordsTo.left);
      const right =
        getRight?.(coordsFrom, coordsTo) ??
        Math.max(coordsFrom.right, coordsTo.right);
      const bottom = getBottom?.(coordsFrom, coordsTo) ?? coordsTo.bottom;
      const top = getTop?.(coordsFrom, coordsTo) ?? coordsFrom.top;
      return {
        left,
        right,
        bottom,
        top,
        x: left,
        y: top,
        width: 0,
        height: bottom - top,
      };
    },
    contextElement: editorView.dom,
  };
  return virtualElement;
}

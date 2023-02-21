import { Command } from 'prosemirror-state';
import { hasParentNodeOfType } from '@curvenote/prosemirror-utils';
import { tableNodeTypes, selectedRect, TableRect } from 'prosemirror-tables';
import { NodeType } from 'prosemirror-model';

export type ToggleHeaderType = 'column' | 'row' | 'cell';

export const toggleHeaderRow = toggleHeader('row');
export const toggleHeaderColumn = toggleHeader('column');

function isHeaderEnabledByType(
  type: 'row' | 'column',
  rect: TableRect,
  types: Record<string, NodeType>
): boolean {
  // Get cell positions for first row or first column
  const cellPositions = rect.map.cellsInRect({
    left: 0,
    top: 0,
    right: type == 'row' ? rect.map.width : 1,
    bottom: type == 'column' ? rect.map.height : 1,
  });

  for (let i = 0; i < cellPositions.length; i++) {
    const cell = rect.table.nodeAt(cellPositions[i]);
    if (cell && cell.type !== types.header_cell) {
      return false;
    }
  }

  return true;
}

export function toggleHeader(type: ToggleHeaderType): Command {
  return function (state, dispatch) {
    const isInTable = hasParentNodeOfType(state.schema.nodes.table)(
      state.selection
    );
    if (!isInTable) return false;
    if (dispatch) {
      const types = tableNodeTypes(state.schema);
      const rect = selectedRect(state),
        tr = state.tr;

      const isHeaderRowEnabled = isHeaderEnabledByType('row', rect, types);
      const isHeaderColumnEnabled = isHeaderEnabledByType(
        'column',
        rect,
        types
      );

      const isHeaderEnabled =
        type === 'column'
          ? isHeaderRowEnabled
          : type === 'row'
          ? isHeaderColumnEnabled
          : false;

      const selectionStartsAt = isHeaderEnabled ? 1 : 0;

      const cellsRect =
        type == 'column'
          ? {
              left: 0,
              top: selectionStartsAt,
              right: 1,
              bottom: rect.map.height,
            }
          : type == 'row'
          ? {
              left: selectionStartsAt,
              top: 0,
              right: rect.map.width,
              bottom: 1,
            }
          : rect;

      const newType =
        type == 'column'
          ? isHeaderColumnEnabled
            ? types.cell
            : types.header_cell
          : type == 'row'
          ? isHeaderRowEnabled
            ? types.cell
            : types.header_cell
          : types.cell;

      rect.map.cellsInRect(cellsRect).forEach((relativeCellPos) => {
        const cellPos = relativeCellPos + rect.tableStart;
        const cell = tr.doc.nodeAt(cellPos);

        if (cell) {
          tr.setNodeMarkup(cellPos, newType, cell.attrs);
        }
      });

      dispatch(tr);
    }
    return true;
  };
}

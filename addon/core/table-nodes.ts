// Helper for creating a schema that supports tables.

import { Node as PNode, NodeSpec } from 'prosemirror-model';

interface ExtraAttribute {
  default: unknown;

  getFromDOM?(this: void, node: Element): unknown;

  setDOMAttr?(this: void, value: unknown, attrs: Record<string, unknown>): void;
}

type CellAttributes = {
  colspan?: number;
  rowspan?: number;
  colwidth?: number[] | null;
} & Record<string, unknown>;

function getCellAttrs(
  dom: Element,
  extraAttrs: Record<string, ExtraAttribute>
): CellAttributes {
  const widthAttr = dom.getAttribute('data-colwidth');
  const widths =
    widthAttr && /^\d+(,\d+)*$/.test(widthAttr)
      ? widthAttr.split(',').map((s) => Number(s))
      : null;
  const colspan = Number(dom.getAttribute('colspan') || 1);
  const result: CellAttributes = {
    colspan,
    rowspan: Number(dom.getAttribute('rowspan') || 1),
    colwidth: widths && widths.length == colspan ? widths : null,
  };
  for (const [key, attr] of Object.entries(extraAttrs)) {
    const getter = attr.getFromDOM;
    const value = getter && getter(dom);
    if (value !== null) {
      result[key] = value;
    }
  }
  return result;
}

function setCellAttrs(node: PNode, extraAttrs: Record<string, ExtraAttribute>) {
  const attrs: CellAttributes = {};
  if (Number(node.attrs.colspan) !== 1) {
    attrs.colspan = node.attrs.colspan as number;
  }
  if (Number(node.attrs.rowspan) !== 1) {
    attrs.rowspan = node.attrs.rowspan as number;
  }
  if (node.attrs.colwidth) {
    attrs['data-colwidth'] = (node.attrs.colwidth as number[]).join(',');
  }
  for (const [key, attr] of Object.entries(extraAttrs)) {
    const setter = attr.setDOMAttr;
    if (setter) {
      setter(node.attrs[key], attrs);
    }
  }
  return attrs;
}

// :: (Object) → Object
//
// This function creates a set of [node
// specs](http://prosemirror.net/docs/ref/#model.SchemaSpec.nodes) for
// `table`, `table_row`, and `table_cell` nodes types as used by this
// module. The result can then be added to the set of nodes when
// creating a a schema.
//
//   options::- The following options are understood:
//
//     tableGroup:: ?string
//     A group name (something like `"block"`) to add to the table
//     node type.
//
//     cellContent:: string
//     The content expression for table cells.
//
//     cellAttributes:: ?Object
//     Additional attributes to add to cells. Maps attribute names to
//     objects with the following properties:
//
//       default:: any
//       The attribute's default value.
//
//       getFromDOM:: ?(dom.Node) → any
//       A function to read the attribute's value from a DOM node.
//
//       setDOMAttr:: ?(value: any, attrs: Object)
//       A function to add the attribute's value to an attribute
//       object that's used to render the cell's DOM.
interface TableNodeOptions {
  tableGroup?: string;
  cellContent: string;
  cellAttributes: Record<string, ExtraAttribute>;
}

interface TableNodes {
  table: NodeSpec;
  table_row: NodeSpec;
  table_cell: NodeSpec;
  table_header: NodeSpec;
}

export function tableNodes(options: TableNodeOptions): TableNodes {
  const extraAttrs = options.cellAttributes || {};
  const cellAttrs: Record<string, { default: unknown }> = {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
  };
  for (const [key, attr] of Object.entries(extraAttrs)) {
    cellAttrs[key] = { default: attr.default };
  }

  return {
    table: {
      content: 'table_row+',
      tableRole: 'table',
      isolating: true,
      attrs: { class: { default: 'say-table' } },
      group: options.tableGroup,
      parseDOM: [{ tag: 'table' }],
      toDOM() {
        return ['table', { class: 'say-table' }, ['tbody', 0]];
      },
    },
    table_row: {
      content: '(table_cell | table_header)*',
      tableRole: 'row',
      parseDOM: [{ tag: 'tr' }],
      toDOM() {
        return ['tr', 0];
      },
    },
    table_cell: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRole: 'cell',
      isolating: true,
      parseDOM: [
        {
          tag: 'td',
          getAttrs: (dom: HTMLElement) => getCellAttrs(dom, extraAttrs),
        },
      ],
      toDOM(node) {
        return ['td', setCellAttrs(node, extraAttrs), 0];
      },
    },
    table_header: {
      content: options.cellContent,
      attrs: cellAttrs,
      tableRole: 'header_cell',
      isolating: true,
      parseDOM: [
        {
          tag: 'th',
          getAttrs: (dom: HTMLElement) => getCellAttrs(dom, extraAttrs),
        },
      ],
      toDOM(node) {
        return ['th', setCellAttrs(node, extraAttrs), 0];
      },
    },
  };
}

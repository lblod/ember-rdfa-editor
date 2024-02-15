// Helper for creating a schema that supports tables.

import { Node as PNode, NodeSpec } from 'prosemirror-model';
import { getRdfaAttrs, rdfaAttrs } from '@lblod/ember-rdfa-editor/core/schema';
import { TableView } from '@lblod/ember-rdfa-editor/plugins/table';
import SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';

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

// A naive way to fix the colwidths attribute, from pixels to percentage
const fixupColWidth = (number: string) => {
  const numberWidth = Number(number);

  if (numberWidth > 100) {
    // return 0 to reset the width
    return 0;
  }

  return numberWidth;
};

function getCellAttrs(
  dom: Element,
  extraAttrs: Record<string, ExtraAttribute>,
): CellAttributes {
  const widthAttr = dom.getAttribute('data-colwidth');

  const widths =
    widthAttr && /^\d+(\.\d+)*(,\d+(\.\d+)*)*$/.test(widthAttr)
      ? widthAttr.split(',').map(fixupColWidth)
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
  return { ...getRdfaAttrs(dom), ...result };
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
  for (const key of Object.keys(rdfaAttrs)) {
    attrs[key] = node.attrs[key];
  }
  return attrs;
}

interface TableNodeOptions {
  tableGroup?: string;
  cellContent: string;
  cellAttributes?: Record<string, ExtraAttribute>;
}

interface TableNodes extends Record<string, NodeSpec> {
  table: SayNodeSpec;
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
      attrs: { ...rdfaAttrs, class: { default: 'say-table' } },
      group: options.tableGroup,
      allowGapCursor: false,
      parseDOM: [
        {
          tag: 'table',
          getAttrs(node: HTMLElement) {
            const rdfaAttrs = getRdfaAttrs(node);
            if (rdfaAttrs) {
              return rdfaAttrs;
            } else {
              return null;
            }
          },
        },
      ],
      toDOM(node: PNode) {
        return ['table', { ...node.attrs, class: 'say-table' }, ['tbody', 0]];
      },
      serialize(node: PNode) {
        const tableView = new TableView(node, 25);

        return [
          'table',
          {
            ...node.attrs,
            class: 'say-table',
            style: 'min-width: 100%',
          },
          tableView.colgroupElement,
          ['tbody', 0],
        ];
      },
    },
    table_row: {
      content: '(table_cell | table_header)*',
      tableRole: 'row',
      attrs: { ...rdfaAttrs },
      allowGapCursor: false,
      parseDOM: [
        {
          tag: 'tr',
          getAttrs(node: HTMLElement) {
            const rdfaAttrs = getRdfaAttrs(node);
            if (rdfaAttrs) {
              return rdfaAttrs;
            } else {
              return null;
            }
          },
        },
      ],
      toDOM(node: PNode) {
        return ['tr', node.attrs, 0];
      },
    },
    table_cell: {
      content: options.cellContent,
      attrs: { ...rdfaAttrs, ...cellAttrs },
      tableRole: 'cell',
      isolating: true,
      allowGapCursor: false,
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
      attrs: { ...rdfaAttrs, ...cellAttrs },
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

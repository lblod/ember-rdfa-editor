// Helper for creating a schema that supports tables.
import { Node as PNode, type NodeSpec } from 'prosemirror-model';
import {
  type RdfaAttrs,
  getRdfaAttrs,
  renderInvisibleRdfa,
  renderRdfaAttrs,
  renderRdfaAware,
  getRdfaContentElement,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor/core/schema';
import { TableView } from '@lblod/ember-rdfa-editor/plugins/table';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';

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
  dom: HTMLElement,
  extraAttrs: Record<string, ExtraAttribute>,
  rdfaAware: boolean,
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
  return { ...getRdfaAttrs(dom, { rdfaAware }), ...result };
}

function setCellAttrs(
  node: PNode,
  extraAttrs: Record<string, ExtraAttribute>,
  useClassicRdfa: boolean,
) {
  const attrs: CellAttributes = {};
  if (Number(node.attrs['colspan']) !== 1) {
    attrs.colspan = node.attrs['colspan'] as number;
  }
  if (Number(node.attrs['rowspan']) !== 1) {
    attrs.rowspan = node.attrs['rowspan'] as number;
  }
  if (node.attrs['colwidth']) {
    attrs['data-colwidth'] = (node.attrs['colwidth'] as number[]).join(',');
  }
  for (const [key, attr] of Object.entries(extraAttrs)) {
    const setter = attr.setDOMAttr;
    if (setter) {
      setter(node.attrs[key], attrs);
    }
  }
  if (useClassicRdfa) {
    // The node is still using classic RDFa attributes, set them here
    for (const key of Object.keys(rdfaAttrSpec({ rdfaAware: false }))) {
      attrs[key] = node.attrs[key];
    }
  }
  return attrs;
}

interface TableNodeOptions {
  tableGroup?: string;
  cellContent: string;
  cellAttributes?: Record<string, ExtraAttribute>;
  /**
   * Style to be applied inline to elements in order to mark the rows and columns of the table.
   * If not supplied, the default stylesheets apply a border to ensure that it is visible.
   * This is not maintained when exporting the markup (e.g. when copy-pasting a table).
   * Style defaults to 'solid'.
   */
  inlineBorderStyle?: {
    width: string;
    style?: string;
    color: string;
  };
  rdfaAware?: boolean;
}

interface TableNodes extends Record<string, NodeSpec> {
  table: SayNodeSpec;
  table_row: NodeSpec;
  table_cell: NodeSpec;
  table_header: NodeSpec;
}

export function tableNodes(options: TableNodeOptions): TableNodes {
  const rdfaAware = options.rdfaAware ?? false;
  const extraAttrs = options.cellAttributes || {};
  const cellAttrs: Record<string, { default: unknown }> = {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
  };
  for (const [key, attr] of Object.entries(extraAttrs)) {
    cellAttrs[key] = { default: attr.default };
  }
  const inlineBorderStyle =
    options.inlineBorderStyle &&
    `${options.inlineBorderStyle.width} ${options.inlineBorderStyle.style || 'solid'} ${options.inlineBorderStyle.color}`;
  const tableStyle =
    inlineBorderStyle &&
    `border: ${inlineBorderStyle}; border-collapse: collapse;`;
  const rowStyle = inlineBorderStyle && `border-top: ${inlineBorderStyle};`;
  const cellStyle = inlineBorderStyle && `border-left: ${inlineBorderStyle};`;

  return {
    table: {
      content: 'table_row+',
      tableRole: 'table',
      isolating: true,
      get attrs() {
        const baseAttrs = {
          class: { default: 'say-table' },
          style: { default: tableStyle },
        };
        return {
          ...rdfaAttrSpec({ rdfaAware }),
          ...baseAttrs,
        };
      },
      group: options.tableGroup,
      allowGapCursor: false,
      parseDOM: [
        {
          tag: 'table',
          getAttrs(node: string | HTMLElement) {
            if (typeof node === 'string') {
              return false;
            }
            return { ...getRdfaAttrs(node, { rdfaAware }) };
          },
          contentElement: getRdfaContentElement,
        },
      ],
      toDOM(node: PNode) {
        if (rdfaAware) {
          return [
            'table',
            {
              ...renderRdfaAttrs(node.attrs as RdfaAttrs),
              class: 'say-table',
              style: tableStyle,
            },
            renderInvisibleRdfa(node, 'div'),
            ['tbody', { 'data-content-container': true }, 0],
          ];
        } else {
          return [
            'table',
            {
              ...node.attrs,
              class: 'say-table',
              style: tableStyle,
            },
            ['tbody', 0],
          ];
        }
      },
      serialize(node: PNode) {
        const tableView = new TableView(node, 25);
        if (rdfaAware) {
          return [
            'table',
            {
              ...renderRdfaAttrs(node.attrs as RdfaAttrs),
              class: 'say-table',
              style: `width: 100%; ${tableStyle || ''}`,
            },
            tableView.colgroupElement,
            renderInvisibleRdfa(node, 'div'),
            ['tbody', { 'data-content-container': true }, 0],
          ];
        } else {
          return [
            'table',
            {
              ...node.attrs,
              class: 'say-table',
              style: `width: 100%; ${tableStyle || ''}`,
            },
            tableView.colgroupElement,
            ['tbody', 0],
          ];
        }
      },
    },
    table_row: {
      content: '(table_cell | table_header)*',
      tableRole: 'row',
      attrs: rdfaAttrSpec({ rdfaAware }),
      allowGapCursor: false,
      parseDOM: [
        {
          tag: 'tr',
          getAttrs(node: string | HTMLElement) {
            if (typeof node === 'string') {
              return false;
            }
            return { ...getRdfaAttrs(node, { rdfaAware }) };
          },
          contentElement: getRdfaContentElement,
        },
      ],
      toDOM(node: PNode) {
        if (rdfaAware) {
          return renderRdfaAware({
            renderable: node,
            tag: 'tr',
            attrs: {
              style: rowStyle,
            },
            content: 0,
          });
        } else {
          return ['tr', { ...node.attrs, style: rowStyle }, 0];
        }
      },
    },
    table_cell: {
      content: options.cellContent,
      attrs: {
        ...rdfaAttrSpec({ rdfaAware }),
        ...cellAttrs,
      },
      tableRole: 'cell',
      isolating: true,
      allowGapCursor: false,
      parseDOM: [
        {
          tag: 'td',
          getAttrs: (dom: string | HTMLElement) => {
            if (typeof dom === 'string') {
              return false;
            }
            const cellAttrs = getCellAttrs(dom, extraAttrs, rdfaAware);
            return {
              ...getRdfaAttrs(dom, { rdfaAware }),
              ...cellAttrs,
            };
          },
          contentElement: getRdfaContentElement,
        },
      ],
      toDOM(node) {
        const cellAttrs = setCellAttrs(node, extraAttrs, !rdfaAware);
        if (rdfaAware) {
          return renderRdfaAware({
            renderable: node,
            tag: 'td',
            attrs: { ...cellAttrs, style: cellStyle },
            content: 0,
          });
        } else {
          return ['td', { ...cellAttrs, style: cellStyle }, 0];
        }
      },
    },
    table_header: {
      content: options.cellContent,
      attrs: {
        ...rdfaAttrSpec({ rdfaAware }),
        ...cellAttrs,
      },
      tableRole: 'header_cell',
      isolating: true,
      parseDOM: [
        {
          tag: 'th',
          getAttrs: (dom: string | HTMLElement) => {
            if (typeof dom === 'string') {
              return false;
            }
            const cellAttrs = getCellAttrs(dom, extraAttrs, rdfaAware);
            return {
              ...getRdfaAttrs(dom, { rdfaAware }),
              ...cellAttrs,
            };
          },
          contentElement: getRdfaContentElement,
        },
      ],
      toDOM(node) {
        const cellAttrs = setCellAttrs(node, extraAttrs, !rdfaAware);
        if (rdfaAware) {
          return renderRdfaAware({
            renderable: node,
            tag: 'th',
            attrs: { ...cellAttrs, style: cellStyle },
            content: 0,
          });
        } else {
          return ['th', { ...cellAttrs, style: cellStyle }, 0];
        }
      },
    },
  };
}

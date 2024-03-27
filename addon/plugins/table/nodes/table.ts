// Helper for creating a schema that supports tables.
import {
  type RdfaAttrs,
  getRdfaAttrs,
  renderInvisibleRdfa,
  renderRdfaAttrs,
  renderRdfaAware,
  getRdfaContentElement,
  rdfaAttrSpec,
} from '@lblod/ember-rdfa-editor/core/schema';

import { Node as PNode, type NodeSpec, ResolvedPos } from 'prosemirror-model';
import { TableView } from '@lblod/ember-rdfa-editor/plugins/table';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import { getPos } from '@lblod/ember-rdfa-editor/utils/node-utils';
import { constructInlineStyles } from '@lblod/ember-rdfa-editor/utils/_private/html-utils';

interface ExtraAttribute {
  default: unknown;

  getFromDOM?(this: void, node: HTMLElement): unknown;

  setDOMAttr?(this: void, value: unknown, attrs: Record<string, unknown>): void;
}

type CellAttributes = {
  colspan?: number;
  rowspan?: number;
  colwidth?: number[] | null;
  background?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
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
  rowBackground?: {
    even?: string;
    odd?: string;
  };
}

interface TableNodes extends Record<string, NodeSpec> {
  table: SayNodeSpec;
  table_row: SayNodeSpec;
  table_cell: SayNodeSpec;
  table_header: SayNodeSpec;
}

const appendToStyleAttribute = (
  attributes: Record<string, unknown>,
  value: string,
) => {
  if (!attributes['style']) {
    attributes['style'] = value;
    return;
  }

  if (typeof attributes['style'] === 'string') {
    attributes['style'] = `${attributes['style']}; ${value};`;
    return;
  }

  return;
};

const getDefaultCellAttributes = ({
  inlineBorderStyle,
}: {
  inlineBorderStyle?: string;
} = {}): Record<string, ExtraAttribute> => ({
  background: {
    default: null,
    getFromDOM(dom) {
      return dom.style.backgroundColor || null;
    },
    setDOMAttr(value, attrs) {
      if (typeof value === 'string') {
        appendToStyleAttribute(attrs, `background-color: ${value}`);
      }
    },
  },
  borderLeft: {
    default: inlineBorderStyle ?? null,
    getFromDOM(dom) {
      return dom.style.borderLeft || null;
    },
    setDOMAttr(value, attrs) {
      if (typeof value === 'string') {
        appendToStyleAttribute(attrs, `border-left: ${value}`);
      }
    },
  },
  verticalAlign: {
    default: null,
    getFromDOM(dom) {
      return dom.style.verticalAlign || null;
    },
    setDOMAttr(value, attrs) {
      if (typeof value === 'string') {
        appendToStyleAttribute(attrs, `vertical-align: ${value}`);
      }
    },
  },
});

export function tableNodes(options: TableNodeOptions): TableNodes {
  const rdfaAware = options.rdfaAware ?? false;
  const inlineBorderStyle =
    options.inlineBorderStyle &&
    `${options.inlineBorderStyle.width} ${options.inlineBorderStyle.style || 'solid'} ${options.inlineBorderStyle.color}`;

  const extraCellAttributes = options.cellAttributes
    ? {
        ...options.cellAttributes,
        ...getDefaultCellAttributes({ inlineBorderStyle }),
      }
    : getDefaultCellAttributes({ inlineBorderStyle });

  const cellAttrs: Record<string, { default: unknown }> = {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
  };

  for (const [key, attr] of Object.entries(extraCellAttributes)) {
    cellAttrs[key] = { default: attr.default };
  }

  const tableStyle = {
    border: inlineBorderStyle,
    'border-collapse': inlineBorderStyle && 'collapse',
    '--say-even-row-background': options.rowBackground?.even,
    '--say-odd-row-background': options.rowBackground?.odd,
  };

  const rowStyle = {
    'border-top': inlineBorderStyle,
  };

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
              style: constructInlineStyles(tableStyle),
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

              style: constructInlineStyles(tableStyle),
            },
            ['tbody', 0],
          ];
        }
      },
      serialize(node: PNode) {
        const tableView = new TableView(node, 25);
        const style = {
          width: '100%',
          ...tableStyle,
          '--say-even-row-background': undefined,
          '--say-odd-row-background': undefined,
        };
        if (rdfaAware) {
          return [
            'table',
            {
              ...renderRdfaAttrs(node.attrs as RdfaAttrs),
              class: 'say-table',
              style: constructInlineStyles(style),
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
              style: constructInlineStyles(style),
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
      serialize(node, state) {
        const pos = getPos(node, state.doc) as ResolvedPos;
        // table rows are 1-indexed
        const isEven = pos.index() % 2 === 1;
        const style = {
          ...rowStyle,
          background: isEven
            ? options.rowBackground?.even
            : options.rowBackground?.odd,
        };
        return [
          'tr',
          { ...node.attrs, style: constructInlineStyles(style) },
          0,
        ];
      },
      toDOM(node: PNode) {
        if (rdfaAware) {
          return renderRdfaAware({
            renderable: node,
            tag: 'tr',
            attrs: {
              style: constructInlineStyles(rowStyle),
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
            const cellAttrs = getCellAttrs(dom, extraCellAttributes, rdfaAware);
            return {
              ...getRdfaAttrs(dom, { rdfaAware }),
              ...cellAttrs,
            };
          },
          contentElement: getRdfaContentElement,
        },
      ],
      toDOM(node) {
        const cellAttrs = setCellAttrs(node, extraCellAttributes, !rdfaAware);
        if (rdfaAware) {
          return renderRdfaAware({
            renderable: node,
            tag: 'td',
            attrs: { ...cellAttrs },
            content: 0,
          });
        } else {
          return ['td', { ...cellAttrs }, 0];
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
            const cellAttrs = getCellAttrs(dom, extraCellAttributes, rdfaAware);
            return {
              ...getRdfaAttrs(dom, { rdfaAware }),
              ...cellAttrs,
            };
          },
          contentElement: getRdfaContentElement,
        },
      ],
      toDOM(node) {
        const cellAttrs = setCellAttrs(node, extraCellAttributes, !rdfaAware);
        if (rdfaAware) {
          return renderRdfaAware({
            renderable: node,
            tag: 'th',
            attrs: { ...cellAttrs },
            content: 0,
          });
        } else {
          return ['th', { ...cellAttrs }, 0];
        }
      },
    },
  };
}

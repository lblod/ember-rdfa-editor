import { InputRule } from 'prosemirror-inputrules';
import { defaultLinkParser, type LinkParser } from './parser.ts';
import type { NodeType } from 'prosemirror-model';
import type { PNode } from '#root/prosemirror-aliases.ts';

type LinkInputRuleOptions = {
  nodeType: NodeType;
  regex?: RegExp;
  linkParser?: LinkParser;
};

const DEFAULT_REGEX = new RegExp(
  String.raw`
  (^|\s)
  (
    (?: ${/* parse email */ ''}
      (?:mailto:)? ${/* optional mailto: protocol */ ''}
      [A-Za-z0-9._%+-]+ ${/* local-part */ ''}
      @
      [A-Za-z0-9.-]+ ${/* domain */ ''}
      \.
      [A-Za-z]{2,} ${/* extension */ ''}
    )
    |
    (?: ${/* parse weblinks */ ''}
      (?:https?:\/\/)? ${/* optional http(s): protocol */ ''}
      (?:www\.)? ${/* optional www */ ''}
      [A-Za-z0-9.-]+ ${/* domain */ ''}
      \.
      [A-Za-z]{2,} ${/* extension */ ''}
    )
  )
  (\s)$ ${/* single space after url/email */ ''}
  `
    .replace(/^\s+|\s+$/gm, '') // remove white space before and at the end of lines (trimming)
    .replace(/\n/g, ''), // remove newlines
);

/**
 * Input rule which is able to detect plain text links and convert them to a link object.
 * It may be configured with a `nodeType`, a custom `regex` and a custom `linkParser`.
 *
 * If using a custom `regex`, it should meet the following conditions:
 * - The first group should capture the text typed before the (possible) link
 * - The second group should capture the text representing the (possible) link
 * - The third group should capture the text typed after the (possible) link
 */
export const link_input_rule = ({
  nodeType,
  regex = DEFAULT_REGEX,
  linkParser = defaultLinkParser(),
}: LinkInputRuleOptions) => {
  return new InputRule(regex, (state, match, start, end) => {
    // Ensure both the start and end of the input-rule match are within the same parent node
    if (state.doc.resolve(start).parent !== state.doc.resolve(end).parent) {
      return null;
    }

    if (!rangeContainsOnlyText(state.doc, start, end)) {
      return null;
    }

    const textBeforeLink = match[1];
    const link = match[2];
    const textAfterLink = match[3];
    const linkStart = start + textBeforeLink.length;

    const linkParserResult = linkParser(link);
    if (!linkParserResult.isSuccessful) {
      return null;
    }
    const node = nodeType.create(
      {
        href: linkParserResult.value,
      },
      state.schema.text(link),
    );
    const tr = state.tr;

    // replace only the email text
    tr.replaceWith(linkStart, end, node);

    tr.insertText(textAfterLink, linkStart + node.nodeSize);

    return tr;
  });
};

const rangeContainsOnlyText = (doc: PNode, from: number, to: number) => {
  let onlyText = true;
  doc.nodesBetween(from, to, (node) => {
    if (node.isInline && !node.isText) {
      onlyText = false;
      return false;
    }
  });
  return onlyText;
};

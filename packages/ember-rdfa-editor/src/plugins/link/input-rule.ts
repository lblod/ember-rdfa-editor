import { InputRule } from 'prosemirror-inputrules';
import { defaultLinkParser, type LinkParser } from './parser.ts';
import type { NodeType } from 'prosemirror-model';

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
  \s$ ${/* single space after url/email */ ''}
  `
    .replace(/^\s+|\s+$/gm, '') // remove white space before and at the end of lines (trimming)
    .replace(/\n/g, ''), // remove newlines
);

export const link_input_rule = ({
  nodeType,
  regex = DEFAULT_REGEX,
  linkParser = defaultLinkParser(),
}: LinkInputRuleOptions) => {
  return new InputRule(regex, (state, match, start) => {
    const textBeforeLink = match[1];
    const link = match[2];
    const linkStart = start + textBeforeLink.length;
    const linkEnd = linkStart + link.length;
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
    tr.replaceWith(linkStart, linkEnd, node);

    return tr;
  });
};

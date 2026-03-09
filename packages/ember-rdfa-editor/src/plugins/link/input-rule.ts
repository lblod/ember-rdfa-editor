import { InputRule } from 'prosemirror-inputrules';
import { defaultLinkParser, type LinkParser } from './parser.ts';
import type { NodeType } from 'prosemirror-model';

type LinkInputRuleOptions = {
  nodeType: NodeType;
  regex?: RegExp;
  linkParser?: LinkParser;
};

export const link_input_rule = ({
  nodeType,
  regex = /(^|\s)((mailto:)?[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\s$/,
  linkParser = defaultLinkParser(),
}: LinkInputRuleOptions) => {
  return new InputRule(regex, (state, match, start) => {
    const textBeforeEmail = match[1];
    const email = match[2];
    const emailStart = start + textBeforeEmail.length;
    const emailEnd = emailStart + email.length;
    const linkParserResult = linkParser(email);
    if (!linkParserResult.isSuccessful) {
      return null;
    }
    const node = nodeType.create(
      {
        href: linkParserResult.value,
      },
      state.schema.text(email)
    );
    const tr = state.tr;

    // replace only the email text
    tr.replaceWith(emailStart, emailEnd, node);

    return tr;
  });
};

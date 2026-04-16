import { ProsePlugin } from '#root/prosemirror-aliases.ts';
import {
  closeDoubleQuote,
  closeSingleQuote,
  ellipsis,
  emDash,
  InputRule,
  openDoubleQuote,
  openSingleQuote,
  smartQuotes,
  textblockTypeInputRule,
  undoInputRule,
  wrappingInputRule,
  inputRules,
} from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';


function sayInputRules({
  rules,
}: {
  rules: readonly InputRule[];
}) {
  const originalPlugin = inputRules({ rules });
  return new ProsePlugin({
    ...originalPlugin.spec,
    props: {
      ...originalPlugin.spec.props,
      handleKeyDown: (view, event) => {
        if (!originalPlugin.spec.props?.handleTextInput) {
          return false;
        }
        if (event.key !== 'Enter') return false;
        if (!(view.state.selection instanceof TextSelection)) {
          return false;
        }
        const { $cursor } = view.state.selection;
        if (!$cursor) {
          return false;
        }
        originalPlugin.spec.props.handleTextInput.call(
          originalPlugin,
          view,
          $cursor.pos,
          $cursor.pos,
          '\n',
          () => {}
        );

        // process 'Enter' as usual
        return false;
      },
    }
  })
}

export {
  sayInputRules as inputRules,
  closeDoubleQuote,
  closeSingleQuote,
  ellipsis,
  emDash,
  InputRule,
  openDoubleQuote,
  openSingleQuote,
  smartQuotes,
  textblockTypeInputRule,
  undoInputRule,
  wrappingInputRule,
};

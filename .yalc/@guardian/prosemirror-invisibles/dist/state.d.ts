import { EditorState, PluginKey, Transaction } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";
/**
 * State
 */
export interface PluginState {
    decorations: DecorationSet;
    shouldShowInvisibles: boolean;
    shouldShowLineEndSelectionDecorations: boolean;
}
export declare const pluginKey: PluginKey<PluginState>;
/**
 * Selectors
 */
export declare const selectActiveState: (state: EditorState) => boolean;
export declare const getActionFromTransaction: (tr: Transaction) => Actions | undefined;
declare const setShowInvisiblesStateAction: (shouldShowInvisibles: boolean) => {
    type: "SET_SHOW_INVISIBLES_STATE";
    payload: {
        shouldShowInvisibles: boolean;
    };
};
declare const setFocusedStateAction: (isFocused: boolean) => {
    type: "BLUR_DOCUMENT";
    payload: {
        isFocused: boolean;
    };
};
export declare type Actions = ReturnType<typeof setShowInvisiblesStateAction> | ReturnType<typeof setFocusedStateAction>;
/**
 * Reducer
 */
export declare const reducer: (state: PluginState, action: Actions | undefined) => PluginState;
/**
 * Commands
 */
declare type Command = (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
export declare const commands: {
    setActiveState: (shouldShowInvisibles: boolean) => Command;
    toggleActiveState: () => Command;
    setFocusedState: (isFocused: boolean) => Command;
};
export {};

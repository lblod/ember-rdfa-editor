import { PluginKey, Plugin, AllSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
var getInsertedRanges = ({ mapping }) => {
  const ranges = [];
  mapping.maps.forEach((stepMap, i) => {
    stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      ranges.push([
        mapping.slice(i + 1).map(newStart),
        mapping.slice(i + 1).map(newEnd)
      ]);
    });
  });
  return ranges;
};
const pluginKey = new PluginKey(
  "PROSEMIRROR_INVISIBLES_PLUGIN"
);
const selectActiveState = (state) => {
  var _a;
  return !!((_a = pluginKey.getState(state)) == null ? void 0 : _a.shouldShowInvisibles);
};
const PROSEMIRROR_INVISIBLES_ACTION = "PM_INVISIBLES_ACTION";
const getActionFromTransaction = (tr) => tr.getMeta(PROSEMIRROR_INVISIBLES_ACTION);
const SET_SHOW_INVISIBLES_STATE = "SET_SHOW_INVISIBLES_STATE";
const SET_FOCUS_STATE = "BLUR_DOCUMENT";
const setShowInvisiblesStateAction = (shouldShowInvisibles) => ({
  type: SET_SHOW_INVISIBLES_STATE,
  payload: { shouldShowInvisibles }
});
const setFocusedStateAction = (isFocused) => ({
  type: SET_FOCUS_STATE,
  payload: { isFocused }
});
const reducer = (state, action) => {
  if (!action) {
    return state;
  }
  switch (action.type) {
    case SET_SHOW_INVISIBLES_STATE:
      return { ...state, shouldShowInvisibles: action.payload.shouldShowInvisibles };
    case SET_FOCUS_STATE: {
      return {
        ...state,
        shouldShowLineEndSelectionDecorations: action.payload.isFocused
      };
    }
    default:
      return state;
  }
};
const toggleActiveState = () => (state, dispatch) => {
  var _a;
  dispatch && dispatch(
    state.tr.setMeta(
      PROSEMIRROR_INVISIBLES_ACTION,
      setShowInvisiblesStateAction(!((_a = pluginKey.getState(state)) == null ? void 0 : _a.shouldShowInvisibles))
    )
  );
  return true;
};
const setActiveState = (shouldShowInvisibles) => (state, dispatch) => {
  dispatch && dispatch(
    state.tr.setMeta(
      PROSEMIRROR_INVISIBLES_ACTION,
      setShowInvisiblesStateAction(shouldShowInvisibles)
    )
  );
  return true;
};
const setFocusedState = (isFocused) => (state, dispatch) => {
  dispatch && dispatch(
    state.tr.setMeta(
      PROSEMIRROR_INVISIBLES_ACTION,
      setFocusedStateAction(isFocused)
    )
  );
  return true;
};
const commands = { setActiveState, toggleActiveState, setFocusedState };
var invisibles = "";
var textBetween = (from, to, doc) => {
  const positions = [];
  doc.nodesBetween(from, to, (node, pos) => {
    var _a;
    if (node.isText) {
      const offset = Math.max(from, pos) - pos;
      positions.push({
        pos: pos + offset,
        text: ((_a = node.text) == null ? void 0 : _a.slice(offset, to - pos)) || ""
      });
    }
  });
  return positions;
};
var createDeco = (pos, type, markAsSelected = false) => {
  const createElement = () => {
    const span = document.createElement("span");
    span.classList.add("invisible");
    span.classList.add(`invisible--${type}`);
    if (markAsSelected) {
      span.classList.add("invisible--is-selected");
      const selectedMarker = document.createElement("span");
      selectedMarker.classList.add("invisible__selected-marker");
      span.appendChild(selectedMarker);
    }
    return span;
  };
  return Decoration.widget(pos, createElement, {
    marks: [],
    key: `${type}${markAsSelected ? "-selected" : ""}`,
    type,
    side: 1e3
  });
};
const BuilderTypes = {
  NODE: "NODE",
  CHAR: "CHAR"
};
const createInvisibleDecosForCharacter = (type, predicate) => ({
  type: BuilderTypes.CHAR,
  createDecorations: (from, to, doc, decos) => textBetween(from, to, doc).reduce(
    (decos1, { pos, text }) => text.split("").reduce(
      (decos2, char, i) => predicate(char) ? decos2.remove(decos.find(pos + i, pos + i, (_) => _.type === type)).add(doc, [createDeco(pos + i, type)]) : decos2,
      decos1
    ),
    decos
  )
});
const createInvisibleDecosForNode = (type, toPosition, predicate) => ({
  type: BuilderTypes.NODE,
  createDecorations: (from, to, doc, decos, selection, shouldMarkAsSelected) => {
    let newDecos = decos;
    doc.nodesBetween(from, to, (node, pos) => {
      if (predicate(node)) {
        const decoPos = toPosition(node, pos);
        const oldDecos = newDecos.find(
          pos,
          pos + node.nodeSize - 1,
          (deco) => deco.type === type
        );
        const selectionIsCollapsed = (selection == null ? void 0 : selection.from) === (selection == null ? void 0 : selection.to);
        const isWithinCurrentSelection = selection && decoPos >= selection.from && decoPos <= selection.to;
        const selectionIsLongerThanNode = !!isWithinCurrentSelection && selection.to >= pos + node.nodeSize;
        const markAsSelected = shouldMarkAsSelected && selectionIsLongerThanNode && !selectionIsCollapsed;
        newDecos = newDecos.remove(oldDecos).add(doc, [createDeco(decoPos, type, markAsSelected)]);
        return false;
      }
    });
    return newDecos;
  }
});
const isSpace = (char) => char === " ";
var space = createInvisibleDecosForCharacter("space", isSpace);
const isHardbreak = (node) => node.type === node.type.schema.nodes.hard_break;
var hardBreak = createInvisibleDecosForNode("break", (_, pos) => pos, isHardbreak);
const isParagraph = (node) => node.type === node.type.schema.nodes.paragraph;
var paragraph = createInvisibleDecosForNode("par", (node, pos) => pos + node.nodeSize - 1, isParagraph);
const isNbSpace = (char) => char === "\xA0";
var nbSpace = createInvisibleDecosForCharacter("nb-space", isNbSpace);
const isHeading = (node) => node.type === node.type.schema.nodes.heading;
var heading = createInvisibleDecosForNode("heading", (node, pos) => pos + node.nodeSize - 1, isHeading);
const createInvisiblesPlugin = (builders, { shouldShowInvisibles = true, displayLineEndSelection = false } = {}) => new Plugin({
  key: pluginKey,
  state: {
    init: (_, state) => {
      const { from, to } = new AllSelection(state.doc);
      const decorations = builders.reduce(
        (newDecos, { createDecorations }) => createDecorations(
          from,
          to,
          state.doc,
          newDecos,
          state.selection,
          displayLineEndSelection
        ),
        DecorationSet.empty
      );
      return {
        shouldShowInvisibles,
        shouldShowLineEndSelectionDecorations: true,
        decorations
      };
    },
    apply: (tr, pluginState, oldState, newState) => {
      const newPluginState = reducer(
        pluginState,
        getActionFromTransaction(tr)
      );
      const documentBlurStateHasNotChanged = pluginState.shouldShowLineEndSelectionDecorations === newPluginState.shouldShowLineEndSelectionDecorations;
      const docAndSelectionHaveNotChanged = !tr.docChanged && oldState.selection === newState.selection;
      if (documentBlurStateHasNotChanged && docAndSelectionHaveNotChanged) {
        return newPluginState;
      }
      const insertedRanges = getInsertedRanges(tr);
      const selectedRanges = [
        [tr.selection.from, tr.selection.to],
        [
          oldState.selection.from,
          Math.min(oldState.selection.to, tr.doc.nodeSize - 2)
        ]
      ];
      const allRanges = insertedRanges.concat(selectedRanges);
      const shouldDisplayLineEndDecorations = displayLineEndSelection && newPluginState.shouldShowLineEndSelectionDecorations;
      const decorations = builders.reduce(
        (newDecos, { createDecorations, type }) => {
          const rangesToApply = type === "NODE" ? allRanges : insertedRanges;
          return rangesToApply.reduce(
            (nextDecos, [from, to]) => createDecorations(
              from,
              to,
              tr.doc,
              nextDecos,
              tr == null ? void 0 : tr.selection,
              shouldDisplayLineEndDecorations
            ),
            newDecos
          );
        },
        newPluginState.decorations.map(tr.mapping, newState.doc)
      );
      return { ...newPluginState, decorations };
    }
  },
  props: {
    decorations: function(state) {
      const { shouldShowInvisibles: shouldShowInvisibles2, decorations } = this.getState(state) || {};
      return shouldShowInvisibles2 ? decorations : DecorationSet.empty;
    },
    handleDOMEvents: {
      blur: (view, event) => {
        const selectionFallsOutsideOfPage = document.activeElement === event.target;
        if (!selectionFallsOutsideOfPage) {
          commands.setFocusedState(false)(view.state, view.dispatch);
        }
        return false;
      },
      focus: (view) => {
        commands.setFocusedState(true)(view.state, view.dispatch);
        return false;
      }
    }
  }
});
export { commands, createDeco, createInvisibleDecosForCharacter, createInvisibleDecosForNode, createInvisiblesPlugin, hardBreak, heading, nbSpace, paragraph, selectActiveState, space, textBetween };

---
Stage: Draft
Start Date: 30-09-2022
Release Date: unreleased
---

# Improvements in how to represent and handle document selections

## Summary

This RFC includes a proposal in how we can represent ModelSelections in a more versatile way. It introduces some different types of selections and abstractions built on top of the currently used ModelSelection.

Additionally this RFC also includes some proprosals on how we handle and display these selections in the editor.

## Motivation

As the editor API evolves, documents have the ability to contain specific elements which do not only represent text. With the introduction of inline components, interactive elements such as buttons and image can be inserted in a document. Currently, the editor does not yet include functionality on how to select these non-text elements in an intuitive way.

This RFC proposes a design on how we can introduce abstraction on top of the current ModelSelection design.

Additionally it presents some ways in how we can handle these abstractions and how we can represent them in the document user view.

## Detailed design

### Representation of selections

This section introduces two selection implementations

- A `BasicSelection`, which represents the `ModelSelections` we are used to. These are used to represents selections of text and the whole document. In addition to the selection ranges, this selection can also contain marks and have a direction.

- A `ComponentSelection`, which represents a selection of an Inline Component. These selections are triggered by e.g. clicking on such a component. Aside from the selection ranges, this selection type also keeps track of the selected component. This type of selection is only used when selecting a component and nothing else.

Both implementations build upon the `ModelSelection` abstract class, which keeps track of the ranges contained in the selection.

```typescript
abstract class ModelSelection {
  private _ranges: ModelRange[];

  constructor(ranges: ModelRange[] = []) {
    this._ranges = ranges;
  }

  /**
   * The focus is the leftmost position of the selection if the selection
   * is left-to-right, and the rightmost position otherwise.
   */
  get focus(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    if (this.isRightToLeft) {
      return this.lastRange.start;
    }
    return this.lastRange.end;
  }

  /**
   * The anchor is the rightmost position of the selection if the selection
   * is left-to-right, and the leftmost position otherwise.
   */
  get anchor(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    if (this.isRightToLeft) {
      return this.lastRange.end;
    }
    return this.lastRange.start;
  }

  ...
}
```

```typescript
class BasicSelection extends ModelSelection {
  private _isRightToLeft: boolean;
  private _activeMarks: MarkSet;
  constructor(ranges: ModelRange[] = []) {
    this._isRightToLeft = false;
    this._activeMarks = new MarkSet();
    super(ranges);
  }
}
```

```typescript
class ComponentSelection extends ModelSelection {
  _component: ModelInlineComponent;
  constructor(component: ModelInlineComponent) {
    this._component = component;
    const range = ModelPosition.fromAroundNode(component);
    super(range);
  }
}
```

### Handling and displaying selections

This section includes some ideas on how to handle and display both `BasicSelections` and `ComponentSelections`.

`BasicSelection` objects should be displayed and handled as before: these are just shown as simple text cursors in the document.

When a instance of a `ComponentSelection` is active, an attribute to the specific component can be added to indicate it is selected. Additionally the text cursor should be disabled. The selection of the component can be displayed using the attribute.

When writing a selection to the DOM, we can determine which type of selection is active and display the selection accordingly.

When reading a DOM selection we can determine the type of selection based on its ranges and `anchorNode`.

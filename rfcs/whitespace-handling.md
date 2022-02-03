---
Stage: Draft
Start Date: 01-02-2022
Release Date: unreleased
---

# whitespace handling in rdfa-editor

## Summary
Whitespacing handling in contenteditable divs is a nuisance, for one its default behaviour is unconsistent accross browsers. Previously we've resorted to a hack by replacing a space with non breaking spaces when a user types a space. This nbsp would then be replaced with a regular space again if the following character inputted was not a space. The latest implementation of this hack is somewhat lacking and not all nbsp's are replaced properly, however even in the past spurious nbsp's would remain. 

To further complicate things browsers themselves sometimes convert regular spaces to non breaking ones, which is why we should not rely on default browser behaviour for inserting spaces. See [this wordpress bug](https://core.trac.wordpress.org/ticket/31157) for example.

This RFC proposes a different approach using CSS styles to ensure all whitespace is shown. This seems a more elegant solution and moves the difficulty of whitespace handling to loading into - and exporting content from the editor.

## Motivation
non breaking spaces make it hard to render text properly as it's unclear where the browser can break up sentences for overflowing text. If we can use css to make spaces visible without the `nbsp` hack we can forego complex/ugly logic to clean up spurious `nbsp`'s.

## Implementation

The css-3 `white-space` property can be used to tell the browser to preserve (and show) whitespace. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space) has a good explanation of the property. 

We could set this property within the editor stylesheet with a `!important` to make sure it's applied. This would make most (depending on the selected value) whitespace visible to users.

Candidate values would be:

###  pre-wrap 

Sequences of white space are preserved. Lines are broken at newline characters, at `<br>`, and as necessary to fill line boxes.

### break-spaces
| break-spaces |     The behavior is identical to that of pre-wrap, except that:

 *   Any sequence of preserved white space always takes up space, including at the end of the line.
 * A line breaking opportunity exists after every preserved white space character, including between white space characters.
 * Such preserved spaces take up space and do not hang, and thus affect the box’s intrinsic sizes (min-content size and max-content size).

Since this would show all whitespaces we will have to strip unwanted whitespace on setting/loading the editor content. This would mean any textnode only consisting of whitespace, any linebreak, ...

## Caveats
### are we the only ones?
It's unclear whether other editors use this css property and that's something we should investigate. If they don't, perhaps there's a good reason not to do this.

### old content
Older documents, pasted content and our templates contain a lot of spurious whitespace which will likely be shown when we use this css property. We will need some kind of strategy to deal with that.

### inconsistencies between layout in the editor and when rendered outside
Both `pre-wrap` and `break-spaces` also break lines on newline characters, which is likely unwanted behaviour as these will not show up in exported documents unless they apply the same whitespace styling. So extra care needs to be taken to replace these newlines with proper breaks on export. 

Consecutive spaces fold by default, so here too extra care needs to be taken on export. The question then becomes what we do on setting content: do we replace non breaking spaces?


# Deletion behavior

Removing text is a fundamental function of a text editor. While it seems like a trivial one,
in an html-context, and especially rdfa-enriched html, there are quite a lot of choices to be made.

The goal here is to define a "sensible" default behavior for the removal of a text range.
We will look from the perspective of an expert user who is aware of the knowledge in the document.
This is currently a fiction, since we don't have the tooling to make the user aware yet.

### conventions for this document

All document structure examples will use our custom xml spec unless otherwise stated.

The range to be deleted will be indicated with `[]` markers.
In this context, we will only consider the removal of a non-collapsed range, and consider
the removal of a collapsed range to be a no-op.

To denote a node containing rdfa-knowlegde, we will use the fictional `<rdfa>` node.

a no-width-space will be indicated with `&`.

#### reminder: equivalent positions

the following positions are identical:

```xml
<span>[<text>abc</text></span>
```

```xml
<span><text>[abc</text></span>
```

however, these are not:

```xml
<span><h1>[<text>abc</text></h1></span>
```

```xml
<span>[<h1><text>abc</text></h1></span>
```

# General principles

In order of importance.

## Correctness

At no point should a removal operation lead to incorrect data. In practice, this means
that

- no new triples can be created by a removal operation
- a triple's object value cannot increase in length, only decrease
- no triples should be made inaccessible by a removal operation

_The implication of this is that it is better to remove rdfa-enriched nodes than to
have inaccessible nodes._

Knowledge that is removed can be recreated, but knowledge that is invisible and inaccessible
to the user is likely incorrect!

## Convention

For the user, deletion should feel "natural". For this, we will reference other popular
browser-based rich-text editors.

## Minimalism

We should strive for the least complex, correct model state after a removal.
This means that any nodes that can be merged, should be, and no empty "useless" nodes
should remain.

# Case: confined in text node

```xml
<text>te[s]t</text>
```

**result:**

```xml
<text>te[]t</text>
```

Even in the simplest case there are some things we need to consider.
Note that we end up with a single text node, not 2. The resulting text node should
contain all the mark and attribute information of the original node.

# Case: across 2 text nodes

```xml
<text>ab[c</text><text>d]ef</text>
```

**result:**

```xml
<text>ab[</text><text>]ef</text>
```

or

```xml
<text>ab[]ef</text>
```

Normally, a state where there exist two adjacent text nodes means that those text nodes
cannot be merged. Typically this is because of a difference in marks or other attributes.

# Case: across 2 text nodes, one fully selected

```xml
<text>ab[c</text><text>def]</text>
```

**result:**

```xml
<text>ab[]</text>
```

We should strive to avoid empty nodes where possible.
It is conceivable there could be a reason why the second textnode would not be allowed to be
removed, however this is out of scope for now.

# Case: all content inside an element

```xml
<span>[<text>abc</text>]</span>
```

**result:**

```xml
<span>&[]</span>
```

Reasoning here is the following behavior in GDocs:

- create a header
- fully select it, and then remove it
- start typing

The newly typed text will appear as a header.

Note that this behavior is already influenced by current implementation.
Header-ness of text can be considered a property of that text, so could be implemented using marks
or some other non-structural technique. However, in the interest of actually getting anything done,
we will take the current implementation as a given.

### Complication:

Say the user performs the above removal, but then clicks away from the resulting location?
We would end up with an invisible and inaccessible "useless" element, breaking the minimalism principle.

I see two ways of handling this:

- Make the "empty" element reselectable
  This would be consistent with Gdocs' behavior around headers (but not around inline styling!).
  It would require the selection logic to have a preference for leafnodes when handling cursor moves.

- Upon moving out, remove the "empty" element
  This would result in clean html, but loses the "headerness" of that particular spot on the page.
  While this breaks principle 2, I think it is still an acceptable solution in this case, and
  might be much easier to implement.

### RDFA

In the event the parent node has rdfa knowledge, the logic still aplies, but it is worth
taking a moment to justify:

```xml
<rdfa>[<text>abc</text>]</rdfa>
```

**result:**

```xml
<rdfa>&[]</rdfa>
```

Is still correct, given the user will then type something to fill the rdfa-node.

**If the user clicks away, removing the node is better than leaving it inaccessible!**

The user clearly indicated an intent to remove the information,
leaving behind the triple with a possibly empty object value is likely not what the user wants.

# Case: across elements

Undoubtedly the most interesting case. Let's start with the basics:

```xml
<span>
  <text>ab[c</text>
</span
<span>
  <text>d]ef</text>
</span>
```

**result:**

```xml
<span>
  <text>ab[]ef</text>
</span>
```

Note we lost the second span here! This is a result of the minimalism principle.

However, there are quite a few cases where that is overridden by the other two principles:

### rdfa

```xml
<rdfa>
  <text>ab[c</text>
</rdfa>
<span>
  <text>d]ef</text>
</span>
```

**result:**

```xml
<rdfa>
  <text>ab</text>
<rdfa>
<text>[]ef</text>
```

Here, we simply cannot know what the user's intention is. 
Do they want the new value of the rdfa knowledge to be `abef` or `ab`?
This is pure conjecture, but I think the former is the more common usecase, 
but the latter is a safer default, so I'd pick the latter for now.


```xml
<span>
  <text>ab[c</text>
</span>
<rdfa>
  <text>d]ef</text>
</rdfa>
```

**result:**

```xml
<span>
  <text>ab[</text>
<span>
<rdfa>
  <text>]ef</text>
</rdfa>
```
Here, it is more clear: merging would lead to loss of knowledge. Should the user
desire that loss, more explicit actions should be made available.

```xml
<span>
  <text>ab[c</text>
</span>
<rdfa>
  <text>def]</text>
</rdfa>
```

**result:**

```xml
<span>
  <text>ab[]</text>
<span>
```

Another interesting case reminiscent of the "all content inside element" case. In essence, I interpret this as equivalent to the following steps
- fully select the rdfa text
- remove it
- select the `c` inside the span
- remove it

In that case, it becomes clear why the rdfa-knowledge gets destroyed: it is a "delete content of element and then move away" case.
Again, either we remove it, or we make it obviously accessible.
I opt for the former for now, but I consider the latter to be a better UX provided we can find a nice way to present it.

### lists

In essence, the default behavior of merging is what other editors seem to tend towards.
Theoretically, a list-item can also contain rdfa-knowledge, in which the same stipulations 
as mentioned above apply.

### complex example

Above examples outline the general principles of element merging, but it's worth 
showing a more complex tree:

```xml
<div>
  <ul>
    <li><text>ab[c</text></li>
  </ul>
</div>
<div>
  <span>
    <text>d]ef</text>
  </span>
</div>
```

**result:**

```xml
<div>
  <ul>
    <li><text>ab[]ef</text></li>
  </ul>
</div>
```

This demonstrates that we expect the right side to merge into the left side at the depth of the startposition.

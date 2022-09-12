---
Stage: Draft
Start Date: 30-08-2022
Release Date: unreleased
---

# Model

## Summary

This rfc describes the shape and characteristics of the datastructures used to represent the document being edited.
We propose a simple tree structure to hold the content, without backlinks, to allow for efficient cloning and replacing.
Alongside the content, we define two systems for specifying positions within that document, which are primarily used
to represent the position of the text cursor, or 'caret': a simple number representing the distance in characters to the
start of the document, and a more elaborate structure based on the path of offsets from the root node in a particular
tree.

## Motivation

As with most of the RFCs in this project, there is a considerable history which led to its creation. Coming from
direct DOM edits, we moved to a custom structure to avoid some design decisions of the DOM which were hindering
our progress. The structure we landed on ended up looking very similar to the DOM, only incorporating the few tweaks we
needed at the time, primarily turning textnodes into first-class nodes and doing away with the awkwardness of
nodes such as `<b>`, `<strong>`, etc.

Another big change was made to the datastructure that represents positions. The DOM's implementation allows for a single
position to be represented by multiple paths, which was a nightmare to work with. Moving from a system based on node
indices to something we ended up calling 'offsets' was a big step forward.

Now, after the creation of the Transactional Edits RFC, we once again need to re-evaluate our core datastructures to
better accommodate the new paradigms we introduced.

In particular, the paradigm of treating state as a value does not mesh well with the current design of the document
tree.
The reason for that are _back-references_ or _backlinks_. This means that every node in the tree holds a reference
to its parent. Here's an example of why that's a problem:

Consider a simple tree made up of a root node R with two children A and B. Say we want to make an edit to node B,
e.g. changing its content. We cannot simply modify node B, since that would break the immutability constraint,
making things like history difficult to track.

The simplest solution is to deep-clone the tree, ending up with R', A', and B', then editing the content of B', and
then setting the document state to the new R' node. (This does not break immutability since we only consider the
_state_ to be immutable, we can "mutate" while constructing a new state.)

However, this is inefficient. The subtree under A has not changed at all. The only thing that changed in A is its
parent reference, since that now has to point to R' instead of R. Through performance monitoring, we've seen that
this deep cloning incurs a significant cost in our average use cases, so it is important to optimize here.

Consider now the same example but _without back-references_. When cloning, we can safely reuse the reference to A,
ending up with the tree R', A, B'. When replacing a node, only its path to root needs to be cloned (since
replacing a child implies replacing the parent), but the rest can remain (since replacing a parent does not imply
replacing a child).

## Detailed design

### ModelNode

Since the change away from parent references will have rather deep implications throughout the codebase, and will 
need significant refactoring either way, I think it is a good opportunity to clean up and simplify 
the interface as a whole, something I've been wanting to do for a long time.
The design also falls in line with what was outlined in the "Stage 1" RFC

The idea is that a particular node in the tree is fully defined with 3 properties:
what "kind" of node it is, what data the node itself contains, and which children it has.
We represent these with 3 interfaces, NodeSpec, NodeData and NodeContent (for lack of a better term) respectively.

The separation also helps with cloning: we can be confident that the content hasn't changed when using methods defined
on NodeData and vice-versa, so an immutable implementation can simply reuse the references. The spec instance is
shared across all nodes with the same spec, so it can also be reused.

We may want to look at providing immutable-style node-transformation methods on the node interface, but I'm a bit
hesitant to overload that interface once again, maybe a collection of pure functions would suit better, or we may
expand the transaction interface to provide them. Where these methods exist has been a point of doubt since the
start of the VDOM adventure, and I'm still not sure, but the picture is becoming clearer.

```typescript
import {MarkSet, MarkSpec} from "./mark";

interface ModelNode {
  spec: NodeSpec;
  data: NodeData;
  content: NodeContent;
}


interface NodeSpec {
  name: string;
  // general properties on how the node will behave
  // others may be necessary
  isLeaf: boolean;
  isBlock: boolean;
  // this is such an important distinction that we cannot 
  // afford to implement it as a spec, the editor needs to know
  // whether a certain spec will behave "like text"
  isText: boolean;
  // similar to the domnodematchers from marks, but 
  // that interface will need some rework as well
  matchers: DomNodeMatcher[];


  write(modelNode: ModelNode): Node
}

interface NodeData {
  attributes: Map<string, string>;
  marks: MarkSet;
  // ignored if isText === false,
  // or maybe not present, depends on how feasible it will be to typecheck this
  text: string;
  // length of text for textnodes, 1 for leaf nodes, size of content + 2 for others. (see position section)
  size: number;
}

interface NodeContent {
  children: ModelNode[];
  isEmpty: boolean;

  addChild(): NodeContent;

  removeChild(): NodeContent;
}
```

#### NodeSpec

NodeSpec is a template containing all the information to build a ModelNode from.
You could consider this to be the superclass. The reason it's implemented using composition is to allow the freedom
of dynamically adding new specs to the editor state. This would make it possible for plugins to implement their own
node types, although that specific feature is not a direct goal of this PR and might require its own RFC. (In
particular, it is not yet clear how this will interact with inline components. It might supersede them, it might
fit more for a different use case, or it might not even be needed at all.)

Alongside some crucial metadata, it contains the information needed to build itself from some configuration of DOM
nodes, and the inverse: the instructions needed to write itself back out to the DOM. You could call this the DNA of
the node.

Important to note is that every node with the same spec will share a single instance of that spec. In other words, it
can't be used to store node-specific state.

#### NodeData

NodeData is a container for any data a node might want to store. It is meant to be extensible by the nodeSpec.
Note we define marks here for all nodes; the impact of this is currently unclear and will need experimentation.
One option is to ignore the marks property for all non-leaf nodes. Another is to remove it from the base interface
and let the spec decide its inclusion. Or we could simply allow marks for all nodes. At the time of writing I
cannot favour one approach over the other.

In general this is the interface I'm the least sure of, and it might be redundant: we could simply put the
attributes and marks directly on the node instance.

#### NodeContent

The decision to make this a separate interface instead of a simple array is also not set in stone. The main
motivation for it is future-proofing: defining our own container for child-state allows us to provide useful methods
on it and separate the concerns of managing the child array from the node itself. We saw an explosion of methods for
managing children that were all implemented on the node directly, so the argument for separation is definitely to be
considered.

Another reason for the custom interface is that it will also be treated as immutable. This is possible with a bare
array, but will be more challenging to present a clean interface that makes working immutably seamless.

Note an important change in design: _every_ node will have a NodeContent instance. For leaf nodes, this means they
will have an empty instance.

### Positions

#### ModelPosition

This interface will remain as-is, with offsets retaining their semantics. Conversion functions to and from simple 
positions will be needed, and they will likely also be added to the ModelPosition class for convenience.

#### SimplePosition

When dealing with immutability, we quickly faced a need for a way to specify a position that could be interpreted in
different document trees. This is not possible with the current ModelPosition interface since it relies on a
path-from-root, with a hard reference to the specific root node. Translation is technically possible, but it is hard
to define exactly how an old position should be interpreted in the new tree, which may have a radically different
structure.

A simple example to illustrate how quickly the problem can occur:

```xml
<!-- tree 1 -->
<div>
  <span>
    abcd
  </span>
</div>
```

```xml
<!-- tree 2 -->
<div>
  abcd
</div>
```

in tree 1, the position to the left of the "b" is defined by the path `[0,1]`.

in tree 2, that path is no longer valid. One approach could be to ignore the invalid parts of the path, leading to a
position to the left of the "a". This is technically workable, since we can calculate what changed between the two
trees and shift the position accordingly, but this becomes complex very quickly (we know this from experience).

A different approach is to define a second method of specifying positions which does not depend on a path from a root.
For this, we use a method that seems to be pretty much universally employed by all wysiwyg editors we investigated.

The position is a simple integer, which is an offset from the start of the document. We calculate that offset as
follows:

- every character counts as one
- every non-text leaf node counts as one
- for every non-leaf node we enter, we add one
- for every non-leaf node we leave, we add one

Those last two rules can be interpreted as "opening and closing tags count as one".

An example to demonstrate that this suffices to specify every reachable position in the document unambiguously:

```xml

<root>
  [0]
  <span>[1]a[2]b[3]c[4]d[5]</span>
  [6]
  <br/>
  [7]
</root>
```

Since every node will store its length, conversion between the two types of positions will be relatively
straightforward to implement.

Using simple positions, it also becomes much easier to define a mapping pre-edit to post-edit, since we only have to
specify how many "points" were added or removed.
in the above example;

```xml
<!-- tree 1 -->
<div>
  <span>
    abcd
  </span>
</div>
```

```xml
<!-- tree 2 -->
<div>
  abcd
</div>
```

the mapping could simply be defined as

```typescript
function map(position: number): number {
  if (position >= 6) {
    return position - 2;
  } else if (position >= 1) {
    return position - 1;
  } else {
    return position;
  }
}
```
With similar looking functions for other kinds of edits, we can easily create these mappings in a generic way.
We've tried to do this for path-based positions, and while it is likely possible, it is difficult and error-prone.

I also think that having access to this type of position will benefit plugin authors, since it is easier to 
reason about. 

## Impact

### The Good

- I believe the removal of backlinks will radically improve the developer experience when working with document trees. 
We've had issues with the bookkeeping required for backlinks ever since the inception of the ModelNode class, 
right up until recently, where I found a severe bug in probably the longest living and most used method in the 
system: `element.addChild`.

- It is pretty much a requirement if we want to go down this path of functional-style programming, and I very much do.

- With the flexibility and simplicity the new node interface offers, we open up new possibilities for plugin authors 
to express what they need to do.

- The addition of simple positions will allow for a much cleaner handling of caret positions throughout edits.

### The Bad

Undoubtedly, we will need to reference a node's parent and siblings at some point. To do this withouth explicit 
parent references, we have to dereference a position in a certain tree. Not only is this more cumbersome, 
it will also incur a performance cost, scaling linearly in the depth of the tree. 
From anecdotal evidence, realistic document trees tend to be relatively flat, 
so I think this will not prove too big of a bottleneck in the long run 
(there is some evidence it won't, since the approach is pretty much identical to the way prosemirror does it).

### The Ugly

Here's the real stinker. This RFC proposes a significant overhaul of the lowest level interface we have. 
This has a number of significant consequences:

- The parent and sibling references alone are used extensively throughout the codebase. 
While I think most uses can actually be avoided (since they happen right after dereferencing a position into a node), 
it means the refactor is quite a big task.

- In theory, since transactional edits is a prerequisite for this RFC, all commands should remain relatively stable. 
However, some use the "create a subtree and replace it with a transaction" approach, which, while it meshes quite well 
with immutability, will need a refactor due to the changed interface. 

- I cannot see a realistic way to implement this without it being a breaking change to the outside world, 
so plugins will likely need adjusting.

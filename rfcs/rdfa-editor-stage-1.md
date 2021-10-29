---
Stage: Draft
Start Date: 28-10-2021
Release Date: Unreleased
RFC PR: 
---

# rdfa-editor architecture stage 1

## Summary

The goal of this RFC is to settle on a solid future direction for the internal architecture and api surface for the rdfa-editor.
The architecture in this RFC is heavily inspired by the design decisions made in the excellent [ProseMirror][prosemirror] project.
While adopting prosemirror as a base has been considered, past experience with libraries and the unique requirements we have
for working with linked data lead us to believe the control and flexibility of a hand-rolled solution outweigh the cost.

This RFC is subtitled stage 1. You may correctly deduce that this means that follow-up RFCs are on the way.
We are continually faced with a tradeoff between architectural refinement and delivering features on time.
The stage 1 proposal tries to keep as many of the current concepts and structure as possible, and is mainly intended
to standardize and document, while also setting out core principles by which future design will be guided.

## Motivation

The project has gone through a number of sweeping codebase changes and paradigm shifts, which have made progress difficult.
It is my opinion that such a process is unavoidable and required for a project of this scale, as it simply takes 
a number of attempts to gather enough domain specific knowledge to be able to assess the viability of certain strategies.

I believe we are at a point however, where a vague vision of what the future could and should be is starting to crystallize.

This is the first RFC for this project, and as far as I am aware the first time a design has been proposed as an RFC in any of our
projects. The template this RFC loosely follows is inspired by the RFC process of the Ember community.

I'm writing this document because I feel I have often pushed through architectural changes that were ill-advised and not sufficiently discussed.
They then came as a surprise to collaborators and made progress difficult, since it was never quite clear what the new paradigm to follow was.

While this is a bad time to start with this kind of process, I believe it is still the best possible time, as the longer we go on without 
a clear vision, the bigger the problems we face will become.

The scope of this RFC is likely way too big to fit into a single document, but let's at least see how this goes.


## Detailed design

### Core principles

These core principles are ranked in order of importance. They are core philosophies which should
permeate every aspect of the design. When principles clash, the higher-priority principle should
be chosen.

#### Rdf knowledge as a first-class concept

On the highest possible level, what we are trying to create here is a tool with which documents can
be constructed which are as easily understood by humans as by computers. The foundational technology
which makes this possible is Linked Data, more specifically its HTML+RDFa representation. 
This duality of natural language and structural data brings its own unique challenges, which
should be taken into consideration at every layer of the architecture. 

This means that at every point, we can assume HTML+RDFa to be the main input and output format.
Other formats may be specified but can never take precedence.

#### Extensibility

Following the open-world principles of linked data, it is impossible to foresee future requirements
and use-cases. As such it is impossible to design a limited API which would support all usecases.
This leads us into taking extensibility right down to the core. Authors of extensions should
encounter as little roadblocks as possible. 

Extensibility also means "ease of extensibility". At a high level, it should be easy to express what you mean.
These two pillars can clash sometimes. Exposing internals makes sure extensions _can_ do everything, but it might be complex,
while abstractions and simple APIs mean it is _easy_ to do _some_ things, but _other_ things can be impossible.

We consider the first pillar to be more important, as theoretically it should be possible to provide simple
APIs on top of exposed low-level internals. In this, we again are inspired by the Prosemirror model, where
we see the community provide more structured wrappers (e.g. [Tiptap][tiptap]) on top of the internals, with more expressive but
also more limited APIs.

#### Immutability

From past experience, we know that managing a state as complex as a document can be tough. While mutating state is easy to implement, 
at various points in the application, we require detailed knowledge and control over those state changes. This is rather difficult to achieve when
any piece of code can mutate the (in essence global) document state.

We can learn from ProseMirror that a functional style lends itself well to these requirements. Treating the document as a value means things like
combining transformations, history rollbacks, and asynchronous editing become simpler to reason about. Edits can become transactions, not unlike database
transactions, which we like for their atomicity and ability to rollback to a known valid state when things go wrong.


### Architecture Stage 1

To give a quick overview of the ideas in this proposal, we will give an example of how a typical editing command would be implemented:

The details and structuring of the various utility methods implied here are not part of this RFC, but they show a 
philosophy of where various pieces of logic are expected to live.

From the start of the VDOM-period, I've went back and forth about whether node classes
should contain logic, or wether we should adopt a more functional design where 
we make more heavy use of utility functions. From our experiments with a ModelTable
custom node class, we learn that node-owned methods can be very expressive and intuitive.
The question of "what can I do with this" becomes easily answered. 

The main argument against this usually involved control over state changes. How
do we implement a `table.insertRow` method while also making sure we can control and track any changes
to the document? The current implementation of mutators and operations provides a solution, but
we run into weird situations where we have methods on nodes which all take in a mutator, which they need to get from somewhere.
It also puts a lot of strain on the mutator's api surface, as different node types can have different abstractions and might
want to interact with their content in different ways.

These problems dissapear if we apply the immutability principle here. If we demand that any node-owned method
does not mutate the node itself (rather returns a new node with desired values), we can reduce the mutator api surface
to convenient ways to replace existing nodes (or ranges) with their newly minted content. Prosemirror shows us that this
approach can be implemented in a sufficiently performant way. 

This demand is consciously not enforced, as javascript is a notably _very_ mutable language, and _actually_ making things immutable
comes with a cost. Plugin authors which implement their own node types are operating on the lowest possible level, and 
are expected to read documentation and adhere to conventions, just as someone assembling their own computer from parts can be expected
to handle components with care and follow instructions.

I also consider allowing plugins to extend the available node-types a very powerful and expressive tool. Rather than concerning
oneself with node-structures, one could implement a TodoItem nodetype, let's say, with natural methods such as `setStatus()` and `schedule()`,
rather than interacting with things like html attributes. All we would need is to implement (de)serialization logic into and from the new type,
and we'd be able to work with the node and write commands in a natural way. Requiring immutability at this point gives us state-tracking and
atomic updates "for free" (aka without polluting the node's apis with unwieldy mutator objects).



```typescript
class InsertListItemCommand extends Command<{range: ModelRange}, void> {

  canExecute({controller}, {range}): boolean {
    return range.parentContext.containsNodeOfType("listNode");
  }
  
  execute(config: CommandConfig, args: {range: ModelRange}): void {
    const {controller} = config;
    if(this.canExecute()) {
      const listNode: ListNode = range.parentContext.findNodesOfType("listNode").next();
      const listIndex = listNode.indexFromRange(range);
      const newListNode = listNode.insertNewItem(listIndex);
      const {mapping} = controller.mutator.replaceNode(listNode, newListNode);
      controller.mapSelectionAndSet(mapping);
    }
  }
}
```


#### Editor

The Editor class is a container for all relevant state which is needed to create and operate the editor. 
Of this state, the Document and the Selection are typically the most important and as of now the only ones
which are defined. But we leave open the possibility for extra state to be added by plugins.
  
Besides managing the state, it also provides the primary api for modifying that state.
   
```typescript
interface Editor {
  document: ModelNode;
  selection: ModelSelection;
}
```

#### Controller

The controller class is a simple wrapper around the editor class. Every consumer of the editor will receive its own
unique controller instance. This is done to track the origin of changes back to the callsite, and enable 
plugins to recognize when a change-event is triggered by an action they performed, so they can avoid infinite loops.

```typescript
interface Controller {

  executeCommand<A, R>(commandName: string, args: A): R;
  registerCommand<A, R>(command: new(): Command<A,R>): void;
  mutator: Mutator;
}
```


#### ModelNode (immutable)

This represents a single node in the document tree. It is in essence on its own an entirely
valid document. 
The node class and its descendants should provide methods to manipulate nodes in an immutable way.

*interface*

```typescript
interface ModelNode {
  type: string;
  children: ModelNode[];
  parent?: ModelNode;
  rdfa: NodeRdfa
}
```


#### ModelPosition (immutable)

A ModelPosition represents a valid location in the document. 


```typescript
interface ModelPositon {
  path: number[];
  root: ModelNode;
}
```

##### motivation

If we take a step back, and ask ourselves what an intuitive definition for a Position in the document
could be, we find ourselves torn between two answers.
On the one hand, if we look at the rendered textDocument, it seems logical to represent
a position as a single number, aka the number of characters from the start of the document.

It is immediately clear why this is a useful representation. Arguably the most essential editing
operation of them all, a single keypress of a character key, adds a single character to the document
at the cursor position. all characters after it visually move by "1 spot". The same goes for the 
behavior of an arrow key. We expect the cursor to move "1 step" to the next character. 

However, once we get more familiar with the tree structure, problems start to appear. 
A single "character offset" is simply not descriptive enough to specify a unique location in a tree.

A simple example of this problem:

```html
<div>abc<span>def</span></div>
```

Here, while we can likely agree the unique position of character offsets 0,1 and 2, what position
should an offset of 3 represent? After the "c", or before the "d"? There is no visual difference 
of course, but anyone who has worked on this project knows that knowing the difference is vital
for implementing the algorithms that actually do the work.

Prosemirror proposes a simple solution to this problem: simply treat a node-boundary as a character.
This would mean that the abovementioned 3rd position would be definitively set as "after c", and the 4th position
would then be "before d".
This does mean that we lose the ability to express "just move one character, regardless of tree structure". 

Another way to represent positions is to embrace the tree structure and represent positions as paths of offsets from
the root node. This is how the current [ModelPositions][modelpositions] work.
The benefit of this representation is that it encodes way more information about the tree structure it operates in. It is
also easier to calculate.

As this second representation is currently implemented, this will be what we will use. However,
the main reason for the small detour about character offsets above serves to illustrate that 
both representations have merit, and a conversion between the two could be desirable.



#### ModelRange

A modelRange simply denotes a contiguous selection between two modelpositions. 
We recognize here that the DOM specification allows for ranges to be left-to-right, that is,
to have an anchornode _after_ the focusnode. We do this by maintaining a SelectionDirection
property on a range.

```typescript
enum SelectionDirection {
    LEFT_TO_RIGHT, RIGHT_TO_LEFT
}

interface ModelRange {
  start: ModelPosition;
  end: ModelPosition;
  direction: SelectionDirection;
}
```

#### ModelSelection

A selection represents the selected region of the document. While in practice, some browsers only
support a single contiguous range, we follow the DOM specification which specifies that a selection
_can_ contain multiple ranges. A range from the dom translates to a fragment of the document 
as specified above. However, in addition to a start and end, a selection also has a direction.

This is why we define a simple Range interface which is in essence simply a tuple of a Fragment 
and a direction.


```typescript 
interface ESelection {
  ranges: ModelRange[]
}
```

#### Operation

An operation represents an atomic change to the Model. Operations should be designed to be composable and combinable.

```typescript
interface Operation {

}
```

#### Mutator

Whereas operations are the smallest unit of change to the document, the mutator interface represents
the "core editing operations" needed to make useful changes to the document. Operations tend to be too
atomic for this purpose.
```typescript
interface Mutator {

}
```

#### Command

A command represents the highest-level primitive with which to build editing functionality. 
Commands should be named after their intention. As certain commands only make sense in certain contexts,
commands also carry with them a method to check whether their execution makes sense at the moment.
Commands receive 2 argument objects: a config object container the tools the command needs to interact with the document,
and an args object containing user-defined arguments that the callsite has to provide.

```typescript
interface CommandConfig {
  executedBy: string;
  controller: Controller;
}

interface Command<A> {
  canExecute(config: CommandConfig, args: A): boolean;
  execute(config: CommandConfig, args: A);
}
```



## Drawbacks

> Why should we *not* do this? Please consider the impact on teaching Ember,
on the integration of this feature with other existing and planned features,
on the impact of the API churn on existing apps, etc.

> There are tradeoffs to choosing any path, please attempt to identify them here.

## Alternatives

> What other designs have been considered? What is the impact of not doing this?

> This section could also include prior art, that is, how other frameworks in the same domain have solved this problem.

## Unresolved questions

> Optional, but suggested for first drafts. What parts of the design are still
TBD?

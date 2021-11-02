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
    const {range} = args;
    if(this.canExecute()) {
      const listNode: ListNode = range.parentContext.findNodesOfType("listNode").next();
      const listIndex = listNode.indexFromRange(range);
      const newListNode = listNode.insertNewItem(listIndex);
      const {mapping} = controller.mutator.replaceNode(listNode, newListNode);
      controller.mutator.mapSelectionAndSet(mapping);
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
  commands: Command[];
  document: ModelNode;
  selection: ModelSelection;
  eventBus: EventBus;
}
```

#### Controller

The controller class is a simple wrapper around the editor class. Every consumer of the editor will receive its own
unique controller instance. This is done to track the origin of changes back to the callsite, and enable 
plugins to recognize when a change-event is triggered by an action they performed, so they can avoid infinite loops.

```typescript
interface Controller {
  name: string;
  executeCommand<A, R>(commandName: string, args: A): R;
  registerCommand<A, R>(command: new(): Command<A,R>): void;
  registerWidget(spec: WidgetSpec): void;
  registerNodeType(spec: NodeSpec): void;
  mutator: Mutator;
  selection: ModelSelection;
  emitEvent(event: EditorEvent);
  onEvent(eventName: string, listener: EditorEventListener, config?: ListenerConfig);
  offEvent(eventName: string, listener: EditorEventListener, config?: ListenerConfig)
}
```

#### EventBus

The eventbus controls the brokering of EditorEvents. Contrary to the builtin DOM event mechanism, the eventbus is not a global singleton. Every instance of the Editor class
will have a unique instance of an eventbus, meaning interference between multiple instances on the same page is impossible. Another reason for a custom event system is simply
to allow for a more finegrained control over event propagation and bubbling, as well as fully typechecked events. 

Listeners are notified in priority order, and listeners with the same priority in reverse order of registration.

Events have an owner (aka the consumer responsible for doing the action that causes the event to fire) and a payload, which can be any object.
They also have a stopPropagation method, which, once called, will make sure no further listeners are notified. 

While a context-bubbling mechanism is currently implemented, it is experimental at best and it is unclear how useful it will be, so it was left out of this RFC.

Note: types are simplified here to their essence.

```typescript
type EditorEventListener = (event: EditorEvent) => void;
type EventListenerPriority = "highest" | "high" | "default" | "low" | "lowest" | "internal";

interface ListenerConfig {
  priority: ListenerPriority;
}

interface EditorEvent<P> {
  name: string;
  owner: string;
  stopped: boolean;
  payload: P;
  stopPropagation(): void;
}

interface EventBus {
  emit(event: EditorEvent);
  emitDebounced(delayMs: number, event: EditorEvent);
  on(eventName: string, listener: EditorEventListener, config?: ListenerConfig);
  off(eventName: string, listener: EditorEventListener, config?: ListenerConfig);
}
```


##### Available Events

The amount of emitted events should be kept to a minimum, whle still providing as much information
as possible.
Plugins are however allowed to define custom event types and emit them as they see fit.
Some events are caused by things which happen very often, and are thus emitted in a debounced fashion.

- SelectionChanged (debounced): Emitted whenever the document selection gets updated. For many plugins,
this will be one of the most important events to hook into.

- ContentChanged (debounced): Emitted whenever the document itself gets updated. Its payload should provide
a good amount of context so listeners can filter for content changes they care about.


#### ModelNode (immutable)

This represents a single node in the document tree. It is in essence on its own an entirely
valid document. 
The node class should provide methods to manipulate nodes in an immutable way.

*interface*

```typescript
interface ModelNode {
  type: string;
  children: ModelNode[];
  parent?: ModelNode;
  
}
```

#### Datastore

At its core, rdfa is a method of attaching linked data knowledge to a structured markup document. It is designed around the idea
that a document can contain human-readable and machine-readable information at the same time.

To make that machine-readable information editable by humans, we need to define some new concepts.
For one, there needs to be a clear indication of _what_ we are currently working on.
This is not a trivial question. To demonstrate this, an example (taken from [](rdfa.info/play)):

```html
<div vocab="http://schema.org/" typeof="Person">
  <a property="image" href="http://manu.sporny.org/images/manu.png">
    <span property="name">Manu Sporny</span></a>, 
  <span property="jobTitle">Founder/CEO</span>
  <div>
    Phone: <span property="telephone">(540) 961-4469</span>
  </div>
  <div>
    E-mail: <a property="email" href="mailto:msporny@digitalbazaar.com">msporny@digitalbazaar.com</a>
  </div>
  <div>
    Links: <a property="url" href="http://manu.sporny.org/">Manu's homepage</a>
  </div>
</div>
```

Imagine putting your cursor somewhere inside the email address. "What" are you editing at that point?
In technical terms, you are editing the value for the object of the triple `<blankNode> schema:email "msporny@digitalbazaar.com"`.
Now imagine an address-book style plugin, which would suggest email addresses from a database. Clearly, it needs
to be aware that the user is currently intending to edit an email address. 
So we should be able to express in the plugin: "if the user is editing the object value of a triple where the predicate is `schema:email`, 
provide some support.
Ok simple enough, right? Calculate the triple which is currently being edited, and send that information to plugins.

However, what if a plugin is not interested in email-addresses, but in Persons? That same address-book plugin, for example,
could provide a way to add new entries by detecting information in the document about people it doesn't recognize, and
rendering an "Add to contacts" button. 
For that, calculating the abovementioned triple would not be enough. We would need to look further in the document and
see that that same blankNode, of which we are currently editing the email address, also is the subject of the triple
`<blankNode> a schema:Person`, or colloquially, that it is an instance of the Person class.

And imagine even further, that this `blankNode` we are looking at, is also the _object_ of a triple. It could
be for example, that this `Person` is the `besluit:chairman` of a resource which is an instance of a `besluit:Zitting` class.

While editing that same email-adress, should a plugin interested in `Zitting`-type resources also be notified?
And what about non-collapsed selections? What does "the triple being edited" mean if a selection covers nodes which are part of different triples?
In the example above, imagine a selection starting in the middle of the phone number, and ending in the middle of the email-address.
Should the email plugin trigger? Or the phone-number plugin?

I am of the opinion that this question cannot be answered a priori. Therefore, it should be up to the plugin to decide, and up to the editor 
to provide as much information to the plugin as possible, in a form that can answer the following questions easily:

- is the selection currently in/around/touching an object value of a triple with given subject or predicate?
- is the selection currently in/around/touching a something which is "related" 
to a resource which is also the subject of a given triple? (most commonly, we'd be interested in the type of the resource)
- does a range contain/touch a triple with a certain shape?
- given a triple, which node defines its subject, which its predicate and which its object? (this also needs to support duplicate triples)
- give me all nodes which are the subject of a given triple
- give me all nodes which are the object of a given triple

If this is starting to sound a lot like the questions you would ask a triplestore, that makes a lot of sense.
In essence, the document _is_ a triplestore, just a very clumsy one, and one with added structure (the html markup).

The idea here is to provide a single interface for all these questions. Whether the knowledge required for the questions is
calculated ad-hoc or kept up-to-date throughout document edits is not specified here. Likely the former
will be easier to implement, but the latter may be more performant. What is clear is that any implementation
needs to have some way to link triples with their constituent nodes and vice versa. 

It is likely and desired this interface will be extended with convenient methods for common usecases. 
Indeed, the "type" of a range or selection is probably the most useful information for plugins, as well as the
inverse, the range of a "type". The methods defined below should allow for implementation of these convenience methods,
although a more performant implementation may be needed.

Note: it seems sensible that Nodes as well as Ranges and the Selection would have methods that wrap the methods of the datastore.
Note: we've made abstraction of subject, predicate and object types here. Assume string to be a valid value, as well as Rdfjs types.
Note: search methods should be implemented as generators (or iterators) where possible. Generators are preferred over iterators (easier to use and implement).

```typescript
interface TripleQuery {
  subject?: Subject,
  predicate?: Predicate,
  object?: Object
}

interface Datastore {
  *findRangesForTriple(query: TripleQuery, strategy: RangeContextStrategy): Generator<ModelRange>
  *findTriplesForRange(range: ModelRange, query: TripleQuery, strategy: RangeContextStrategy): Generator<Triple>
  *findSubjectNodes(query: TripleQuery): Generator<Node>
  *findObjectNodes(query: TripleQuery): Generator<Node>
  *findPredicateNodes(query: TripleQuery): Generator<Node>
}
```
#### RangeContextStrategy

At various points in the application, most notably the above section about the Datastore, we need to query about the context a range is in.
We've already seen that this can be defined in multiple ways. 
This section then serves to standardize the names and meaning of the different strategies.

##### Containing

A range contains a node if the start of the range lies _before_ the opening tag of the node, _and_ the end of the range lies 
_after_ the closing tag.

##### Including

A range includes a node if the start of the range lies _before_ the closing tag of the node, _or (exclusive)_ the end lies _after_ the opening tag.
You can think of this as "containing but edge-inclusive"

##### Touching

A range touches a node if it includes it, and if either the start is directly _after_ the closing tag of the node, _or_ the end is directly _before_ the opening tag.

##### Inside

A range is inside a node if the start lies _after_ the opening tag of the node, _and_ the end lies _before_ the closing tag.

```typescript
enum RangeContextStrategy {
  CONTAINING, INCLUDING, TOUCHING, INSIDE
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
_can_ contain multiple ranges. 

```typescript 
interface ModelSelection {
  ranges: ModelRange[]
}
```

#### Operation

An operation represents an atomic change to the Model. Operations should be designed to be composable and combinable.

Fundamentally, an insert operation which overwrites content can cover every possible editing usecase, including deletion (just insert nothing) and
moving content (as a combination of a deletion and an insertion, aka 2 insertions).
However, to allow for optimization at the lowest level, we define a generic operation interface rather than a single insert operation.

An operation is always defined over a range. While in essence an operation is just a function, we define it as a stateful object
which remembers its arguments to allow for easy chaining and modification before execution.


```typescript
interface Operation {
  range: ModelRange;
  execute();
}
```

#### Mutator

Whereas operations are the smallest unit of change to the document, the mutator interface represents
the "core editing operations" needed to make useful changes to the document. Operations tend to be too
atomic for this purpose.

```typescript
interface Mutator {
  replaceRange(range: ModelRange, ...content: Node[]);
  replaceNode(oldNode: Node, newNode: Node);
  updateSelection(selection: ModelSelection);
  selectRange(range: ModelRange);
}
```

#### Command

A command represents the highest-level primitive with which to build editing functionality. 
Commands should be named after their intention. As certain commands only make sense in certain contexts,
commands also carry with them a method to check whether their execution makes sense at the moment.

Commands receive 2 argument objects: a config object containing the tools the command needs to interact with the document,
and an args object containing user-defined arguments that the callsite has to provide.

Commands can choose to interact with the document in 2 core ways, or a combination of both:
- by composing other commands
- by interacting with ranges and nodes and using the mutator to persist changes to the document

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

### Plugins

With extensibility as one of the core pillars, plugin support should be considered at every level. The above
architecture gives plugins the following capabillities:

- defining new node types
- defining new commands
- executing commands
- updating the vdom through a mutator (either as part of a command, or directly)
- listening to events
- defining and emitting new events
- defining new UI elements and registering them for rendering

```typescript
interface EditorPlugin {
  name: string;
  async initialize(controller: Controller): void;
}
```
#### Widgets

A widget is simply a ui component which can be registered in the editor. This can be a simple menu, a single button, or even a full-blown ember application.
At this stage, only ember-based plugins are supported, and widgets have to be ember components. There are limited locations where a widget can be registered, 
which are specified below.
A widget is always rendered, and as such has full control over when it is visible. 

```typescript
type WidgetLocation = "toolbar" | "sidebar" | "cursor" | "block";

interface WidgetSpec {
  componentName: string,
  desiredLocation: WidgetLocation
}
```

#### Adding a node type

Adding a new node type is very similar to adding a command or a widget. Simply call the appropriate method in the controller, providing it with a Spec object defined below.
The spec object demands a reader and writer to respectively deserialize and serialize the node from and to the actual DOM.

```typescript

interface NodeSpec {
  name: type;
  implementation: new () => ModelNode;
  htmlReader: Reader<Node, ModelNode>;
  htmlWriter: Writer<ModelNode, Node>;
}
```


## Drawbacks

## Alternatives

## Unresolved questions

It is as of yet unclear how to best extend node types in plugins. The proposed method works well for "core" plugins which are developed as 
in-repo-addons, but for external plugins would require a hard dependency on the editor itself 
to be able to extend the base node class. Other options such as mixins
or delegating custom node methods to a NodeType property on the base class (maybe even with use of Proxies)
needs to be explored.

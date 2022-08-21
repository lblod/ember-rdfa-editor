---
Stage: Draft
Start Date: 20-08-2022
Release Date: unreleased
---

# Transactional Edits

## Summary

This rfc details the core concepts of an editing engine based on a transactional model of state changes.
It is inspired by databases and revolves around the idea of making every state change a well-defined atomic operation.
The goal is to provide primitives which are easy to test and reason about and rely as little as possible on stateful
context.

## Motivation

Throughout the development of this project, the biggest challenge at every point has been to
manage the complexity of making changes to a large, complex html document. Essentially we are dealing
with a free-form tree structure, where the outcome of any operations on the structure heavily depend on
the location they are performed, and the metadata of the nodes in the vicinity of the transformation.

We have seen a steady evolution of the codebase in search of more control and abstraction,
moving away from direct dom edits to our own model of the document. This move was primarily motivated
by a need to abstract over certain idiosyncrasies of the DOM. With this, we were able to abstract away
the complexity of basic text styling by using the Mark abstraction, for example. 
In short, it gave us the necessary freedom to experiment with different ways to interact with the document tree.

Later, we recognized the need to centralize state changing logic, which we achieved using Operations. 
These were inspired by the classical idea of a data structure accompanied by a minimal set of transformation algorithms.
When combined, those transformations guarantee the ability to reach any possible end state, and each transformation
brings with it guarantees of algorithmic complexity.
Operations were designed to be that minimal set (although some liberties were taken) of composable transformations.
The motivation was to create a toolkit of predictable and well-tested state-changing logic, with which every possible
document edit could be built. 
The centralization also opened the door for event-based monitoring of every state change,
since it was now guaranteed to originate from a single point.

It is that monitoring, however, that motivated this next step in the evolution. With the use of plugins,
there are multiple actors wishing to perform state changes, 
and to perform these changes **in reaction to** other changes.
This created a slew of infinite-loop headaches with the event-driven architecture that was based on monitoring operations.
Essentially, the problem was one of ordering and context. 
It was not enough to monitor a state change, 
it was also necessary to be aware of the entire chain of changes that led to its invocation. 
**In other words, an abstraction was needed that described a
logical unit of a series of related state changes.**

We are familiar with this concept when we think about databases. 
Often, it is desirable to treat a batch of state changes as a single,
atomic, unit, which either succeeds entirely or fails without making any change at all.
**We need to guarantee that the state is consistent and understood at any point in time, no matter what happens**

This lead to transactional edits.

## Detailed design

### Core principles

#### Every state change must happen in a transaction

Direct modification of the state outside a transaction means that we lose
all guarantees transactions provide us. Requiring everything to pass through transactions also provides a true single point of entry for state changes,
as opposed to "a few points of entry" in the operation era.

"Every" means _literally every change of any part of the entire state_. 
Things like plugin configuration, marks, etc., will _also_ happen through transactions.

#### Every document change must be composed of operations

Operations are not going anywhere, they remain the lowest level primitives with which the _document_ tree
is edited. Note we start talking about the "document state" as opposed to the "state", this is because
there is more to the state of an editor than just the document. There are also things like the selection,
the active plugins, the active marks, configuration options, etc....

Operations are designed to handle document updates only (I see a potential need to extend this in case collaborative
editing is in the cards, but that's for another time).

#### Transactions are append-only

Any actor that wants to adjust the behavior of an open transaction, can only do so by _adding_ steps to the transaction.
E.g.: if a user deletes a word, and a plugin wants to prevent it, the plugin should add back the word rather than
removing the
original delete request.

#### state-as-a-value, aka immutability

While not strictly necessary for transactional edits, treating the state as an immutable value
has a number of benefits. For one, it makes the rollback feature trivial to implement.
Same for document history. It also leads to a clear, functional style of programming which is easier
to test and reason about, since the function arguments are the only dependencies.

### Architecture

#### State

The word "state" has already been used repeatedly throughout this document, without ever being defined.
If transactional edits is all about state _changes_, we should first define _state_.

In every web application there is an idea of "rendering", or taking some form of input and ultimately showing something on the screen.
This input, in its entirety, is what we call the "state". It is all the input needed to draw a frame
(abstract, not going to pretend I know how browsers work) of our application.

An example of what the state may contain (the exact contents are subject to change, it's the idea that counts: _
everything_):

```ts
export default interface State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: InitializedPlugin[];
  commands: Partial<Commands>;
  marksRegistry: MarksRegistry;
  inlineComponentsRegistry: InlineComponentsRegistry;
  previousState: State | null;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]>;
  datastore: Datastore;
  pathFromDomRoot: Node[];
  baseIRI: string;
  keymap: KeyMap;

  createTransaction(): Transaction;

  parseNode(node: Node): NodeParseResult;

  eventBus: EventBus;
  config: Map<string, string | null>;
  transactionListeners: TransactionListener[];
}
```

As discussed, a state instance is to be considered immutable. This is not enforced, as object freezing incurs a
significant performance hit.

#### View

In essence, the view is a function which takes in a state and modifies the dom to represent it.
By extension, it is responsible for all interactions with the dom, which includes registering event handlers.
Its lifetime is tied to the ember component that creates it.

This also leads to a notion of the "current state". This is, at any point in time, the state that is at that point
represented by the DOM state.
If we say we "change the editor state", this means we create a new state based on that current state and request the
view to render it.

```ts
export interface View {
  /**
   * The html element that the editor will render in
   * */
  domRoot: Element;

  /**
   * The modelstate represented by the current html document
   * */
  currentState: State;

  /**
   * Get the domNode that corresponds to the given modelNode
   * State is needed because active configuration may influence the result
   * */
  modelToView(state: State, modelNode: ModelNode): Node | null;

  /**
   * Get the modelnode that corresponds tot the given domNode
   * State is needed because active configuration may influence the result
   * */
  viewToModel(state: State, domNode: Node): ModelNode;

  /**
   * Update the DOM to represent the given state
   * */
  update(state: State, differences: Difference[]): void;

  /**
   * Manually dispatch a transaction
   * @param transaction
   */
  dispatch(transaction: Transaction): void;

  /**
   * Cleanup any handlers or other global state
   */
  tearDown(): void;
}
```

**update()**

"Updating the view" means giving the view a new state to be rendered. This state will then be set as the new
currentState.
The implementation of this needs to be highly efficient. From experience we know that big sweeping changes to the DOM
are
huge performance hits. As such, the update algorithm needs to calculate the minimal set of dom changes required to
reach the correct DOM state.

Because applying a transaction and immediately updating the view with the resulting state is so common, the view also
has a `dispatch` method, which will do exactly that.

A view is created with the following arguments, which may be extended in implementation:

```ts
export interface ViewArgs {
  domRoot: Element;
  initialState: State;
  dispatch?: Dispatch;
}
```

This also shows how the consuming application can supply alternative implementations for core mechanisms such as the
dispatch function, essentially allowing the host to completely
bypass the default handling of transactions.

#### Transaction

Finally, we come to the crux of this RFC. If view is a function of state -> dom, then a transaction is essentially
function of state -> state, with deferred execution.

An example interface:

```ts
interface Transaction {
  steps: Step[];
  initialState: State;

  // example of state metadata we can change
  setPlugins(plugins: Plugin[]): void;

  addListener(listener: TransactionListener);

  addMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec);

  readFromView(view: View): void;

  setConfig(key: string, value: string | null): void;


  // example of some document editing functions
  insertText({range, text, marks}: TextInsertion): ModelRange;

  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange;

  setSelection(selection: ModelSelection);

  addMarkToSelection(mark: Mark);

  // ranges and positions lose their meaning when state changes, this is how we translate
  // the selection to keep it valid
  mapSelection(selection: ModelSelection): ModelSelection;

  get commands(): CommandExecutor;

  // some methods that apply to the transaction itself
  apply(): State;

  rollback(): State;

  // interacting with history
  createSnapshot();

  restoreSnapshot(steps: number);

  // some methods can also provide information to the view
  focus();
}
```

**Steps**

Conceptually a step is a general abstraction of a single state change. It contains information about what kind of change
it is
(e.g. is it a document change or a selection change) and how to map positions before the change to after.
This way an actor that sees a transaction come by can inspect it to see what is scheduled to happen when it will be
applied,
and can use that information to decide whether to add steps of its own.

**commands()**

Commands are higher level editing actions which can be exposed by the host or by plugins,
so their existence is also part of the state. They invariably take a transaction as an argument
so it makes sense to provide easy access to them on a transaction.

**apply()**

Produces the new state based on the initial state, essentially performing the currently added steps.
At the moment, we do not have a notion of a transaction being "closed", so apply can be called multiple times,
but this may change as the need arises.

**rollback()**

completely resets the transaction, such that calling `apply()` right after would produce the initial state.

**createSnapshot()**

Not every new state produced by a transaction is worthy of being recorded in history, e.g. if only the selection has
changed.

#### Engine

With these three pillars in place, we have a complete editor engine.
The cycle goes as follows:

- View catches user input
- handler creates a Transaction starting from the View's current state (remember, this is the last rendered state)
- We get the new state by applying the Transaction
- View updates the dom using the new state, and sets its currentState to the new value, ready to restart the cycle

an alternative flow:

- host intercepts user input before the view sees it
- host creates transaction
- continue as above

or even:

- view catches input, uses handler provided by host
- etc

### Host app and Plugins

#### Creating transactions

Both the host and plugins have the ability to create transactions. Note that, since plugins are added via a transaction,
this means that plugins could potentially add other plugins. The author is cautiously optimistic about this, but also
slightly terrified.

#### Providing view arguments

Both the host app and plugins can customize and/or override
the behavior of the view by providing things like event handlers, dispatch functions, configuration options, etc.
Essentially, it should be possible to completely bypass all editor code by manually reacting to events and producing
valid state,
so a plugin or host should be able to reimplement the editor, if it would want to.

#### Listening to transactions

Using a transaction, anyone can add a transactionListener. This is simply a callback which will receive every
transaction
as part of the dispatch logic. The handler is free to append steps to the transaction.
It is guaranteed that every listener sees all steps that it did not create itself, and it sees them only once.

e.g.:

- user types a character
- uppercase-plugin sees the transaction, and adds a step that replaces the character with its uppercase variant
- only-the-letter-b-plugin sees the transaction which now contains 2 steps, and changes the typed character to the
  letter b
- uppercase-plugin sees the transaction again, this time only containing 3rd step, since it already saw the first, and
  is the creator of the 2nd. It changes the b to a B.
- only-the-letter-b-plugin now sees the transaction again, only containing de 4th step. Since it's already a B, it is
  happy and doesn't add anything.

The order of the handlers is simply the order in which they were added.

(note, it's easy to see that, in the above example, we could have an infinite loop if the b-plugin would change the B to
a lowercase b. The solution to that is to write a better plugin,
or explicitly state that the b-plugin is not compatible with the uppercase-plugin).





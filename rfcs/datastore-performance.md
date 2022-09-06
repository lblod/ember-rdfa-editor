---
Stage: Draft
Start Date: 31-08-2022
Release Date: unreleased
---

# Datastore performance

This RFC outlines possible ways to improve the performance of the datastore calculation. This calculation is 
currently the main bottleneck preventing us from handling documents larger than about ten pages. It assumes a state 
after adoption of the ModelNodes RFC, in particular it requires a document tree without back-references.

## Motivation

Even in moderately sized documents, the datastore calculation takes up the majority of the processing time in when 
handling a keypress. What's worse is that the calculation time scales linearly in the size of the document, and can 
become unusably slow in large but realistic documents. 

There's little we can do about the time needed for a full parse, since linear scaling is already the best possible 
scenario (every node must be visited). However, in most edits, a full parse is a massive waste of resources, since 
only a tiny part of the document (often a single character added or removed) is changed. We propose a solution to the 
problem of determining the minimal amount of parsing needed to correctly update the datastore after an edit.

## Detailed design

First, lets define a few conventions to be used throughout this section.

- an edit operation happens over a range
- we will only discuss the replacement of a particular range with new content
Every possible editing action can be described as a replacement of a certain range with other content.
A cut/paste edit, for example, is then the combination of two replacements.
- We define the "commonAncestor" of a range as the closest common ancestor of the nodes containing the start and 
endpoints of the range 


A first observation we can make is that the rdfa context a certain node is part of is fully defined by the node and 
its path to the root. The rdfa parsing algorithm is a preorder depth-first-search, where on every visit we take into 
account the context of the nodes we visited before in the recursion. 


Under transactional edits with parentless nodes, there is already a mechanism required which considers the 
path-to-root of the commonAncestor. These are precisely the nodes that need to be cloned when creating the new state.
The idea is to attach rdfa parsing to these nodes when cloning them, generating the set of triples that will no 
longer be valid anyway (since their node references are no longer valid). Then, when attaching the new tree, we run 
the parser again on the cloned nodes, generating the new set of triples to be added to the datastore.

Since this cloning is unavoidable work, we are essentially getting the datastore updates for "free" (in a big-O 
notation sense).

Below follows a pseudocode overview of a node replacement edit:

```
replace(root, oldNode, newNode):
  let oldParser;
  let newParser
  
  oldParser.visit(root);
  let current = root.clone();
  let newRoot = current;
  newParser.visit(current);
  
  for node in pathFromRootWithoutRoot(oldNode, root):
    oldParser.visit(node);
    clone = node.shallowClone()
    current.replaceChild(node, clone)
    newParser.visit(clone);
    current = clone 
    
  current.replaceChild(oldNode, newNode);
  
  triplesToRemove = oldParser.triples
  triplesToAdd = newParser.triples
  
  return newRoot, triplesToRemove, triplesToAdd;
```

If we implement a range replacement as a node replacement of its common ancestor, we can model every possible edit 
with this replacement logic.

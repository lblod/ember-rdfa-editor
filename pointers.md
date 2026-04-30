- First, create a pointer node. This is a node that can point to another node.
- Can link any existing resource to this pointer, defining predicate

# Serialise now?
- Resource has nothing referencing pointer?
- Pointer has data-backlink (node attr) referencing resource and predicate

# Insert 'pointed'
- Literal? or Resource node that has a 'pointed' value
- If literal, defines datatype and language (node attrs)

# Serialise now? Resource pointed
- Resource still has no reference
- Pointer has note that it was object of a triple (could be same data attributes?)
- Pointed has RDFa link to resource with predicate (invis)

# Serialse now? Literal pointed
- Resource, no reference
- Pointer has note (attrs)
- Pointed has RDFa link to resource with predicate, datatype and language (attrs)

#### What if: literals are a special case of pointers
- In practise, 'literal' nodes become 'pointer' nodes
  - Maybe stay called literals for backwards compat
  - Does this mean pointers are a special case of literals? :s
  - Literals need to specify dt/lang, pointers just need an ID (could be rdfaid?)
  - Pointer with dt and/or lang is a literal?

##### Re-try logic
- First, create a pointer node. This is a node that can point to another node.
- Can link any existing resource to this pointer, defining predicate

# Serialise now?
- Resource has nothing referencing pointer?
- Pointer has data-backlink (node attr) referencing resource and predicate

# Insert 'pointed'
- Pointer or Resource node that has a 'pointed' value
- If pointer, defines datatype and language or id (node attrs)

# Serialise now? Resource pointed
- Resource still has no reference
- Pointer has note that it was object of a triple (could be same data attributes?)
- Pointed has RDFa link to resource with predicate (invis)

# Serialse now? Pointer with dt/lang pointed
- Resource, no reference
- Pointer has note (attrs)
- Pointed has RDFa link to resource with predicate, datatype and language (attrs)

# Serialse now? Pointer with no dt/lang pointed
- Resource, no reference
- Pointer has note (attrs)
- Pointed has has a pointed value and data-backlink referencing resource and pred



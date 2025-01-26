/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */
import type * as RDF from '@rdfjs/types';
import type { IActiveTag } from './active-tag.ts';
import type { IHtmlParseListener } from './html-parse-listener.ts';
import INITIAL_CONTEXT_XHTML from './initial-context-xhtml.ts';
import INITIAL_CONTEXT from './initial-context.ts';
import type { IRdfaPattern } from './rdfa-pattern.ts';
import {
  type IRdfaFeatures,
  RDFA_FEATURES,
  type RdfaProfile,
} from './rdfa-profile.ts';
import { Util } from './util.ts';
import { CustomError } from '#root/utils/_private/errors.ts';
import { isElement, isTextNode } from '#root/utils/_private/dom-helpers.ts';
import MapUtils from '#root/utils/_private/map-utils.ts';
import { GraphyDataset } from '#root/utils/_private/datastore/graphy-dataset.ts';
import { unwrap } from '#root/utils/_private/option.ts';
import type {
  RdfaResourceNodeMap,
  RdfaContentNodeMap,
} from '../datastore/node-map.ts';
import {
  rdfaContentNodeMap,
  rdfaResourceNodeMap,
} from '../datastore/node-map.ts';
import { postProcessTagAsRdfaNode } from './post-process-as-rdfa-nodes.ts';
import {
  languageOrDataType,
  sayDataFactory,
} from '#root/core/say-data-factory/index.ts';
import { LANG_STRING } from '../constants.ts';

export type ModelTerm<N> =
  | ModelQuadObject<N>
  | ModelQuadPredicate<N>
  | ModelQuadSubject<N>;
export type ModelQuadSubject<N> = ModelNamedNode<N> | ModelBlankNode<N>;
export type ModelQuadPredicate<N> = ModelNamedNode<N>;
export type ModelQuadObject<N> =
  | ModelNamedNode<N>
  | ModelBlankNode<N>
  | ModelLiteral<N>;

export interface ModelNamedNode<N, I extends string = string>
  extends RDF.NamedNode<I> {
  node?: N;
}

export interface ModelBlankNode<N> extends RDF.BlankNode {
  node?: N;
}

export interface ModelLiteral<N> extends RDF.Literal {
  node?: N;
}

export interface ModelQuad<N> extends RDF.Quad {
  subject: ModelQuadSubject<N>;
  predicate: ModelQuadPredicate<N>;
  object: ModelQuadObject<N>;
}

export interface RdfaParseConfig<N> {
  root: N;

  parseRoot?: boolean;

  textContent(this: void, node: N): string;

  isText(this: void, node: N): boolean;

  children(this: void, node: N): Iterable<N>;

  tag(this: void, node: N): string;

  attributes(this: void, node: N): Record<string, string>;

  baseIRI: string;
  pathFromDomRoot?: Node[];
}

export interface QuadNodes<N> {
  subjectNodes: N[];
  predicateNodes: N[];
  objectNodes: N[];
}

export interface SubAndPred {
  subject: RDF.Quad_Subject;
  predicate: RDF.Quad_Predicate;
  languageOrDatatype?: RDF.NamedNode;
}

export interface RdfaParseResponse<N> {
  dataset: RDF.Dataset;

  subjectToNodesMapping: Map<string, N[]>;
  nodeToSubjectMapping: Map<N, ModelQuad<N>>;

  nodeToObjectsMapping: Map<N, Set<ModelQuad<N>>>;
  objectToNodesMapping: Map<string, N[]>;

  nodeToPredicatesMapping: Map<N, Set<ModelQuad<N>>>;
  predicateToNodesMapping: Map<string, N[]>;

  quadToNodesMapping: Map<string, QuadNodes<N>>;
  seenPrefixes: Map<string, string>;

  resourceNodeMapping: RdfaResourceNodeMap<N>;
  contentNodeMapping: RdfaContentNodeMap<N>;
}

export class RdfaParser<N> {
  private readonly options: IRdfaParserOptions<N>;
  private util: Util<N>;
  private readonly defaultGraph: RDF.Quad_Graph;
  private readonly features: IRdfaFeatures;
  private readonly htmlParseListener?: IHtmlParseListener;
  private readonly rdfaPatterns: Record<string, IRdfaPattern<N>>;
  private readonly pendingRdfaPatternCopies: Record<string, IActiveTag<N>[]>;
  private resultSet: RDF.Dataset;

  private readonly activeTagStack: IActiveTag<N>[] = [];
  private nodeToSubjectMapping: Map<N, ModelQuad<N>>;
  private subjectToNodesMapping: Map<string, N[]>;

  private nodeToObjectsMapping: Map<N, Set<ModelQuad<N>>>;
  private objectToNodesMapping: Map<string, N[]>;

  // nodes can define multiple predicates
  private nodeToPredicatesMapping: Map<N, Set<ModelQuad<N>>>;
  private predicateToNodesMapping: Map<string, N[]>;

  private quadToNodesMapping: Map<string, QuadNodes<N>>;

  private rootModelNode: N;
  private seenSubjectNodes: Map<RDF.Term, N>;
  private seenPredicateNodes: Map<RDF.Term, N>;
  private seenObjectNodes: Map<RDF.Term, N>;
  private globallySeenPrefixes: Map<string, string>;
  private resourceNodeMapping: RdfaResourceNodeMap<N>;
  private contentNodeMapping: RdfaContentNodeMap<N>;

  constructor(options: IRdfaParserOptions<N>) {
    this.options = options;

    this.rootModelNode = options.rootModelNode;
    this.util = new Util<N>(this.rootModelNode, undefined, options.baseIRI);
    this.defaultGraph =
      options.defaultGraph || this.util.dataFactory.defaultGraph();
    const profile = options.contentType
      ? Util.contentTypeToProfile(options.contentType)
      : options.profile || '';
    this.features = options.features || RDFA_FEATURES[profile];
    this.htmlParseListener = options.htmlParseListener;
    this.rdfaPatterns = {};
    this.pendingRdfaPatternCopies = {};
    this.resultSet = new GraphyDataset();
    this.globallySeenPrefixes = new Map<string, string>();

    this.nodeToSubjectMapping = new Map();
    this.subjectToNodesMapping = new Map<string, N[]>();

    this.predicateToNodesMapping = new Map<string, N[]>();
    this.nodeToPredicatesMapping = new Map();

    this.nodeToObjectsMapping = new Map();
    this.objectToNodesMapping = new Map<string, N[]>();
    this.seenSubjectNodes = new Map<RDF.Term, N>();
    this.seenPredicateNodes = new Map<RDF.Term, N>();
    this.seenObjectNodes = new Map<RDF.Term, N>();

    this.quadToNodesMapping = new Map<string, QuadNodes<N>>();
    this.resourceNodeMapping = rdfaResourceNodeMap<N>();
    this.contentNodeMapping = rdfaContentNodeMap<N>();

    this.activeTagStack.push({
      incompleteTriples: [],
      inlist: false,
      language: options.language,
      listMapping: {},
      listMappingLocal: {},
      name: '',
      prefixesAll: {
        ...INITIAL_CONTEXT['@context'],
        ...(this.features.xhtmlInitialContext
          ? INITIAL_CONTEXT_XHTML['@context']
          : {}),
      },
      prefixesCustom: {},
      skipElement: false,
      vocab: options.vocab,
      node: this.rootModelNode,
    });
  }

  static parse<N>(config: RdfaParseConfig<N>): RdfaParseResponse<N> {
    const { pathFromDomRoot = [], root, baseIRI, parseRoot = true } = config;
    const parser = new RdfaParser<N>({ rootModelNode: root, baseIRI });
    for (const domNode of pathFromDomRoot) {
      if (isElement(domNode)) {
        const attributeObj: Record<string, string> = {};
        for (const attr of domNode.attributes) {
          attributeObj[attr.name] = attr.value;
        }
        parser.onTagOpen(domNode.tagName, attributeObj, root);
      } else if (isTextNode(domNode)) {
        parser.onText(domNode.textContent || '');
      }
    }
    if (parseRoot) {
      this.parseRec(root, parser, config);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of pathFromDomRoot) {
      parser.onTagClose();
    }
    parser.onEnd();
    return {
      dataset: parser.resultSet,
      nodeToSubjectMapping: parser.nodeToSubjectMapping,
      subjectToNodesMapping: parser.subjectToNodesMapping,
      nodeToPredicatesMapping: parser.nodeToPredicatesMapping,
      predicateToNodesMapping: parser.predicateToNodesMapping,
      nodeToObjectsMapping: parser.nodeToObjectsMapping,
      objectToNodesMapping: parser.objectToNodesMapping,
      quadToNodesMapping: parser.quadToNodesMapping,
      seenPrefixes: parser.globallySeenPrefixes,
      resourceNodeMapping: parser.resourceNodeMapping,
      contentNodeMapping: parser.contentNodeMapping,
    };
  }

  static parseRec<N>(
    node: N,
    parser: RdfaParser<N>,
    config: RdfaParseConfig<N>,
  ) {
    const { isText, textContent, tag, attributes, children } = config;
    if (isText(node)) {
      parser.onText(textContent(node));
      return;
    }
    parser.onTagOpen(tag(node), attributes(node), node);
    for (const child of children(node)) {
      this.parseRec<N>(child, parser, config);
    }
    parser.onTagClose();
  }

  protected onTagOpen(
    name: string,
    attributes: Record<string, string>,
    node?: N,
  ) {
    // Determine the parent tag (ignore skipped tags)
    let parentTagI: number = this.activeTagStack.length - 1;
    while (parentTagI > 0 && this.activeTagStack[parentTagI].skipElement) {
      parentTagI--;
    }
    let parentTag: IActiveTag<N> = this.activeTagStack[parentTagI];
    // If we skipped a tag, make sure we DO use the lang, prefixes and vocab of the skipped tag
    if (parentTagI !== this.activeTagStack.length - 1) {
      parentTag = {
        ...parentTag,
        language: this.activeTagStack[this.activeTagStack.length - 1].language,
        prefixesAll:
          this.activeTagStack[this.activeTagStack.length - 1].prefixesAll,
        prefixesCustom:
          this.activeTagStack[this.activeTagStack.length - 1].prefixesCustom,
        vocab: this.activeTagStack[this.activeTagStack.length - 1].vocab,
      };
    }

    // Create a new active tag and inherit language scope and baseIRI from parent
    const activeTag: IActiveTag<N> = {
      collectChildTags: parentTag.collectChildTags,
      incompleteTriples: [],
      inlist: !!attributes['inlist'],
      listMapping: {},
      listMappingLocal: parentTag.listMapping,
      localBaseIRI: parentTag.localBaseIRI,
      name,
      prefixesAll: {},
      prefixesCustom: {},
      skipElement: false,
      node,
    };
    this.activeTagStack.push(activeTag);

    // Save the tag contents if needed
    if (activeTag.collectChildTags) {
      // Add explicitly defined xmlns, xmlns:* and prefixes to attributes, as required by the spec (Step 11, note)
      // Sort prefixes alphabetically for deterministic namespace declaration order
      for (const prefix of Object.keys(parentTag.prefixesCustom).sort()) {
        const suffix = parentTag.prefixesCustom[prefix];
        const attributeKey = prefix === '' ? 'xmlns' : 'xmlns:' + prefix;
        if (!(attributeKey in attributes)) {
          attributes[attributeKey] = suffix;
        }
      }

      const attributesSerialized = Object.keys(attributes)
        .map((key) => `${key}="${attributes[key]}"`)
        .join(' ');
      activeTag.text = [
        `<${name}${attributesSerialized ? ' ' + attributesSerialized : ''}>`,
      ];
      if (this.features.skipHandlingXmlLiteralChildren) {
        return;
      }
    }

    let allowTermsInRelPredicates = true;
    let allowTermsInRevPredicates = true;
    if (this.features.onlyAllowUriRelRevIfProperty) {
      // Ignore illegal rel/rev values when property is present
      if (attributes['property'] && attributes['rel']) {
        allowTermsInRelPredicates = false;
        if (attributes['rel'].indexOf(':') < 0) {
          delete attributes['rel'];
        }
      }
      if (attributes['property'] && attributes['rev']) {
        allowTermsInRevPredicates = false;
        if (attributes['rev'].indexOf(':') < 0) {
          delete attributes['revany'];
        }
      }
    }

    if (this.features.copyRdfaPatterns) {
      // Save the tag if needed
      if (parentTag.collectedPatternTag) {
        const patternTag: IRdfaPattern<N> = {
          attributes,
          children: [],
          name,
          referenced: false,
          rootPattern: false,
          text: [],
        };
        parentTag.collectedPatternTag.children.push(patternTag);
        activeTag.collectedPatternTag = patternTag;
        return;
      }

      // Store tags with type rdfa:Pattern as patterns
      if (attributes['typeof'] === 'rdfa:Pattern') {
        activeTag.collectedPatternTag = {
          attributes,
          children: [],
          name,
          parentTag,
          referenced: false,
          rootPattern: true,
          text: [],
        };
        return;
      }

      // Instantiate patterns on rdfa:copy
      if (attributes['property'] === 'rdfa:copy') {
        const copyTargetPatternId: string =
          attributes['resource'] || attributes['href'] || attributes['src'];
        if (this.rdfaPatterns[copyTargetPatternId]) {
          this.emitPatternCopy(
            parentTag,
            this.rdfaPatterns[copyTargetPatternId],
            copyTargetPatternId,
            activeTag.node,
          );
        } else {
          if (!this.pendingRdfaPatternCopies[copyTargetPatternId]) {
            this.pendingRdfaPatternCopies[copyTargetPatternId] = [];
          }
          this.pendingRdfaPatternCopies[copyTargetPatternId].push(parentTag);
        }
        return;
      }
    }

    // <base> tags override the baseIRI of the whole document
    if (this.features.baseTag && name === 'base' && attributes['href']) {
      this.util.baseIRI = this.util.getBaseIRI(attributes['href'], node);
    }
    // xml:base attributes override the baseIRI of the current tag and children
    if (this.features.xmlBase && attributes['xml:base']) {
      activeTag.localBaseIRI = this.util.getBaseIRI(
        attributes['xml:base'],
        node,
      );
    }

    // <time> tags set an initial datatype
    if (this.features.timeTag && name === 'time' && !attributes['datatype']) {
      activeTag.interpretObjectAsTime = true;
    }

    // Processing based on https://www.w3.org/TR/rdfa-core/#s_rdfaindetail
    // 1: initialize values
    let newSubject: ModelNamedNode<N> | ModelBlankNode<N> | boolean | null =
      null;
    let currentObjectResource:
      | ModelNamedNode<N>
      | ModelBlankNode<N>
      | boolean
      | null = null;
    let typedResource: ModelNamedNode<N> | ModelBlankNode<N> | boolean | null =
      null;

    // 2: handle vocab attribute to set active vocabulary
    // Vocab sets the active vocabulary
    if (attributes['vocab']) {
      if (attributes['vocab']) {
        activeTag.vocab = attributes['vocab'];
        this.emitTriple(
          this.util.getBaseIriTerm(activeTag),
          this.util.dataFactory.namedNode(Util.RDFA + 'usesVocabulary', node),
          this.util.dataFactory.namedNode(activeTag.vocab, node),
        );
      } else {
        // If vocab is set to '', then we fallback to the root vocab as defined via the parser constructor
        activeTag.vocab = this.activeTagStack[0].vocab;
      }
    } else {
      activeTag.vocab = parentTag.vocab;
    }

    // 3: handle prefixes
    activeTag.prefixesCustom = Util.parsePrefixes(
      attributes,
      parentTag.prefixesCustom,
      this.features.xmlnsPrefixMappings,
      this.globallySeenPrefixes,
    );
    activeTag.prefixesAll =
      Object.keys(activeTag.prefixesCustom).length > 0
        ? { ...parentTag.prefixesAll, ...activeTag.prefixesCustom }
        : parentTag.prefixesAll;

    // Handle role attribute
    if (this.features.roleAttribute && attributes['role']) {
      const roleSubject = attributes['id']
        ? this.util.createIri(
            '#' + attributes['id'],
            activeTag,
            false,
            false,
            false,
          )
        : this.util.createBlankNode(node);
      // Temporarily override vocab
      const vocabOld = activeTag.vocab;
      activeTag.vocab = 'http://www.w3.org/1999/xhtml/vocab#';
      for (const role of this.util.createVocabIris(
        attributes['role'],
        activeTag,
        true,
        false,
      )) {
        this.emitTriple(
          roleSubject,
          this.util.dataFactory.namedNode(
            'http://www.w3.org/1999/xhtml/vocab#role',
            node,
          ),
          role,
        );
      }
      activeTag.vocab = vocabOld;
    }

    // 4: handle language
    // Save language attribute value in active tag
    if (
      attributes['xml:lang'] ||
      (this.features.langAttribute && attributes['lang'])
    ) {
      activeTag.language = attributes['xml:lang'] || attributes['lang'];
    } else {
      activeTag.language = parentTag.language;
    }

    const isRootTag: boolean = this.activeTagStack.length === 2;
    if (!attributes['rel'] && !attributes['rev']) {
      // 5: Determine the new subject when rel and rev are not present
      if (
        attributes['property'] &&
        !attributes['content'] &&
        !attributes['datatype']
      ) {
        // 5.1: property is present, but not content and datatype
        // Determine new subject
        if (attributes['about']) {
          newSubject = this.util.createIri(
            attributes['about'],
            activeTag,
            false,
            true,
            true,
          );
          activeTag.explicitNewSubject = !!newSubject;
        } else if (isRootTag) {
          newSubject = true;
        } else if (parentTag.object) {
          newSubject = parentTag.object;
        }

        // Determine type
        if (attributes['typeof']) {
          if (attributes['about']) {
            typedResource = this.util.createIri(
              attributes['about'],
              activeTag,
              false,
              true,
              true,
            );
          }
          if (!typedResource && isRootTag) {
            typedResource = true;
          }
          if (!typedResource && attributes['resource']) {
            typedResource = this.util.createIri(
              attributes['resource'],
              activeTag,
              false,
              true,
              true,
            );
          }
          if (!typedResource && (attributes['href'] || attributes['src'])) {
            typedResource = this.util.createIri(
              attributes['href'] || attributes['src'],
              activeTag,
              false,
              false,
              true,
            );
          }
          if (!typedResource && this.isInheritSubjectInHeadBody(name)) {
            typedResource = newSubject;
          }
          if (!typedResource) {
            typedResource = this.util.createBlankNode(node);
          }

          currentObjectResource = typedResource;
        }
      } else {
        // 5.2
        if (attributes['about'] || attributes['resource']) {
          newSubject = this.util.createIri(
            attributes['about'] || attributes['resource'],
            activeTag,
            false,
            true,
            true,
          );
          activeTag.explicitNewSubject = !!newSubject;
        }
        if (!newSubject && (attributes['href'] || attributes['src'])) {
          newSubject = this.util.createIri(
            attributes['href'] || attributes['src'],
            activeTag,
            false,
            false,
            true,
          );
          activeTag.explicitNewSubject = !!newSubject;
        }
        if (!newSubject) {
          if (isRootTag) {
            newSubject = true;
          } else if (this.isInheritSubjectInHeadBody(name)) {
            newSubject = parentTag.object || null;
          } else if (attributes['typeof']) {
            newSubject = this.util.createBlankNode(node);
            activeTag.explicitNewSubject = true;
          } else if (parentTag.object) {
            newSubject = parentTag.object;
            if (!attributes['property']) {
              activeTag.skipElement = true;
            }
          }
        }

        // Determine type
        if (attributes['typeof']) {
          typedResource = newSubject;
        }
      }
    } else {
      // either rel or rev is present
      // 6: Determine the new subject when rel or rev are present

      // Define new subject
      if (attributes['about']) {
        newSubject = this.util.createIri(
          attributes['about'],
          activeTag,
          false,
          true,
          true,
        );
        activeTag.explicitNewSubject = !!newSubject;
        if (attributes['typeof']) {
          typedResource = newSubject;
        }
      } else if (isRootTag) {
        newSubject = true;
      } else if (parentTag.object) {
        newSubject = parentTag.object;
      }

      // Define object
      if (attributes['resource']) {
        currentObjectResource = this.util.createIri(
          attributes['resource'],
          activeTag,
          false,
          true,
          true,
        );
      }
      if (!currentObjectResource) {
        if (attributes['href'] || attributes['src']) {
          currentObjectResource = this.util.createIri(
            attributes['href'] || attributes['src'],
            activeTag,
            false,
            false,
            true,
          );
        } else if (
          attributes['typeof'] &&
          !attributes['about'] &&
          !this.isInheritSubjectInHeadBody(name)
        ) {
          currentObjectResource = this.util.createBlankNode(node);
        }
      }

      // Set typed resource
      if (attributes['typeof'] && !attributes['about']) {
        if (this.isInheritSubjectInHeadBody(name)) {
          typedResource = newSubject;
        } else {
          typedResource = currentObjectResource;
        }
      }
    }

    // 7: If a typed resource was defined, emit it as a triple
    if (typedResource) {
      for (const type of this.util.createVocabIris(
        attributes['typeof'],
        activeTag,
        true,
        true,
      )) {
        this.emitTriple(
          this.util.getResourceOrBaseIri(typedResource, activeTag),
          this.util.dataFactory.namedNode(Util.RDF + 'type', node),
          type,
        );
      }
    }

    // 8: Reset list mapping if we have a new subject
    if (newSubject) {
      activeTag.listMapping = {};
    }

    // 9: If an object was defined, emit triples for it
    if (currentObjectResource) {
      if (!newSubject) {
        throw new NullOrUndefinedError();
      }
      // Handle list mapping
      if (attributes['rel'] && attributes['inlist']) {
        for (const predicate of this.util.createVocabIris(
          attributes['rel'],
          activeTag,
          allowTermsInRelPredicates,
          false,
        )) {
          this.addListMapping(
            activeTag,
            newSubject,
            predicate,
            currentObjectResource,
          );
        }
      }

      // Determine predicates using rel or rev (unless rel and inlist are present)
      if (!(attributes['rel'] && attributes['inlist'])) {
        if (attributes['rel']) {
          for (const predicate of this.util.createVocabIris(
            attributes['rel'],
            activeTag,
            allowTermsInRelPredicates,
            false,
          )) {
            this.emitTriple(
              this.util.getResourceOrBaseIri(newSubject, activeTag),
              predicate,
              this.util.getResourceOrBaseIri(currentObjectResource, activeTag),
            );
          }
        }
        if (attributes['rev']) {
          for (const predicate of this.util.createVocabIris(
            attributes['rev'],
            activeTag,
            allowTermsInRevPredicates,
            false,
          )) {
            this.emitTriple(
              this.util.getResourceOrBaseIri(currentObjectResource, activeTag),
              predicate,
              this.util.getResourceOrBaseIri(newSubject, activeTag),
            );
          }
        }
      }
    }

    // 10: Store incomplete triples if we don't have an object, but we do have predicates
    if (!currentObjectResource) {
      if (attributes['rel']) {
        if (attributes['inlist']) {
          for (const predicate of this.util.createVocabIris(
            attributes['rel'],
            activeTag,
            allowTermsInRelPredicates,
            false,
          )) {
            if (!newSubject) {
              throw new NullOrUndefinedError();
            }
            this.addListMapping(activeTag, newSubject, predicate, null);
            activeTag.incompleteTriples.push({
              predicate,
              reverse: false,
              list: true,
            });
          }
        } else {
          for (const predicate of this.util.createVocabIris(
            attributes['rel'],
            activeTag,
            allowTermsInRelPredicates,
            false,
          )) {
            activeTag.incompleteTriples.push({ predicate, reverse: false });
          }
        }
      }
      if (attributes['rev']) {
        for (const predicate of this.util.createVocabIris(
          attributes['rev'],
          activeTag,
          allowTermsInRevPredicates,
          false,
        )) {
          activeTag.incompleteTriples.push({ predicate, reverse: true });
        }
      }

      // Set a blank node object, so the children can make use of this when completing the triples
      if (activeTag.incompleteTriples.length > 0) {
        currentObjectResource = this.util.createBlankNode(node);
      }
    }

    // 11: Determine current property value
    if (attributes['property']) {
      // Create predicates
      activeTag.predicates = this.util.createVocabIris(
        attributes['property'],
        activeTag,
        true,
        false,
      );

      // Save datatype attribute value in active tag
      let localObjectResource: RDF.Term | boolean | null = null;

      if (attributes['datatype']) {
        activeTag.datatype = this.util.createIri(
          attributes['datatype'],
          activeTag,
          true,
          true,
          false,
        );
        if (
          activeTag.datatype &&
          (activeTag.datatype.value === Util.RDF + 'XMLLiteral' ||
            (this.features.htmlDatatype &&
              activeTag.datatype.value === Util.RDF + 'HTML'))
        ) {
          activeTag.collectChildTags = true;
        }
      } else {
        // Try to determine resource
        if (
          !attributes['rev'] &&
          !attributes['rel'] &&
          !attributes['content']
        ) {
          if (attributes['resource']) {
            localObjectResource = this.util.createIri(
              attributes['resource'],
              activeTag,
              false,
              true,
              true,
            );
          }
          if (!localObjectResource && attributes['href']) {
            localObjectResource = this.util.createIri(
              attributes['href'],
              activeTag,
              false,
              false,
              true,
            );
          }
          if (!localObjectResource && attributes['src']) {
            localObjectResource = this.util.createIri(
              attributes['src'],
              activeTag,
              false,
              false,
              true,
            );
          }
        }
        if (attributes['typeof'] && !attributes['about']) {
          localObjectResource = typedResource;
        }
      }
      if (!newSubject) {
        throw new NullOrUndefinedError();
      }

      if (attributes['content']) {
        if (!newSubject) {
          throw new NullOrUndefinedError();
        }
        // Emit triples based on content attribute has preference over text content
        const object = this.util.createLiteral(
          attributes['content'],
          activeTag,
        );
        if (attributes['inlist']) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, newSubject, predicate, object);
          }
        } else {
          const subject = this.util.getResourceOrBaseIri(newSubject, activeTag);
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Unset predicate to avoid text contents to produce new triples
        activeTag.predicates = null;
      } else if (this.features.datetimeAttribute && attributes['datetime']) {
        activeTag.interpretObjectAsTime = true;
        // Datetime attribute on time tag has preference over text content
        const object = this.util.createLiteral(
          attributes['datetime'],
          activeTag,
        );
        if (attributes['inlist']) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, newSubject, predicate, object);
          }
        } else {
          const subject = this.util.getResourceOrBaseIri(newSubject, activeTag);
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Unset predicate to avoid text contents to produce new triples
        activeTag.predicates = null;
      } else if (localObjectResource) {
        // Emit triples for all resource objects
        const object = this.util.getResourceOrBaseIri(
          localObjectResource,
          activeTag,
        );
        if (attributes['inlist']) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, newSubject, predicate, object);
          }
        } else {
          const subject = this.util.getResourceOrBaseIri(newSubject, activeTag);
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Unset predicate to avoid text contents to produce new triples
        activeTag.predicates = null;
      }
    }

    // 12: Complete incomplete triples
    let incompleteTriplesCompleted = false;
    if (
      !activeTag.skipElement &&
      newSubject &&
      parentTag.incompleteTriples.length > 0
    ) {
      incompleteTriplesCompleted = true;
      if (!parentTag.subject) {
        throw new NullOrUndefinedError();
      }
      const subject = this.util.getResourceOrBaseIri(
        parentTag.subject,
        activeTag,
      );
      const object = this.util.getResourceOrBaseIri(newSubject, activeTag);
      for (const incompleteTriple of parentTag.incompleteTriples) {
        if (!incompleteTriple.reverse) {
          if (incompleteTriple.list) {
            // Find the active tag that defined the list by going up the stack
            let firstInListTag = null;
            for (let i = this.activeTagStack.length - 1; i >= 0; i--) {
              if (this.activeTagStack[i].inlist) {
                firstInListTag = this.activeTagStack[i];
                break;
              }
            }
            // firstInListTag is guaranteed to be non-null
            // <Arne Bertrand>: but lets check it anyway
            if (!firstInListTag) {
              throw new NullOrUndefinedError();
            }
            this.addListMapping(
              firstInListTag,
              newSubject,
              incompleteTriple.predicate,
              object,
            );
          } else {
            this.emitTriple(subject, incompleteTriple.predicate, object);
          }
        } else {
          this.emitTriple(object, incompleteTriple.predicate, subject);
        }
      }
    }
    if (!incompleteTriplesCompleted && parentTag.incompleteTriples.length > 0) {
      activeTag.incompleteTriples = activeTag.incompleteTriples.concat(
        parentTag.incompleteTriples,
      );
    }

    // 13: Save evaluation context into active tag
    activeTag.subject = newSubject || parentTag.subject;
    activeTag.object = currentObjectResource || newSubject;

    postProcessTagAsRdfaNode({
      activeTag,
      attributes,
      isRootTag,
      typedResource,
      markAsLiteralNode: this.markAsLiteralNode,
      markAsResourceNode: this.markAsResourceNode,
    });
  }

  markAsLiteralNode = (
    node: N,
    activeTag: IActiveTag<N>,
    attributes: Record<string, string>,
    predicateAttribute = 'property',
  ) => {
    this.contentNodeMapping.set(node, {
      subject: sayDataFactory.literalNode(
        this.util.getResourceOrBaseIri(unwrap(activeTag.subject), activeTag)
          .value,
        languageOrDataType(activeTag.language, activeTag.datatype),
      ),

      predicate: this.util.createIri(
        attributes[predicateAttribute],
        activeTag,
        true,
        true,
        false,
      ).value,
    });
  };

  markAsResourceNode = (
    node: N,
    resource: boolean | ModelBlankNode<N> | ModelNamedNode<N>,
    activeTag: IActiveTag<N>,
    contentPredicate?: ModelNamedNode<N>,
    contentDatatype?: ModelNamedNode<N>,
    contentLanguage?: string,
  ) => {
    if (
      contentDatatype &&
      !contentDatatype.equals(sayDataFactory.namedNode(LANG_STRING))
    ) {
      contentLanguage = undefined;
    }
    this.resourceNodeMapping.set(node, {
      subject: this.util.getResourceOrBaseIri(resource, activeTag),
      contentPredicate: contentPredicate
        ? this.util.getResourceOrBaseIri(contentPredicate, activeTag)
        : undefined,
      contentDatatype,
      contentLanguage: contentLanguage?.toLowerCase(),
    });
  };

  public onText(data: string) {
    const activeTag: IActiveTag<N> =
      this.activeTagStack[this.activeTagStack.length - 1];

    // Collect text in pattern tag if needed
    if (this.features.copyRdfaPatterns && activeTag.collectedPatternTag) {
      activeTag.collectedPatternTag.text.push(data);
      return;
    }

    // Save the text inside the active tag
    if (!activeTag.text) {
      activeTag.text = [];
    }
    activeTag.text.push(data);
  }

  public onTagClose() {
    // Get the active tag
    const activeTag: IActiveTag<N> =
      this.activeTagStack[this.activeTagStack.length - 1];
    const parentTag: IActiveTag<N> =
      this.activeTagStack[this.activeTagStack.length - 2];

    if (
      !(
        activeTag.collectChildTags &&
        parentTag.collectChildTags &&
        this.features.skipHandlingXmlLiteralChildren
      )
    ) {
      // If we detect a finalized rdfa:Pattern tag, store it
      if (
        this.features.copyRdfaPatterns &&
        activeTag.collectedPatternTag &&
        activeTag.collectedPatternTag.rootPattern
      ) {
        const patternId = activeTag.collectedPatternTag.attributes['resource'];

        // Remove resource and typeof attributes to avoid it being seen as a new pattern
        delete activeTag.collectedPatternTag.attributes['resource'];
        delete activeTag.collectedPatternTag.attributes['typeof'];

        // Store the pattern
        this.rdfaPatterns[patternId] = activeTag.collectedPatternTag;

        // Apply all pending copies for this pattern
        if (this.pendingRdfaPatternCopies[patternId]) {
          for (const tag of this.pendingRdfaPatternCopies[patternId]) {
            this.emitPatternCopy(
              tag,
              activeTag.collectedPatternTag,
              patternId,
              activeTag.node,
            );
          }
          delete this.pendingRdfaPatternCopies[patternId];
        }

        // Remove the active tag from the stack
        this.activeTagStack.pop();

        return;
      }

      // Emit all triples that were determined in the active tag
      if (activeTag.predicates) {
        if (!activeTag.subject) {
          throw new NullOrUndefinedError();
        }
        const subject = this.util.getResourceOrBaseIri(
          activeTag.subject,
          activeTag,
        );
        let textSegments: string[] = activeTag.text || [];
        if (activeTag.collectChildTags && parentTag.collectChildTags) {
          // If we are inside an XMLLiteral child that also has RDFa content, ignore the tag name that was collected.
          textSegments = textSegments.slice(1);
        }
        const object = this.util.createLiteral(
          textSegments.join(''),
          activeTag,
        );
        if (activeTag.inlist) {
          for (const predicate of activeTag.predicates) {
            this.addListMapping(activeTag, subject, predicate, object);
          }
        } else {
          for (const predicate of activeTag.predicates) {
            this.emitTriple(subject, predicate, object);
          }
        }

        // Reset text, unless the parent is also collecting text
        if (!parentTag.predicates) {
          activeTag.text = null;
        }
      }

      // 14: Handle local list mapping
      if (activeTag.object && Object.keys(activeTag.listMapping).length > 0) {
        const subject = this.util.getResourceOrBaseIri(
          activeTag.object,
          activeTag,
        );
        for (const predicateValue in activeTag.listMapping) {
          const predicate = this.util.dataFactory.namedNode(
            predicateValue,
            activeTag.node,
          );
          const values = activeTag.listMapping[predicateValue];

          if (values.length > 0) {
            // Non-empty list, emit linked list of rdf:first and rdf:rest chains
            const bnodes = values.map((value) =>
              this.util.createBlankNode(
                typeof value === 'boolean' ? undefined : value.node,
              ),
            );
            for (let i = 0; i < values.length; i++) {
              const object = this.util.getResourceOrBaseIri(
                values[i],
                activeTag,
              );
              this.emitTriple(
                bnodes[i],
                this.util.dataFactory.namedNode(
                  Util.RDF + 'first',
                  activeTag.node,
                ),
                object,
              );
              this.emitTriple(
                bnodes[i],
                this.util.dataFactory.namedNode(
                  Util.RDF + 'rest',
                  activeTag.node,
                ),
                i < values.length - 1
                  ? bnodes[i + 1]
                  : this.util.dataFactory.namedNode(Util.RDF + 'nil'),
              );
            }

            // Emit triple for the first linked list chain
            this.emitTriple(subject, predicate, bnodes[0]);
          } else {
            // Empty list, just emit rdf:nil
            this.emitTriple(
              subject,
              predicate,
              this.util.dataFactory.namedNode(Util.RDF + 'nil'),
            );
          }
        }
      }
    }

    // Remove the active tag from the stack
    this.activeTagStack.pop();

    // Save the tag contents if needed
    if (activeTag.collectChildTags && activeTag.text) {
      activeTag.text.push(`</${activeTag.name}>`);
    }

    // If we still have text contents, try to append it to the parent tag
    if (activeTag.text && parentTag) {
      if (!parentTag.text) {
        parentTag.text = activeTag.text;
      } else {
        parentTag.text = parentTag.text.concat(activeTag.text);
      }
    }
  }

  public onEnd() {
    if (this.features.copyRdfaPatterns) {
      this.features.copyRdfaPatterns = false;

      // Emit all unreferenced patterns
      for (const patternId in this.rdfaPatterns) {
        const pattern = this.rdfaPatterns[patternId];
        if (!pattern.referenced) {
          pattern.attributes['typeof'] = 'rdfa:Pattern';
          pattern.attributes['resource'] = patternId;
          if (!pattern.parentTag) {
            throw new NullOrUndefinedError();
          }
          this.emitPatternCopy(pattern.parentTag, pattern, patternId);
          pattern.referenced = false;
          delete pattern.attributes['typeof'];
          delete pattern.attributes['resource'];
        }
      }

      // Emit all unreferenced copy links
      for (const patternId in this.pendingRdfaPatternCopies) {
        for (const parentTag of this.pendingRdfaPatternCopies[patternId]) {
          this.activeTagStack.push(parentTag);
          this.onTagOpen('link', { property: 'rdfa:copy', href: patternId });
          this.onTagClose();
          this.activeTagStack.pop();
        }
      }

      this.features.copyRdfaPatterns = true;
    }
  }

  /**
   * If the new subject can be inherited from the parent object
   * if the resource defines no new subject.
   * @param {string} name The current tag name.
   * @returns {boolean} If the subject can be inherited.
   */
  protected isInheritSubjectInHeadBody(name: string) {
    return (
      this.features.inheritSubjectInHeadBody &&
      (name === 'head' || name === 'body')
    );
  }

  /**
   * Add a list mapping for the given predicate and object in the active tag.
   */
  protected addListMapping(
    activeTag: IActiveTag<N>,
    subject: ModelQuadSubject<N> | boolean,
    predicate: ModelQuadPredicate<N>,
    currentObjectResource: ModelQuadObject<N> | boolean | null,
  ) {
    if (activeTag.explicitNewSubject) {
      const bNode = this.util.createBlankNode(activeTag.node);
      this.emitTriple(
        this.util.getResourceOrBaseIri(subject, activeTag),
        predicate,
        bNode,
      );
      if (!currentObjectResource) {
        throw new NullOrUndefinedError();
      }
      this.emitTriple(
        bNode,
        this.util.dataFactory.namedNode(Util.RDF + 'first', activeTag.node),
        this.util.getResourceOrBaseIri(currentObjectResource, activeTag),
      );
      this.emitTriple(
        bNode,
        this.util.dataFactory.namedNode(Util.RDF + 'rest', activeTag.node),
        this.util.dataFactory.namedNode(Util.RDF + 'nil'),
      );
    } else {
      let predicateList = activeTag.listMappingLocal[predicate.value];
      if (!predicateList) {
        activeTag.listMappingLocal[predicate.value] = predicateList = [];
      }
      if (currentObjectResource) {
        predicateList.push(currentObjectResource);
      }
    }
  }

  /**
   * Emit the given triple to the stream.
   */
  protected emitTriple(
    subject: ModelQuadSubject<N>,
    predicate: ModelQuadPredicate<N>,
    object: ModelQuadObject<N>,
  ) {
    // Validate IRIs
    if (
      (subject.termType === 'NamedNode' && subject.value.indexOf(':') < 0) ||
      (predicate.termType === 'NamedNode' &&
        predicate.value.indexOf(':') < 0) ||
      (object.termType === 'NamedNode' && object.value.indexOf(':') < 0)
    ) {
      return;
    }
    const quad = this.util.dataFactory.quad(
      subject,
      predicate,
      object,
      this.defaultGraph,
    );
    if (subject.node && !this.seenSubjectNodes.has(subject)) {
      this.seenSubjectNodes.set(subject, subject.node);
      this.nodeToSubjectMapping.set(subject.node, quad);
      MapUtils.setOrPush(
        this.subjectToNodesMapping,
        subject.value,
        subject.node,
      );
    }
    if (predicate.node && !this.seenPredicateNodes.has(predicate)) {
      this.seenPredicateNodes.set(predicate, predicate.node);
      MapUtils.setOrAdd(this.nodeToPredicatesMapping, predicate.node, quad);
      MapUtils.setOrPush(
        this.predicateToNodesMapping,
        predicate.value,
        predicate.node,
      );
    }
    if (object.node && !this.seenObjectNodes.has(object)) {
      this.seenObjectNodes.set(object, object.node);
      MapUtils.setOrAdd(this.nodeToObjectsMapping, object.node, quad);
      MapUtils.setOrPush(this.objectToNodesMapping, object.value, object.node);
    }
    this.quadToNodesMapping.set(quadHash(quad), {
      subjectNodes: this.subjectToNodesMapping.get(subject.value) ?? [],
      predicateNodes: this.predicateToNodesMapping.get(predicate.value) ?? [],
      objectNodes: this.objectToNodesMapping.get(object.value) ?? [],
    });

    this.resultSet.add(quad);
  }

  /**
   * Emit an instantiation of the given pattern with the given parent tag.
   * @param {IActiveTag} parentTag The parent tag to instantiate in.
   * @param {IRdfaPattern} pattern The pattern to instantiate.
   * @param {string} rootPatternId The pattern id.
   * @param node the extra metadata that will be stored along with the triple
   */
  protected emitPatternCopy(
    parentTag: IActiveTag<N>,
    pattern: IRdfaPattern<N>,
    rootPatternId: string,
    node?: N,
  ) {
    this.activeTagStack.push(parentTag);
    pattern.referenced = true;

    // Ensure that blank nodes within patterns are instantiated only once.
    // All next pattern copies will reuse the instantiated blank nodes from the first pattern.
    if (!pattern.constructedBlankNodes) {
      pattern.constructedBlankNodes = [];
      this.util.blankNodeFactory = () => {
        const bNode = this.util.dataFactory.blankNode(undefined, node);
        unwrap(pattern.constructedBlankNodes).push(bNode);
        return bNode;
      };
    } else {
      let blankNodeIndex = 0;
      this.util.blankNodeFactory = () => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const bNode = unwrap(pattern.constructedBlankNodes)[blankNodeIndex];
        blankNodeIndex++;
        return bNode;
      };
    }

    // Apply everything within the pattern
    this.emitPatternCopyAbsolute(pattern, true, rootPatternId);

    this.util.blankNodeFactory = null;
    this.activeTagStack.pop();
  }

  /**
   * Emit an instantiation of the given pattern with the given parent tag.
   *
   * This should probably not be called directly,
   * call {@link emitPatternCopy} instead.
   *
   * @param {IRdfaPattern} pattern The pattern to instantiate.
   * @param {boolean} root If this is the root call for the given pattern.
   * @param {string} rootPatternId The pattern id.
   * @param node the extra metadata that will be stored along with the triple
   */
  protected emitPatternCopyAbsolute(
    pattern: IRdfaPattern<N>,
    root: boolean,
    rootPatternId: string,
    node?: N,
  ) {
    // Stop on detection of cyclic patterns
    if (
      !root &&
      pattern.attributes['property'] === 'rdfa:copy' &&
      pattern.attributes['href'] === rootPatternId
    ) {
      return;
    }

    this.onTagOpen(pattern.name, pattern.attributes, node);
    for (const text of pattern.text) {
      this.onText(text);
    }
    for (const child of pattern.children) {
      this.emitPatternCopyAbsolute(child, false, rootPatternId);
    }
    this.onTagClose();
  }
}

export interface IRdfaParserOptions<N> {
  /**
   * A custom RDFJS DataFactory to construct terms and triples.
   */
  dataFactory?: RDF.DataFactory;
  /**
   * An initial default base IRI.
   */
  baseIRI: string;
  /**
   * A default language for string literals.
   */
  language?: string;
  /**
   * The initial vocabulary.
   */
  vocab?: string;
  /**
   * The default graph for constructing quads.
   */
  defaultGraph?: RDF.Quad_Graph;
  /**
   * A hash of features that should be enabled.
   * Defaults to the features defined by the profile.
   */
  features?: IRdfaFeatures;
  /**
   * The RDFa profile to use.
   * Defaults to a profile with all possible features enabled.
   */
  profile?: RdfaProfile;
  /**
   * The content type of the document that should be parsed.
   * This can be used as an alternative to the 'profile' option.
   */
  contentType?: string;
  /**
   * An optional listener for the internal HTML parse events.
   */
  htmlParseListener?: IHtmlParseListener;

  rootModelNode: N;
}

/**
 * Thrown when a variable is null or undefined unexpectedly.
 * Should ideally never be used, but useful for repairing
 * broken typings of third party code.
 */
export class NullOrUndefinedError extends CustomError {
  constructor() {
    super('Unexpected null/undefined value for variable');
  }
}

export function quadHash(quad: RDF.Quad): string {
  return `${quad.subject.termType}${quad.subject.value}${quad.predicate.termType}${quad.predicate.value}${quad.object.termType}${quad.object.value}${quad.graph.termType}${quad.graph.value}`;
}

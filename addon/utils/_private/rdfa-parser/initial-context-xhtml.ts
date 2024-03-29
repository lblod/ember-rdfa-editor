/**
 * Modified from https://github.com/rubensworks/rdfa-streaming-parser.js
 *
 * Copyright © 2019 Ruben Taelman
 */

const INITIAL_CONTEXT_XHTML = {
  '@context': {
    alternate: 'http://www.w3.org/1999/xhtml/vocab#alternate',
    appendix: 'http://www.w3.org/1999/xhtml/vocab#appendix',
    cite: 'http://www.w3.org/1999/xhtml/vocab#cite',
    bookmark: 'http://www.w3.org/1999/xhtml/vocab#bookmark',
    contents: 'http://www.w3.org/1999/xhtml/vocab#contents',
    chapter: 'http://www.w3.org/1999/xhtml/vocab#chapter',
    copyright: 'http://www.w3.org/1999/xhtml/vocab#copyright',
    first: 'http://www.w3.org/1999/xhtml/vocab#first',
    glossary: 'http://www.w3.org/1999/xhtml/vocab#glossary',
    help: 'http://www.w3.org/1999/xhtml/vocab#help',
    icon: 'http://www.w3.org/1999/xhtml/vocab#icon',
    index: 'http://www.w3.org/1999/xhtml/vocab#index',
    last: 'http://www.w3.org/1999/xhtml/vocab#last',
    license: 'http://www.w3.org/1999/xhtml/vocab#license',
    meta: 'http://www.w3.org/1999/xhtml/vocab#meta',
    next: 'http://www.w3.org/1999/xhtml/vocab#next',
    prev: 'http://www.w3.org/1999/xhtml/vocab#prev',
    previous: 'http://www.w3.org/1999/xhtml/vocab#previous',
    section: 'http://www.w3.org/1999/xhtml/vocab#section',
    start: 'http://www.w3.org/1999/xhtml/vocab#start',
    stylesheet: 'http://www.w3.org/1999/xhtml/vocab#stylesheet',
    subsection: 'http://www.w3.org/1999/xhtml/vocab#subsection',
    top: 'http://www.w3.org/1999/xhtml/vocab#top',
    up: 'http://www.w3.org/1999/xhtml/vocab#up',
    p3pv1: 'http://www.w3.org/1999/xhtml/vocab#p3pv1',
  },
};
export default INITIAL_CONTEXT_XHTML;

/**
 * Data factory implementation based on https://github.com/rubensworks/rdf-data-factory.js
 * This data factory extends the RDF.DataFactory implementation with support for custom prosemirror-specific terms.
 * Additionally, the `equals` method on the different term implementations is implemented as an arrow function,
 * rather than as a prototype method, in order to support object spreading.
 *
 * The MIT License (MIT)
 *
 * Copyright © 2020 - now Ruben Taelman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

export * from './data-factory.ts';
export * from './blank-node.ts';
export * from './default-graph.ts';
export * from './literal.ts';
export * from './named-node.ts';
export * from './quad.ts';
export * from './variable.ts';
export * from './prosemirror-terms/index.ts';
export type { SayTerm } from './term.ts';

import type { NodeView } from 'prosemirror-view';
import type SayNodeSpec from '@lblod/ember-rdfa-editor/core/say-node-spec';
import { oneLineTrim } from 'common-tags';

/**
 * This file contains a simple prosemirror node-spec and nodeview which can be used to reproduce the so-called 'Firefox SVG bug'.
 * If several of these nodes are included in a document, you'll notice issues if you try to select across the different nodes containing inline SVGs.
 * This issue does not occur in chromium-based browsers.
 * The solution (for now), is to simply disable inline SVGs in your nodes if the browser used is firefox.
 */

export const firefox_svg_bug: SayNodeSpec = {
  inline: true,
  group: 'inline',
  selectable: false,
  parseDOM: [{ tag: 'span[data-firefox-svg-bug]' }],
  toDOM() {
    return ['span', { 'data-firefox-svg-bug': 'true' }];
  },
};

export class FirefoxSVGBugView implements NodeView {
  dom: HTMLElement;
  constructor() {
    this.dom = document.createElement('span');
    this.dom.contentEditable = 'false';
    // this.dom.className = 'ember-node';
    const html = `<span class='firefox-svg-bug'>
                    firefox svg bug
                    <svg class='firefox-svg-bug__icon' width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M20.4931636,7.78162645 C21.0549636,8.34412645 21.3705636,9.10662645 21.3705636,9.90162645 C21.3705636,10.6303398 21.1053719,11.3317777 20.6284443,11.8768917 L20.4931636,12.0215864 L15.53998,16.99998 L11.99998,20.48998 C11.43748,21.05178 10.67498,21.36738 9.88002,21.36738 C9.15127,21.36738 8.44982903,21.1021883 7.90471473,20.6252607 L7.76002,20.48998 L9.17002,19.07998 C9.35738,19.26618 9.61083,19.37078 9.87502,19.37078 C10.0951533,19.37078 10.3078144,19.2981411 10.4810357,19.1661735 L10.57998,19.07998 L14.11998,15.53998 L19.0831636,10.6015864 C19.2694636,10.4141864 19.3739636,10.1607864 19.3739636,9.89662645 C19.3739636,9.67646811 19.3013941,9.46376811 19.1693918,9.2905577 L19.0831636,9.19162645 L20.4931636,7.78162645 Z M9.88001,12.70998 L11.28998,14.11998 L4.22001,21.18998 L2.81001,19.77998 L9.88001,12.70998 Z M14.11998,2.63264 C14.91498,2.63264 15.67748,2.9482 16.23998,3.51 L16.23998,3.51 L14.81998,4.92 C14.63258,4.73375 14.37918,4.62921 14.11498,4.62921 C13.85078,4.62921 13.59728,4.73375 13.40998,4.92 L13.40998,4.92 L8.45865,9.87864 L8.46001,9.88 L4.93001,13.41998 C4.74376,13.60738 4.63922,13.86078 4.63922,14.12498 C4.63922,14.38918 4.74376,14.64258 4.93001,14.82998 L4.93001,14.82998 L3.52001,16.23998 C2.95821,15.67748 2.64265,14.91498 2.64265,14.11998 C2.64265,13.32498 2.95821,12.56248 3.52001,11.99998 L3.52001,11.99998 L7.05001,8.46 L7.05365,8.46364 L11.99998,3.51 C12.515605,2.99501667 13.1992856,2.68694333 13.922004,2.63917405 Z M19.77998,2.81001 L21.18998,4.22001 L14.11998,11.28998 L12.70998,9.88001 L19.77998,2.81001 Z">
                      </path>
                    </svg>
                  </span>`;
    this.dom.innerHTML = oneLineTrim(html);
  }
}

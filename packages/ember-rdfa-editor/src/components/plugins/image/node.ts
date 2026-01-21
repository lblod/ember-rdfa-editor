/**
 * Inspired by https://gitlab.com/emergence-engineering/prosemirror-image-plugin
 *
 * MIT License
 *
 * Copyright (c) 2022 emergence-engineering
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 */

import Component from '@glimmer/component';
import type { EmberNodeArgs } from '#root/utils/ember-node.ts';
import { modifier } from 'ember-modifier';
import { updateSize } from '#root/plugins/image/utils/resize-functions.ts';

const MIN_SURFACE = 625;

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

type HandlePosition =
  | 'topLeft'
  | 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left';

type Handle = {
  direction: -1 | 1;
  updatesWidth?: boolean;
  updatesHeight?: boolean;
};

const HANDLES: Record<HandlePosition, Handle> = {
  topLeft: {
    direction: 1,
    updatesWidth: true,
    updatesHeight: true,
  },
  topRight: {
    direction: -1,
    updatesWidth: true,
    updatesHeight: true,
  },
  bottomRight: {
    direction: -1,
    updatesWidth: true,
    updatesHeight: true,
  },
  bottomLeft: {
    direction: 1,
    updatesWidth: true,
    updatesHeight: true,
  },
  top: {
    direction: 1,
    updatesHeight: true,
  },
  right: {
    direction: -1,
    updatesWidth: true,
  },
  bottom: {
    direction: -1,
    updatesHeight: true,
  },
  left: {
    direction: 1,
    updatesWidth: true,
  },
};

type ResizeState = {
  handle: Handle;
  initialPosition: Position;
  initialSize: Size;
};

export default class ImageNode extends Component<EmberNodeArgs> {
  handleReferences: Partial<Record<HandlePosition, HTMLElement>> = {};
  imageContainer?: HTMLElement;
  image?: HTMLElement;

  resizeState?: ResizeState;

  setUpHandle = modifier(
    (element: HTMLElement, [position]: [HandlePosition]) => {
      this.handleReferences[position] = element;
      element.addEventListener('mousedown', (event) =>
        this.onMouseDown(event, position),
      );
    },
  );

  setUpImageContainer = modifier((element: HTMLElement) => {
    this.imageContainer = element;
  });
  setUpImage = modifier((element: HTMLElement) => {
    this.image = element;
  });

  get node() {
    return this.args.node;
  }

  get controller() {
    return this.args.controller;
  }

  get width() {
    return this.args.node.attrs['width'] as number;
  }

  get height() {
    return this.args.node.attrs['height'] as number;
  }

  get style() {
    const widthStyle = this.width ? `width: ${this.width}px;` : '';
    const heightStyle = this.height ? `height: ${this.height}px;` : '';
    return widthStyle + heightStyle;
  }

  onMouseDown = (event: MouseEvent, handlePosition: HandlePosition) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.image && handlePosition) {
      // this.handleReferences;
      this.resizeState = {
        handle: HANDLES[handlePosition],
        initialPosition: { x: event.clientX, y: event.clientY },
        initialSize: {
          height: this.image.clientHeight,
          width: this.image.clientWidth,
        },
      };
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    }
  };

  onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    if (this.resizeState && this.image && this.imageContainer) {
      const { initialPosition, initialSize, handle } = this.resizeState;
      const aspectRatio = initialSize.height / initialSize.width;

      const dX = (initialPosition.x - event.clientX) * handle.direction;
      const dY = (initialPosition.y - event.clientY) * handle.direction;

      let newWidth = initialSize.width;
      let newHeight = initialSize.height;
      if (handle.updatesWidth && handle.updatesHeight) {
        newWidth = initialSize.width + dX;
        newHeight = newWidth * aspectRatio;
      } else if (handle.updatesWidth) {
        newWidth = initialSize.width + dX;
      } else if (handle.updatesHeight) {
        newHeight = initialSize.height + dY;
      }

      if (newWidth * newHeight >= MIN_SURFACE) {
        updateSize(this.imageContainer, newWidth, newHeight);
        updateSize(this.image, newWidth, newHeight);
      }
    }
  };

  onMouseUp = () => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    if (this.image) {
      const { clientWidth, clientHeight } = this.image;
      const pos = this.args.getPos();
      if (pos !== undefined) {
        this.controller.withTransaction((tr) => {
          return tr
            .setNodeAttribute(pos, 'width', clientWidth)
            .setNodeAttribute(pos, 'height', clientHeight);
        });
      }
    }
    this.resizeState = undefined;
  };
}

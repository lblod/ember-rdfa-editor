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

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { NodeSelection } from 'prosemirror-state';
import { modifier } from 'ember-modifier';
import {
  ResizeFunction,
  updateHeight,
  updateSize,
  updateWidth,
} from '@lblod/ember-rdfa-editor/plugins/image/utils/resize-functions';

const MIN_SURFACE = 625;

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

type HandleType =
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
  resizeFunction: ResizeFunction;
};

const HANDLES: Record<HandleType, Handle> = {
  topLeft: {
    direction: 1,
    resizeFunction: updateSize,
  },
  topRight: {
    direction: -1,
    resizeFunction: updateSize,
  },
  bottomRight: {
    direction: -1,
    resizeFunction: updateSize,
  },
  bottomLeft: {
    direction: 1,
    resizeFunction: updateSize,
  },
  top: {
    direction: 1,
    resizeFunction: updateHeight,
  },
  right: {
    direction: -1,
    resizeFunction: updateWidth,
  },
  bottom: {
    direction: -1,
    resizeFunction: updateHeight,
  },
  left: {
    direction: 1,
    resizeFunction: updateWidth,
  },
};

type ResizeState = {
  handle: Handle;
  initialPosition: Position;
  initialSize: Size;
};

export default class ImageNode extends Component<EmberNodeArgs> {
  handleReferences: Partial<Record<HandleType, HTMLElement>> = {};
  imageContainer?: HTMLElement;
  image?: HTMLElement;

  resizeState?: ResizeState;

  setUpHandle = modifier(
    (element: HTMLElement, [position]: [HandleType]) => {
      this.handleReferences[position] = element;
      element.addEventListener('mousedown', this.onMouseDown);
    },
    {
      eager: false,
    }
  );

  setUpImageContainer = modifier(
    (element: HTMLElement) => {
      this.imageContainer = element;
    },
    { eager: false }
  );
  setUpImage = modifier(
    (element: HTMLElement) => {
      this.image = element;
    },
    { eager: false }
  );

  get node() {
    return this.args.node;
  }

  get controller() {
    return this.args.controller;
  }

  get width() {
    return this.args.node.attrs.width as number;
  }

  get height() {
    return this.args.node.attrs.height as number;
  }

  get style() {
    const widthStyle = this.width ? `width: ${this.width}px;` : '';
    const heightStyle = this.height ? `height: ${this.height}px;` : '';
    return widthStyle + heightStyle;
  }

  @action
  select(event: InputEvent) {
    event.preventDefault();
    if (!this.args.selected) {
      const pos = this.args.getPos();
      if (pos !== undefined) {
        this.args.controller.withTransaction((tr) => {
          return tr.setSelection(NodeSelection.create(tr.doc, pos));
        });
      }
    }
  }

  onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const handleType = Object.keys(this.handleReferences).find(
      (key: HandleType) => this.handleReferences[key] === event.target
    ) as HandleType | undefined;
    if (this.image && handleType) {
      this.handleReferences;
      this.resizeState = {
        handle: HANDLES[handleType],
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
      switch (handle.resizeFunction) {
        case updateSize:
          newWidth = initialSize.width + dX;
          newHeight = newWidth * aspectRatio;
          break;
        case updateWidth:
          newWidth = initialSize.width + dX;
          break;
        case updateHeight:
          newHeight = initialSize.height + dY;
          break;
      }

      if (newWidth * newHeight >= MIN_SURFACE) {
        handle.resizeFunction(this.imageContainer, newWidth, newHeight);
        handle.resizeFunction(this.image, newWidth, newHeight);
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

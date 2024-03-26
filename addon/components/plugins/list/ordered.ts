import { findParentNode } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import {
  OrderListStyle,
  toggleList,
} from '@lblod/ember-rdfa-editor/plugins/list';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import { sinkListItem, wrapInList } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
};
export default class ListOrdered extends Component<Args> {
  @service declare intl: IntlService;

  get styles() {
    return [
      {
        name: 'decimal',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.decimal',
        ),
        title: '1',
      },
      {
        name: 'lower-alpha',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.lower-alpha',
        ),
        title: 'a',
      },
      {
        name: 'upper-roman',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.upper-roman',
        ),
        title: 'I',
      },
      {
        name: 'hierarchical-numbering',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.hierarchical',
        ),
        title: '1.2.3',
      },
    ];
  }

  get firstListParentWithHierarchicalNumbering() {
    return findParentNode(
      (node) =>
        node.type === this.schema.nodes.ordered_list &&
        node.attrs.style === 'hierarchical-numbering',
    )(this.selection);
  }

  get firstListParentWithStyle() {
    return findParentNode((node) => {
      if (!node.attrs.style) return false;

      return (
        node.type === this.schema.nodes.ordered_list ||
        node.type === this.schema.nodes.bullet_list
      );
    })(this.selection);
  }

  get firstListParent() {
    return findParentNode(
      (node) =>
        node.type === this.schema.nodes.ordered_list ||
        node.type === this.schema.nodes.bullet_list,
    )(this.selection);
  }

  get lastListParent() {
    const $pos = this.selection.$from;

    for (let i = 0; i < $pos.depth; i++) {
      const node = $pos.node(i);
      if (
        node.type === this.schema.nodes.ordered_list ||
        node.type === this.schema.nodes.bullet_list
      ) {
        return {
          node,
          pos: $pos.before(i),
        };
      }
    }

    return undefined;
  }

  get isActive() {
    return (
      this.firstListParent?.node.type ===
      this.controller.schema.nodes.ordered_list
    );
  }

  get controller() {
    return this.args.controller;
  }

  get selection() {
    return this.controller.activeEditorState.selection;
  }

  get schema() {
    return this.controller.schema;
  }

  toggleCommand(listStyle?: OrderListStyle): Command {
    return chainCommands(
      toggleList(this.schema.nodes.ordered_list, this.schema.nodes.list_item, {
        style: listStyle,
      }),
      wrapInList(this.schema.nodes.ordered_list, {
        style: listStyle,
      }),
      sinkListItem(this.schema.nodes.list_item),
    );
  }

  get canToggle() {
    return this.controller.checkCommand(this.toggleCommand());
  }

  @action
  toggle(style?: OrderListStyle) {
    this.controller.focus();
    this.controller.doCommand(
      autoJoin(this.toggleCommand(style), ['ordered_list', 'bullet_list']),
    );
  }

  setStyleOnPosition = ({
    style,
    pos,
  }: {
    style: OrderListStyle;
    pos: number;
  }) => {
    this.controller.withTransaction((tr) => {
      return tr.setNodeAttribute(pos, 'style', style);
    });
  };

  @action
  setStyle(style: OrderListStyle) {
    /**
     * If we want to set the style to hierarchical numbering,
     * then we need to find the topmost list parent,
     * and set the style on that position.
     */
    const lastListParentWithStyle = this.lastListParent;

    if (style === 'hierarchical-numbering' && lastListParentWithStyle) {
      return this.setStyleOnPosition({
        style,
        pos: lastListParentWithStyle.pos,
      });
    }

    /**
     * Normal case, without considering hierarchical numbering.
     */
    const firstListParent = this.firstListParent;

    if (
      firstListParent?.node.type === this.controller.schema.nodes.ordered_list
    ) {
      return this.setStyleOnPosition({
        style,
        pos: firstListParent.pos,
      });
    }

    this.toggle(style);
  }

  isStyleButtonDisabled = (style: OrderListStyle) => {
    /**
     * If we want to enable `hierarchical-numbering`, but there is already a parent
     * with hierarchical numbering, then we should not allow it.
     */
    if (
      style === 'hierarchical-numbering' &&
      // Checking if the first list parent is not the same as the last (top most) list parent
      this.firstListParent?.node !== this.lastListParent?.node
    ) {
      return true;
    }

    return this.styleIsActive(style);
  };

  styleIsActive = (style: OrderListStyle) => {
    const firstListParentWithStyle = this.firstListParentWithStyle;

    /**
     * If there is a parent with the same style, then we should return true,
     * as we are "inheriting" the style from the parent.
     */
    if (
      firstListParentWithStyle?.node.type ===
        this.controller.schema.nodes.ordered_list &&
      firstListParentWithStyle.node.attrs.style === style
    ) {
      return true;
    }

    return false;
  };
}

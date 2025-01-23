import { findParentNode } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import {
  type OrderListStyle,
  toggleList,
} from '#root/plugins/list';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import { sinkListItem, wrapInList } from 'prosemirror-schema-list';
import { type Command } from 'prosemirror-state';
import SayController from '#root/core/say-controller';
import { OrderedListIcon } from '@appuniversum/ember-appuniversum/components/icons/ordered-list';
import { CheckIcon } from '@appuniversum/ember-appuniversum/components/icons/check';

type Args = {
  controller: SayController;
  enableHierarchicalList?: boolean;
};
export default class ListOrdered extends Component<Args> {
  OrderedListIcon = OrderedListIcon;
  CheckIcon = CheckIcon;

  @service declare intl: IntlService;

  get styles() {
    return [
      {
        name: 'decimal',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.decimal',
        ),
      },
      {
        name: 'lower-alpha',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.lower-alpha',
        ),
      },
      {
        name: 'upper-alpha',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.upper-alpha',
        ),
      },
      {
        name: 'upper-roman',
        description: this.intl.t(
          'ember-rdfa-editor.ordered-list.styles.upper-roman',
        ),
      },
    ];
  }

  get firstListParent() {
    return findParentNode(
      (node) =>
        node.type === this.schema.nodes['ordered_list'] ||
        node.type === this.schema.nodes['bullet_list'],
    )(this.selection);
  }
  get firstListItemParent() {
    return findParentNode(
      (node) => node.type === this.schema.nodes['list_item'],
    )(this.selection);
  }

  get isActive() {
    return (
      this.firstListParent?.node.type ===
      this.controller.schema.nodes['ordered_list']
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
  get isHierarchical() {
    if (!this.args.enableHierarchicalList) {
      return false;
    }
    const listItem = this.firstListItemParent;
    if (listItem?.node.type === this.controller.schema.nodes['list_item']) {
      const path = listItem.node.attrs['listPath'];

      return path[path.length - 1].hierarchical;
    } else {
      return false;
    }
  }

  toggleCommand(listStyle?: OrderListStyle): Command {
    return chainCommands(
      toggleList(
        this.schema.nodes['ordered_list'],
        this.schema.nodes['list_item'],
        {
          style: listStyle,
        },
      ),
      wrapInList(this.schema.nodes['ordered_list'], {
        style: listStyle,
      }),
      sinkListItem(this.schema.nodes['list_item']),
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

  @action
  setStyle(style: OrderListStyle) {
    const firstListParent = this.firstListParent;
    if (
      firstListParent?.node.type ===
      this.controller.schema.nodes['ordered_list']
    ) {
      const pos = firstListParent.pos;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'style', style);
      });
    } else {
      this.toggle(style);
    }
  }

  @action
  toggleHierarchical() {
    const firstListParent = this.firstListParent;
    if (
      firstListParent?.node.type ===
      this.controller.schema.nodes['ordered_list']
    ) {
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(
          firstListParent.pos,
          'hierarchical',
          !this.isHierarchical,
        );
      });
    }
  }
  styleIsActive = (style: string) => {
    if (this.args.enableHierarchicalList) {
      const listItem = this.firstListItemParent;
      if (listItem?.node.type === this.controller.schema.nodes['list_item']) {
        const path = listItem.node.attrs['listPath'];

        return path[path.length - 1].style === style;
      } else {
        return false;
      }
    } else {
      const firstListParent = this.firstListParent;
      if (
        firstListParent?.node.type ===
        this.controller.schema.nodes['ordered_list']
      ) {
        return firstListParent.node.attrs['style'] === style;
      } else {
        return false;
      }
    }
  };
}

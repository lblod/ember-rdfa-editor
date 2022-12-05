import { WidgetSpec } from '@lblod/ember-rdfa-editor';

export { cardView, card } from './inline-component-models/card';
export { counterView, counter } from './inline-component-models/counter';
export { dropdownView, dropdown } from './inline-component-models/dropdown';
export const insertDummyComponentsWidget: WidgetSpec = {
  componentName: 'inline-components-plugin/rdfa-ic-plugin-insert',
  desiredLocation: 'insertSidebar',
};

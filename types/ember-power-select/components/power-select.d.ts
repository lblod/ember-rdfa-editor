// Types from ember-power-select but with tweaks to improve glint support. Can be removed if moving
// to >v8.0
declare module 'ember-power-select/components/power-select' {
  import Component from '@glimmer/component';
  import { MatcherFn } from '../utils/group-utils';
  import {
    type Dropdown,
    type DropdownActions,
  } from '@gavant/glint-template-types/types/ember-basic-dropdown/components/basic-dropdown';

  interface SelectActions extends DropdownActions {
    search: (term: string) => void;
    highlight: (option: unknown) => void;
    select: (selected: unknown, e?: Event) => void;
    choose: (selected: unknown, e?: Event) => void;
    scrollTo: (option: unknown) => void;
  }
  export interface Select extends Dropdown {
    selected: unknown;
    highlighted: unknown;
    options: unknown[];
    results: unknown[];
    resultsCount: number;
    loading: boolean;
    isActive: boolean;
    searchText: string;
    lastSearchedText: string;
    actions: SelectActions;
  }
  export interface PowerSelectArgs {
    // The following args are not in the v6 or v7 types as they are only used in the template
    loadingMessage?: string;
    placeholder?: string;
    allowClear?: boolean;
    renderInPlace?: boolean;
    disabled?: boolean;
    // END extra args
    highlightOnHover?: boolean;
    placeholderComponent?: string;
    searchMessage?: string;
    searchMessageComponent?: string;
    noMatchesMessage?: string;
    noMatchesMessageComponent?: string;
    matchTriggerWidth?: boolean;
    options?: unknown[] | Promise<unknown[]>;
    selected?: unknown | Promise<unknown>;
    closeOnSelect?: boolean;
    defaultHighlighted?: unknown;
    searchField?: string;
    searchEnabled?: boolean;
    tabindex?: number | string;
    triggerComponent?: string;
    beforeOptionsComponent?: string;
    optionsComponent?: string;
    groupComponent?: string;
    matcher?: MatcherFn;
    initiallyOpened?: boolean;
    typeAheadOptionMatcher?: MatcherFn;
    buildSelection?: (selected: unknown, select: Select) => unknown;
    onChange: (selection: unknown, select: Select, event?: Event) => void;
    search?: (term: string, select: Select) => unknown[] | Promise<unknown[]>;
    onOpen?: (select: Select, e: Event) => boolean | undefined;
    onClose?: (select: Select, e: Event) => boolean | undefined;
    onInput?: (term: string, select: Select, e: Event) => string | false | void;
    onKeydown?: (select: Select, e: KeyboardEvent) => boolean | undefined;
    onFocus?: (select: Select, event: FocusEvent) => void;
    onBlur?: (select: Select, event: FocusEvent) => void;
    scrollTo?: (option: unknown, select: Select) => void;
    registerAPI?: (select: Select) => void;
  }
  // Copied from PS 8.0 types
  type PowerSelectSig = {
    Element: HTMLElement;
    Args: PowerSelectArgs;
    Blocks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      default: [option: any, select: Select];
    };
  };
  export default class PowerSelect extends Component<PowerSelectSig> {
    _publicAPIActions: {
      search: (term: string) => void;
      highlight: (opt: unknown) => void;
      select: (selected: unknown, e?: Event | undefined) => void;
      choose: (selected: unknown, e?: Event | undefined) => void;
      scrollTo: (option: unknown) => void;
    };
    private _resolvedOptions?;
    private _resolvedSelected?;
    private _repeatingChar;
    private _expirableSearchText;
    private _searchResult?;
    isActive: boolean;
    loading: boolean;
    searchText: string;
    lastSearchedText: string;
    highlighted?: unknown;
    storedAPI: Select;
    private _lastOptionsPromise?;
    private _lastSelectedPromise?;
    private _lastSearchPromise?;
    private _filterResultsCache;
    constructor(owner: unknown, args: PowerSelectArgs);
    willDestroy(): void;
    get highlightOnHover(): boolean;
    get highlightedIndex(): string;
    get searchMessage(): string;
    get noMatchesMessage(): string;
    get matchTriggerWidth(): boolean;
    get mustShowSearchMessage(): boolean;
    get mustShowNoMessages(): boolean;
    get results(): unknown[];
    get options(): unknown[];
    get resultsCount(): number;
    get selected(): unknown;
    handleOpen(_select: Select, e: Event): boolean | void;
    handleClose(_select: Select, e: Event): boolean | void;
    handleInput(e: InputEvent): void;
    handleKeydown(e: KeyboardEvent): boolean | void;
    handleTriggerKeydown(e: KeyboardEvent): boolean | void;
    handleFocus(event: FocusEvent): void;
    handleBlur(event: FocusEvent): void;
    _search(term: string): void;
    _updateOptions(): void;
    _updateHighlighted(): void;
    _updateSelected(): void;
    _selectedObserverCallback(): void;
    _highlight(opt: unknown): void;
    _select(selected: unknown, e?: Event): void;
    _choose(selected: unknown, e?: Event): void;
    _scrollTo(option: unknown): void;
    _registerAPI(_: Element, [publicAPI]: [Select]): void;
    _performSearch(_: unknown, [term]: [string]): void;
    _defaultBuildSelection(option: unknown): unknown;
    _routeKeydown(select: Select, e: KeyboardEvent): boolean | void;
    _handleKeyTab(select: Select, e: KeyboardEvent): void;
    _handleKeyESC(select: Select, e: KeyboardEvent): void;
    _handleKeyEnter(select: Select, e: KeyboardEvent): boolean | void;
    _handleKeySpace(select: Select, e: KeyboardEvent): void;
    _handleKeyUpDown(select: Select, e: KeyboardEvent): void;
    _resetHighlighted(): void;
    _filter(
      options: unknown[],
      term: string,
      skipDisabled?: boolean,
    ): unknown[];
    _updateIsActive(value: boolean): void;
    findWithOffset(
      options: unknown[],
      term: string,
      offset: number,
      skipDisabled?: boolean,
    ): unknown;
    triggerTypingTask(
      this: PowerSelect,
      e: KeyboardEvent,
    ): Generator<import('ember-concurrency').Yieldable<void>, void, unknown>;
  }
  export {};
}

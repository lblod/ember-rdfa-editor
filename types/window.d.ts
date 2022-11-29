import Prosemirror, {
  ProseController,
} from '@lblod/ember-rdfa-editor/core/prosemirror';

type Owner = {
  register(
    fullName: `${string}:${string}`,
    factory: unknown,
    options?: unknown
  ): void;
  lookup(fullName: `${string}:${string}`, options?: unknown): unknown;
  factoryFor(fullName: `${string}:${string}`): unknown;
};

declare global {
  interface Window {
    __PM: Prosemirror;
    __PC: ProseController;
    __APPLICATION: Owner;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}

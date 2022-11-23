import State from '@lblod/ember-rdfa-editor/core/state';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';

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
    __STATE: State;
    __EDITOR: Controller;
    __APPLICATION: Owner;
    __executeCommand: (commandName: string, ...args: unknown[]) => void;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}

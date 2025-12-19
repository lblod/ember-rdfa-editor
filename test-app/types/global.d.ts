import '@glint/ember-tsc/types';

declare global {
  interface Assert {
    deepArrayContains(
      array: unknown[],
      element: unknown,
      message?: string,
    ): void;
  }
  interface Window {
    define: (key: string, value: unknown) => void;
  }
}

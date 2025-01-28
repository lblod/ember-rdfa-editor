import '@glint/environment-ember-loose';

declare global {
  interface Assert {
    deepArrayContains(
      array: unknown[],
      element: unknown,
      message?: string,
    ): void;
  }
}

export {};

declare global {
  interface Window {
    __PC: {
      setHtmlContent: (content: string) => void;
    };
  }
}

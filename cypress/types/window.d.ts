/// <reference types="cypress" />
declare namespace Cypress {
  interface ApplicationWindow {
    __PC: {
      setHtmlContent: (html: string) => void;
    };
  }
}

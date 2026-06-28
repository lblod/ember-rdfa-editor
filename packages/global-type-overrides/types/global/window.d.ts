import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

// pay attention to the placing of the import statements, inside or outside the module definition
// with any top-level import or export statements, the declaration file acts as a module augmentation
// without, it acts as a replacement for the module definition
//
// here, we want to augment, since we're adding a type to the global window type

declare global {
  interface Window {
    __PM: SayEditor;
    __PC: SayController;
    setLogFilter: (filter: string) => void;
    clipboardData: DataTransfer;
  }
}

// note there are no imports or exports in this file, instead we use these
// typescript-specific references. This is to make sure this is treated as an ambient declaration,
// meaning the types we reference here will be added to the global scope
//
// basically: it's black magic, don't touch unless you know what you're doing

/// <reference path="./yup.d.ts" />
/// <reference path="./window.d.ts" />
/// <reference path="./appuniversum/ember-appuniversum/components/au-dropdown.d.ts" />
/// <reference path="./ember-power-select-with-create/components/power-select-with-create.d.ts" />
/// <reference path="./tracked-toolbox/index.d.ts" />
/// <reference path="./glint.d.ts" />

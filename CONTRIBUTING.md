# How To Contribute

## NPM and node

This project is primarily developed with npm v6.10.3 on node v12.22.1, through the use of [docker-ember](https://github.com/madnificent/docker-ember)
v3.26.1. 
This does not mean any other version is incompatible, but when running into trouble, try that version first.
It also means we are currently sticking to v1 lockfiles.

## Installation

* `git clone <repository-url>`
* `cd @lblod/ember-rdfa-editor`
* `npm install`

## Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

## Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

## Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

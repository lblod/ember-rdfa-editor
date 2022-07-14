'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  description: '',

  normalizeEntityName() {},

  async afterInstall() {
    // Import styles if using SCSS
    let dependencies = this.project.dependencies();
    let type;
    let importStatement = '\n@import "ember-rdfa-editor";\n';

    // Check if this project is using SCSS
    if ('ember-cli-sass' in dependencies) {
      type = 'scss';
    }

    if (type) {
      let stylePath = path.join('app', 'styles');
      let file = path.join(stylePath, `app.${type}`);

      if (!fs.existsSync(stylePath)) {
        fs.mkdirSync(stylePath);
      }
      if (fs.existsSync(file)) {
        this.ui.writeLine(`Added import statement to ${file}`);
        return this.insertIntoFile(file, importStatement, {});
      } else {
        fs.writeFileSync(file, importStatement);
        this.ui.writeLine(`Created ${file}`);
      }
    }
  },
};

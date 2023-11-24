'use strict'

const { Command } = require('@adonisjs/ace');

class CleanCommand extends Command {
  inspectDir;

  constructor() {
    super();

    this.inspectDir = use('inspect.dir');
  }

  /**
   * Ensures the command is executed within the
   * project root
   *
   * @method ensureInProjectRoot
   *
   * @return {void}
   */
  async ensureInProjectRoot () {
    const path = require('path');
    const acePath = path.join(process.cwd(), 'ace');
    const exists = await this.pathExists(acePath);

    if (!exists) {
      throw new Error(`Make sure you are inside an Adonisjs app to run ${this.constructor.commandName} command`);
    }
  }

  static get inject () {
    return []
  }

  static get signature () {
    return 'inspect:clean';
  }

  static get description () {
    return 'Clean generated json files';
  }

  async handle () {
    await this.ensureInProjectRoot();

    const fs = require('fs');
    const files = fs.readdirSync(this.inspectDir);
    const jsonFiles = files.filter(f => f.indexOf('manifest.json') === -1);
    const manifestPath = `${this.inspectDir}/manifest.json`;

    for (let jsonFile of jsonFiles) {
      fs.rmSync(`${this.inspectDir}/${jsonFile}`);
    }

    console.log(`${this.icon('success')} ${this.chalk.green('Deleted ' + jsonFiles.length + ' files')}`);

    const manifest = {
      requests: []
    };

    fs.writeFileSync(manifestPath, Buffer.from(JSON.stringify(manifest)));

    console.log(`${this.icon('success')} ${this.chalk.green('Generated new manifest file')}`);

    return;
  }
}

module.exports = CleanCommand;

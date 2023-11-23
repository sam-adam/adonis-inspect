'use strict';

/*
 * adonis-inspect
 *
 * (c) Samuel Adam Suhendra <samuel.suhendra@gmail.com>
 */

const path = require('path');

module.exports = async function (cli) {
  try {
    await cli.copy(
      path.join(__dirname, './templates/config.js'),
      path.join(cli.helpers.configPath(), 'inspect.js')
    )
    cli.command.completed('create', 'config/inspect.js')
  } catch (error) {}
}

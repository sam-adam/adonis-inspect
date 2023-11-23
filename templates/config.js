'use strict';

const Env = use('Env');

module.exports = {
  enabled: Env.get('INSPECT_ENABLED', false),
  dir: 'storage/inspect'
};

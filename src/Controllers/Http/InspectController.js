'use strict'

class InspectController {
  async index({ response }) {
    const View = use('InspectView');
    const inspectDir = use('inspect.dir');
    const fs = require('fs');
    const manifest = JSON.parse(fs.readFileSync(`${inspectDir}/manifest.json`, 'utf-8'));

    return View.render('inspect-list', {
      manifest: manifest
    });
  }

  async show({ params, response }) {
    const View = use('InspectView');
    const inspectDir = use('inspect.dir');
    const fs = require('fs');
    const req = JSON.parse(fs.readFileSync(`${inspectDir}/${params.id}.json`, 'utf-8'));

    return View.render('inspect-show', {
      req: req,
      queriesDuration: req.queries.reduce((a, c) => a + c.duration, 0)
    });
 }
}

module.exports = InspectController; 
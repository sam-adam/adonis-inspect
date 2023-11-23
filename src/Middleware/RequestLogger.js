'use strict';

class RequestLogger {
  async handle({ request }, next) {
    if (request.originalUrl().indexOf('/_inspect') === 0) {
      return next();
    }

    const fs = require('fs');
    const inspectDir = use('inspect.dir');
    const manifestPath = `${inspectDir}/manifest.json`;
    const Database = use('Database');
    const requestId = use('uuid').v4();
    const start = new Date();
    const logFilePath = `${inspectDir}/${requestId}.json`;
    const logData = {
      request: {
        id: requestId,
        method: request.method(),
        url: request.originalUrl(),
        get: request.get(),
        post: request.post(),
        headers: request.headers()
      },
      timestamp: start,
      queries: []
    }

    Database.on('query', function (query) {
      let q = query;

      q['start'] = new Date();

      logData.queries.push(q);
    });

    Database.on('query-response', function (res, query) {
      let idx = logData.queries.findIndex(q => q['__knexQueryUid'] === query['__knexQueryUid']);
      let q = logData.queries[idx];

      q['end'] = new Date();
      q['duration'] = q['end'] - q['start'];
      q['response'] = query.response[0] || null;

      logData.queries[idx] = q;
    });

    await next();

    logData['duration'] = new Date() - start;

    let manifest = {
      requests: []
    };

    fs.writeFileSync(logFilePath, Buffer.from(JSON.stringify(logData)));

    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(`${inspectDir}/manifest.json`, 'utf-8'));
    }
  
    manifest.requests.unshift({
      id: requestId,
      timestamp: start,
      method: request.method(),
      url: request.originalUrl(),
      logFile: logFilePath
    });

    fs.writeFileSync(manifestPath, Buffer.from(JSON.stringify(manifest)));
  }
}

module.exports = new RequestLogger();
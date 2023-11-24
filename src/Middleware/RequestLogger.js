'use strict';

class RequestLogger {
  async after({ response }) {
    console.log('After', response)
  }
  async handle({ request, response }, next) {
    // prevent logging self
    if (request.originalUrl().indexOf('/_inspect') === 0) {
      return next();
    }

    // prevent logging file requests
    if (request.originalUrl().match(/\/[^\/]+(\.[a-zA-Z]+)$/)) {
      return next();
    }

    const fs = require('fs');
    const Config = use('Config');
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
      response: {
        headers: [],
        code: 0,
        body: ''
      },
      timestamp: start,
      queries: []
    }

    if (Config.get('inspect.collectors.query')) {
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
    }

    await next();

    if (Config.get('inspect.collectors.response')) {
      let responseBody = response.lazyBody.content;
      let responseStr = responseBody;

      if (responseBody instanceof Error || (responseBody && responseBody.status && responseBody.status === 'error')) {
        responseStr = responseBody.message.toString();
      }

      logData['response'] = {
        headers: response.response.headers,
        code: response.response.statusCode,
        body: responseStr
      }
    }

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
      responseCode: response.response.statusCode,
      logFile: logFilePath
    });

    fs.writeFileSync(manifestPath, Buffer.from(JSON.stringify(manifest)));
  }
}

module.exports = new RequestLogger();
/*
 * phantom-monitor
 *
 * @author Jared Smith <jasmith79@gmail.com>
 *
 * Listens on a port (defaults to 8080) for a request with a url and JavaScript to run against it to
 * return whether or not the page is correctly served.
 */

'use strict';

const com     = require('commander');
const fs      = require('fs');
const http    = require('http');
const main    = require('./main.js');
const version = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).version;
const CLI     = !module.parent; // i.e. being used from command line rather than required.

// validateRequest :: String -> Promise {k:v}
const validateRequest = req => {
  let first = typeof req === 'string' && req.length > 3 && req.match(/^[\[\{]/), second;
  if (first) {
    try {
      second = JSON.parse(req);
    } catch (e) {
      return Promise.reject(e);
    }
  } else {
    return Promise.reject(new Error(`Request ${req} is not a valid JSON string.`));
  }

  return Promise.resolve(second);
};

const main = args => {
  prog
    .version(version)
    .option('-v, --verbose', 'Outputs actions to console.')
    .option('-p, --type [port]', 'Port to listen on, defaults to 8080')
    .option('-o, --output [path]', `path for the log file. Defaults to ./phantom-monitor.log`)
    .option('--host', 'Hostname, defaults to localhost')
    .option('--secure', 'Will fail on ssl errors')
    .parse(args);

  const port     = prog.port || 8080;
  const hostname = prog.host || 'localhost';
  const logFile  = fs.openSync((prog.output || './phantom-monitor.log', 'w'));
  const verbose  = prog.verbose;

  if (verbose) {
    console.log('starting server...');
  }

  const server = http.createServer((request, response) => {
    response.end('a-ok');
    validateRequest(request.query) //? how where is info stored? need to decide GET/POST
      .then(req => {
        response.end(main(req));
      })
      .catch(e => {
        console.log(e.message); // need to add logging
        response.end('Malformed request');
      });
  });

  server.listen(port, hostname, err => {
    if (err) {
      throw err;
    }
    if (verbose) {
      console.log(`server listening on ${hostname} port ${port}`);
    }
  });
};

if (CLI) {
  main(process.argv);
} else {
  module.exports = (...args) => main(['',''].concat(args));
}

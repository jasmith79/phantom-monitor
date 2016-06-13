/*
 * Website Monitor
 * @author Jared Smith <jarsmith@indot.in.gov>
 * @copyright 2016 INDOT
 */
'use strict';

const switches = require('commander');
const check    = require('./main.es');
const decor    = require('decorators-js');
const fs       = require('fs');
const http     = require('http');
const version  = 3; //JSON.parse(fs.readFileSync('../package.json', 'utf-8')).version;

switches
  .version(version)
  .option('-p, --port', 'Port to listen on')
  .option('-v, --verbose', 'Logs output to console')
  .option('--secure', 'Will fail on ssl errors')
  .parse(process.argv);

const port = switches.port || 8080;

const status = {
  OK: 0,
  warn: 1,
  fail: 2,
  unknown: 3
};

// because of the way the phantom api works, the test needs to be a function function (NOT =>) of
// no arguments
const sites = [
  {
    url: 'https://deltaspeed.trafficwise.org/',
    test: function() {
      return [].slice.call(document.scripts);
    }
  }, {
    url: 'https://crashmap.trafficwise.org',
    test: function() {
      return [].slice.call(document.scripts);
    }
  }, {
    url: 'https://mileage.trafficwise.org/',
    test: function() {
      return [].slice.call(document.scripts);
    }
  }, {
    url: 'https://mobilitymap.trafficwise.org',
    test: function() {
      return [].slice.call(document.scripts);
    }
  }, {
    url: 'https://hoosierhelpers.trafficwise.org',
    test: function() {
      return [].slice.call(document.scripts);
    }
  }
].map(o => Object.assign(o, switches)); // adds the CLI parameters

let results = Promise.resolve(null);

let update = () => {
  let p = Promise.all(sites.map(check));
  results = p;
  return p;
};

let result2JSON = (obj, str, i) => {
  let siteName = sites[i].url.match(/https?:\/\/([a-z]+)\./i)[1];
  let res = str.toString();
  obj[siteName] = res.match(/[0-9a-z]/i) ? res : 'Success!';
  return obj;
};

setInterval(update, 60000);

var server = http.createServer(function(req, res) {
  results
    .then(arg => {
      switch (Object.prototype.toString.call(arg)) {
        case '[object Error]': res.end(arg.message); break;
        case '[object Array]': res.end(JSON.stringify(arg.reduce(result2JSON, {}))); break;
        default: res.end('null\n');
      }
    })
    .catch(e => res.end(`${new Date().toString()}:'${e.message}`));
});
server.listen(8080, function() {
  console.log('Listening at localhost 8080');
});

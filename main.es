/*
 * Website Monitor
 * @author Jared Smith <jarsmith@indot.in.gov>
 * @copyright 2016 INDOT
 */
'use strict';

const phantom = require('phantom');
const fs = require('fs');

module.exports = args => {
  let phantomObj, site, errs = [];
  return phantom.create([`--ignore-ssl-errors=${args.secure ? 'yes' : 'no'}`])
    .then(instance => {
      phantomObj = instance;
      return instance.createPage();
    })
    .then(page => {
      site = page;
      page.onConsoleMessage = function (msag, line) {
        let msg = `${msag} line:${line}`;
        if (args.verbose) {
          console.log(msg);
        }
        errs.push(msg);
      };
      if (args.verbose) {
        if (!args.secure) {
          console.log('Ignoring ssl errors.');
        }
        console.log(`Opening page ${args.url}...;`)
      }
      return page.open(args.url);
    })
    .then(status => {
      if (args.verbose) {
        console.log(`STATUS: ${status}`);
      }

      if (status === 'fail') {
        if (args.verbose) {
          console.log('aborting...')
        }
        throw new Error(`${new Date().toString()}: site ${args.url} failed to load.`);
      }

      return site.evaluateJavaScript(args.test.toString());
      // return new Promise((resolve, reject) => {
      //   let timeout = setTimeout(function() {
      //     reject(new Error("Page failed to load DOM content < 5 seconds"));
      //   }, 5000);
      //
      // });
    })
    .then(result => {
      return new Promise((resolve, reject) => {
        let str = result.toString();
        let retStr = str.match(/[a-z0-9]/i) ? str : 'Success!';
        setTimeout(() => {
          if (args.verbose) {
            console.log(result);
          }
          resolve(`${new Date().toString()}: ${retStr}\n${errs.join('\n')}\n`);
          site.close();
          phantomObj.exit();
        }, 7000);
      });
    })
    .catch(e => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(`${new Date().toString()}: ${e.message}\n${errs.join('\n')}\n`);
        }, 7000);
        site.close();
        phantomObj.exit();
      });
    });
}

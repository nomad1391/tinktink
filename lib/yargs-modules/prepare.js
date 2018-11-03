'use strict'

module.exports = {
  command: 'prepare',
  aliases: ['prep'],
  describe: 'pre-fetch all dependencies',
  builder (y) {
    return y.help().alias('help', 'h')
      .options(Object.assign(require('../common-opts.js'), module.exports.options()))
  },
  options () {
    return {}
  },
  handler: prepare
}

function prepare (argv) {
  const cp = require('child_process')
  const fs = require('graceful-fs')
  const path = require('path')

  let pkgMap = checkPkgMap()
  if (!pkgMap) {
    cp.spawnSync(process.argv[0], [
      require.resolve('../worker.js'), ...process.argv.slice(2)
    ], {
      stdio: 'inherit'
    })
  }

  function checkPkgMap () {
    try {
      const base = process.cwd()
      const lock = JSON.parse(stripBOM(fs.readFileSync(path.join(base, 'package-lock.json'), 'utf8')))
      const map = JSON.parse(stripBOM(fs.readFileSync(path.join(base, '.package-map.json'), 'utf8')))
      require('ssri').checkData(
        JSON.stringify(lock), map.lockfile_integrity, { error: true }
      )
      return map
    } catch (err) {
      return false
    }
  }

  function stripBOM (str) {
    return str.replace(/^\uFEFF/, '')
  }
}
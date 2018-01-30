const osenv = require('osenv')
const path = require('path')
const minimist = require('minimist')

module.exports = require('rc')('depgrep', {
  db: path.join(osenv.home(), '.depgrep', 'db')
}, minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    'clear-cache': 'c'
  }
}))

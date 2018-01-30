#!/usr/bin/env node

const debug = require('debug')('depgrep')
const c = require('chalk')
const ora = require('ora')
const rimraf = require('rimraf')
const rc = require('./lib/rc')

if (rc.c) {
  rimraf.sync(rc.db)
  process.exit(0)
}

const db = require('./lib/db')(rc.db)
const doQuery = require('./lib/query')

if (rc.help) {
  usage()
  process.exit(0)
}

const base = rc._[0]
if (typeof base !== 'string') {
  console.log(c.yellow('Missing module name'))
  process.exit(1)
}

let query = rc._[1]
if (typeof query === 'string') {
  query = query.toLowerCase()
} else {
  console.log(c.yellow('Missing search query'))
  process.exit(1)
}

debug('Searching', c.bold(base), 'dependents')
debug('Query:', c.bold(query))

const spinner = ora().start()

doQuery(db, base, query, (err, files) => {
  spinner.stop()
  if (err) return exit(err)
  files.forEach((file, i) => {
    console.log(c.rgb(120, 255, 0).bold(file.html_url))
    file.text_matches.forEach(match => {
      console.log(hilight(match.fragment, query))
    })
    if (i < files.length) console.log()
  })
}).on('status', status => {
  spinner.text = status
})

function hilight (str, pattern) {
  const regex = new RegExp(pattern, 'ig')
  return str.replace(regex, match => c.bgYellow.gray.bold(match))
}

function exit (err) {
  console.error(c.red(err.message || err))
  process.exit(1)
}

function usage () {
  console.log('depgrep [module query] [options]')
  console.log('')
  console.log('  Search for testBuffer in dependents of abstract-leveldown')
  console.log(c.bold('    depgrep abstract-leveldown testBuffer'))
  console.log('  Clear cached search results')
  console.log(c.bold('    depgrep -c | --clear-cache'))
  console.log('  Show this help')
  console.log(c.bold('    depgrep -h | --help'))
}

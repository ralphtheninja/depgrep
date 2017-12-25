const debug = require('debug')('depgrep')
const level = require('level')
const sub = require('subleveldown')
const mkdirp = require('mkdirp')

module.exports = path => {
  debug('Database at', path)
  mkdirp.sync(path)

  const db = level(path)
  const dependents = sub(db, 'dependents', {
    valueEncoding: 'json'
  })
  const query = sub(db, 'query', {
    valueEncoding: 'json'
  })
  return { dependents, query }
}

const debug = require('debug')('depgrep')
const moduleDependents = require('module-dependents')
const github = require('github-from-package')
const jsonist = require('jsonist')
const unique = require('array-uniq')
const EventEmitter = require('events').EventEmitter

const dependents = (db, base, cb) => {
  debug('Getting cached dependents for', base)
  db.dependents.get(base, (err, result) => {
    if (err && !err.notFound) return cb(err)

    if (!err) {
      debug('Found cached dependents for', base)
      return cb(null, result)
    }

    debug('No cached dependents found for', base)
    moduleDependents(base).then(dependents => {
      const result = dependents.filter(pkg => {
        return typeof pkg.repository !== 'undefined'
      }).map(pkg => {
        const url = github(pkg)
        if (typeof url !== 'undefined') {
          return {
            pkg: pkg,
            url: url,
            slug: url.split('https://github.com/')[1]
          }
        }
      }).filter(Boolean)
      db.dependents.put(base, result, err => {
        debug('Storing dependents for', base, 'in cache')
        cb(err, result)
      })
    }, cb)
  })
}

const queryUrl = (packages, query) => {
  const base = 'https://api.github.com/search/code'
  return `${base}?q=${query}+in:file${uniqueRepos(packages)}`
}

function uniqueRepos (packages) {
  const result = unique(packages.map(pkg => {
    return pkg.slug
  })).join('+repo:')
  return '+repo:' + result
}

module.exports = (db, base, query, cb) => {
  const ee = new EventEmitter()
  const key = base + '!' + query
  debug('Getting cached search results for', key)
  db.query.get(key, (err, cachedQuery) => {
    if (err && !err.notFound) return cb(err)

    if (!err) {
      debug('Found cached query for', key)
      return cb(null, cachedQuery)
    }

    debug(key, 'not in query cache')
    ee.emit('status', 'Getting dependent npm modules')

    dependents(db, base, (err, packages) => {
      if (err) return cb(err)
      const url = queryUrl(packages, query)
      const opts = {
        headers: {
          'user-agent': 'ralphtheninja/depgrep',
          accept: 'application/vnd.github.v3.text-match+json'
        }
      }

      debug('Quering url', url)
      ee.emit('status', 'Searching github repositories')

      jsonist.get(url, opts, function (err, data, resp) {
        if (err) return cb(err)
        const result = Array.isArray(data.items) ? data.items : []
        db.query.put(key, result, err => {
          debug('Storing query for', key, 'in cache')
          cb(err, result)
        })
      })
    })
  })

  return ee
}

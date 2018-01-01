# depgrep

> Search dependents of a node module.

[![Build Status](https://travis-ci.org/ralphtheninja/depgrep.svg?branch=master)](https://travis-ci.org/ralphtheninja/depgrep)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

As a module and/or maintenance developer it can be handy to gather information on which modules are actually using your module, e.g. which parts of the api it uses, variable names etc. This can be particularly useful when changing the API and helps answering the question `How will this change affect the users of my module?`.

## Features

* Finds dependents of a module using [`module-dependents`](https://github.com/doowb/module-dependents)
* Uses the [GitHub Search API](https://developer.github.com/v3/search/) to search for keywords
* Output heavily influenced by [`the_silver_searcher`](https://github.com/ggreer/the_silver_searcher) but points out blobs on GitHub rather than files on the local file system
* Search results are indexed based on the queried module and query which helps with repetetive and offline queries
* Dependent modules are cached for faster and offline queries

Data is stored using [`level`](https://github.com/level/level). Storage path defaults to `~/.depgrep/db` but can be configured by the `depgrep_db` environment variable (determined by [`rc`](https://github.com/dominictarr/rc)).

## Install

```
$ npm i depgrep -g
```

## Usage

Search for `testBuffer` in dependents of `abstract-leveldown`

![image](depgrep.gif)

## License

MIT


//     eskimo-server
//     Copyright (c) 2014- Nick Baugh <niftylettuce@gmail.com> (http://niftylettuce.com)
//     MIT Licensed

// Eskimo server is a component used by eskimo.

// * Author: [@niftylettuce](https://twitter.com/#!/niftylettuce)
// * Source: <https://github.com/niftylettuce/eskimo-server>

// # eskimo-server

// Inspired by `bixby-server` by Jared Hanson

var https = require('https')
var http = require('http')
var cluster = require('cluster')
var os = require('os')
var path = require('path')

exports = module.exports = function(logger, settings) {

  return function(done) {

    if (cluster.isMaster && settings.server.cluster) {

      var size = settings.server.cluster.size || os.cpus().length

      logger.info('creating cluster with %d workers', size)

      for (var i=0; i<size; i++) {
        logger.info('spawning worker #%d', i + 1)
        cluster.fork()
      }

      cluster.on('fork', function(worker) {
        logger.info('worker #%s with pid %d spawned', worker.id, worker.process.pid)
      })

      cluster.on('online', function(worker) {
        logger.info('worker #%s with pid %d online', worker.id, worker.process.pid)
      })

      cluster.on('listening', function(worker, addr) {
        logger.info('worker #%s with pid %d listening on %s:%d', worker.id, worker.process.pid, addr.address, addr.port)
      })

      cluster.on('disconnect', function(worker) {
        logger.info('worker #%s with pid %d disconnected', worker.id, worker.process.pid)
      })

      cluster.on('exit', function(worker, code, signal) {
        logger.error('worker #%s with pid %d exited with code/signal', worker.id, worker.process.pid, signal, code)
        if (worker.suicide) return
        logger.info('worker #%s restarting', worker.id)
        cluster.fork()
      })

    } else {

      if (settings.server.ssl.enabled)
        this.server = https.createServer(settings.server.ssl.options, this)
      else
        this.server = http.createServer(this)

      this.server.listen(settings.server.port, settings.server.host, function() {
        var addr = this.address()
        logger.info('app listening on %s:%d', addr.address, addr.port)
        done()
      })

    }

  }

}

exports['@singleton'] = true
exports['@require'] = [ 'logger', 'settings' ]

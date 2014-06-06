
// # lib

var path = require('path')

module.exports = function express(id) {
  var map = {
    'eskimo/server': path.join(__dirname, 'boot', 'eskimo-server')
  }
  var mid = map[id]
  if (mid)
    return require(mid)
}

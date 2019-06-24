/* eslint-disable no-console */
try {
  require('electron-reloader')(module, { debug: true })
  // eslint-disable-next-line no-empty
} catch (_) {}
require('./main')

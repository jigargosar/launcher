// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.require = require
// window.addEventListener('DOMContentLoaded', () => {
//   const debugMenu = require('debug-menu')
//   debugMenu.install() // activate context menu
//   for (const versionType of ['chrome', 'electron', 'node']) {
//     document.getElementById(`${versionType}-version`).innerText =
//       process.versions[versionType]
//   }
// })

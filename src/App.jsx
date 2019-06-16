import React from 'react'

import debug from 'debug'

const log = debug('app:App.jsx:')

function getCmdList() {
  return [
    //
    { title: 'Show Date' },
    { title: 'Show Time' },
    {
      title: 'Web Bookmarks',
      onSelect: () => {
        log('Show bookmarks list')
      },
    },
  ]
}
export function App() {
  const cmdList = getCmdList()
  return (
    <div className="lh-copy measure-wide center">
      <div className="pv3 b ttu">Launcher</div>
      <div>
        {cmdList.map((cmd, idx) => {
          return (
            <div
              key={idx}
              className="pointer pa1 ba mv1"
              onClick={() => cmd.onSelect && cmd.onSelect()}
            >
              {cmd.title}
            </div>
          )
        })}
      </div>
    </div>
  )
}

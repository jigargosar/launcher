/* eslint-disable no-console */
import React, { useCallback, useEffect } from 'react'
import debug from 'debug'
import { useKey, useGetSet } from 'react-use'
import cx from 'clsx'
import { taggedSum } from 'daggy'
import over from 'ramda/es/over'
import lensProp from 'ramda/es/lensProp'
import pipe from 'ramda/es/pipe'
import add from 'ramda/es/add'
import mathMod from 'ramda/es/mathMod'
import identity from 'ramda/es/identity'
import isHotKey from 'is-hotkey'
import ky from 'ky'
// import { api } from 'electron-util'
import { remote } from 'electron'
const overProp = propName => over(lensProp(propName))
const nop = () => {}

const log = debug('app:App.jsx:')

const Cmd = {
  run: () => cmd => log(cmd),
  none: nop,
}

const useStateEffect = initialState => update => {
  const [get, set] = useGetSet(initialState)
  const send = useCallback(
    msg => {
      const [nextState, cmd] = update(msg)(get())
      set(nextState)
      Cmd.run(send)(cmd)
    },
    [get, set, update],
  )
  return [get, send]
}

const initialState = {
  hlIdx: 0,
  items: [
    //
    { title: 'Show Date' },
    { title: 'Show Time' },
    {
      title: 'Gmail',
      run: () => {
        console.log('opening gmail')
        const target = 'https://mail.google.com/mail/u/0'
        ky.post('//localhost:8081/opn', { searchParams: { target } })
        // fetch({url:'localhost:8081', })
      },
    },
  ],
}

const Msg = taggedSum('Msg', {
  INC: [],
  DEC: [],
})

const update = msg => state => {
  const rollHlIdxBy = offset => {
    const totalItems = state.items.length
    if (totalItems === 0) {
      return identity
    }
    return overProp('hlIdx')(
      pipe(
        //
        add(offset),
        idx => mathMod(idx, totalItems),
      ),
    )
  }
  return msg.cata({
    INC: () => [rollHlIdxBy(1)(state), Cmd.none],
    DEC: () => [rollHlIdxBy(-1)(state), Cmd.none],
  })
}

const useHotKey = keys => handler => {
  useKey(isHotKey(keys), handler, {}, [])
}

export function App() {
  const [get, send] = useStateEffect(initialState)(update)
  const hlIdx = get().hlIdx
  const cmdList = get().items

  useHotKey(['down', 'shift+j'])(() => {
    send(Msg.INC)
  })

  useHotKey(['up', 'shift+k'])(() => {
    send(Msg.DEC)
  })

  useClip()

  return (
    <div className="lh-copy measure-wide center">
      <div className="pv3 b ttu">Launcher</div>
      <div className="pv2">Input: {`<type to filter>`}</div>
      <div>
        {cmdList.map((cmd, idx) => {
          const isHighlighted = idx === hlIdx
          return (
            <div
              key={idx}
              className={cx(
                'pointer pa1 ba mv1',
                isHighlighted ? 'bg-light-gray' : '',
              )}
              onClick={() => cmd.run && cmd.run()}
            >
              {cmd.title}
            </div>
          )
        })}
      </div>
    </div>
  )
}
function useClip() {
  useEffect(() => {
    const readClip = () => remote.clipboard.readText()
    let prev = readClip()
    const intervalId = setInterval(() => {
      const next = readClip()
      if (prev !== next) {
        console.log('clip changed:', next)
        prev = next
      }
    }, 500)
    return () => clearInterval(intervalId)
  }, [])
}

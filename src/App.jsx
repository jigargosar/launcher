import React, { useCallback } from 'react'
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

const overProp = propName => over(lensProp(propName))
const nop = () => {}

const log = debug('app:App.jsx:')

const initialState = {
  hlIdx: 0,
  items: [
    //
    { title: 'Show Date' },
    { title: 'Show Time' },
    {
      title: 'Web Bookmarks',
      onSelect: () => {
        log('Show bookmarks list')
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

export function App() {
  const [get, send] = useStateEffect(initialState)(update)
  const hlIdx = get().hlIdx
  const cmdList = get().items

  useKey('ArrowDown', () => {
    send(Msg.INC)
  })

  useKey('ArrowUp', () => {
    send(Msg.DEC)
  })

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

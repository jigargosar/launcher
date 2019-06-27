/* eslint-disable no-console */
import React, { useCallback, useEffect } from 'react'
import debug from 'debug'
import Kefir from 'kefir'
import { useKey, useGetSet } from 'react-use'
import cx from 'clsx'
import { taggedSum, tagged } from 'daggy'
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
import prepend from 'ramda/es/prepend'
import is from 'ramda/es/is'
const overProp = propName => over(lensProp(propName))
const nop = () => {}
const invariant = (bool, msg = 'Invariant Failed') => {
  if (!bool) {
    throw new Error(msg)
  }
}

const log = debug('app:App.jsx:')

const Command = (() => {
  const Command = tagged('Command', ['fn'])
  const Command$static = {
    of: fn => {
      invariant(is(Function, fn))
      return Command(fn)
    },
    none: Command(nop),
    run: send => cmd => {
      invariant(is(Function, send))
      invariant(Command.is(cmd))
      cmd.fn(send)
    },
  }
  Object.assign(Command, Command$static)
  return Command
})()

const Cmd = Command

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
  clips: [],
  items: [
    //
    { title: 'Show Date' },
    { title: 'Show Time' },
    {
      title: 'Gmail',
      run: () => {
        log('opening gmail')
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
  OnClipChange: ['value'],
  OnHlClipSelected: [],
})

const writeClipTxtCmd = txt => () => remote.clipboard.writeText(txt)

const update = msg => state => {
  const overHlIdx = overProp('hlIdx')
  const rollHlIdxBy = offset => {
    const totalItems = state.clips.length
    if (totalItems === 0) {
      return identity
    }
    return overHlIdx(
      pipe(
        //
        add(offset),
        idx => mathMod(idx, totalItems),
      ),
    )
  }
  const pure = s => [s, Cmd.none]
  const overClips = overProp('clips')
  const prependNewClip = txt => overClips(prepend(txt))
  const resetHlIdx = overHlIdx(() => 0)
  return msg.cata({
    INC: () => [rollHlIdxBy(1)(state), Cmd.none],
    DEC: () => [rollHlIdxBy(-1)(state), Cmd.none],
    OnClipChange: txt =>
      pure(
        pipe(
          //
          prependNewClip(txt),
          resetHlIdx,
        )(state),
      ),
    OnHlClipSelected: () => [
      state,
      writeClipTxtCmd(state.clips[state.hlIdx]),
    ],
  })
}

const useHotKey = keys => handler => {
  useKey(isHotKey(keys), handler, {}, [])
}

export function App() {
  const [get, send] = useStateEffect(initialState)(update)
  const hlIdx = get().hlIdx
  const clips = get().clips

  useHotKey(['down', 'shift+j'])(() => {
    send(Msg.INC)
  })

  useHotKey(['up', 'shift+k'])(() => {
    send(Msg.DEC)
  })

  useHotKey(['enter'])(() => {
    send(Msg.OnHlClipSelected)
  })

  log('state changed', get())

  useEffect(() => {
    const sub = Kefir.withInterval(500, emitter =>
      emitter.value(remote.clipboard.readText()),
    )
      .skipDuplicates()
      .observe(txt => send(Msg.OnClipChange(txt)))

    return () => sub.unsubscribe()
  }, [])

  return (
    <div className="lh-copy measure-wide center">
      <div className="pv3 b ttu">Launcher</div>
      <div className="pv2">Input: {`<type to filter>`}</div>
      <div>
        {clips.map((clipTxt, idx) => {
          const isHighlighted = idx === hlIdx
          return (
            <div
              key={idx}
              className={cx(
                'pointer pa1 ba mv1',
                isHighlighted ? 'bg-light-gray' : '',
              )}
              onClick={() => send(Msg.OnHlClipSelected)}
            >
              {clipTxt}
            </div>
          )
        })}
      </div>
    </div>
  )
}

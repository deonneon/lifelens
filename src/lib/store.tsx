import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { Account, Source, UniverseEvent, UniverseState } from '../types'
import { SEED } from '../data/seed'

const STORAGE_KEY = 'lifelens.universe.v1'

type ActionType =
  | { type: 'ADD_SOURCE'; source: Source }
  | { type: 'ADD_EVENT'; event: UniverseEvent; accounts: Account[] }
  | { type: 'ADD_ACCOUNT'; account: Account }
  | { type: 'RESET' }

function reducer(state: UniverseState, action: ActionType): UniverseState {
  switch (action.type) {
    case 'ADD_SOURCE':
      if (state.sources.some((s) => s.id === action.source.id)) return state
      return { ...state, sources: [...state.sources, action.source] }
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.event],
        accounts: [...state.accounts, ...action.accounts],
      }
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.account] }
    case 'RESET':
      return SEED
  }
}

function load(): UniverseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED
    const parsed = JSON.parse(raw) as UniverseState
    if (!parsed.entities?.length || !parsed.events?.length) return SEED
    return parsed
  } catch {
    return SEED
  }
}

interface StoreValue {
  state: UniverseState
  addSource: (source: Source) => void
  addEvent: (event: UniverseEvent, accounts: Account[]) => void
  addAccount: (account: Account) => void
  reset: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function UniverseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full or unavailable — the app still works in memory
    }
  }, [state])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      addSource: (source) => dispatch({ type: 'ADD_SOURCE', source }),
      addEvent: (event, accounts) => dispatch({ type: 'ADD_EVENT', event, accounts }),
      addAccount: (account) => dispatch({ type: 'ADD_ACCOUNT', account }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useUniverse(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useUniverse must be used inside UniverseProvider')
  return ctx
}

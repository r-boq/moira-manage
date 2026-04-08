import { produce } from 'immer'
import { StateCreator, StoreApi } from 'zustand'
import type { DevtoolsOptions, PersistOptions, StoreMiddleware } from './types'

const isDev = process.env.NODE_ENV !== 'production'

// ============================================================================
// Immer Middleware
// ============================================================================

/**
 * Immer middleware - enables draft-based state mutations
 */
export const immer = <T extends object>(config: StateCreator<T>): StateCreator<T> => {
  return (set, get, api) => {
    const immerSet: typeof set = (updater: unknown, replace?: unknown) => {
      const nextState =
        typeof updater === 'function' ? produce(updater as Parameters<typeof produce>[1]) : updater
      return (set as (...args: unknown[]) => void)(nextState, replace)
    }
    return config(immerSet, get, api)
  }
}

// ============================================================================
// DevTools Middleware
// ============================================================================

/**
 * DevTools middleware - integrates with Redux DevTools Extension
 * Only active in development by default
 */
export const devtools = <T>(
  config: StateCreator<T>,
  options?: DevtoolsOptions | boolean
): StateCreator<T> => {
  const opts: DevtoolsOptions =
    typeof options === 'boolean' ? { enabled: options } : (options ?? {})

  const {
    name = 'Store',
    enabled = isDev,
    anonymousActionType = 'action',
    trace = false,
  } = opts

  if (
    !enabled ||
    typeof window === 'undefined' ||
    !(window as { __REDUX_DEVTOOLS_EXTENSION__?: unknown }).__REDUX_DEVTOOLS_EXTENSION__
  ) {
    return config
  }

  return (set, get, api) => {
    const extension = (
      window as { __REDUX_DEVTOOLS_EXTENSION__: { connect: (o: unknown) => unknown } }
    ).__REDUX_DEVTOOLS_EXTENSION__
    const devtoolsInstance = extension.connect({ name, trace }) as {
      init: (s: unknown) => void
      send: (type: string, s: unknown) => void
    }

    devtoolsInstance.init(get())

    const devtoolsSet: typeof set = (updater: unknown, replace?: unknown) => {
      const nextState = typeof updater === 'function' ? (updater as (s: T) => T)(get()) : updater
      ;(set as (...args: unknown[]) => void)(nextState, replace)
      devtoolsInstance.send(anonymousActionType, get())
    }

    return config(devtoolsSet, get, api)
  }
}

// ============================================================================
// Persist Middleware  (Web — uses localStorage)
// ============================================================================

/**
 * Persist middleware - saves state to localStorage and hydrates on init
 */
export const persist = <T extends object>(
  config: StateCreator<T>,
  options: PersistOptions<T>
): StateCreator<T> => {
  const {
    name,
    partialize = (state) => state,
    version = 0,
    migrate,
    merge = (persisted, current) => ({ ...current, ...persisted }),
  } = options

  return (set, get, api) => {
    const initialState = config(set, get, api)

    // Hydrate from localStorage (SSR-safe)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(name)
        if (stored) {
          const parsed = JSON.parse(stored) as { state: Partial<T>; version: number }
          let persistedState = parsed.state

          if (migrate && parsed.version !== version) {
            persistedState = migrate(persistedState, parsed.version)
          }

          const mergedState = merge(persistedState, get())
          set(mergedState as T, true)
        }
      } catch (error) {
        console.error(`[Persist] Failed to hydrate store "${name}":`, error)
      }

      // Subscribe to state changes and persist
      api.subscribe((state) => {
        try {
          const stateToPersist = partialize(state)
          localStorage.setItem(name, JSON.stringify({ state: stateToPersist, version }))
        } catch (error) {
          console.error(`[Persist] Failed to persist store "${name}":`, error)
        }
      })
    }

    return initialState
  }
}

// ============================================================================
// Logger Middleware (Development Only)
// ============================================================================

/**
 * Logger middleware - logs state changes to console (dev only)
 */
export const logger = <T>(
  config: StateCreator<T>,
  options?: { name?: string; enabled?: boolean }
): StateCreator<T> => {
  const { name = 'Store', enabled = isDev } = options ?? {}

  if (!enabled) return config

  return (set, get, api) => {
    const loggerSet: typeof set = (updater: unknown, replace?: unknown) => {
      ;(set as (...args: unknown[]) => void)(updater, replace)
      const nextState = get()
      console.group(`[${name}] State Update`)
      console.log('Next State:', nextState)
      console.groupEnd()
    }
    return config(loggerSet, get, api)
  }
}

// ============================================================================
// Middleware Composition
// ============================================================================

/**
 * Compose multiple middlewares (right to left, like Redux)
 */
export const compose = <T>(...middlewares: StoreMiddleware[]) => {
  return (config: StateCreator<T>): StateCreator<T> => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc as StateCreator<unknown>), config as StateCreator<unknown>) as StateCreator<T>
  }
}

// ============================================================================
// Persist Utilities
// ============================================================================

export const clearPersistedStore = (name: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.error(`[Persist] Failed to clear store "${name}":`, error)
    }
  }
}

export const getPersistedStore = <T>(name: string): T | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(name)
    if (stored) {
      const parsed = JSON.parse(stored) as { state: T }
      return parsed.state
    }
    return null
  } catch (error) {
    console.error(`[Persist] Failed to get persisted store "${name}":`, error)
    return null
  }
}

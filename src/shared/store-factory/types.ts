import { Draft } from 'immer'
import { StoreApi } from 'zustand'

// ============================================================================
// Core Zustand Types
// ============================================================================

/**
 * Zustand set function with Immer support
 * Allows both direct state updates and draft-based mutations
 */
export type ZustandSet<T> = {
  (partial: T | Partial<T> | ((state: T) => T | Partial<T> | void), replace?: boolean): void
  (fn: (state: Draft<T>) => void): void
}

/**
 * Zustand get function - returns current state
 */
export type ZustandGet<T> = () => T

// ============================================================================
// Store Action Types
// ============================================================================

/**
 * Action wrapper function for createSimpleStore
 */
export type StoreActionWrapper<TState> = (
  set: ZustandSet<TState>,
  get: ZustandGet<TState>
) => {
  [key: string]: (...args: unknown[]) => unknown
}

/**
 * Actions object for createImmerStore
 * Methods can directly mutate draft state or return new state
 */
export type ImmerActions<TState> = {
  [key: string]: (
    this: {
      set: ZustandSet<TState>
      get: ZustandGet<TState>
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => unknown
}

// ============================================================================
// Middleware Types
// ============================================================================

/**
 * Store middleware function
 */
export type StoreMiddleware = <T>(
  config: (
    set: StoreApi<T>['setState'],
    get: StoreApi<T>['getState'],
    api: StoreApi<T>
  ) => T
) => (
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  api: StoreApi<T>
) => T

/**
 * DevTools middleware options
 */
export interface DevtoolsOptions {
  /** Store name in DevTools */
  name?: string
  /** Enable DevTools (default: true in development) */
  enabled?: boolean
  /** Anonymize actions */
  anonymousActionType?: string
  /** Trace actions */
  trace?: boolean
}

/**
 * Persist middleware options
 */
export interface PersistOptions<T> {
  /** localStorage key */
  name: string
  /** Partial state to persist (default: entire state) */
  partialize?: (state: T) => Partial<T>
  /** Version for migration */
  version?: number
  /** Migration function */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  migrate?: (persistedState: any, version: number) => T
  /** Merge strategy */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  merge?: (persistedState: any, currentState: T) => T
}

// ============================================================================
// Store Configuration Types
// ============================================================================

/**
 * Configuration for createImmerStore
 */
export interface ImmerStoreConfig<
  TState extends object,
  TActions extends ImmerActions<TState>,
> {
  /** Initial state */
  state: TState
  /** Actions that can mutate draft state */
  actions: TActions
  /** DevTools options */
  devtools?: DevtoolsOptions | boolean
  /** Persist options */
  persist?: PersistOptions<TState>
}

/**
 * Configuration for createControllerStore
 */
export interface ControllerStoreConfig<TState extends object> {
  /** DevTools options */
  devtools?: DevtoolsOptions | boolean
  /** Persist options */
  persist?: PersistOptions<TState>
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract action types from ImmerActions
 */
export type ExtractActions<TActions extends ImmerActions<unknown>> = {
  [K in keyof TActions]: TActions[K] extends (
    this: unknown,
    ...args: infer P
  ) => infer R
    ? (...args: P) => R
    : never
}

/**
 * Complete store type combining state and actions
 */
export type StoreType<TState, TActions> = TState & TActions

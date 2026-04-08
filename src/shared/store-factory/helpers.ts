import { StoreApi, UseBoundStore } from 'zustand'
import type { ZustandGet, ZustandSet } from './types'

// ============================================================================
// Action Helpers
// ============================================================================

/**
 * Bind actions to set/get context (used internally by createImmerStore)
 */
export function createActions<TState, TActions extends Record<string, Function>>(
  actions: TActions,
  set: ZustandSet<TState>,
  get: ZustandGet<TState>
): TActions {
  const boundActions = {} as TActions
  for (const key in actions) {
    if (typeof actions[key] === 'function') {
      boundActions[key] = actions[key].bind({ set, get }) as TActions[typeof key]
    }
  }
  return boundActions
}

// ============================================================================
// Selector Helpers
// ============================================================================

/**
 * Create per-key selector hooks for a store (prevents unnecessary re-renders)
 *
 * @example
 * const selectors = createSelectors(useAuthStore)
 * const user = selectors.user()   // instead of useAuthStore(s => s.user)
 */
export function createSelectors<TState extends object>(
  store: UseBoundStore<StoreApi<TState>>
) {
  type Selectors = { [K in keyof TState]: () => TState[K] }
  const selectors = {} as Selectors

  for (const key of Object.keys(store.getState()) as Array<keyof TState>) {
    selectors[key] = () => store((state) => state[key])
  }

  return selectors
}

/**
 * Create a single typed selector from a store
 */
export function createSelector<TState, TResult>(
  store: UseBoundStore<StoreApi<TState>>,
  selector: (state: TState) => TResult
): () => TResult {
  return () => store(selector)
}

// ============================================================================
// Reset Helper
// ============================================================================

/**
 * Create a reset function that restores the store to its initial state
 */
export function createResetFunction<TState extends object>(
  store: UseBoundStore<StoreApi<TState>>,
  initialState: TState
): () => void {
  return () => store.setState(initialState, true)
}

// ============================================================================
// Computed Values
// ============================================================================

/**
 * Derive computed values from store state
 */
export function createComputed<TState, TComputed extends Record<string, unknown>>(
  store: UseBoundStore<StoreApi<TState>>,
  computedFns: { [K in keyof TComputed]: (state: TState) => TComputed[K] }
): () => TComputed {
  return () => {
    const state = store.getState()
    const computed = {} as TComputed
    for (const key in computedFns) {
      computed[key] = computedFns[key](state)
    }
    return computed
  }
}

// ============================================================================
// Subscription Helpers
// ============================================================================

/**
 * Subscribe to a specific state key; fires only when that key changes
 */
export function subscribeToKey<TState extends object, K extends keyof TState>(
  store: UseBoundStore<StoreApi<TState>>,
  key: K,
  callback: (value: TState[K], previousValue: TState[K]) => void
): () => void {
  let previousValue = store.getState()[key]

  return store.subscribe((state) => {
    const currentValue = state[key]
    if (currentValue !== previousValue) {
      callback(currentValue, previousValue)
      previousValue = currentValue
    }
  })
}

/**
 * Subscribe with a custom selector; fires only when selected value changes
 */
export function subscribeWithSelector<TState, TSelected>(
  store: UseBoundStore<StoreApi<TState>>,
  selector: (state: TState) => TSelected,
  callback: (value: TSelected, previousValue: TSelected) => void,
  equalityFn: (a: TSelected, b: TSelected) => boolean = Object.is
): () => void {
  let previousValue = selector(store.getState())

  return store.subscribe((state) => {
    const currentValue = selector(state)
    if (!equalityFn(currentValue, previousValue)) {
      callback(currentValue, previousValue)
      previousValue = currentValue
    }
  })
}

// ============================================================================
// Type Guard
// ============================================================================

export function isZustandStore(value: unknown): value is UseBoundStore<StoreApi<unknown>> {
  return (
    typeof value === 'function' &&
    typeof (value as UseBoundStore<StoreApi<unknown>>).getState === 'function' &&
    typeof (value as UseBoundStore<StoreApi<unknown>>).setState === 'function' &&
    typeof (value as UseBoundStore<StoreApi<unknown>>).subscribe === 'function'
  )
}

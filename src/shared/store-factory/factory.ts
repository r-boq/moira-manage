// @ts-nocheck - Zustand overloads are complex; types are enforced at the call-site
import { create } from 'zustand'
import { produce } from 'immer'
import type { StoreApi } from 'zustand/vanilla'
import type { UseBoundStore } from 'zustand/react'
import type {
  ZustandGet,
  ZustandSet,
  StoreActionWrapper,
  ImmerActions,
  ExtractActions,
  ImmerStoreConfig,
  ControllerStoreConfig,
  DevtoolsOptions,
  PersistOptions,
} from './types'
import { devtools, persist, immer } from './middleware'
import { createActions } from './helpers'

// ============================================================================
// Internal: apply middleware stack
// ============================================================================

function applyMiddleware<T extends object>(
  creator: unknown,
  options?: {
    devtools?: DevtoolsOptions | boolean
    persist?: PersistOptions<T>
  }
) {
  let result = creator

  if (options?.persist) {
    result = persist(result, options.persist)
  }

  if (options?.devtools !== undefined && options.devtools !== false) {
    const devtoolsOpts =
      typeof options.devtools === 'object' ? options.devtools : { enabled: true }
    result = devtools(result, devtoolsOpts)
  }

  return result
}

// ============================================================================
// extractMethods — used by createControllerStore
// ============================================================================

export function extractMethods<T extends object>(
  instance: T
): Partial<Record<keyof T, Function>> {
  const proto = Object.getPrototypeOf(instance)
  return Object.fromEntries(
    Object.getOwnPropertyNames(proto)
      .filter(
        (key) =>
          key !== 'constructor' && typeof instance[key as keyof T] === 'function'
      )
      .map((key) => [key, (instance[key as keyof T] as Function).bind(instance)])
  ) as Partial<Record<keyof T, Function>>
}

// ============================================================================
// createImmerStore — 推荐 API
// ============================================================================

/**
 * Create a Zustand store with Immer integration.
 *
 * @example
 * ```ts
 * const useCounterStore = createImmerStore({
 *   state: { count: 0 },
 *   actions: {
 *     increment() { this.set((d) => { d.count++ }) },
 *     reset()     { this.set({ count: 0 }) },
 *   },
 *   devtools: { name: 'CounterStore' },
 * })
 * ```
 */
export function createImmerStore<
  TState extends object,
  TActions extends ImmerActions<TState>,
>(
  config: ImmerStoreConfig<TState, TActions>
): UseBoundStore<StoreApi<TState & ExtractActions<TActions>>> {
  const {
    state: initialState,
    actions: actionDefs,
    devtools: devtoolsOpts,
    persist: persistOpts,
  } = config

  return create<TState & ExtractActions<TActions>>()(
    applyMiddleware(
      immer((set, get) => {
        const immerSet: ZustandSet<TState> = (updater: unknown, replace?: boolean) => {
          if (typeof updater === 'function') {
            set((state) => produce(state, updater as (d: TState) => void) as unknown, replace)
          } else {
            set(updater, replace)
          }
        }

        const immerGet = get as ZustandGet<TState>
        const boundActions = createActions(actionDefs, immerSet, immerGet)

        return { ...initialState, ...boundActions } as TState & ExtractActions<TActions>
      }),
      { devtools: devtoolsOpts, persist: persistOpts }
    )
  )
}

// ============================================================================
// createControllerStore — OOP 模式
// ============================================================================

/**
 * Create a store using a Controller class (OOP style).
 *
 * @example
 * ```ts
 * class AuthState { user: User | null = null }
 *
 * class AuthController extends BaseController<AuthState> {
 *   setUser(user: User) { this.set({ user }) }
 *   logout()            { this.set({ user: null }) }
 * }
 *
 * export const useAuthStore = createControllerStore(AuthState, AuthController, {
 *   devtools: { name: 'AuthStore' },
 * })
 * ```
 */
export function createControllerStore<
  TState extends object,
  TService,
  TController extends object,
>(
  StateClass: new (...args: unknown[]) => TState,
  ControllerClass: new (
    set: ZustandSet<TState>,
    get: ZustandGet<TState>,
    service?: TService
  ) => TController,
  serviceOrConfig?: TService | ControllerStoreConfig<TState>,
  initValue?: unknown[]
): UseBoundStore<StoreApi<TState & TController>> {
  let service: TService | undefined
  let config: ControllerStoreConfig<TState> | undefined

  if (
    serviceOrConfig &&
    typeof serviceOrConfig === 'object' &&
    ('devtools' in serviceOrConfig || 'persist' in serviceOrConfig)
  ) {
    config = serviceOrConfig as ControllerStoreConfig<TState>
  } else {
    service = serviceOrConfig as TService
  }

  return create<TState & TController>()(
    applyMiddleware(
      immer((set, get) => {
        const state = new StateClass(...(initValue ?? []))

        const immerSet: ZustandSet<TState> = (updater: unknown, replace?: boolean) => {
          if (typeof updater === 'function') {
            set((s) => produce(s, updater as (d: TState) => void) as unknown, replace)
          } else {
            set(updater, replace)
          }
        }

        const controller = new ControllerClass(
          immerSet,
          get as ZustandGet<TState>,
          service
        )
        const controllerMethods = extractMethods(controller)

        return { ...state, ...controllerMethods } as TState & TController
      }),
      config
    )
  )
}

// ============================================================================
// createSimpleStore — 函数式模式（向后兼容）
// ============================================================================

/**
 * Functional-style store creation.
 *
 * @example
 * ```ts
 * const useCounterStore = createSimpleStore(
 *   { count: 0 },
 *   (set) => ({
 *     increment: () => set((d) => { d.count++ }),
 *     reset:     () => set({ count: 0 }),
 *   })
 * )
 * ```
 */
export function createSimpleStore<TState extends object>(
  state: TState,
  actionWrappers: StoreActionWrapper<TState>,
  options?: {
    devtools?: DevtoolsOptions | boolean
    persist?: PersistOptions<TState>
  }
): UseBoundStore<StoreApi<TState & ReturnType<StoreActionWrapper<TState>>>> {
  return create<TState & ReturnType<StoreActionWrapper<TState>>>()(
    applyMiddleware(
      immer((set, get) => {
        const immerSet: ZustandSet<TState> = (updater: unknown, replace?: boolean) => {
          if (typeof updater === 'function') {
            set((s) => produce(s, updater as (d: TState) => void) as unknown, replace)
          } else {
            set(updater, replace)
          }
        }

        const actions = actionWrappers(immerSet, get as ZustandGet<TState>)
        return { ...state, ...actions }
      }),
      options
    )
  )
}

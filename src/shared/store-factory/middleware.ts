import { produce } from 'immer';
import { type StateCreator } from 'zustand';

import type { DevtoolsOptions, PersistOptions, StoreMiddleware } from './types';

const isDev = process.env.NODE_ENV !== 'production';

// Redux DevTools 全局扩展类型
interface ReduxDevtoolsExtension {
  connect: (options: { name: string; trace: boolean }) => {
    init: (state: unknown) => void;
    send: (type: string, state: unknown) => void;
  };
}

// ============================================================================
// Immer Middleware
// ============================================================================

export const immer =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) => {
    const immerSet: typeof set = (updater: unknown, replace?: unknown) => {
      const nextState =
        typeof updater === 'function' ? produce(updater as Parameters<typeof produce>[1]) : updater;
      return (set as (...args: unknown[]) => void)(nextState, replace);
    };
    return config(immerSet, get, api);
  };

// ============================================================================
// DevTools Middleware
// ============================================================================

export const devtools = <T>(
  config: StateCreator<T>,
  options?: DevtoolsOptions | boolean,
): StateCreator<T> => {
  const opts: DevtoolsOptions =
    typeof options === 'boolean' ? { enabled: options } : (options ?? {});

  const { name = 'Store', enabled = isDev, anonymousActionType = 'action', trace = false } = opts;

  /* eslint-disable no-underscore-dangle */
  const ext =
    typeof window !== 'undefined' &&
    (window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevtoolsExtension })
      .__REDUX_DEVTOOLS_EXTENSION__;
  /* eslint-enable no-underscore-dangle */

  if (!enabled || !ext) return config;

  return (set, get, api) => {
    const devtoolsInstance = ext.connect({ name, trace });
    devtoolsInstance.init(get());

    const devtoolsSet: typeof set = (updater: unknown, replace?: unknown) => {
      const nextState = typeof updater === 'function' ? (updater as (s: T) => T)(get()) : updater;
      (set as (...args: unknown[]) => void)(nextState, replace);
      devtoolsInstance.send(anonymousActionType, get());
    };

    return config(devtoolsSet, get, api);
  };
};

// ============================================================================
// Persist Middleware  (Web — uses localStorage)
// ============================================================================

export const persist = <T extends object>(
  config: StateCreator<T>,
  options: PersistOptions<T>,
): StateCreator<T> => {
  const {
    name,
    partialize = (state) => state,
    version = 0,
    migrate,
    merge = (persisted, current) => ({ ...current, ...persisted }),
  } = options;

  return (set, get, api) => {
    const initialState = config(set, get, api);

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(name);
        if (stored) {
          const parsed = JSON.parse(stored) as { state: Partial<T>; version: number };
          let persistedState = parsed.state;
          if (migrate && parsed.version !== version) {
            persistedState = migrate(persistedState, parsed.version);
          }
          set(merge(persistedState, get()) as T, true);
        }
      } catch (error) {
        console.error(`[Persist] Failed to hydrate store "${name}":`, error);
      }

      api.subscribe((state) => {
        try {
          localStorage.setItem(name, JSON.stringify({ state: partialize(state), version }));
        } catch (error) {
          console.error(`[Persist] Failed to persist store "${name}":`, error);
        }
      });
    }

    return initialState;
  };
};

// ============================================================================
// Logger Middleware (Development Only)
// ============================================================================

export const logger = <T>(
  config: StateCreator<T>,
  options?: { name?: string; enabled?: boolean },
): StateCreator<T> => {
  const { name = 'Store', enabled = isDev } = options ?? {};

  if (!enabled) return config;

  return (set, get, api) => {
    const loggerSet: typeof set = (updater: unknown, replace?: unknown) => {
      (set as (...args: unknown[]) => void)(updater, replace);
      console.info(`[${name}] State Update`, get());
    };
    return config(loggerSet, get, api);
  };
};

// ============================================================================
// Middleware Composition
// ============================================================================

export const compose =
  <T>(...middlewares: StoreMiddleware[]) =>
  (config: StateCreator<T>): StateCreator<T> =>
    middlewares.reduceRight(
      (acc, middleware) => middleware(acc as StateCreator<unknown>),
      config as StateCreator<unknown>,
    ) as StateCreator<T>;

// ============================================================================
// Persist Utilities
// ============================================================================

export const clearPersistedStore = (name: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`[Persist] Failed to clear store "${name}":`, error);
    }
  }
};

export const getPersistedStore = <T>(name: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(name);
    if (stored) {
      return (JSON.parse(stored) as { state: T }).state;
    }
    return null;
  } catch (error) {
    console.error(`[Persist] Failed to get persisted store "${name}":`, error);
    return null;
  }
};

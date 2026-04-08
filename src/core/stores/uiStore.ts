import { createSimpleStore } from '@shared/store-factory';

/**
 * UIStore - 全局 UI 状态（侧边栏、主题、全局加载等）
 * 演示 createSimpleStore 函数式用法
 */
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  globalLoading: boolean;
}

export const useUIStore = createSimpleStore<UIState>(
  {
    sidebarOpen: true,
    theme: 'system',
    globalLoading: false,
  },
  (set) => ({
    toggleSidebar: () =>
      set((draft) => {
        // eslint-disable-next-line no-param-reassign
        draft.sidebarOpen = !draft.sidebarOpen;
      }),

    setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

    setTheme: (theme: UIState['theme']) => set({ theme }),

    setGlobalLoading: (loading: boolean) => set({ globalLoading: loading }),
  }),
  {
    devtools: { name: 'UIStore' },
    persist: {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    },
  },
);

// Selectors
export const useSidebarOpen = () => useUIStore((s) => s.sidebarOpen);
export const useTheme = () => useUIStore((s) => s.theme);
export const useGlobalLoading = () => useUIStore((s) => s.globalLoading);

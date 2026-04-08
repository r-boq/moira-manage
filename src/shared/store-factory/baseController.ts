import type { ZustandGet, ZustandSet } from './types';

/**
 * BaseController - OOP 模式的 store 控制器基类
 *
 * 继承此类后可直接使用 this.set / this.get 操作 store 状态
 */
export class BaseController<TState> {
  protected set: ZustandSet<TState>;

  protected get: ZustandGet<TState>;

  constructor(set: ZustandSet<TState>, get: ZustandGet<TState>) {
    this.set = set;
    this.get = get;
  }
}

/**
 * HttpError — 统一的 HTTP 异常类
 *
 * 同时承载 HTTP 状态码（来自传输层）与业务错误码（来自响应体），
 * 便于调用方按需判断：
 *
 * @example
 * ```ts
 * try {
 *   await http.get('/users');
 * } catch (err) {
 *   if (err instanceof HttpError) {
 *     console.log(err.httpStatus);  // 401
 *     console.log(err.bizCode);     // 10001（业务码）
 *     console.log(err.message);     // "登录已过期"
 *   }
 * }
 * ```
 */
export class HttpError extends Error {
  /** HTTP 状态码，如 200 / 401 / 500 */
  public readonly httpStatus: number;

  /** 业务错误码（来自响应体 code 字段），HTTP 层错误时为 -1 */
  public readonly bizCode: number;

  /** 原始响应数据（可选） */
  public readonly data?: unknown;

  constructor(httpStatus: number, bizCode: number, message: string, data?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.httpStatus = httpStatus;
    this.bizCode = bizCode;
    this.data = data;
  }

  /** 是否为 HTTP 层错误（4xx / 5xx） */
  get isHttpError(): boolean {
    return this.httpStatus >= 400;
  }

  /** 是否为业务层错误（HTTP 200 但 code !== 0） */
  get isBizError(): boolean {
    return this.httpStatus === 200 && this.bizCode !== 0;
  }
}

// ---- 通用分页 ----
export interface Pagination {
  page: number
  pageSize: number
  total: number
}

// ---- 通用 API 响应包装 ----
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PagedData<T> {
  list: T[]
  pagination: Pagination
}

// ---- 通用选项类型（下拉、单选等） ----
export interface Option<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * 用户领域模型
 * 与后端 DTO 解耦，供前端内部使用
 */
export interface User {
  id: string
  username: string
  nickname: string
  avatar?: string
  roles: string[]
  createdAt: string
}

export function isAdmin(user: User): boolean {
  return user.roles.includes('admin')
}

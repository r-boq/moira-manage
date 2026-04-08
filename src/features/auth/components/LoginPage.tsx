import { LoginForm } from './LoginForm'

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">登录</h1>
        <p className="mb-6 text-sm text-gray-500">欢迎回来，请登录您的账号</p>
        <LoginForm />
      </div>
    </main>
  )
}

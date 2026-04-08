'use client'

import { FormEvent, useState } from 'react'
import { Button, Input } from '@components/ui'
import { useLogin } from '../../hooks/useLogin'
import styles from './index.module.scss'

export function LoginForm() {
  const { login, loading, error } = useLogin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await login({ username, password })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>用户名</label>
        <Input
          placeholder="请输入用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          size="large"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>密码</label>
        <Input.Password
          placeholder="请输入密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          size="large"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        size="large"
        block
        className={styles.submit}
      >
        登录
      </Button>
    </form>
  )
}

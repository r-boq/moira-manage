import Link from 'next/link';

import styles from './index.module.scss';

export interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '仪表盘', href: '/dashboard' },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Moira Manage
        </Link>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

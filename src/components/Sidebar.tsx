import { Link, useRouter } from '@tanstack/react-router'

const navItems = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/subscriptions', icon: 'subscriptions', label: 'Subscriptions' },
  { to: '/balances', icon: 'account_balance_wallet', label: 'Balances' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics' },
] as const

export default function Sidebar() {
  const router = useRouter()
  const currentPath = router.state.location.pathname

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col bg-surface-container-lowest lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="signature-gradient flex h-9 w-9 items-center justify-center rounded-lg">
            <span className="material-symbols-outlined text-[20px] text-on-primary">shield</span>
          </div>
          <span className="font-headline text-xl font-bold text-on-surface">Vault</span>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {navItems.map(item => {
            const isActive = item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-3 pb-4">
          <Link
            to="/add"
            className="signature-gradient flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary shadow-lg transition-transform hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Entry
          </Link>
          <div className="mt-4 flex flex-col gap-1">
            <button className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[20px]">help_outline</span>
              Help
            </button>
            <button className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="glass-effect fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-outline-variant/20 py-2 lg:hidden">
        {navItems.map(item => {
          const isActive = item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

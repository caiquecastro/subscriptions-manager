import { Link } from '@tanstack/react-router'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-surface/80 px-4 py-3 backdrop-blur-xl lg:px-8">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="signature-gradient flex h-8 w-8 items-center justify-center rounded-lg">
          <span className="material-symbols-outlined text-[18px] text-on-primary">shield</span>
        </div>
        <span className="font-headline text-lg font-bold text-on-surface">Vault</span>
      </div>

      {/* Search */}
      <div className="hidden max-w-md flex-1 lg:block">
        <div className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2.5">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Search subscriptions, balances..."
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          to="/add"
          className="signature-gradient flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-on-primary lg:hidden"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add
        </Link>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[22px] text-on-surface-variant">notifications</span>
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[22px] text-on-surface-variant">settings</span>
        </button>
        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary">
          CS
        </div>
      </div>
    </header>
  )
}

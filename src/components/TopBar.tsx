import { Link } from "@tanstack/react-router";
import { useAuth } from "../lib/auth";

export default function TopBar() {
  const { user, signOutUser } = useAuth();
  const initials = (user?.displayName || user?.email || "VA")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
        <button
          onClick={() => void signOutUser()}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high sm:hidden"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            logout
          </span>
        </button>
        <button
          onClick={() => void signOutUser()}
          className="hidden items-center gap-2 rounded-full bg-surface-container-high px-3 py-2 text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-highest sm:inline-flex"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign Out
        </button>
        <div className="ml-1 flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-on-surface">
              {user?.displayName || "Vault User"}
            </p>
            <p className="text-[11px] text-on-surface-variant">
              {user?.email || "Signed in"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}

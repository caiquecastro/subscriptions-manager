import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Vault — Subscription & Balance Manager' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-body antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-[240px]">
        <TopBar />
        <main className="px-4 pb-24 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { QueryClientProvider } from '@tanstack/react-query'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { createQueryClient } from '../lib/query'
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
  const [queryClient] = useState(() => createQueryClient())

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-body antialiased">
        <QueryClientProvider client={queryClient}>
          {children}
          <Scripts />
        </QueryClientProvider>
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

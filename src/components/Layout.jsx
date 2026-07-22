import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/',
    label: 'Home',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'History',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.6} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="flex-shrink-0 safe-bottom" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="flex">
          {tabs.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="flex-1 flex flex-col items-center py-2.5 gap-1">
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? 'var(--text)' : 'var(--text-3)' }}>
                    {icon(isActive)}
                  </span>
                  <span className="text-xs font-medium" style={{ color: isActive ? 'var(--text)' : 'var(--text-3)' }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

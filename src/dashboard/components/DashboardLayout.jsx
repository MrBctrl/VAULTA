import Sidebar, { personalNav } from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import MobileNav from './MobileNav.jsx'

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="px-5 sm:px-8 py-6 sm:py-8 pb-24 md:pb-8 max-w-[1400px]">{children}</main>
      </div>
      <MobileNav items={personalNav} homeHref="/dashboard" />
    </div>
  )
}

import Logo from './Logo.jsx'

const columns = [
  {
    title: 'Personal',
    links: ['Accounts', 'Transfers', 'Savings', 'Analytics'],
  },
  {
    title: 'Business',
    links: ['Payroll', 'Invoices', 'Team Cards', 'Expense Management'],
  },
  {
    title: 'Company',
    links: ['About', 'Security', 'Pricing', 'Support'],
  },
]

export default function Footer() {
  return (
    <footer id="support" className="bg-navy-700 text-navy-100/70 pt-20 pb-10">
      <div className="container-content">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-12">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" variant="white" />
              <span className="font-display font-semibold text-lg text-white">VAULTA</span>
            </a>
            <p className="mt-4 text-sm max-w-xs leading-relaxed">
              Banking Beyond Boundaries. A premium digital financial ecosystem
              for individuals and businesses.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>© {new Date().getFullYear()} VAULTA. A NEXCRAFT Creative Studio Concept.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Legal</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

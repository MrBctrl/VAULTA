import { Routes, Route } from 'react-router-dom'

import MarketingHome from './pages/MarketingHome.jsx'
import NotFound from './pages/NotFound.jsx'
import SignIn from './pages/SignIn.jsx'
import OpenAccount from './pages/OpenAccount.jsx'
import ProtectedRoute from './lib/ProtectedRoute.jsx'
import BusinessGate from './lib/BusinessGate.jsx'

// Personal dashboard
import Overview from './dashboard/personal/Overview.jsx'
import Accounts from './dashboard/personal/Accounts.jsx'
import Transactions from './dashboard/personal/Transactions.jsx'
import Transfers from './dashboard/personal/Transfers.jsx'
import Cards from './dashboard/personal/Cards.jsx'
import Savings from './dashboard/personal/Savings.jsx'
import Investments from './dashboard/personal/Investments.jsx'
import Analytics from './dashboard/personal/Analytics.jsx'
import Security from './dashboard/personal/Security.jsx'
import Settings from './dashboard/personal/Settings.jsx'

// Business dashboard
import BusinessOverview from './dashboard/business/BusinessOverview.jsx'
import BusinessAccounts from './dashboard/business/BusinessAccounts.jsx'
import BusinessTransactions from './dashboard/business/BusinessTransactions.jsx'
import Invoices from './dashboard/business/Invoices.jsx'
import Expenses from './dashboard/business/Expenses.jsx'
import Team from './dashboard/business/Team.jsx'
import BusinessCards from './dashboard/business/BusinessCards.jsx'
import Payroll from './dashboard/business/Payroll.jsx'
import BusinessAnalytics from './dashboard/business/BusinessAnalytics.jsx'
import BusinessSettings from './dashboard/business/BusinessSettings.jsx'

// Information architecture (locked):
//
// PUBLIC — MarketingHome (unchanged): Home, Personal, Business, Cards,
//   Investments, Security, About, Open Account, Sign In
//
// AUTHENTICATED — Personal Dashboard (/dashboard/*):
//   Overview, Accounts, Transactions, Transfers, Cards, Savings,
//   Investments, Analytics, Security, Settings
//
// AUTHENTICATED — Business Dashboard (/business/*):
//   Overview, Accounts, Transactions, Invoices, Expenses, Team, Cards,
//   Payroll, Analytics, Settings
//
// "Open Account" / "Sign In" on the marketing site route straight into
// /dashboard — there is no real backend, so authentication is simulated
// per the brief's "do not overbuild" guidance (mock interactions are fine).
function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingHome />} />
      <Route path="/login" element={<SignIn />} />
      <Route path="/open-account" element={<OpenAccount />} />

      <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
      <Route path="/dashboard/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
      <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/dashboard/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
      <Route path="/dashboard/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
      <Route path="/dashboard/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
      <Route path="/dashboard/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
      <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/dashboard/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
      <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="/business" element={<ProtectedRoute><BusinessGate><BusinessOverview /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/accounts" element={<ProtectedRoute><BusinessGate><BusinessAccounts /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/transactions" element={<ProtectedRoute><BusinessGate><BusinessTransactions /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/invoices" element={<ProtectedRoute><BusinessGate><Invoices /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/expenses" element={<ProtectedRoute><BusinessGate><Expenses /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/team" element={<ProtectedRoute><BusinessGate><Team /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/cards" element={<ProtectedRoute><BusinessGate><BusinessCards /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/payroll" element={<ProtectedRoute><BusinessGate><Payroll /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/analytics" element={<ProtectedRoute><BusinessGate><BusinessAnalytics /></BusinessGate></ProtectedRoute>} />
      <Route path="/business/settings" element={<ProtectedRoute><BusinessGate><BusinessSettings /></BusinessGate></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App

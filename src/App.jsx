import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import KeyFeatures from './components/KeyFeatures.jsx'
import PersonalBanking from './components/PersonalBanking.jsx'
import BusinessBanking from './components/BusinessBanking.jsx'
import Cards from './components/Cards.jsx'
import Investments from './components/Investments.jsx'
import Security from './components/Security.jsx'
import Testimonials from './components/Testimonials.jsx'
import DownloadApp from './components/DownloadApp.jsx'
import Footer from './components/Footer.jsx'

// Locked homepage sequence (VAULTA Website & Digital Experience spec):
// Navigation → Hero → Key Features → Personal Banking → Business Banking →
// Cards → Investments → Security → Testimonials → Download App CTA → Footer
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <KeyFeatures />
        <PersonalBanking />
        <BusinessBanking />
        <Cards />
        <Investments />
        <Security />
        <Testimonials />
        <DownloadApp />
      </main>
      <Footer />
    </div>
  )
}

export default App

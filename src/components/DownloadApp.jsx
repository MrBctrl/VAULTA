import { Apple, PlayCircle } from 'lucide-react'

export default function DownloadApp() {
  return (
    <section className="py-24 md:py-30">
      <div className="container-content">
        <div className="rounded-card bg-navy-600 px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-electric-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight max-w-xl mx-auto">
              Take VAULTA wherever you go.
            </h2>
            <p className="mt-4 text-navy-100/70 max-w-md mx-auto leading-relaxed">
              Download the app to manage accounts, send money, and track
              investments, right from your pocket.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-button bg-white text-navy-700 font-semibold px-6 py-3.5 hover:bg-navy-50 transition-colors"
              >
                <Apple size={20} /> App Store
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 rounded-button border border-white/25 text-white font-semibold px-6 py-3.5 hover:bg-white/10 transition-colors"
              >
                <PlayCircle size={20} /> Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

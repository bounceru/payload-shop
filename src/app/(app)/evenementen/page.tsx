import Link from 'next/link'
import type { Metadata } from 'next'
import { fetchShopContext } from '@/lib/fetchShopContext'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { getS3Url } from '@/utils/media'
import { ArrowRight, BarChart3, Calendar, CheckCircle, Headphones, Megaphone, Shield, Star, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Evenementen organiseren in Vlaanderen | Stagepass',
  description:
    'Ontdek hoe je als organisator eenvoudig evenementen in Vlaanderen kunt beheren en promoten met Stagepass.',
}

export default async function EvenementenPage() {
  const { isShop, shop, branding } = await fetchShopContext({})

  const logoUrl = getS3Url(branding?.siteLogo) || '/static/stagepass-logo.png'
  const headerBgColor = branding?.headerBackgroundColor || '#ED6D38'

  return (
    <>
      <NavBar isShop={isShop} logoUrl={logoUrl} ctaColor={headerBgColor} shopName={isShop ? shop?.name : undefined} />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-orange-50 py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  Organiseer jouw
                  <span className="text-orange-600"> evenement</span>
                  <br />
                  in Vlaanderen
                </h1>
                <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Stagepass helpt Vlaamse organisatoren bij het aanmaken, beheren en promoten van hun evenementen. Ons
                  platform ondersteunt tickets, promoties en meer zodat jij je kunt focussen op een succesvolle
                  productie.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/registreren"
                  className="group inline-flex items-center gap-2 bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-orange-700 transform hover:-translate-y-1 transition-all duration-300"
                >
                  Registreer en start nu
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:border-orange-600 hover:text-orange-600 transition-all duration-300"
                >
                  Bekijk demo
                </Link>
              </div>

              <div className="pt-8">
                <p className="text-sm text-gray-500 mb-4">Vertrouwd door 500+ organisatoren in Vlaanderen</p>
                <div className="flex justify-center items-center space-x-8 opacity-60">
                  <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">Logo 1</div>
                  <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">Logo 2</div>
                  <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">Logo 3</div>
                  <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">Logo 4</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">500+</div>
                <div className="text-gray-600">Evenementen</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">50K+</div>
                <div className="text-gray-600">Tickets verkocht</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">98%</div>
                <div className="text-gray-600">Tevredenheid</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Alles wat je nodig hebt voor een succesvol evenement
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Van ticketverkoop tot promotie, wij hebben alle tools die je nodig hebt om je evenement tot een succes
                te maken.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div
                  className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                  <Calendar className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Eenvoudig beheer</h3>
                <p className="text-gray-600 leading-relaxed">
                  Maak evenementen aan, beheer tickets en hou je inschrijvingen in real time in het oog. Alles vanuit
                  één overzichtelijk dashboard.
                </p>
              </div>

              <div
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div
                  className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                  <Megaphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Promotie op maat</h3>
                <p className="text-gray-600 leading-relaxed">
                  Bereik jouw doelpubliek dankzij geïntegreerde marketingtools, sociale media integratie en deelbare
                  evenementpagina's.
                </p>
              </div>

              <div
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div
                  className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <Headphones className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Lokale support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Een Vlaams team staat klaar om je te helpen bij vragen over jouw evenement. Persoonlijke begeleiding
                  in het Nederlands.
                </p>
              </div>

              <div
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div
                  className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Realtime analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Krijg inzicht in je ticketverkoop, bezoekersgedrag en evenementprestaties met uitgebreide rapportages.
                </p>
              </div>

              <div
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div
                  className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Veilige betalingen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Accepteer alle gangbare betaalmethoden met onze veilige betalingsverwerking. PCI-compliant en
                  betrouwbaar.
                </p>
              </div>

              <div
                className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div
                  className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-200 transition-colors">
                  <Users className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Toegangsbeheer</h3>
                <p className="text-gray-600 leading-relaxed">
                  Scan tickets aan de deur, beheer toegang en krijg realtime inzicht in wie er aanwezig is op je
                  evenement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Hoe het werkt</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                In slechts 4 eenvoudige stappen heb je jouw evenement online en ben je klaar om tickets te verkopen.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div
                  className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account aanmaken</h3>
                <p className="text-gray-600">
                  Registreer je gratis account en verifieer je gegevens in enkele minuten.
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Evenement instellen</h3>
                <p className="text-gray-600">
                  Voeg je evenementdetails toe, stel tickettypes in en configureer je instellingen.
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Promoten & verkopen</h3>
                <p className="text-gray-600">
                  Deel je evenementpagina en begin met het verkopen van tickets aan je publiek.
                </p>
              </div>

              <div className="text-center">
                <div
                  className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Evenement uitvoeren</h3>
                <p className="text-gray-600">Scan tickets aan de deur en geniet van je succesvolle evenement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Wat organisatoren zeggen</h2>
              <p className="text-xl text-gray-600">Ontdek waarom honderden organisatoren kiezen voor Stagepass</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "Stagepass heeft ons geholpen om ons festival naar een hoger niveau te tillen. De ticketverkoop was
                  nog nooit zo eenvoudig!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Janssen</div>
                    <div className="text-gray-500 text-sm">Organisator Zomerfestival Gent</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "De Nederlandse support en lokale kennis maken het verschil. Eindelijk een platform dat ons begrijpt!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Tom Vermeulen</div>
                    <div className="text-gray-500 text-sm">Evenementenbureau Antwerpen</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "Van kleine workshops tot grote conferenties, Stagepass groeit mee met onze behoeften. Absoluut een
                  aanrader!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Lisa De Vries</div>
                    <div className="text-gray-500 text-sm">Cultuurcentrum Leuven</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Veelgestelde vragen</h2>
              <p className="text-xl text-gray-600">
                Alles wat je wilt weten over evenementen organiseren met Stagepass
              </p>
            </div>

            <div className="space-y-8">
              <div className="border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Wat kost het gebruik van Stagepass?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stagepass werkt met een transparant commissiemodel. Je betaalt alleen een kleine commissie per
                  verkocht ticket. Er zijn geen maandelijkse kosten of opstartkosten.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Hoe snel ontvang ik mijn geld?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Je ontvangt je ticketopbrengsten binnen 2-3 werkdagen na afloop van je evenement, direct op je
                  bankrekening.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Kan ik mijn evenementpagina aanpassen?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ja! Je kunt je evenementpagina volledig aanpassen met je eigen branding, kleuren, logo en content om
                  perfect aan te sluiten bij je evenement.
                </p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Welke betaalmethoden worden ondersteund?</h3>
                <p className="text-gray-600 leading-relaxed">
                  We ondersteunen alle gangbare betaalmethoden zoals Bancontact, creditcards, PayPal en
                  bankoverschrijvingen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-orange-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Klaar om je evenement te lanceren?</h2>
            <p className="text-xl mb-8 opacity-90">
              Sluit je aan bij honderden tevreden organisatoren in Vlaanderen en maak van je evenement een succes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/registreren"
                className="group inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Start nu gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-8 py-4 rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300"
              >
                Neem contact op
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm opacity-75">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Geen opstartkosten
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Nederlandse support
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Veilige betalingen
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer
        branding={
          branding
            ? {
              ...branding,
              siteLogo:
                typeof branding.siteLogo === 'object' && branding.siteLogo !== null
                  ? (branding.siteLogo.s3_url ?? undefined)
                  : branding.siteLogo,
              primaryColorCTA: branding.primaryColorCTA ?? undefined,
              headerBackgroundColor: branding.headerBackgroundColor ?? undefined,
            }
            : undefined
        }
        isShop={isShop}
        shop={shop}
      />
    </>
  )
}

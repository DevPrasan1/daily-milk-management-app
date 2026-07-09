import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Milk, ClipboardList, Receipt, Globe, ShieldCheck, CheckCircle2, FileDown, Map, ArrowRight, Compass, Search, UserCheck, Check, Send, MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'
import AppShell from '@/components/layout/AppShell'

export default function Landing() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isHindi = i18n.language === 'hi'

  const [activeMockup, setActiveMockup] = useState('map') // 'map' | 'ledger'

  // Auto-slide mockups on mobile view every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveMockup(prev => (prev === 'map' ? 'ledger' : 'map'))
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const buyerFeatures = [
    {
      icon: Map,
      title: isHindi ? 'आस-पास के विक्रेता खोजें' : 'Find Nearby Sellers',
      desc: isHindi ? 'नक्शे पर अपने क्षेत्र के सक्रिय दूध विक्रेताओं को खोजें और ताज़ा दूध खरीदने के लिए जुड़ें।' : 'Browse active dairy sellers in your 10km radius on an interactive local map.'
    },
    {
      icon: ClipboardList,
      title: isHindi ? 'वास्तविक समय में रिकॉर्ड देखें' : 'Real-Time Logging Sync',
      desc: isHindi ? 'विक्रेता द्वारा दर्ज सुबह-शाम की मात्रा और दर को अपने फोन पर लाइव देखें।' : 'View daily morning and evening delivery entries as soon as the seller logs them.'
    },
    {
      icon: Receipt,
      title: isHindi ? 'पारदर्शी बिलिंग और भुगतान' : 'Billing & Balance Summaries',
      desc: isHindi ? 'कुल मात्रा, दी गई राशि और शेष बकाया राशि का सटीक हिसाब-किताब।' : 'Auto-calculate monthly volumes, sub-totals, payment history, and pending balances.'
    },
    {
      icon: FileDown,
      title: isHindi ? 'PDF रसीदें डाउनलोड करें' : 'Download Monthly PDFs',
      desc: isHindi ? 'पारदर्शिता के साथ पूरे महीने की दूध की रसीद एक क्लिक में डाउनलोड करें।' : 'Export and download detailed monthly delivery breakdowns for your household budget.'
    }
  ]

  const sellerFeatures = [
    {
      icon: Compass,
      title: isHindi ? 'नए खरीदार प्राप्त करें' : 'Get Discovered Locally',
      desc: isHindi ? 'ऐप पर अपनी डेयरी का स्थान दर्ज करें और आस-पास के नए खरीदारों को आकर्षित करें।' : 'List your location on the map to allow local buyers in your area to find and message you.'
    },
    {
      icon: ClipboardList,
      title: isHindi ? 'आसान ग्राहक प्रबंधन' : 'Effortless Ledger Management',
      desc: isHindi ? 'सभी ग्राहकों के दूध का दैनिक हिसाब एक ही स्थान पर प्रबंधित करें।' : 'Maintain individual ledgers for all your buyers in one consolidated app.'
    },
    {
      icon: Receipt,
      title: isHindi ? 'लचीले मूल्य और रेट कार्ड' : 'Custom Pricing Models',
      desc: isHindi ? 'विभिन्न ग्राहकों या अलग-अलग पशु प्रकार (गाय, भैंस, बकरी) के लिए अलग दरें सेट करें।' : 'Configure custom rate cards per customer or global default prices for cow/buffalo milk.'
    },
    {
      icon: FileDown,
      title: isHindi ? 'बिल साझा करें और पीडीएफ भेजें' : 'Generate Shared Statements',
      desc: isHindi ? 'मासिक बिलों को पीडीएफ रसीदों में बदलें और तुरंत व्हाट्सएप पर खरीदारों से साझा करें।' : 'Share monthly summaries and PDF breakdowns directly with buyers to receive payments.'
    }
  ]

  const benefits = [
    {
      title: isHindi ? 'फटने या खोने का कोई डर नहीं' : 'No lost papers or wet diaries',
      desc: isHindi ? 'कागज़ के पन्ने फटने, खोने या गीले होने का डर खत्म। पूरा हिसाब हमेशा क्लाउड पर सुरक्षित है।' : 'Paper logs get lost or wet. Your digital MilkBook data is safely backed up in the cloud forever.'
    },
    {
      title: isHindi ? 'हिसाब में कोई गड़बड़ी नहीं, पक्का भरोसा' : 'Zero math arguments',
      desc: isHindi ? 'दर और कुल राशि का हिसाब एकदम सही। खरीदार और विक्रेता दोनों के पास समान और पारदर्शी रिकॉर्ड।' : '100% accurate rate calculations. Both buyer and seller share the exact same ledger, preventing trust disputes.'
    },
    {
      title: isHindi ? 'स्थानीय खरीदार और विक्रेता मिलाप' : 'Local Buyer-Seller Matching',
      desc: isHindi ? 'खरीदार आस-पास के दूध विक्रेताओं को आसानी से नक्शे पर खोज सकते हैं, और विक्रेता अपनी लोकेशन अपडेट करके नए खरीदार पा सकते हैं।' : 'Buyers easily search and locate active milk sellers nearby. Sellers list their locations to instantly get discovered by new local buyers.'
    }
  ]

  function toggleLanguage() {
    const next = i18n.language === 'en' ? 'hi' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('milkbook_lang', next)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-x-hidden">

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#1D9E75] flex items-center justify-center shadow-md">
            <Milk className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">MilkBook</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-gray-500" />
            <span>{isHindi ? 'English' : 'हिंदी'}</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-[#1D9E75] hover:underline px-2 py-1.5 cursor-pointer"
          >
            {isHindi ? 'लॉगिन' : 'Login'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-8 pb-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center flex-1">
        <div className="lg:col-span-5 flex flex-col items-start text-left">

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('landing.tagline')}</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            {isHindi ? (
              <>दैनिक दूध का हिसाब <br /><span className="text-[#1D9E75]">अब हुआ आसान!</span></>
            ) : (
              <>Manage Milk Records <br /><span className="text-[#1D9E75]">Without the Paper.</span></>
            )}
          </h2>

          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
            {isHindi ? (
              'दूध डायरी फटने या खोने का झंझट खत्म। MilkBook ऐप पर अपनी गाय, भैंस के दूध का रोज़ाना का रिकॉर्ड और भुगतान हिसाब बिल्कुल सुरक्षित और पारदर्शी रखें।'
            ) : (
              'No more wet notebooks or lost receipts. Keep a transparent record of daily milk deliveries, payments, and balances with your buyer or seller in real-time.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 font-bold px-8 shadow-md"
            >
              <span>{t('landing.loginBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Interactive CSS App Mockups (Layered Map + Ledger screens) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center w-full relative min-h-[440px] md:min-h-[480px]">
          <div className="absolute inset-0 bg-radial from-[#1D9E75]/10 to-transparent blur-3xl rounded-full z-0" />

          <div className="relative w-full max-w-[320px] md:max-w-none h-[380px] md:h-[440px] flex items-center justify-center">

          {/* Screen 1: Nearby Sellers Map View (Offset Left/Bottom on desktop, slider on mobile) */}
          <div className={`w-[270px] bg-white dark:bg-gray-800 rounded-[28px] p-3 shadow-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-500 absolute md:left-2 lg:left-6 md:bottom-4 md:rotate-[-3deg] md:opacity-100 md:scale-100 md:pointer-events-auto ${activeMockup === 'map' ? 'left-1/2 -translate-x-1/2 opacity-100 scale-100 z-20' : 'left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none z-0'}`}>
            {/* Speaker */}
            <div className="w-12 h-3 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Search Header */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 rounded-xl py-1.5 pl-8 pr-3 text-[10px] font-medium text-gray-500 flex items-center justify-between">
                <span>{isHindi ? 'नोएडा सेक्टर 62...' : 'Noida Sector 62...'}</span>
                <Map className="w-3.5 h-3.5 text-[#1D9E75]" />
              </div>
            </div>

            {/* Mock Map Canvas */}
            <div className="w-full h-32 bg-sky-50 dark:bg-sky-950/20 rounded-xl relative overflow-hidden mb-3 border border-sky-100/50 dark:border-sky-900/30">
              {/* Street Lines */}
              <div className="absolute inset-0 opacity-20 dark:opacity-10">
                <div className="absolute top-8 left-0 right-0 h-[2px] bg-gray-400" />
                <div className="absolute top-20 left-0 right-0 h-[2px] bg-gray-400" />
                <div className="absolute top-0 bottom-0 left-12 w-[2px] bg-gray-400" />
                <div className="absolute top-0 bottom-0 left-36 w-[2px] bg-gray-400" />
              </div>

              {/* User Center Pulse */}
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="absolute w-6 h-6 bg-blue-500/20 rounded-full animate-ping" />
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
              </div>

              {/* Seller Pins */}
              <div className="absolute top-1/3 right-1/4 flex flex-col items-center">
                <div className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 text-[8px] font-bold shadow-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-0.5 whitespace-nowrap mb-0.5">
                  <span>🐄 Verma Dairy</span>
                </div>
                <div className="w-5 h-5 bg-[#1D9E75] rounded-full flex items-center justify-center text-white shadow-md border-2 border-white animate-bounce">
                  <MapPin className="w-3 h-3" />
                </div>
              </div>

              <div className="absolute bottom-4 right-1/3 flex flex-col items-center">
                <div className="px-1.5 py-0.5 rounded-md bg-white dark:bg-gray-800 text-[8px] font-bold shadow-xs border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-0.5 whitespace-nowrap mb-0.5">
                  <span>🐃 Krishna Dairy</span>
                </div>
                <div className="w-4 h-4 bg-[#1D9E75] rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                  <MapPin className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            {/* Selected Seller Bottom Card preview */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2.5 border border-gray-100 dark:border-gray-700/60">
              <div className="flex justify-between items-start mb-1">
                <h5 className="text-[10px] font-bold text-gray-800 dark:text-gray-200">Verma Dairy (0.8 km)</h5>
                <span className="text-[7px] px-1.5 py-0.5 bg-[#1D9E75]/10 text-[#1D9E75] font-bold rounded-full">{isHindi ? 'ताज़ा दूध' : 'Open'}</span>
              </div>
              <p className="text-[8px] text-gray-400 mb-2">🐄 Cow (₹60/L) • 🐃 Buffalo (₹80/L)</p>
              <div className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#1D9E75] text-white font-bold text-[8px] cursor-pointer shadow-xs hover:bg-[#168562] transition-colors">
                <Send className="w-2 h-2" />
                <span>{isHindi ? 'कनेक्ट रिक्वेस्ट भेजें' : 'Send Connect Request'}</span>
              </div>
            </div>
          </div>

          {/* Screen 2: Shared MilkBook Ledger (Main Focus, Layered Right/Top on desktop, slider on mobile) */}
          <div className={`w-[280px] bg-white dark:bg-gray-800 rounded-[30px] p-3.5 shadow-2xl border border-gray-100 dark:border-gray-700/50 transition-all duration-500 absolute md:right-2 lg:right-8 md:top-4 md:rotate-[2deg] md:opacity-100 md:scale-100 md:pointer-events-auto ${activeMockup === 'ledger' ? 'left-1/2 -translate-x-1/2 opacity-100 scale-100 z-20' : 'left-1/2 -translate-x-1/2 opacity-0 scale-95 pointer-events-none z-0'}`}>
            {/* Speaker */}
            <div className="w-14 h-3.5 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-7 h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* App Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/80 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1D9E75]/10 flex items-center justify-center font-bold text-[10px] text-[#1D9E75]">R</div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-800 dark:text-gray-200">Ramesh Dairy</h4>
                  <p className="text-[8px] text-gray-400">July 2026</p>
                </div>
              </div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                {isHindi ? 'सक्रिय बुक' : 'Active'}
              </span>
            </div>

            {/* Stat breakdown */}
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-2.5 mb-2.5 border border-gray-50 dark:border-gray-700/50">
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">🐄 {isHindi ? 'गाय' : 'Cow'}:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">100 L @ ₹60/L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">🐃 {isHindi ? 'भैंस' : 'Buffalo'}:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">120 L @ ₹80/L</span>
                </div>
              </div>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-3 gap-1 mb-2.5 text-center">
              <div className="bg-[#1D9E75]/5 dark:bg-[#1D9E75]/10 rounded-lg p-1.5">
                <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200">220 L</p>
                <p className="text-[7px] text-gray-400 uppercase font-semibold">{isHindi ? 'कुल लीटर' : 'Total L'}</p>
              </div>
              <div className="bg-[#1D9E75]/5 dark:bg-[#1D9E75]/10 rounded-lg p-1.5">
                <p className="text-[10px] font-bold text-gray-800 dark:text-gray-200">₹15,600</p>
                <p className="text-[7px] text-gray-400 uppercase font-semibold">{isHindi ? 'कुल राशि' : 'Amount'}</p>
              </div>
              <div className="bg-red-500/5 dark:bg-red-500/10 rounded-lg p-1.5">
                <p className="text-[10px] font-bold text-red-500">₹2,000</p>
                <p className="text-[7px] text-gray-400 uppercase font-semibold">{isHindi ? 'बकाया' : 'Due'}</p>
              </div>
            </div>

            {/* Calendar entries */}
            <div className="space-y-1.5 mb-2.5">
              <div className="flex items-center justify-between text-[9px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-2 rounded-lg">
                <span className="font-semibold text-gray-600 dark:text-gray-400">09 July 2026</span>
                <div className="flex gap-2 text-gray-700 dark:text-gray-300 font-medium">
                  <span>☀️ 5 L</span>
                  <span>🌙 4.5 L</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 p-2 rounded-lg">
                <span className="font-semibold text-gray-600 dark:text-gray-400">08 July 2026</span>
                <div className="flex gap-2 text-gray-700 dark:text-gray-300 font-medium">
                  <span>☀️ 5 L</span>
                  <span>🌙 5 L</span>
                </div>
              </div>
            </div>

            {/* PDF Download Button mock */}
            <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1D9E75]/10 text-[#1D9E75] font-bold text-[10px] shadow-xs border border-dashed border-[#1D9E75]/30">
              <FileDown className="w-3.5 h-3.5" />
              <span>{isHindi ? 'PDF डाउनलोड करें' : 'Download Monthly PDF'}</span>
            </div>
          </div>
        </div>

        {/* Dots navigation for mobile slider */}
        <div className="flex md:hidden items-center gap-2 mt-4 z-30">
          <button
            type="button"
            onClick={() => setActiveMockup('map')}
            className={`w-2.5 h-2.5 rounded-full transition-all ${activeMockup === 'map' ? 'bg-[#1D9E75] w-6' : 'bg-gray-300 dark:bg-gray-700'}`}
            aria-label="Map View"
          />
          <button
            type="button"
            onClick={() => setActiveMockup('ledger')}
            className={`w-2.5 h-2.5 rounded-full transition-all ${activeMockup === 'ledger' ? 'bg-[#1D9E75] w-6' : 'bg-gray-300 dark:bg-gray-700'}`}
            aria-label="Ledger View"
          />
        </div>
      </div>
    </section>

      {/* Divided Features Section (Split Seller vs Buyer) */}
      <section className="bg-white dark:bg-gray-800/40 border-y border-gray-100 dark:border-gray-800 py-16 md:py-24">
        <div className="w-full max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {isHindi ? 'आपकी जरूरत के हिसाब से बनाए फीचर्स' : 'Features Built Around Your Needs'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {isHindi ? 'हमने दूध खरीदारों (Buyers) और डेयरी विक्रेताओं (Sellers) दोनों के लिए शानदार और अलग टूल्स डिज़ाइन किए हैं।' : 'Consolidated and dedicated modules customized specifically for dairy buyers and sellers.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Buyer Block */}
            <div className="bg-gradient-to-br from-white to-[#FAFAF8] dark:from-gray-800 dark:to-gray-900/60 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider mb-6 self-start">
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isHindi ? 'दूध खरीदार (BUYER)' : 'For Milk Buyers'}</span>
              </div>

              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {isHindi ? 'अपना दूध खर्च और डिलीवरी प्रबंधित करें' : 'Track Your Milk Deliveries & Expenses'}
              </h4>

              <div className="space-y-6 flex-1 mb-8">
                {buyerFeatures.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="md" onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-2">
                <span>{isHindi ? 'कस्टमर अकाउंट बनाएं' : 'Register as Buyer'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Seller Block */}
            <div className="bg-gradient-to-br from-white to-[#FAFAF8] dark:from-gray-800 dark:to-gray-900/60 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold uppercase tracking-wider mb-6 self-start">
                <Milk className="w-3.5 h-3.5" />
                <span>{isHindi ? 'डेयरी विक्रेता (SELLER)' : 'For Milk Sellers'}</span>
              </div>

              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {isHindi ? 'अपनी डेयरी का व्यापार और बिक्री बढ़ाएं' : 'Grow Your Dairy & Streamline Customers'}
              </h4>

              <div className="space-y-6 flex-1 mb-8">
                {sellerFeatures.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1D9E75]/10 flex items-center justify-center flex-shrink-0 text-[#1D9E75]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="md" onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-2 shadow-sm">
                <span>{isHindi ? 'डेयरी विक्रेता खाता बनाएं' : 'Register as Seller'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits/Why Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              {isHindi ? 'मिल्कबुक (MilkBook) क्यों?' : 'Why Choose MilkBook?'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {isHindi ? (
                'पारंपरिक रजिस्टर और डायरियों में पानी गिरने, फटने या गायब होने का खतरा रहता है। मिल्कबुक डिजिटल माध्यम से दोनों पक्षों के बीच पक्का विश्वास और पारदर्शिता बनाता है।'
              ) : (
                'Traditional paper diaries easily get misplaced, ruined, or leads to calculation mistakes. MilkBook replaces manual ledgers to build trust and clear accounting.'
              )}
            </p>
            <Button size="md" onClick={() => navigate('/login')}>
              {isHindi ? 'अभी शुरुआत करें' : 'Get Started Now'}
            </Button>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {benefits.map(({ title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs text-left"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#1D9E75] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#1D9E75] text-white py-12 md:py-16 text-center">
        <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center">
          <h3 className="text-2xl md:text-4xl font-extrabold mb-3">
            {isHindi ? 'कागज़ मुक्त दूध हिसाब आज ही अपनाएं!' : 'Ready to Go Paperless?'}
          </h3>
          <p className="text-sm text-emerald-100 mb-8 max-w-md leading-relaxed">
            {isHindi ? (
              'आज ही मिल्कबुक (MilkBook) पर अपना निःशुल्क खाता बनाएं और पारदर्शी दूध हिसाब की शुरुआत करें।'
            ) : (
              'Create your free account today and start tracking your milk transactions with confidence.'
            )}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-xl bg-white text-[#1D9E75] hover:bg-gray-50 font-bold text-sm shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>{t('landing.loginBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Sub-footer */}
      <footer className="w-full py-6 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
        <p>© 2026 MilkBook App. All Rights Reserved.</p>
      </footer>

    </div>
  )
}

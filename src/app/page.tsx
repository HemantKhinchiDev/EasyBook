"use client";

import Link from "next/link";
import {
  QrCode, Globe, ChevronDown, Menu, CheckCircle, ArrowRight, Store, XCircle, TrendingDown,
  Frown, Zap, Clock, CheckCircle2, Users, Smile, MapPin, Search, Hand, Armchair,
  BellRing, Star, ExternalLink, LucideIcon
} from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Simple language placeholder function
  const changeLanguage = (lang: string) => {
    console.log("Language changed to", lang);
    // Implement language context if needed
  };

  return (
    <main className="bg-slate-50 min-h-screen text-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Area */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">EasyBook</span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Desktop Links */}
              <div className="hidden md:flex items-center space-x-6">
                <a href="#comparison" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Shopkeeper Benefits</a>
                <a href="#process" className="text-sm font-medium text-slate-600 hover:text-indigo-600">How it Works</a>
                <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Reviews</a>
              </div>

              {/* Desktop CTA */}
              <Link href="/register" className="hidden md:flex px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-all shadow-md hover:shadow-lg items-center gap-2">
                Get Free QR
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 top-16 shadow-lg z-40">
            <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
              <a href="#comparison" className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50">Shopkeeper Benefits</a>
              <a href="#process" className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50">How it Works</a>
              <a href="#testimonials" className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50">Reviews</a>
              <Link href="/register" className="block w-full text-center px-5 py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold rounded-xl transition-all shadow-md">
                Get Free QR
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center reveal active">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold mb-6 uppercase tracking-wide">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Free for all Shopkeepers</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Stop the Crowd. <br />
            <span className="text-indigo-600">Start the Flow.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform your Google Maps listing into a booking machine. <br />
            Upload one QR code. Customers book online. <strong>Zero technical skills needed.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
              <span>Get My Shop QR Code</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 1: Shopkeeper Problem */}
      <section id="comparison" className="py-20 lg:py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 reveal">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Manage your Shop, Not the Crowd</h2>
            <p className="text-slate-500 mt-2">See the difference between a normal shop and an EasyBook shop.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

            {/* CHAOS (Visual) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden group reveal hover:shadow-md transition-shadow">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">Traditional Shop</h3>
                  <p className="text-xs text-red-500 font-bold uppercase tracking-wide mt-1">Problem</p>
                </div>
                <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                  High Stress
                </div>
              </div>

              {/* Graphic */}
              <div className="bg-slate-100 rounded-xl h-48 md:h-56 relative flex items-center justify-center mb-6 overflow-hidden border border-slate-200">
                <Store className="w-16 md:w-20 h-16 md:h-20 text-slate-300" />

                {/* Animated Red Dots (Crowd) */}
                <div className="absolute inset-0 animate-chaos">
                  <div className="absolute top-[40%] left-[30%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-[45%] left-[45%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-[35%] left-[50%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-[55%] left-[40%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-[40%] left-[60%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="absolute top-[50%] left-[55%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>

                  <div className="absolute top-8 right-4 md:right-8 flex items-center gap-2 animate-walk-away">
                    <span className="text-[10px] font-bold text-red-500 bg-white px-2 py-1 rounded shadow-sm border border-red-100">Waiting too long!</span>
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Informative Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span><strong>Unpredictable waiting</strong> causes anger.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Customers leave when they see a crowd.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Frown className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Shopkeeper is stressed managing queue.</span>
                </div>
              </div>
            </div>

            {/* ORDER (Visual) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border-2 border-indigo-500 relative overflow-hidden group scale-100 md:scale-105 reveal delay-100 z-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">EasyBook Shop</h3>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mt-1">Solution</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> <span>Automated</span>
                </div>
              </div>

              {/* Graphic */}
              <div className="bg-indigo-50 rounded-xl h-48 md:h-56 relative flex items-center justify-center mb-6 overflow-hidden border border-indigo-100">
                <Store className="w-16 md:w-20 h-16 md:h-20 text-indigo-300 z-10" />

                {/* Smooth Dots Flowing */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-[ping_2s_infinite]"></div>
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>

                  <div className="absolute left-0 w-1/2 h-0.5 border-t-2 border-dashed border-indigo-200"></div>
                  <div className="absolute right-0 w-1/2 h-0.5 border-t-2 border-dashed border-indigo-200"></div>

                  <div className="absolute left-[10%] w-3 h-3 bg-indigo-300 rounded-full animate-[flow_4s_linear_infinite]"></div>
                  <div className="absolute left-[30%] w-3 h-3 bg-indigo-300 rounded-full animate-[flow_4s_linear_infinite_1s]"></div>
                </div>

                {/* Live Status Badge */}
                <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-sm text-xs border border-indigo-100">
                  <div className="font-bold text-indigo-900">Next: Rahul</div>
                  <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> 4:00 PM
                  </div>
                </div>
              </div>

              {/* Informative Stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span><strong>Zero waiting.</strong> Customers arrive on time.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Users className="w-4 h-4 text-green-600 shrink-0" />
                  <span>100% Retention (No one walks away).</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Smile className="w-4 h-4 text-green-600 shrink-0" />
                  <span>Relaxed environment for everyone.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: The Process */}
      <section id="process" className="py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white via-white/90 to-white/50"></div>

        <div className="absolute top-20 left-10 text-indigo-400 opacity-50 animate-bounce" style={{ animationDuration: '3s' }}><MapPin className="w-8 h-8" /></div>
        <div className="absolute bottom-40 right-20 text-red-400 opacity-50 animate-bounce" style={{ animationDuration: '4s' }}><MapPin className="w-6 h-6" /></div>
        <div className="absolute top-40 right-1/3 text-green-400 opacity-30 animate-bounce" style={{ animationDuration: '5s' }}><MapPin className="w-4 h-4" /></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="inline-block px-3 py-1 bg-white/80 backdrop-blur border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-4 uppercase shadow-sm">Simple Setup</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6 drop-shadow-sm">Google Maps Setup</h2>

              <div className="space-y-6 relative">
                <div className="absolute left-6 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-indigo-300 z-0"></div>

                <div className="relative flex gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold border-4 border-white shadow z-10 shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Register in 30 seconds</h4>
                    <p className="text-sm text-slate-600 mt-1">Fill the Google Form. We generate a unique system for you.</p>
                  </div>
                </div>

                <div className="relative flex gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold border-4 border-white shadow z-10 shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Get your QR Code</h4>
                    <p className="text-sm text-slate-600 mt-1">We send your unique booking link directly to your Email or Telegram.</p>
                  </div>
                </div>

                <div className="relative flex gap-4 bg-indigo-600/90 backdrop-blur-md p-4 rounded-xl border border-indigo-500 shadow-lg hover:shadow-xl transition-shadow text-white md:transform md:translate-x-2">
                  <div className="w-12 h-12 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold border-4 border-indigo-400 shadow z-10 shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white">Upload to Maps (Crucial)</h4>
                    <p className="text-sm text-indigo-100 mt-1">Add the QR image to your Google Maps photos. This is how customers find you.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8">
                <Link href="/register" className="inline-flex bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-0.5">
                  <span>Start Step 1 Now</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* GRAPHIC: Google Maps Mockup */}
            <div className="relative reveal delay-100 perspective-1000 mt-12 md:mt-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full filter blur-3xl opacity-60"></div>

              <div className="relative bg-white rounded-[2rem] shadow-2xl border-4 border-slate-900 overflow-hidden max-w-sm mx-auto transform md:rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="bg-red-500 text-white p-2 rounded-full shadow-sm animate-pin">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-800 rounded w-24 mb-1"></div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    </div>
                  </div>
                  <Search className="w-5 h-5 text-slate-400" />
                </div>

                <div className="h-40 bg-indigo-50 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-12 w-6 bg-white border-x-2 border-slate-200"></div>
                  <div className="absolute top-12 left-0 right-0 h-6 bg-white border-y-2 border-slate-200"></div>
                  <div className="absolute top-20 right-4 w-16 h-16 bg-green-100 rounded-lg opacity-50"></div>
                  <div className="absolute top-16 left-16 bg-blue-500 w-5 h-5 rounded-full border-2 border-white shadow-lg z-10"></div>
                  <div className="absolute top-16 left-16 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                </div>

                <div className="p-5 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-bold text-slate-500 uppercase">Shop Photos</div>
                    <div className="text-[10px] text-indigo-600 font-bold">Add Photo +</div>
                  </div>
                  <div className="flex gap-3 overflow-x-hidden pb-2">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl shrink-0 flex items-center justify-center border border-slate-100">
                      <Store className="text-slate-300 w-8 h-8" />
                    </div>
                    <div className="w-24 h-24 bg-white border-2 border-indigo-600 rounded-xl shrink-0 flex flex-col items-center justify-center p-2 shadow-xl relative scale-105">
                      <QrCode className="w-12 h-12 text-slate-900" />
                      <div className="text-[8px] font-bold text-indigo-600 mt-1 bg-indigo-50 px-2 py-0.5 rounded">Scan Me</div>
                      <div className="absolute -bottom-3 -right-3 bg-slate-900 rounded-full p-1.5 shadow-lg border-2 border-white animate-bounce">
                        <Hand className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    <div className="w-24 h-24 bg-slate-100 rounded-xl shrink-0 border border-slate-100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Testimonials */}
      <section id="testimonials" className="py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16 reveal">
            <h2 className="text-3xl font-bold text-slate-900">Used by Smart Shopkeepers</h2>
            <p className="text-slate-500 mt-2">See what others say about EasyBook.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 reveal hover:shadow-lg transition-shadow">
              <div className="flex text-yellow-400 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-slate-700 mb-6 italic">"My barber shop used to be chaotic on Sundays. Now, everyone books via Google Maps and comes on time. I save 2 hours daily."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div>
                  <div className="font-bold text-slate-900">Rajesh Kumar</div>
                  <div className="text-xs text-slate-500">Salon Owner, Delhi</div>
                </div>
              </div>
            </div>
            {/* Review 2 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 reveal delay-100 hover:shadow-lg transition-shadow">
              <div className="flex text-yellow-400 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-slate-700 mb-6 italic">"Patients hated waiting in the clinic. EasyBook fixed it. The best part is I didn't have to install any app."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div>
                  <div className="font-bold text-slate-900">Dr. Anita Desai</div>
                  <div className="text-xs text-slate-500">Dentist, Mumbai</div>
                </div>
              </div>
            </div>
            {/* Review 3 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 reveal delay-200 hover:shadow-lg transition-shadow">
              <div className="flex text-yellow-400 mb-4">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-slate-700 mb-6 italic">"Simple and effective. I just uploaded the QR to my shop photos and the bookings started coming in automatically."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div>
                  <div className="font-bold text-slate-900">Amit Singh</div>
                  <div className="text-xs text-slate-500">Repair Shop, Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 reveal">
          <h2 className="text-3xl font-bold mb-6">Ready to Digitalize Your Shop?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join thousands of modern shopkeepers. No apps to install. Just a simple form to get your QR code.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-indigo-500/50">
            <span>Register Shop Now</span>
            <ExternalLink className="w-5 h-5" />
          </Link>
          <p className="mt-8 text-xs text-slate-600">&copy; 2025 EasyBook App.</p>
        </div>
      </section>
    </main>
  );
}

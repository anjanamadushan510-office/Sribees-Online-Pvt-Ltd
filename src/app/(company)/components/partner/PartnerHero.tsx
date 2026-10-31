import { AFFILIATE_PORTAL_URL } from "../../companyContent";
import { ModalTrigger } from "../modals/ModalTrigger";
import { Container } from "../base";

export function PartnerHero() {
  return (
    <>
<section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-pink-50/20 to-white">
  
  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 sm:w-200 h-100 bg-gradient-to-tr from-pink-300/30 via-rose-200/20 to-indigo-200/30 blur-3xl rounded-full pointer-events-none -z-10 opacity-70"></div>
  <div className="absolute top-12 right-10 w-96 h-96 bg-pink-100/50 rounded-full blur-2xl pointer-events-none -z-10"></div>

  <Container size="xl">
    <div className="max-w-3xl mx-auto text-center flex flex-col items-center space-y-6 sm:space-y-8">
      
      
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-pink-200 shadow-sm backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#D81B60] animate-pulse"></span>
        <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
          SRIBEES PARTNER ENGINE
        </span>
      </div>

      
      <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black text-slate-900 tracking-tight leading-[1.15]">
        Turn daily grocery needs into steady income with <br className="hidden sm:inline"/>
        <span className="bg-gradient-to-r from-[#D81B60] via-pink-600 to-rose-500 bg-clip-text text-transparent">
          2%–3% lifetime commission
        </span>
      </h1>

      
      <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
        Promote Sri Lanka&apos;s leading virtual grocery network. Share your personal link and earn 2%–3% lifetime commission on total order value when anyone buys groceries from your link.
      </p>

      
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
        
        <a
          href={AFFILIATE_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-full bg-gradient-to-r from-[#D81B60] to-pink-600 hover:from-pink-600 hover:to-[#C2185B] text-white font-semibold text-sm sm:text-base shadow-lg shadow-[#D81B60]/30 hover:shadow-xl hover:shadow-[#D81B60]/40 transform hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <span>Access SRIBEES Affiliate Portal</span>
          <svg className="w-4 h-4 stroke-white transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        
        <ModalTrigger modal="calculator" className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-medium text-sm sm:text-base border border-slate-200 shadow-sm hover:border-pink-300 transition-all duration-200 hover:-translate-y-0.5">
          <svg className="w-4 h-4 text-[#D81B60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m-6 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Calculate earnings</span>
        </ModalTrigger>
      </div>

      
      <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>Instant link generation</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>30-day tracking cookie</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>Monthly automated payouts</span>
        </div>
      </div>

    </div>
  </Container>
</section>
    </>
  );
}

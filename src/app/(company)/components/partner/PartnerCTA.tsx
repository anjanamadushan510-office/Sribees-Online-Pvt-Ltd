import { AFFILIATE_PORTAL_URL } from "../../companyContent";
import { Container } from "../base";

export function PartnerCTA() {
  return (
    <>
<section className="py-16 sm:py-20 relative">
  <Container size="xl">
    
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
      
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D81B60]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div className="lg:col-span-7 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#D81B60] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">PROFIT WITH SRIBEES</span>
          </div>

          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Start Earning with SRIBEES Online?
          </h2>

          
          <p className="text-zinc-300 text-base sm:text-lg font-normal leading-relaxed max-w-xl">
            Join 500+ creators, campus leads, and influencers earning recurring grocery commissions on every single order delivered by SRIBEES across Sri Lanka.
          </p>

          
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-zinc-300 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Fast approval in under 24 hrs</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>No upfront fees</span>
            </div>
          </div>
        </div>

        
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 justify-center items-stretch lg:items-end">
          
          <a
            href={AFFILIATE_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-[#D81B60] to-pink-600 hover:from-pink-600 hover:to-[#C2185B] text-white font-semibold text-base shadow-xl shadow-[#D81B60]/30 hover:shadow-2xl hover:shadow-[#D81B60]/50 transform hover:-translate-y-0.5 transition-all duration-200 group text-center"
          >
            <span>Access SRIBEES Affiliate Portal</span>
            <svg className="w-4 h-4 stroke-white transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>


        </div>
      </div>
    </div>
  </Container>
</section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { ModalTrigger } from "../modals/ModalTrigger";
import { Container } from "../base";

export function AppBanner() {
  return (
    <>
<section id="products" className={"py-6 sm:py-10 bg-white"}>
  <Container size="xl">
    
    <div className="bg-gradient-to-r from-[#FFD3E1] via-[#FFE4EC] to-[#FFC2D6] rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-pink-200/60 shadow-sm relative overflow-hidden">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        
        
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          
          <div>
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-pink-100/60">
              <div className="bg-[#D81B60] text-white p-1 rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                  <line x1="11" y1="18" x2="13" y2="18" />
                </svg>
              </div>
              <span className="text-[#D81B60] font-extrabold text-xs tracking-wider uppercase">SRIBEES ONLINE</span>
            </div>
          </div>

          
          <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold text-zinc-900 tracking-tight leading-snug">
            Effortless Grocery Ordering <br className="hidden sm:inline" />
            <span className="text-[#D81B60] font-extrabold block sm:inline">
              Zero Queues, Pure Convenience
            </span>
          </h2>

          
          <p className="text-zinc-700 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
            Order your daily essentials on the web or in the SRIBEES Online mobile app. Browse fresh farm produce, dairy, and household staples delivered straight to your doorstep without stepping out.
          </p>

          
          <div className="flex flex-wrap items-center gap-3 pt-1 sm:pt-2">
            
            <ModalTrigger modal="download" className="bg-zinc-900 hover:bg-black text-white font-semibold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-full inline-flex items-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <span>Download SRIBEES App</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </ModalTrigger>

            
            <Link href={ROUTES.HOME} className="bg-[#D81B60] hover:bg-[#C2185B] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-full inline-flex items-center gap-2 shadow-md shadow-[#D81B60]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
              <span>Shop on the Web</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        
        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <div className="bg-white p-2 sm:p-2.5 rounded-3xl shadow-xl border border-white/80 relative">
            <Image src="/company/Herotwo.jpg" alt="SRIBEES Online shopping experience" width={720} height={480} sizes="(max-width: 1024px) 90vw, 40vw" className="w-full h-52 sm:h-64 lg:h-72 object-cover rounded-2xl" />
          </div>
        </div>

      </div>
    </div>
  </Container>
</section>
    </>
  );
}

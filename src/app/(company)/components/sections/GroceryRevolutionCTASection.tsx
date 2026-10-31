import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { ModalTrigger } from "../modals/ModalTrigger";
import { ShopNowLink } from "../layout/ShopNowLink";
import { Container } from "../base";

export function GroceryRevolutionCTASection() {
  return (
    <>
<section id="grocery-revolution-cta" className="py-16 sm:py-20 lg:py-24 bg-white relative">
  <Container size="xl">
    
    <div className="relative bg-gradient-to-br from-[#1A182F] via-[#1E1B38] to-[#121024] rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl overflow-hidden border border-purple-950/50">
      
      
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D81B60]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        
        <div className="lg:col-span-7 space-y-6">
          
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60] animate-pulse"></span>
            FAIR & COMMITMENT ESSENTIALS
          </div>

          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Be Part of Sri Lanka’s Grocery Revolution
          </h2>

          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
            Whether you&apos;re a shopper looking for pristine daily vegetables or an agritech grower seeking fair market access, SRIBEES Online connects you to the future.
          </p>

          
          <div className="flex flex-wrap items-center gap-4 pt-2">
            
            <ShopNowLink label="Start Shopping" className="px-6 py-3.5 text-sm" />
            <ModalTrigger modal="download" className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold px-6 py-3.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download SRIBEES App</span>
            </ModalTrigger>

            
            <Link href={ROUTES.BECOME_PARTNER}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold px-6 py-3.5 rounded-full border border-white/20 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Farmer & Partner Network</span>
            </Link>
          </div>

        </div>

        
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative group/mockup">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover/mockup:blur-3xl transition-all duration-500"></div>
            <Image src="/base/mainmock.png" alt="SRIBEES Mobile App Mockup" width={1254} height={1254} sizes="(max-width: 1024px) 80vw, 420px" className="relative z-10 w-full max-w-md lg:max-w-full h-auto object-contain max-h-95 lg:max-h-110 drop-shadow-2xl group-hover/mockup:scale-105 transition-transform duration-500" />
          </div>
        </div>

      </div>

    </div>
  </Container>
</section>
    </>
  );
}

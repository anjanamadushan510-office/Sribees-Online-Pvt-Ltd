import Image from "next/image";
import { STORE_URLS } from "../../companyContent";
import { ShopNowLink } from "../layout/ShopNowLink";
import { Badge, Container } from "../base";

export function AppDownloadCTA() {
  return (
    <>
<section id="download" className="py-16 bg-white">
  <Container size="xl">
    <div className="bg-gradient-to-r from-zinc-950 via-[#260017] to-zinc-950 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 text-white border border-pink-900/30 shadow-2xl relative overflow-hidden">
      
      
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D81B60]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        
        <div className="lg:col-span-7 space-y-6">
          <div>
            <Badge variant="pink" className="shadow-lg shadow-pink-900/50">
              FAST & FREE APP DOWNLOAD
            </Badge>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Order Groceries in Seconds with SRIBEES Online
          </h2>

          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-xl">
            Download our native Android/iOS application. Real-time inventory synchronization, instant order tracking, and seamless delivery tracking right to your doorstep.
          </p>

          
          <div className="flex flex-wrap gap-4 pt-4">
            
            <a href={STORE_URLS.playStore} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-black border border-white/20 text-white px-5 py-3 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-xl group">
              <Image src="/base/playstore.png" alt="" width={24} height={24} className="w-6 h-6 object-contain shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider leading-none">GET IT ON</div>
                <div className="text-sm font-extrabold text-white tracking-tight leading-tight mt-0.5">Google Play</div>
              </div>
            </a>
            <a href={STORE_URLS.appStore} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-black border border-white/20 text-white px-5 py-3 rounded-2xl flex items-center gap-3 transition-all hover:scale-105 shadow-xl group">
              <Image src="/base/appstore.png" alt="" width={24} height={24} className="w-6 h-6 object-contain shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-zinc-400 font-semibold tracking-wider leading-none">Download on the</div>
                <div className="text-sm font-extrabold text-white tracking-tight leading-tight mt-0.5">App Store</div>
              </div>
            </a>
            <ShopNowLink label="Shop on the Web" className="px-6 py-3.5 text-sm" />
          </div>
        </div>

        
        <div className="lg:col-span-5 flex justify-center">
          <Image src="/base/mainmock.png" alt="SRIBEES Mobile App Mockup" width={1254} height={1254} sizes="(max-width: 1024px) 80vw, 420px" className="w-full max-w-70 sm:max-w-80 h-auto object-contain drop-shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-300" />
        </div>

      </div>
    </div>
  </Container>
</section>
    </>
  );
}

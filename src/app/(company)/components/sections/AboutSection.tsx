import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Badge, Container } from "../base";

export function AboutSection() {
  return (
    <>
<section id="about" className="py-16 bg-white">
  <Container size="xl">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      
      
      <div className="relative rounded-3xl overflow-hidden shadow-lg bg-zinc-900 border border-zinc-200 min-h-95 lg:min-h-110 flex flex-col justify-end group">
        
        <Image src="/company/about.jpg" alt="About SRIBEES Fresh Produce" fill sizes="(max-width: 1024px) 100vw, 50vw" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

        
        <div className="relative z-10 p-6">
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 mb-2 border border-white/10">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            DIRECT FROM SRI LANKAN FARMS
          </div>
          <p className="text-xs text-zinc-300 font-medium">
            Direct from local growers, temperature-controlled warehouse logistics.
          </p>
        </div>
      </div>

      
      <div className="bg-white rounded-3xl p-8 lg:p-12 border border-zinc-100 shadow-xl flex flex-col justify-between space-y-6">
        <div className="space-y-6">
          <div>
            <Badge variant="pink">
              VIRTUAL GROCERY ARCHITECTURE
            </Badge>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            About SRIBEES
          </h2>

          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            SRIBEES is a locally-engineered digital e-commerce and technology platform revolutionizing everyday grocery logistics across Sri Lanka. Unlike legacy supermarkets with crowded aisles and cashier queues, we operate an interconnected virtual grocery ecosystem powered by smart micro-fulfillment hubs.
          </p>

          <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed italic border-l-2 border-[#D81B60] pl-4 py-1">
            Our light-footprint model technology enables micro-vendors to maintain competitive supply chains, fully-responsive, and household items provide fast fulfillment with reliable deliver-to-door for ultimate convenience.
          </p>
        </div>

        <div className="pt-4">
          <Link href={ROUTES.ABOUT} className="inline-flex items-center gap-2 text-sm font-bold text-[#D81B60] hover:text-[#C2185B] transition-colors group">
            Learn More
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

    </div>
  </Container>
</section>
    </>
  );
}

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Container } from "../base";

const pillars = [
  {
    number: "01",
    pillar: "PILLAR 01",
    tag: "MARKETPLACE",
    title: "Digital Marketplace",
    description:
      "SRIBEES brings local agricultural products together in one convenient online marketplace, making it easier for customers to discover what is available.",
    linkText: "Explore Marketplace",
    linkHref: ROUTES.HOME,
    stepText: "Step 1 of 4",
    bubbleTopBg: "bg-pink-200/50",
    bubbleBottomBg: "bg-pink-100/60",
    iconBg: "bg-pink-100/80 text-[#D81B60] border-pink-200/60",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M8 7V5a4 4 0 018 0v2" /></svg>`
  },
  {
    number: "02",
    pillar: "PILLAR 02",
    tag: "VIRTUAL STORES",
    title: "Virtual Stores",
    description:
      "We create and manage digital storefronts that give local agricultural businesses a dedicated online presence without requiring them to build their own e-commerce platform.",
    linkText: "Discover Our Stores",
    linkHref: ROUTES.HOME,
    stepText: "Step 2 of 4",
    bubbleTopBg: "bg-emerald-200/50",
    bubbleBottomBg: "bg-emerald-100/60",
    iconBg: "bg-emerald-100/80 text-emerald-600 border-emerald-200/60",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 7l2-3h12l2 3M5 7v12a1 1 0 001 1h12a1 1 0 001-1V7M9 11h6" /></svg>`
  },
  {
    number: "03",
    pillar: "PILLAR 03",
    tag: "LOCAL ACCESS",
    title: "Local Product Access",
    description:
      "Our platform helps customers find locally sourced agricultural products through a centralized digital experience, connecting them with products from the regional supply network.",
    linkText: "Browse Local Products",
    linkHref: ROUTES.PRODUCTS,
    stepText: "Step 3 of 4",
    bubbleTopBg: "bg-pink-200/50",
    bubbleBottomBg: "bg-pink-100/60",
    iconBg: "bg-pink-100/80 text-[#D81B60] border-pink-200/60",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" /><circle cx="12" cy="10" r="2.5" /></svg>`
  },
  {
    number: "04",
    pillar: "PILLAR 04",
    tag: "SIMPLE SHOPPING",
    title: "Simple Digital Shopping",
    description:
      "From discovering products to exploring virtual stores, SRIBEES is designed to make the experience simple, convenient, and accessible for everyday customers.",
    linkText: "How It Works",
    linkHref: ROUTES.HOW_IT_WORKS,
    stepText: "Step 4 of 4",
    bubbleTopBg: "bg-sky-200/50",
    bubbleBottomBg: "bg-sky-100/60",
    iconBg: "bg-sky-100/80 text-sky-600 border-sky-200/60",
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`
  }
];

export function FoundationalValuesSection() {
  return (
    <>
<section
  id="foundational-values"
  className="py-16 sm:py-24 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 relative overflow-hidden"
>
  <Container size="xl">

    
    <div className="text-center max-w-3xl mx-auto space-y-3.5 pt-8">
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-pink-50 text-[#D81B60] border border-pink-200/70 shadow-2xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60] animate-pulse"></span>
        OUR PLATFORM
      </div>

      <h2
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
      >
        A Simpler Digital Way to Connect With Local Products
      </h2>

      <p
        className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
      >
        SRIBEES combines virtual stores, local products, and a convenient
        digital marketplace to create a simpler online shopping experience
        for Sri Lankan customers.
      </p>
    </div>

    
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-12 sm:mt-16"
    >
      {
        pillars.map((item) => (
          <div key={item.number}
            className="group relative bg-white rounded-[2rem] p-7 sm:p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 flex flex-col justify-between h-full overflow-hidden"
          >
            
            <div
              className={`absolute -top-12 -right-12 w-44 h-44 rounded-full ${item.bubbleTopBg} pointer-events-none group-hover:scale-115 transition-transform duration-500 ease-out z-0`}
            ></div>

            
            <div
              className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full ${item.bubbleBottomBg} pointer-events-none group-hover:scale-115 transition-transform duration-500 ease-out z-0`}
            ></div>

            <div className="relative z-10">
              
              <div className="flex items-center justify-between mb-6">
                
                <span className="text-3xl sm:text-4xl font-black text-[#D81B60] tracking-tight">
                  {item.number}
                </span>

                
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-[#D81B60] border border-pink-100 shadow-2xs">
                  {item.tag}
                </span>
              </div>

              
              <div
                className={`w-11 h-11 rounded-full border flex items-center justify-center ${item.iconBg} shadow-2xs mb-5 group-hover:scale-110 transition-transform duration-300`}
                dangerouslySetInnerHTML={{ __html: item.icon }}
              >
              </div>

              
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2.5 group-hover:text-[#D81B60] transition-colors leading-snug tracking-tight">
                {item.title}
              </h3>

              
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                {item.description}
              </p>
            </div>

            
            <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between relative z-10">
              
              <Link
                href={item.linkHref}
                className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-[#D81B60] shadow-2xs border border-slate-200/70 transition-colors"
              >
                {item.stepText}
              </Link>

              
              <Link
                href={item.linkHref}
                className="w-10 h-10 rounded-full bg-slate-100/90 hover:bg-[#D81B60] text-slate-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-2xs group/btn"
                aria-label={item.linkText}
              >
                <svg
                  className="w-4 h-4 transform group-hover/btn:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ))
      }
    </div>

  </Container>
</section>
    </>
  );
}

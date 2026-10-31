import { ModalTrigger } from "../modals/ModalTrigger";
import { ShopNowLink } from "../layout/ShopNowLink";
import { Badge, Container } from "../base";

interface Step {
  number: string;
  title: string;
  description: string;
  badge: string;
  iconSvg: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Browse & Choose',
    description: 'Explore thousands of fresh farm produce, dairy, and household essentials on the SRIBEES App or Web store.',
    badge: 'SELECT ITEMS',
    iconSvg: `<svg class="w-5 h-5 text-[#D81B60]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`
  },
  {
    number: '02',
    title: 'Place Your Order',
    description: 'Add your everyday staples to the cart with transparent pricing, zero cashier queues, and easy digital payments.',
    badge: 'INSTANT CHECKOUT',
    iconSvg: `<svg class="w-5 h-5 text-[#D81B60]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" ry="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>`
  },
  {
    number: '03',
    title: 'Micro-Hub Dispatch',
    description: 'Your order is routed to the nearest SRIBEES micro-fulfillment hub, where items are fresh-packed with care.',
    badge: 'SMART PACKING',
    iconSvg: `<svg class="w-5 h-5 text-[#D81B60]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`
  },
  {
    number: '04',
    title: 'Express Delivery',
    description: 'Our dedicated SRIBEES Express riders bring your order right to your doorstep fast, fresh, and hassle-free.',
    badge: 'TO YOUR DOOR',
    iconSvg: `<svg class="w-5 h-5 text-[#D81B60]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
  }
];

export function HowItWorks() {
  return (
    <>
<section id="how-it-works" className="py-16 sm:py-24 bg-[#FAFAFA] border-y border-zinc-100 relative overflow-hidden">
  
  <div className="absolute top-10 right-1/4 w-[30rem] h-[30rem] bg-pink-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>
  <div className="absolute bottom-10 left-1/4 w-[30rem] h-[30rem] bg-rose-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

  <Container size="xl">
    
    <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-16">
      <Badge variant="pink">
        HOW IT WORKS
      </Badge>
      
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
        Seamless Grocery Shopping in <span className="text-[#D81B60]">4 Simple Steps</span>
      </h2>
      
      <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
        Experience Sri Lanka&apos;s premier virtual grocery network. Order fresh produce and essentials directly from local farm hubs to your doorstep without standard market hassles.
      </p>
    </div>

    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      {steps.map((step, idx) => (
        <div key={step.number} className="relative group bg-white rounded-[2rem] p-7 sm:p-8 border border-zinc-200/70 shadow-xl shadow-pink-500/5 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden z-10">
          
          
          <div className="absolute -top-16 -right-12 w-48 h-48 bg-[#FFD6E5] rounded-full pointer-events-none group-hover:scale-105 transition-transform duration-500 z-0"></div>
          
          
          <div className="absolute -bottom-20 -left-16 w-52 h-52 bg-[#FFD6E5] rounded-full pointer-events-none group-hover:scale-105 transition-transform duration-500 z-0"></div>

          
          <div className="relative z-10">
            
            <div className="flex items-center justify-between mb-5">
              <span className="text-4xl font-extrabold text-[#D81B60] tracking-tight">
                {step.number}
              </span>
              <span className="bg-[#FFE8F2] text-[#D81B60] px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs">
                {step.badge}
              </span>
            </div>

            
            <div className="w-12 h-12 rounded-full bg-[#FFE8F2] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              <div dangerouslySetInnerHTML={{ __html: step.iconSvg }} />
            </div>

            
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight mb-3">
              {step.title}
            </h3>
            
            
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-normal">
              {step.description}
            </p>
          </div>

          
          <div className="relative z-10 pt-5 border-t border-zinc-100 flex items-center justify-between">
            <span className="bg-white px-4 py-1.5 rounded-full border border-pink-100/80 shadow-xs text-xs font-semibold text-zinc-500">
              Step {idx + 1} of 4
            </span>
            <div className="w-9 h-9 rounded-full bg-zinc-100/90 group-hover:bg-[#D81B60] group-hover:text-white flex items-center justify-center text-zinc-400 transition-colors duration-300">
              <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

        </div>
      ))}
    </div>

    
    <div className="mt-14 sm:mt-16 bg-zinc-900 text-white rounded-[2rem] p-6 sm:p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
      
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D81B60]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#D81B60]/20 border border-[#D81B60]/40 flex items-center justify-center text-[#D81B60] shrink-0 hidden sm:flex">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-white">Ready to place your first grocery order?</h4>
          <p className="text-xs sm:text-sm text-zinc-400">Shop on the web or download the SRIBEES Online app and enjoy hassle-free home delivery.</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-3 shrink-0">
        <ShopNowLink label="Start Shopping" className="text-xs sm:text-sm px-7 py-3.5" />
        <ModalTrigger modal="download" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold px-7 py-3.5 rounded-full whitespace-nowrap transition-colors">
        Download App Now
      </ModalTrigger>
      </div>
    </div>
  </Container>
</section>
    </>
  );
}

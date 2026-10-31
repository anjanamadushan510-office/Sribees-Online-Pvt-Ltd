import { Container } from "../base";

const steps = [
  {
    stepNumber: '01',
    title: 'Signup & Track',
    description: 'Register in 1 minute. Get your unique affiliate tracking link, QR code, and real-time earnings dashboard.',
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />`
  },
  {
    stepNumber: '02',
    title: 'Promote & Share',
    description: 'Share content or product links across WhatsApp, social media, or your website to recommend grocery items.',
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />`
  },
  {
    stepNumber: '03',
    title: 'Customer Buys Essentials',
    description: 'Referred customers order fresh groceries, rice, milk, cooking oil, & household staples online 24/7.',
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />`
  },
  {
    stepNumber: '04',
    title: 'Collect 2% – 3% Direct',
    description: 'When building repeat customer orders, receive steady lifetime commissions directly to your bank account.',
    iconSvg: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />`
  },
];

export function PartnerHowItWorks() {
  return (
    <>
<section id="how-partner-works" className="py-20 bg-gradient-to-b from-white via-pink-50/20 to-slate-50/50 relative overflow-hidden">
  <Container size="xl">
    
    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
      <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-[#D81B60] text-xs font-bold uppercase tracking-wider">
        HOW IT WORKS
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
        How the SRIBEES Partner Engine Works
      </h2>
      <p className="text-slate-600 text-base sm:text-lg font-normal max-w-2xl mx-auto">
        4 simple steps to start earning recurring income from Sri Lanka&apos;s fastest growing grocery network.
      </p>
    </div>

    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
      {
        steps.map((step) => (
          <div key={step.stepNumber} className="group relative bg-white rounded-3xl p-7 border border-slate-200/70 shadow-md hover:shadow-2xl hover:shadow-pink-500/10 hover:border-pink-200 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between overflow-hidden">
            
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D81B60] to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100/60 border border-pink-200/60 text-[#D81B60] flex items-center justify-center group-hover:bg-[#D81B60] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-105 group-hover:rotate-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: step.iconSvg }} />
                </div>

                
                <div className="text-right select-none pointer-events-none">
                  <div className="text-3xl sm:text-4xl font-black text-slate-300 group-hover:text-[#D81B60] transition-colors leading-none">
                    {step.stepNumber}
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-slate-400 group-hover:text-[#D81B60] transition-colors uppercase mt-0.5">
                    STEP
                  </div>
                </div>
              </div>

              
              <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#D81B60] transition-colors leading-tight">
                {step.title}
              </h3>

              
              <p className="text-slate-600 text-sm font-normal leading-relaxed">
                {step.description}
              </p>
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

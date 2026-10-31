import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { STORE_URLS, footerSections } from "../../companyContent";
import { ModalTrigger } from "../modals/ModalTrigger";
import { Container } from "../base";

export function CompanyFooter() {
  return (
    <>
<footer className="bg-zinc-950 text-white pt-16 pb-24 sm:pb-12 relative overflow-hidden border-t border-zinc-800">
  <Container size="xl">
    
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-12 border-b border-zinc-800 gap-6">
      <Link href={ROUTES.COMPANY} className="flex items-center gap-3">
        <Image src="/base/logo.png" alt="" width={48} height={48} className="h-10 sm:h-12 w-auto object-contain" />
        <span className="flex items-baseline gap-1.5 leading-none text-white">
          <span className="font-montserrat font-black italic tracking-tight text-xl sm:text-2xl">SRIBEƎS</span>
          <span className="text-sm sm:text-base font-medium">Online</span>
        </span>
      </Link>

      
      <div className="flex flex-wrap gap-3">

        
        <a href={STORE_URLS.playStore} target="_blank" rel="noopener noreferrer" className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-white px-4 py-2 rounded-xl flex items-center gap-3 transition-colors">
          <Image src="/base/playstore.png" alt="" width={24} height={24} className="w-6 h-6 object-contain shrink-0" />
          <div className="text-left">
            <div className="text-[10px] uppercase text-zinc-400 font-medium">GET IT ON</div>
            <div className="text-xs font-bold -mt-0.5">Google Play</div>
          </div>
        </a>
      </div>
    </div>

    
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 py-12 border-b border-zinc-800">
      {
        footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4">{section.title}</h3>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-zinc-400 hover:text-white transition-colors duration-150 block">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      }
    </div>

    
    <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
      <div>
        <p>&copy; 2026 SRIBEES Online. All rights reserved.</p>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <ModalTrigger modal="terms" className="hover:text-zinc-300 transition-colors cursor-pointer">Terms and Conditions</ModalTrigger>
        <span>|</span>
        <Link href={ROUTES.PRIVACY_POLICY} className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
        <span>|</span>
        <span>Making local products easier to discover, access, and shop online.</span>
      </div>
    </div>
  </Container>


</footer>
    </>
  );
}

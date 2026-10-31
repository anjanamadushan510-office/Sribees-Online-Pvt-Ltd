import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { Badge, Container } from "../base";

export function ImpactSection() {
  return (
    <>
<section id="partner" className="py-16 bg-white">
  <Container size="xl">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

      
      <div
        className="bg-white rounded-3xl p-8 lg:p-12 border border-zinc-100 shadow-xl flex flex-col justify-between space-y-8"
      >
        <div className="space-y-6">

          <div>
            <Badge variant="pink">
              TECHNOLOGY & COMMUNITY
            </Badge>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Connecting Local Agriculture Through Technology
          </h2>

          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            SRIBEES brings local agricultural products into a convenient digital
            marketplace. By building and managing virtual stores, we make regional
            products easier to discover while helping local suppliers reach
            customers through a modern online shopping experience.
          </p>

          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#D81B60]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M8 7V5a4 4 0 018 0v2"
                  />
                </svg>
              </div>

              <div className="text-sm font-bold text-zinc-900">
                Virtual Stores
              </div>

              <p className="text-xs leading-relaxed text-zinc-500">
                Digital storefronts managed through the SRIBEES platform.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#D81B60]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0118 0z"
                  />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>

              <div className="text-sm font-bold text-zinc-900">
                Local Products
              </div>

              <p className="text-xs leading-relaxed text-zinc-500">
                Discover products sourced through Sri Lanka&apos;s local supply network.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#D81B60]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <div className="text-sm font-bold text-zinc-900">
                Digital Access
              </div>

              <p className="text-xs leading-relaxed text-zinc-500">
                A simpler way to access local agricultural products online.
              </p>
            </div>

          </div>
        </div>

        <div>
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-bold text-[#D81B60] hover:text-[#C2185B] transition-colors group">
            Explore SRIBEES Online
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      
      <div
        className="relative rounded-3xl overflow-hidden shadow-lg bg-zinc-900 border border-zinc-200 min-h-95 lg:min-h-110 flex flex-col justify-end group"
      >

        <Image src="/company/technology.jpg" alt="SRIBEES digital agricultural marketplace" fill sizes="(max-width: 1024px) 100vw, 50vw" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

        <div className="relative z-10 p-6">

          <div
            className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-sky-400 mb-2 border border-white/10"
          >
            SRIBEES Platform
          </div>

          <p className="text-xs text-zinc-300 font-medium">
            Building a digital marketplace that brings local agricultural products
            closer to Sri Lankan consumers.
          </p>

        </div>
      </div>

    </div>
  </Container>
</section>
    </>
  );
}

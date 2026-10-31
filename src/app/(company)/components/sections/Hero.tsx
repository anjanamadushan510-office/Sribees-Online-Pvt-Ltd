"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, ShoppingBag, Smartphone, Truck } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useCompanyUiStore } from "@/state/companyUi.store";
import { Container } from "../base";
import { socialLinks } from "../../companyContent";
import { ShopNowLink } from "../layout/ShopNowLink";

const SLIDE_INTERVAL_MS = 7000;

const heroSlides = [
  {
    src: "/company/Heroone.jpg",
    title: "Your Groceries. Delivered to You.",
    description:
      "Get your everyday grocery items easily on the web or with the SRIBEES Online mobile app. Shop from home, place your order, and get it delivered to your doorstep.",
  },
  {
    src: "/company/Herotwo.jpg",
    title: "Fresh Quality Products. Unbeatable Fast Service.",
    description:
      "Explore wide range of groceries and essential items. Order online with SRIBEES and enjoy fast, reliable doorstep delivery.",
  },
  {
    src: "/company/herothree.jpg",
    title: "Wide Variety of Fresh Groceries at Best Prices.",
    description:
      "Discover incredible deals on everyday essentials and enjoy seamless shopping right at your fingertips.",
  },
  {
    src: "/company/herofour.jpg",
    title: "Fast & Reliable Delivery Across Sri Lanka.",
    description:
      "Experience convenience with our fast delivery network ensuring your daily needs reach your doorstep in top quality.",
  },
];

const platformCards = [
  { tagline: "VIRTUAL GROCERY NETWORK", title: "SRIBEES Online", subtitle: "Virtual Grocery Network", Icon: ShoppingBag, href: ROUTES.HOME },
  { tagline: "MOBILE FIRST", title: "SRIBEES App", subtitle: "Android Order App", Icon: Smartphone },
  { tagline: "ONLINE ACCESS", title: "SRIBEES Web", subtitle: "Online Portal & Catalog", Icon: Globe, href: ROUTES.PRODUCTS },
  { tagline: "FAST DELIVERY", title: "SRIBEES Express", subtitle: "Same-Day Order Delivery", Icon: Truck, href: ROUTES.HOW_IT_WORKS },
];

const PLATFORM_CARD_CLASS =
  "group w-[85%] sm:w-auto shrink-0 snap-center sm:shrink relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl p-5 text-left text-zinc-900 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer";

function PlatformCardBody({ card }: { card: (typeof platformCards)[number] }) {
  return (
    <>
      <span className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200/70 border border-pink-300/50 rounded-full transition-transform duration-500 group-hover:scale-110 pointer-events-none" />
      <span className="relative z-10 flex items-center justify-between">
        <span>
          <span className="text-[10px] font-bold tracking-wider text-[#D81B60] uppercase block mb-0.5">{card.tagline}</span>
          <span className="block text-lg font-extrabold text-zinc-900 group-hover:text-[#D81B60] transition-colors">{card.title}</span>
          <span className="block text-xs text-zinc-500 mt-0.5 font-medium">{card.subtitle}</span>
        </span>
        <span className="w-11 h-11 rounded-2xl bg-white/90 text-[#D81B60] flex items-center justify-center group-hover:bg-[#D81B60] group-hover:text-white transition-all duration-300 shadow-md border border-pink-100 shrink-0 ml-3">
          <card.Icon className="w-5 h-5" />
        </span>
      </span>
    </>
  );
}

export function Hero() {
  const [active, setActive] = useState(0);
  const openModal = useCompanyUiStore((state) => state.openModal);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % heroSlides.length),
      SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen lg:h-screen pt-24 pb-6 bg-zinc-700 text-white overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 z-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === active ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes="100vw"
              preload={index === 0}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/75 via-zinc-950/45 to-transparent" />
          </div>
        ))}
      </div>

      <Container className="relative z-10 mt-auto mb-2 sm:mb-4 pt-16 sm:pt-32">
        <div className="max-w-3xl">
          <div className="grid">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.title}
                aria-hidden={index !== active}
                className={`[grid-area:1/1] transition-all duration-1000 ease-in-out ${
                  index === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                {index === 0 ? (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-3 max-w-2xl">
                    {slide.title}
                  </h1>
                ) : (
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-3 max-w-2xl font-heading">
                    {slide.title}
                  </p>
                )}
                <p className="text-base sm:text-lg text-zinc-200/90 font-normal leading-relaxed max-w-xl">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <ShopNowLink label="Start Shopping" className="text-base px-7 py-3.5 hover:scale-[1.03] active:scale-[0.98]" />
            <button
              type="button"
              onClick={() => openModal("download")}
              className="inline-flex items-center rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md text-white text-base font-semibold px-7 py-3.5 transition-colors cursor-pointer"
            >
              Download App
            </button>
          </div>
        </div>
      </Container>

      <aside className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-2">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-[#D81B60] text-white flex items-center justify-center transition-colors shadow-lg border border-white/20"
          >
            {link.label === "Facebook" && (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            )}
            {link.label === "Instagram" && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" /></svg>
            )}
            {link.label === "YouTube" && (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            )}
          </a>
        ))}
      </aside>

      <div className="relative z-10 mt-auto pt-6 sm:pt-8">
        <Container>
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar pb-2 sm:pb-0">
            {platformCards.map((card) =>
              card.href ? (
                <Link key={card.title} href={card.href} className={PLATFORM_CARD_CLASS}>
                  <PlatformCardBody card={card} />
                </Link>
              ) : (
                <button key={card.title} type="button" onClick={() => openModal("download")} className={PLATFORM_CARD_CLASS}>
                  <PlatformCardBody card={card} />
                </button>
              ),
            )}
          </div>
        </Container>
      </div>
    </section>
  );
}

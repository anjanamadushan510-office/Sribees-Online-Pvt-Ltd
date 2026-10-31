import Image from "next/image";

/** Shown instantly while the store shell loads after leaving the company site. */
export default function Loading() {
  return (
    <div role="status" className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50">
      <div className="flex items-end gap-2.5 animate-pulse">
        <Image src="/base/logo.png" alt="" width={40} height={40} className="h-10 w-auto object-contain" />
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className="font-montserrat text-2xl font-black italic tracking-tight text-slate-900">SRIBEƎS</span>
          <span className="font-poppins text-base font-bold text-[#D81B60]">Online</span>
        </span>
      </div>
      <div className="h-1 w-40 rounded-full bg-[#D81B60]/20 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-[#D81B60] animate-pulse" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

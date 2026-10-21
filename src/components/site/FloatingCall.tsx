import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/store";

export function FloatingCall() {
  return (
    <a
      href={whatsappLink("Hello TCL Kenya! I'd like to order. Please call me back.")}
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-whatsapp py-3 pl-3 pr-6 text-whatsapp-foreground shadow-whatsapp transition hover:-translate-y-1"
      aria-label="WhatsApp call to order"
    >
      <span className="grid h-11 w-11 animate-pulse-ring place-items-center rounded-full bg-whatsapp-foreground/20">
        <MessageCircle className="h-6 w-6" />
      </span>
      <span className="leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-widest opacity-90">WhatsApp</span>
        <span className="block font-display text-sm font-bold">Call to Order</span>
      </span>
    </a>
  );
}

import { ArrowUpRight, CalendarDays, Clock3, Heart, MapPin } from "lucide-react";
import type { EventItem } from "../types";

type Props = {
  event: EventItem;
  isSaved: boolean;
  onSave: (id: number) => void;
  onOpen: (event: EventItem) => void;
  compact?: boolean;
};

export function EventCard({ event, isSaved, onSave, onOpen, compact = false }: Props) {
  return <article className="event-card overflow-hidden bg-paper transition hover:-translate-y-1 hover:shadow-xl">
    <div className={`relative ${compact ? "h-32" : "h-[185px]"}`}>
      <img src={event.image} alt="" className="h-full w-full object-cover" />
      <div className="absolute left-3.5 top-3.5 bg-paper px-2.5 py-2 text-center"><strong className="block font-mono text-base leading-none text-coral">{event.day}</strong><small className="font-mono text-[8px] tracking-widest text-[#69736d]">{event.month}</small></div>
      <button onClick={() => onSave(event.id)} className={`absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-paper/90 ${isSaved ? "text-coral" : "text-ink"}`} aria-label={isSaved ? "Remove from saved" : "Save event"}><Heart size={16} fill={isSaved ? "currentColor" : "none"} /></button>
    </div>
    <div className="p-[18px]">
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-[#89928d]"><span className="text-coral">{event.type}</span><span>{event.distance}</span></div>
      <h3 className="my-2.5 text-lg font-bold leading-tight tracking-[-.6px]">{event.title}</h3>
      <div className="grid gap-2 text-[10px] text-[#747e78]"><span><CalendarDays className="mr-1 inline text-coral" size={13} />{event.date}</span><span><Clock3 className="mr-1 inline text-coral" size={13} />{event.time}</span><span><MapPin className="mr-1 inline text-coral" size={13} />{event.venue}</span></div>
      {!compact && <div className="mt-4 flex items-center justify-between border-t border-[#ecece6] pt-3.5"><span className="font-mono text-[11px]">{event.price}</span><button onClick={() => onOpen(event)} className="text-[10px] font-bold text-coral">View details <ArrowUpRight className="inline" size={13} /></button></div>}
    </div>
  </article>;
}

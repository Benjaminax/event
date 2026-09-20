import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Heart, MapPin, Search, SlidersHorizontal, Sparkles, X, ArrowUpRight, LocateFixed, Navigation, Layers3, Menu } from "lucide-react";
import { gsap } from "gsap";
import type { EventItem } from "./types";
import { EventCard as SharedEventCard } from "./components/EventCard";
import { Footer as SharedFooter, Newsletter as SharedNewsletter } from "./components/Marketing";

const categories = ["All events", "Music", "Art & culture", "Learning", "Outdoors", "Food & drink"];
const events: EventItem[] = [
  { id:1, title:"Sunset Sessions: Live at the Yard", category:"Music", type:"Live music", day:"24", month:"SEP", date:"Tuesday, September 24", time:"6:30 PM – 9:00 PM", venue:"The Sultan Room", address:"234 Starr St, Bushwick", distance:"1.2 mi away", price:"$18", image:"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85", description:"An open-air evening of warm sounds and even warmer company. Three local acts, a sunset set, and the city’s best little dance floor." },
  { id:2, title:"The Art of Paying Attention", category:"Art & culture", type:"Exhibition", day:"25", month:"SEP", date:"Wednesday, September 25", time:"7:00 PM – 10:00 PM", venue:"Greenpoint Gallery", address:"390 McGuinness Blvd, Greenpoint", distance:"2.4 mi away", price:"Free", image:"https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85", description:"A group exhibition about noticing the details we usually miss, featuring work from 12 emerging Brooklyn artists." },
  { id:3, title:"Make Your Own Miso", category:"Food & drink", type:"Workshop", day:"26", month:"SEP", date:"Thursday, September 26", time:"6:00 PM – 8:30 PM", venue:"Marlow & Sons", address:"81 Broadway, Williamsburg", distance:"3.1 mi away", price:"$42", image:"https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=1200&q=85", description:"Get hands-on with koji, soybeans, and time. Leave with your own jar of miso and a new appreciation for slow food." },
  { id:4, title:"Future / Now: Designing Tomorrow", category:"Learning", type:"Talk", day:"28", month:"SEP", date:"Saturday, September 28", time:"11:00 AM – 1:00 PM", venue:"BRIC House", address:"647 Fulton St, Downtown Brooklyn", distance:"0.8 mi away", price:"$12", image:"https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85", description:"Four brilliant minds look at the choices shaping our future — from cities and climate to the everyday objects around us." },
  { id:5, title:"Sunday Morning Run Club", category:"Outdoors", type:"Community", day:"29", month:"SEP", date:"Sunday, September 29", time:"9:00 AM – 10:30 AM", venue:"Prospect Park Boathouse", address:"East Dr, Prospect Park", distance:"2.0 mi away", price:"Free", image:"https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=85", description:"A friendly, no-pressure 5K through the park. All paces welcome, coffee and good conversation guaranteed at the finish." },
  { id:6, title:"Ceramics & Natural Wine", category:"Art & culture", type:"Hands-on", day:"01", month:"OCT", date:"Tuesday, October 1", time:"7:00 PM – 9:30 PM", venue:"Clay Space", address:"110 Nassau Ave, Greenpoint", distance:"2.8 mi away", price:"$55", image:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=85", description:"Shape something beautiful while discovering a few natural wines from small producers. No experience, no rules — just play." }
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState("Brooklyn, NY");
  const [priceFilter, setPriceFilter] = useState("Any price");
  const [sortBy, setSortBy] = useState("Soonest first");
  const [currentLocation, setCurrentLocation] = useState({ label: "Brooklyn, NY", lat: 40.6782, lng: -73.9442 });
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [page, setPage] = useState<"discover" | "saved" | "about">(() => {
    const hash = window.location.hash.replace("#", "");
    return hash === "saved" || hash === "about" ? hash : "discover";
  });
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("All events");
  const [saved, setSaved] = useState<number[]>(() => JSON.parse(localStorage.getItem("near-saved") || "[]"));
  const [selected, setSelected] = useState<EventItem | null>(null); const [toast, setToast] = useState("");
  const gridRef = useRef<HTMLDivElement>(null); const heroRef = useRef<HTMLElement>(null);
  const splashRef = useRef<HTMLDivElement>(null); const videoRef = useRef<HTMLVideoElement>(null);
  const filtered = events.filter(e => (category === "All events" || e.category === category) && (priceFilter === "Any price" || (priceFilter === "Free" ? e.price === "Free" : e.price !== "Free")) && `${e.title} ${e.venue} ${e.category}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => {
    if (sortBy === "Free first") return Number(a.price !== "Free") - Number(b.price !== "Free");
    if (sortBy === "Closest first") return parseFloat(a.distance) - parseFloat(b.distance);
    return a.id - b.id;
  });
  const savedEvents = events.filter(e => saved.includes(e.id));
  const navigate = (nextPage: "discover" | "saved" | "about") => {
    setPage(nextPage);
    setMobileMenuOpen(false);
    window.history.replaceState(null, "", `#${nextPage}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => { gsap.from(".hero-copy > *", { y:24, opacity:0, duration:.7, stagger:.1, ease:"power3.out" }); }, heroRef);
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!splashRef.current) return;
      gsap.to(splashRef.current, { clipPath:"inset(0 0 100% 0)", duration:1.05, ease:"power4.inOut", onComplete:() => setIsLoading(false) });
    }, 1450);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[data-menu-root]")) {
        setLocationOpen(false); setProfileOpen(false); setFiltersOpen(false); setSortOpen(false); setMobileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocationOpen(false); setProfileOpen(false); setFiltersOpen(false); setSortOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("click", closeMenus); document.removeEventListener("keydown", closeOnEscape); };
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const startPlayback = () => {
      video.muted = true;
      void video.play().catch(() => undefined);
    };
    video.addEventListener("canplay", startPlayback);
    startPlayback();
    return () => video.removeEventListener("canplay", startPlayback);
  }, []);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const moveX = gsap.quickTo(hero.querySelector(".hero-video"), "x", { duration:.8, ease:"power3" });
    const moveY = gsap.quickTo(hero.querySelector(".hero-video"), "y", { duration:.8, ease:"power3" });
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - .5) * -12;
      const y = (event.clientY / window.innerHeight - .5) * -8;
      moveX(x); moveY(y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  useEffect(() => { const cards = gridRef.current?.querySelectorAll(".event-card"); if (cards?.length) gsap.fromTo(cards, { y:12, opacity:.45 }, { y:0, opacity:1, duration:.35, stagger:.04, ease:"power2.out" }); }, [query, category]);
  useEffect(() => { localStorage.setItem("near-saved", JSON.stringify(saved)); }, [saved]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "saved" || hash === "about" || hash === "discover") setPage(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  const toggleSave = (id:number) => { const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id]; setSaved(next); setToast(next.includes(id) ? "Saved to your shortlist" : "Removed from your shortlist"); window.setTimeout(() => setToast(""), 1800); };
  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          label: "Your current location",
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocating(false);
        setLocationMessage("Showing events closest to you");
      },
      () => {
        setLocating(false);
        setLocationMessage("We couldn't access your location. Showing Brooklyn instead.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  return <div className="min-h-screen bg-cream text-ink font-sans">
    {isLoading && <div ref={splashRef} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark text-paper [clip-path:inset(0)]">
      <div className="splash-orbit absolute h-56 w-56 rounded-full border border-white/10" />
      <div className="splash-orbit splash-orbit-delay absolute h-72 w-72 rounded-full border border-coral/20" />
      <div className="relative flex items-center gap-2 text-4xl font-extrabold tracking-[-2px]"><Sparkles className="text-coral" size={28} fill="currentColor" /> near<span className="text-coral">.</span></div>
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[.28em] text-[#a6b9ab]">Find your next good plan</p>
      <div className="absolute bottom-12 h-px w-32 overflow-hidden bg-white/10"><span className="splash-progress block h-full w-1/2 bg-coral" /></div>
    </div>}
    <header className={`fixed left-0 right-0 top-0 z-30 flex h-[78px] items-center gap-14 px-[5.8vw] transition-all duration-500 ${scrolled ? "mx-[2vw] mt-3 rounded-full border border-white/20 bg-white/10 shadow-[0_8px_24px_rgba(23,32,30,.06)] backdrop-blur-sm" : "border-b border-[#dce0d9] bg-paper"}`}>
      <button onClick={() => navigate("discover")} className="text-[22px] font-extrabold tracking-[-1.3px]"><Sparkles className="inline-block text-coral mr-1" size={18} fill="currentColor" /> near<span className="text-coral">.</span></button>
      <nav className="hidden md:flex h-full items-center gap-8 text-[13px] font-semibold text-[#78817c]">
        <button onClick={() => navigate("discover")} className={page === "discover" ? "relative text-ink after:absolute after:-bottom-[30px] after:left-0 after:right-0 after:h-0.5 after:bg-coral" : ""}>Discover</button>
        <button onClick={() => navigate("saved")} className={page === "saved" ? "relative text-ink after:absolute after:-bottom-[30px] after:left-0 after:right-0 after:h-0.5 after:bg-coral" : ""}>Saved <span className="rounded-full bg-sage px-1.5 py-0.5 text-[10px]">{saved.length}</span></button>
        <button onClick={() => navigate("about")} className={page === "about" ? "relative text-ink after:absolute after:-bottom-[30px] after:left-0 after:right-0 after:h-0.5 after:bg-coral" : ""}>How it works</button>
      </nav>
      <div className="ml-auto hidden items-center gap-4 md:flex">
        <div className="relative" data-menu-root><button onClick={() => { setLocationOpen(!locationOpen); setProfileOpen(false); setFiltersOpen(false); setSortOpen(false); }} className="text-xs font-bold"><MapPin className="inline text-coral mr-1" size={17} /> {location} <ChevronDown className={`inline text-[#68726d] transition ${locationOpen ? "rotate-180" : ""}`} size={14} /></button>{locationOpen && <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-white/60 bg-paper/95 p-2 shadow-2xl backdrop-blur-xl"><p className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-[#89928d]">Choose your city</p>{["Brooklyn, NY", "Manhattan, NY", "Queens, NY"].map(city => <button key={city} onClick={() => { setLocation(city); setLocationOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-cream">{city}{location === city && <span className="text-coral">✓</span>}</button>)}</div>}</div>
        <div className="relative" data-menu-root><button onClick={() => { setProfileOpen(!profileOpen); setLocationOpen(false); setFiltersOpen(false); setSortOpen(false); }} className="h-9 w-9 rounded-full bg-dark text-[10px] font-extrabold text-white" aria-label="Open profile">JD</button>{profileOpen && <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-white/60 bg-paper/95 p-2 shadow-2xl backdrop-blur-xl"><div className="border-b border-[#dce0d9] px-3 py-3"><p className="text-xs font-bold">Jordan Davis</p><p className="mt-1 text-[10px] text-[#89928d]">jordan@example.com</p></div><button className="w-full rounded-xl px-3 py-2.5 text-left text-xs hover:bg-cream">Your preferences</button><button className="w-full rounded-xl px-3 py-2.5 text-left text-xs hover:bg-cream">Notification settings</button><button className="w-full rounded-xl px-3 py-2.5 text-left text-xs text-coral hover:bg-[#fbe0d8]">Sign out</button></div>}</div>
      </div>
      <div className="relative ml-auto md:hidden" data-menu-root>
        <button
          onClick={event => { event.stopPropagation(); setMobileMenuOpen(open => !open); }}
          className="grid h-10 w-10 place-items-center rounded-full border border-[#dce0d9] bg-paper/70 text-ink"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        {mobileMenuOpen && <div id="mobile-navigation" className="absolute right-0 top-14 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/60 bg-paper/95 p-2 shadow-2xl backdrop-blur-xl">
          <nav className="grid gap-1 border-b border-[#dce0d9] pb-2 text-sm font-semibold">
            <button onClick={() => navigate("discover")} className={`flex items-center justify-between rounded-xl px-3 py-3 text-left ${page === "discover" ? "bg-cream text-ink" : "text-[#78817c]"}`}>Discover <ArrowUpRight size={15} /></button>
            <button onClick={() => navigate("saved")} className={`flex items-center justify-between rounded-xl px-3 py-3 text-left ${page === "saved" ? "bg-cream text-ink" : "text-[#78817c]"}`}>Saved <span className="rounded-full bg-sage px-2 py-0.5 text-[10px]">{saved.length}</span></button>
            <button onClick={() => navigate("about")} className={`flex items-center justify-between rounded-xl px-3 py-3 text-left ${page === "about" ? "bg-cream text-ink" : "text-[#78817c]"}`}>How it works <ArrowUpRight size={15} /></button>
          </nav>
          <div className="grid gap-1 pt-2">
            <p className="px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-[#89928d]">Your settings</p>
            {["Brooklyn, NY", "Manhattan, NY", "Queens, NY"].map(city => <button key={city} onClick={() => { setLocation(city); setMobileMenuOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold hover:bg-cream">{city}{location === city && <span className="text-coral">✓</span>}</button>)}
            <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold"><span>Jordan Davis</span><span className="grid h-6 w-6 place-items-center rounded-full bg-dark text-[8px] text-white">JD</span></div>
          </div>
        </div>}
      </div>
    </header>
    <main className="pt-[78px]">
      {page !== "discover" ? (page === "saved" ? <SavedPage events={savedEvents} onSave={toggleSave} onOpen={setSelected} onDiscover={() => navigate("discover")} /> : <HowItWorksPage onDiscover={() => navigate("discover")} />) : <>
      <section ref={heroRef} id="discover" className="relative isolate flex min-h-[440px] justify-between overflow-hidden bg-dark px-[10vw] py-[72px] text-[#f9f7f1]">
        <video ref={videoRef} className="hero-video absolute inset-[-18px] -z-20 h-[calc(100%+36px)] w-[calc(100%+36px)] object-cover opacity-35 mix-blend-screen" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1800&q=85" aria-hidden="true">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(32,61,53,.98)_0%,rgba(32,61,53,.82)_42%,rgba(32,61,53,.45)_100%)]" />
        <div className="hero-grain pointer-events-none absolute inset-0 -z-10 opacity-20" />
        <div className="hero-copy"><p className="font-mono text-[10px] uppercase tracking-[1.3px] text-[#a6b9ab]"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-coral shadow-[0_0_0_4px_rgba(240,109,79,.17)]" /> Your city, in motion</p><h1 className="mt-5 text-[clamp(44px,6.3vw,88px)] font-bold leading-[.94] tracking-[-5px]">Make plans<br /><em className="font-serif font-normal tracking-[-4px] text-[#dce7d8]">that feel like you.</em></h1><p className="mt-7 max-w-[360px] text-sm leading-[1.65] text-[#b3c0b5]">The best things happening around Brooklyn — curated for your kind of curious.</p></div>
        <div className="hidden self-end items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-[#a8b9aa] md:flex"><span className="h-px w-10 bg-coral" /> Good plans<br /> start nearby.</div>
        <div className="absolute bottom-8 right-[10vw] hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 font-mono text-[9px] uppercase tracking-wider text-[#b3c0b5] backdrop-blur-sm md:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" /> Live from Brooklyn</div>
      </section>
      <section className="mx-auto max-w-[1220px] px-[5vw] py-10">
        <div className="mb-6 flex gap-3"><div className="flex h-[52px] flex-1 items-center border border-[#dce0d9] bg-paper px-4"><Search className="mr-2 text-coral" size={20} /><input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9ca39e]" placeholder="Search events, artists, places..." aria-label="Search events" /><kbd className="hidden border border-[#dce0d9] bg-cream px-2 py-1 font-mono text-[10px] text-[#8b938e] sm:block">⌘ K</kbd></div><div className="relative" data-menu-root><button onClick={() => { setFiltersOpen(!filtersOpen); setLocationOpen(false); setProfileOpen(false); setSortOpen(false); }} className="flex h-[52px] items-center border border-[#bfc7c0] px-5 text-xs font-bold"><SlidersHorizontal className="mr-2 text-coral" size={17} /> Filters{priceFilter !== "Any price" && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-coral" />}</button>{filtersOpen && <div className="absolute right-0 top-14 z-40 w-64 rounded-2xl border border-white/70 bg-paper/95 p-4 shadow-2xl backdrop-blur-xl"><p className="font-mono text-[9px] uppercase tracking-wider text-[#89928d]">Refine results</p><label className="mt-4 block text-xs font-bold">Price</label><select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="mt-2 w-full rounded-lg border border-[#dce0d9] bg-cream px-3 py-2 text-xs outline-none"><option>Any price</option><option>Free</option><option>Paid</option></select><button onClick={() => { setPriceFilter("Any price"); setFiltersOpen(false); }} className="mt-4 text-[10px] font-bold text-coral">Reset filters</button></div>}</div></div>
        <div className="scrollbar-hide flex gap-2 overflow-auto border-b border-[#dce0d9] pb-8"><span className="mr-2 whitespace-nowrap self-center font-mono text-[10px] uppercase tracking-wide text-[#89928c]">Explore by</span>{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold transition ${category === c ? "border-ink bg-ink text-white" : "border-[#dce0d9] text-[#65706a] hover:bg-ink hover:text-white"}`}>{c}</button>)}</div>
        <NearbyMap location={currentLocation} locating={locating} message={locationMessage} onLocate={locateMe} onSelectEvent={setSelected} />
        <div className="mt-11 flex items-end justify-between"><div><p className="mb-4 font-mono text-[10px] uppercase tracking-[1.3px] text-[#8a948e]">Curated for you</p><h2 className="text-[39px] font-bold leading-[1.03] tracking-[-2.2px]">Worth leaving<br /><span className="font-serif font-normal">the house for.</span></h2></div><div className="relative" data-menu-root><button onClick={() => { setSortOpen(!sortOpen); setLocationOpen(false); setProfileOpen(false); setFiltersOpen(false); }} className="flex items-center gap-2 font-mono text-[10px] text-[#8a928d]">{sortBy}<ChevronDown className={`transition ${sortOpen ? "rotate-180" : ""}`} size={13} /></button>{sortOpen && <div className="absolute right-0 top-7 z-30 w-40 rounded-xl border border-white/70 bg-paper/95 p-1 shadow-xl backdrop-blur-xl">{["Soonest first", "Closest first", "Free first"].map(option => <button key={option} onClick={() => { setSortBy(option); setSortOpen(false); }} className="flex w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-cream">{option}</button>)}</div>}<span className="mt-2 block text-right font-mono text-[10px] text-[#8a928d]">{filtered.length} event{filtered.length === 1 ? "" : "s"}</span></div></div>
        {filtered.length ? <div ref={gridRef} className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map(e => <SharedEventCard key={e.id} event={e} isSaved={saved.includes(e.id)} onSave={toggleSave} onOpen={setSelected} />)}</div> : <div className="py-20 text-center"><p className="font-mono text-xs text-[#89928c]">Nothing by that name, yet.</p><button className="mt-4 text-xs font-bold text-coral" onClick={() => setQuery("")}>Clear search</button></div>}
        <section id="saved" className="mt-24 border-t border-[#dce0d9] pt-11"><div className="mb-7 flex items-end justify-between"><div><p className="mb-4 font-mono text-[10px] uppercase tracking-[1.3px] text-[#8a948e]">Your shortlist</p><h2 className="text-3xl font-bold tracking-[-2px]">Saved for later <span className="rounded-full bg-[#fbe0d8] px-2 py-1 font-mono text-[11px] text-coral">{saved.length}</span></h2></div><p className="hidden text-[11px] leading-relaxed text-[#87908a] sm:block">Keep the good ones close.<br />We’ll remember them for you.</p></div>{savedEvents.length ? <div className="grid gap-4 md:grid-cols-3">{savedEvents.map(e => <SharedEventCard compact key={e.id} event={e} isSaved onSave={toggleSave} onOpen={setSelected} />)}</div> : <p className="font-mono text-[10px] text-[#969f99]">Your saved events will show up here.</p>}</section>
      </section>
        <section className="mx-auto max-w-[1220px] px-[5vw] pb-24 pt-20">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="relative min-h-[390px] overflow-hidden bg-dark p-8 text-paper sm:p-12">
              <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1500&q=90" alt="Concert crowd under colorful lights" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/45 to-transparent" />
              <div className="relative flex h-full flex-col justify-between"><span className="font-mono text-[10px] uppercase tracking-[1.3px] text-[#b3c0b5]">The weekend edit</span><div><h2 className="max-w-lg text-4xl font-bold leading-none tracking-[-2px] sm:text-5xl">Three nights.<br /><span className="font-serif font-normal">Three different yous.</span></h2><button onClick={() => setCategory("Music")} className="mt-7 border border-white/30 px-4 py-3 text-[11px] font-bold text-white hover:bg-white hover:text-ink">Explore the edit <ArrowUpRight className="ml-2 inline" size={14} /></button></div></div>
            </div>
            <div className="relative min-h-[390px] overflow-hidden bg-[#dfcdb4] p-8 sm:p-10"><img src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=90" alt="Immersive art installation" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-70 transition duration-700 hover:scale-105" /><div className="absolute inset-0 bg-[#d3b99b]/30" /><div className="relative flex h-full flex-col justify-between text-ink"><span className="font-mono text-[10px] uppercase tracking-[1.3px]">Near IRL</span><div><p className="max-w-xs text-3xl font-bold leading-tight tracking-[-1px]">A little further is often worth it.</p><p className="mt-4 max-w-xs text-sm leading-6">Unexpected places, chosen with intention.</p></div></div></div>
          </div>
        </section>
        <SharedNewsletter email={email} setEmail={setEmail} subscribed={subscribed} onSubscribe={() => { if (email.includes("@")) setSubscribed(true); }} />
        <SharedFooter onNavigate={navigate} />
      </>}
    </main>
    {page !== "discover" && <SharedFooter onNavigate={navigate} />}
    {selected && <DetailDrawer event={selected} onClose={() => setSelected(null)} onToast={setToast} />}
    {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-ink px-5 py-3 text-[11px] text-white">{toast}</div>}
  </div>;
}

function NearbyMap({ location, locating, message, onLocate, onSelectEvent }: { location:{ label:string; lat:number; lng:number }; locating:boolean; message:string; onLocate:() => void; onSelectEvent:(event:EventItem) => void }) {
 const pins = [
   { event:events[0], left:"21%", top:"32%" },
   { event:events[1], left:"67%", top:"24%" },
   { event:events[2], left:"48%", top:"69%" },
   { event:events[3], left:"79%", top:"63%" },
   { event:events[4], left:"30%", top:"78%" }
 ];
 return <section className="mt-10 overflow-hidden rounded-[2px] border border-[#dce0d9] bg-[#d8e0d5] shadow-[0_12px_35px_rgba(23,32,30,.06)]">
   <div className="flex flex-col justify-between gap-4 bg-paper px-5 py-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><Navigation className="text-coral" size={15} fill="currentColor" /><p className="font-mono text-[10px] uppercase tracking-[1.2px] text-[#68726d]">Events near you</p></div><h2 className="mt-1 text-xl font-bold tracking-[-.7px]">Find something close by.</h2><p className="mt-1 text-[11px] text-[#89928d]">{location.label} · {pins.length} picks within 3 miles</p></div><div className="flex items-center gap-3"><span className="hidden text-[10px] text-[#89928d] sm:inline">{message || "Use your location for a more personal map."}</span><button onClick={onLocate} disabled={locating} className="flex items-center gap-2 bg-dark px-4 py-2.5 text-[10px] font-extrabold text-white disabled:cursor-wait disabled:opacity-70"><LocateFixed size={14} />{locating ? "Locating…" : "Find near me"}</button></div></div>
   <div className="relative h-[330px] overflow-hidden bg-[#cbd6c8]">
     <div className="map-grid absolute inset-0 opacity-60" />
     <div className="absolute -left-16 top-1/2 h-20 w-[120%] -rotate-[13deg] border-y-[10px] border-[#f2eee4] bg-[#b4c7b7] shadow-[0_0_0_2px_#a4b8a9]" />
     <div className="absolute -left-8 top-[38%] h-12 w-[110%] rotate-[27deg] border-y-4 border-[#f2eee4] bg-[#c0cfbd]" />
     <div className="absolute left-[31%] top-[-15%] h-[140%] w-11 rotate-[18deg] border-x-4 border-[#f2eee4] bg-[#c0cfbd]" />
     <div className="absolute left-[68%] top-[-15%] h-[140%] w-8 -rotate-[34deg] border-x-4 border-[#f2eee4] bg-[#c0cfbd]" />
     <span className="absolute left-[9%] top-[18%] rotate-[-8deg] font-mono text-[9px] uppercase tracking-widest text-[#829688]">Prospect Park</span><span className="absolute right-[8%] top-[17%] rotate-[8deg] font-mono text-[9px] uppercase tracking-widest text-[#829688]">Greenpoint</span><span className="absolute left-[44%] top-[14%] font-mono text-[9px] uppercase tracking-widest text-[#829688]">Williamsburg</span><span className="absolute bottom-[14%] left-[10%] font-mono text-[9px] uppercase tracking-widest text-[#829688]">Park Slope</span>
     <div className="absolute left-[52%] top-[49%] z-10"><span className="absolute -inset-3 animate-ping rounded-full bg-coral/25" /><span className="relative block h-4 w-4 rounded-full border-[3px] border-white bg-coral shadow-lg" /><span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-dark px-2 py-1 font-mono text-[8px] text-white">You are here</span></div>
     {pins.map(pin => <button key={pin.event.id} onClick={() => onSelectEvent(pin.event)} className="group absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left:pin.left, top:pin.top }} aria-label={`View ${pin.event.title}`}><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-coral text-white shadow-lg transition group-hover:scale-125"><MapPin size={15} fill="currentColor" /></span><span className="pointer-events-none absolute left-1/2 top-10 hidden w-36 -translate-x-1/2 rounded-lg bg-dark px-2 py-1.5 text-left text-[9px] text-white shadow-xl group-hover:block">{pin.event.title}<br /><span className="text-[#b3c0b5]">{pin.event.distance}</span></span></button>)}
     <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg border border-white/60 bg-paper/85 px-2 py-1.5 font-mono text-[8px] text-[#68726d] backdrop-blur-sm"><Layers3 size={12} /> Map view</div>
   </div>
 </section>;
}

function EventCard({ event, isSaved, onSave, onOpen, compact=false }: { event:EventItem; isSaved:boolean; onSave:(id:number)=>void; onOpen:(event:EventItem)=>void; compact?:boolean }) {
  return <article className="event-card overflow-hidden bg-paper transition hover:-translate-y-1 hover:shadow-xl"><div className={`relative ${compact ? "h-32" : "h-[185px]"}`}><img src={event.image} alt="" className="h-full w-full object-cover" /><div className="absolute left-3.5 top-3.5 bg-paper px-2.5 py-2 text-center"><strong className="block font-mono text-base leading-none text-coral">{event.day}</strong><small className="font-mono text-[8px] tracking-widest text-[#69736d]">{event.month}</small></div><button onClick={() => onSave(event.id)} className={`absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full bg-paper/90 ${isSaved ? "text-coral" : "text-ink"}`} aria-label={isSaved ? "Remove from saved" : "Save event"}><Heart size={16} fill={isSaved ? "currentColor" : "none"} /></button></div><div className="p-[18px]"><div className="flex justify-between font-mono text-[9px] uppercase tracking-wider text-[#89928d]"><span className="text-coral">{event.type}</span><span>{event.distance}</span></div><h3 className="my-2.5 text-lg font-bold leading-tight tracking-[-.6px]">{event.title}</h3><div className="grid gap-2 text-[10px] text-[#747e78]"><span><CalendarDays className="mr-1 inline text-coral" size={13} />{event.date}</span><span><Clock3 className="mr-1 inline text-coral" size={13} />{event.time}</span><span><MapPin className="mr-1 inline text-coral" size={13} />{event.venue}</span></div>{!compact && <div className="mt-4 flex items-center justify-between border-t border-[#ecece6] pt-3.5"><span className="font-mono text-[11px]">{event.price}</span><button onClick={() => onOpen(event)} className="text-[10px] font-bold text-coral">View details <ArrowUpRight className="inline" size={13} /></button></div>}</div></article>;
}

function DetailDrawer({ event, onClose, onToast }: { event:EventItem; onClose:() => void; onToast:(text:string) => void }) {
  const drawer = useRef<HTMLElement>(null);
  useLayoutEffect(() => { if (drawer.current) gsap.fromTo(drawer.current, { x:"100%" }, { x:0, duration:.35, ease:"power3.out" }); }, []);
  return <div className="fixed inset-0 z-40 flex justify-end bg-ink/50" onClick={e => e.target === e.currentTarget && onClose()}><aside ref={drawer} role="dialog" aria-modal="true" aria-labelledby="detail-title" className="h-full w-full max-w-[520px] overflow-auto bg-paper"><div className="relative h-[300px]"><img src={event.image} alt="" className="h-full w-full object-cover" /><button onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-paper/90" aria-label="Close event details"><X size={20} /></button></div><div className="p-8 sm:p-10"><div className="flex justify-between font-mono text-[10px]"><span className="uppercase tracking-wider text-coral">{event.type}</span><span className="text-[#89928d]">{event.distance}</span></div><h2 id="detail-title" className="mt-4 text-4xl font-bold leading-tight tracking-[-2px]">{event.title}</h2><p className="my-6 text-[13px] leading-relaxed text-[#6d7771]">{event.description}</p><div className="space-y-4 border-y border-[#dce0d9] py-5 text-xs"><div className="flex gap-3"><CalendarDays className="text-coral" size={19} /><div><strong className="block">{event.date}</strong><span className="mt-1 block text-[#89928d]"><Clock3 className="mr-1 inline" size={13} />{event.time}</span></div></div><div className="flex gap-3"><MapPin className="text-coral" size={19} /><div><strong className="block">{event.venue}</strong><span className="mt-1 block text-[#89928d]">{event.address}</span></div></div></div><div className="mt-7 flex items-center justify-between"><span className="font-mono text-xs">{event.price === "Free" ? "Free entry" : `From ${event.price}`}</span><button onClick={() => onToast("Ticket link ready — enjoy the plan!")} className="bg-coral px-5 py-3 text-[11px] font-extrabold text-white">Get tickets <ArrowUpRight className="ml-2 inline" size={15} /></button></div></div></aside></div>;
}

function SavedPage({ events, onSave, onOpen, onDiscover }: { events:EventItem[]; onSave:(id:number) => void; onOpen:(event:EventItem) => void; onDiscover:() => void }) {
  return <section className="mx-auto min-h-[calc(100vh-78px)] max-w-[1220px] px-[5vw] py-16">
    <div className="max-w-2xl"><p className="font-mono text-[10px] uppercase tracking-[1.3px] text-[#8a948e]">Your shortlist</p><h1 className="mt-5 text-5xl font-bold leading-none tracking-[-3px] sm:text-7xl">Plans worth<br /><span className="font-serif font-normal">keeping close.</span></h1><p className="mt-6 max-w-md text-sm leading-7 text-[#68726d]">A considered list of the places, people, and experiences you want to make time for.</p></div>
    {events.length ? <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map(event => <SharedEventCard key={event.id} event={event} isSaved onSave={onSave} onOpen={onOpen} />)}</div> : <div className="mt-14 border border-dashed border-[#bfc7c0] bg-paper px-6 py-16 text-center"><Heart className="mx-auto text-coral" size={24} /><h2 className="mt-5 text-2xl font-bold tracking-tight">Your shortlist is ready when you are.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#747e78]">Save an event while you browse and it will appear here, ready for when the mood strikes.</p><button onClick={onDiscover} className="mt-7 bg-coral px-5 py-3 text-[11px] font-extrabold text-white">Explore events <ArrowUpRight className="ml-2 inline" size={14} /></button></div>}
  </section>;
}

function HowItWorksPage({ onDiscover }: { onDiscover:() => void }) {
  const steps = [
    { number:"01", title:"Tell us what moves you", text:"Browse by mood, category, or neighborhood. Near keeps the search human and the choices considered." },
    { number:"02", title:"Find your kind of night", text:"Every event has the details that matter: the time, the place, the price, and the reason it is worth your time." },
    { number:"03", title:"Make it a plan", text:"Save the ones that spark something. When you are ready, your shortlist is waiting with everything in one place." }
  ];
  return <section className="mx-auto min-h-[calc(100vh-78px)] max-w-[1220px] px-[5vw] py-16 sm:py-24">
    <div className="grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[1.3px] text-[#8a948e]">A better way to go out</p><h1 className="mt-5 text-5xl font-bold leading-[.95] tracking-[-3px] sm:text-7xl">Less scrolling.<br /><span className="font-serif font-normal">More living.</span></h1><p className="mt-7 max-w-lg text-base leading-7 text-[#68726d]">Near is a thoughtful guide to what is happening around you. Not everything. Just the things you will be glad you made time for.</p><button onClick={onDiscover} className="mt-8 bg-dark px-5 py-3 text-[11px] font-extrabold text-white">Start exploring <ArrowUpRight className="ml-2 inline" size={14} /></button></div><div className="relative min-h-[300px] overflow-hidden bg-dark p-8 text-paper"><img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=85" alt="Friends sharing a good evening" className="absolute inset-0 h-full w-full object-cover opacity-55" /><div className="absolute inset-0 bg-dark/60" /><div className="relative flex h-full flex-col justify-between"><Sparkles className="text-coral" size={28} fill="currentColor" /><p className="max-w-xs text-3xl font-bold leading-tight tracking-[-1px]">Good plans start nearby.</p><span className="font-mono text-[10px] uppercase tracking-widest text-[#b3c0b5]">Made for curious people</span></div></div></div>
    <div className="mt-20 grid border-y border-[#dce0d9] md:grid-cols-3">{steps.map(step => <div key={step.number} className="border-b border-[#dce0d9] py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-[10px] text-coral">{step.number}</span><h2 className="mt-7 text-xl font-bold tracking-[-.6px]">{step.title}</h2><p className="mt-3 text-sm leading-6 text-[#747e78]">{step.text}</p></div>)}</div>
  </section>;
}

function Newsletter({ email, setEmail, subscribed, onSubscribe }: { email:string; setEmail:(value:string) => void; subscribed:boolean; onSubscribe:() => void }) {
  return <section className="mx-auto max-w-[1220px] px-[5vw] pb-20"><div className="relative overflow-hidden bg-coral px-7 py-10 text-white sm:px-12 sm:py-14"><div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/20" /><div className="absolute -right-5 -top-14 h-52 w-52 rounded-full border border-white/20" /><div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[1.3px] text-white/70">The near letter</p><h2 className="mt-4 max-w-md text-3xl font-bold leading-tight tracking-[-1.5px] sm:text-4xl">A few good things,<br /><span className="font-serif font-normal">once a week.</span></h2></div><div><p className="mb-4 max-w-md text-sm leading-6 text-white/80">New openings, small discoveries, and plans worth making — delivered without the noise.</p>{subscribed ? <div className="border border-white/40 bg-white/10 px-4 py-3 text-sm">You’re on the list. See you in your inbox.</div> : <form onSubmit={event => { event.preventDefault(); onSubscribe(); }} className="flex max-w-lg border border-white/40 bg-white/10 p-1 backdrop-blur-sm"><input value={email} onChange={event => setEmail(event.target.value)} type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/60" /><button className="bg-white px-4 py-3 text-[11px] font-extrabold text-coral">Subscribe</button></form>}</div></div></div></section>;
}

function Footer({ onNavigate }: { onNavigate:(page:"discover"|"saved"|"about") => void }) {
  return <footer className="border-t border-[#dce0d9] bg-paper px-[5vw] py-12"><div className="mx-auto max-w-[1220px]"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_.7fr_.9fr]"><div><button onClick={() => onNavigate("discover")} className="text-2xl font-extrabold tracking-[-1.5px]"><Sparkles className="mr-1 inline text-coral" size={18} fill="currentColor" />near<span className="text-coral">.</span></button><p className="mt-4 max-w-xs text-sm leading-6 text-[#747e78]">A thoughtful guide to the best things happening around your city.</p></div><div><p className="font-mono text-[10px] uppercase tracking-wider text-[#8a948e]">Explore</p><div className="mt-4 grid gap-3 text-sm font-semibold"><button className="text-left hover:text-coral" onClick={() => onNavigate("discover")}>Discover events</button><button className="text-left hover:text-coral" onClick={() => onNavigate("saved")}>Saved plans</button><button className="text-left hover:text-coral" onClick={() => onNavigate("about")}>How it works</button></div></div><div><p className="font-mono text-[10px] uppercase tracking-wider text-[#8a948e]">Cities</p><div className="mt-4 grid gap-3 text-sm text-[#747e78]"><span>Brooklyn</span><span>New York</span><span>Coming soon</span></div></div><div><p className="font-mono text-[10px] uppercase tracking-wider text-[#8a948e]">Follow along</p><div className="mt-4 flex gap-3 text-sm font-semibold"><span>Instagram</span><span>Are.na</span></div></div></div><div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#dce0d9] pt-5 text-[10px] text-[#8a948e] sm:flex-row"><span>© 2026 Near, Inc.</span><span>Made for plans worth leaving home for.</span></div></div></footer>;
}

export default App;

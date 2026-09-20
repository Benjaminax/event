const events = [
  { id:1, title:"Sunset Sessions: Live at the Yard", category:"Music", type:"Live music", day:"24", month:"SEP", date:"Tuesday, September 24", time:"6:30 PM – 9:00 PM", venue:"The Sultan Room", address:"234 Starr St, Bushwick", distance:"1.2 mi away", price:"$18", visual:"visual-one", description:"An open-air evening of warm sounds and even warmer company. Three local acts, a sunset set, and the city’s best little dance floor." },
  { id:2, title:"The Art of Paying Attention", category:"Art & culture", type:"Exhibition", day:"25", month:"SEP", date:"Wednesday, September 25", time:"7:00 PM – 10:00 PM", venue:"Greenpoint Gallery", address:"390 McGuinness Blvd, Greenpoint", distance:"2.4 mi away", price:"Free", visual:"visual-two", description:"A group exhibition about noticing the details we usually miss, featuring work from 12 emerging Brooklyn artists." },
  { id:3, title:"Make Your Own Miso", category:"Food & drink", type:"Workshop", day:"26", month:"SEP", date:"Thursday, September 26", time:"6:00 PM – 8:30 PM", venue:"Marlow & Sons", address:"81 Broadway, Williamsburg", distance:"3.1 mi away", price:"$42", visual:"visual-three", description:"Get hands-on with koji, soybeans, and time. Leave with your own jar of miso and a new appreciation for slow food." },
  { id:4, title:"Future / Now: Designing Tomorrow", category:"Learning", type:"Talk", day:"28", month:"SEP", date:"Saturday, September 28", time:"11:00 AM – 1:00 PM", venue:"BRIC House", address:"647 Fulton St, Downtown Brooklyn", distance:"0.8 mi away", price:"$12", visual:"visual-four", description:"Four brilliant minds look at the choices shaping our future — from cities and climate to the everyday objects around us." },
  { id:5, title:"Sunday Morning Run Club", category:"Outdoors", type:"Community", day:"29", month:"SEP", date:"Sunday, September 29", time:"9:00 AM – 10:30 AM", venue:"Prospect Park Boathouse", address:"East Dr, Prospect Park", distance:"2.0 mi away", price:"Free", visual:"visual-five", description:"A friendly, no-pressure 5K through the park. All paces welcome, coffee and good conversation guaranteed at the finish." },
  { id:6, title:"Ceramics & Natural Wine", category:"Art & culture", type:"Hands-on", day:"01", month:"OCT", date:"Tuesday, October 1", time:"7:00 PM – 9:30 PM", venue:"Clay Space", address:"110 Nassau Ave, Greenpoint", distance:"2.8 mi away", price:"$55", visual:"visual-six", description:"Shape something beautiful while discovering a few natural wines from small producers. No experience, no rules — just play." }
];
let saved = JSON.parse(localStorage.getItem("near-saved") || "[]");
let selectedCategory = "All";
const $ = (id) => document.getElementById(id);

function renderCards(list, target, compact = false) {
  target.innerHTML = list.map(event => `
    <article class="event-card" data-id="${event.id}">
      <div class="card-image ${event.visual}">
        <div class="date-badge"><strong>${event.day}</strong><small>${event.month}</small></div>
        <button class="save-button ${saved.includes(event.id) ? "saved" : ""}" data-save="${event.id}" aria-label="${saved.includes(event.id) ? "Remove from saved" : "Save event"}">${saved.includes(event.id) ? "♥" : "♡"}</button>
      </div>
      <div class="card-body">
        <div class="card-kicker"><span class="type">${event.type}</span><span>${event.distance}</span></div>
        <h3 class="card-title">${event.title}</h3>
        <div class="card-meta"><span>${event.date.replace("Tuesday, ","").replace("Wednesday, ","").replace("Thursday, ","").replace("Saturday, ","").replace("Sunday, ","")}</span><span>${event.venue}</span></div>
        ${compact ? "" : `<div class="card-footer"><span class="price">${event.price}</span><button class="details-link" data-detail="${event.id}">View details ↗</button></div>`}
      </div>
    </article>`).join("");
}
function updateSaved() {
  $("savedCount").textContent = saved.length; $("savedHeadingCount").textContent = saved.length;
  const list = events.filter(e => saved.includes(e.id));
  $("savedGrid").innerHTML = list.length ? "" : '<p class="saved-empty">Your saved events will show up here.</p>';
  if (list.length) renderCards(list, $("savedGrid"), true);
}
function render() {
  const query = $("searchInput").value.toLowerCase().trim();
  const filtered = events.filter(e => (selectedCategory === "All" || e.category === selectedCategory) && `${e.title} ${e.venue} ${e.category}`.toLowerCase().includes(query));
  renderCards(filtered, $("eventGrid"));
  $("resultCount").textContent = `${filtered.length} event${filtered.length === 1 ? "" : "s"}`;
  $("emptyState").classList.toggle("hidden", filtered.length > 0);
  updateSaved();
}
function showDetail(id) {
  const event = events.find(e => e.id === id); if (!event) return;
  $("detailImage").className = `detail-image ${event.visual}`; $("detailType").textContent = event.type; $("detailDistance").textContent = event.distance;
  $("detailTitle").textContent = event.title; $("detailDescription").textContent = event.description; $("detailDate").textContent = event.date; $("detailTime").textContent = event.time; $("detailVenue").textContent = event.venue; $("detailAddress").textContent = event.address; $("detailPrice").textContent = event.price === "Free" ? "Free entry" : `From ${event.price}`;
  $("overlay").classList.remove("hidden"); document.body.style.overflow = "hidden";
}
function toggleSave(id) {
  saved = saved.includes(id) ? saved.filter(item => item !== id) : [...saved, id];
  localStorage.setItem("near-saved", JSON.stringify(saved)); render();
  $("toast").textContent = saved.includes(id) ? "Saved to your shortlist" : "Removed from your shortlist"; $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1800);
}
$("searchInput").addEventListener("input", render);
document.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => { selectedCategory = chip.dataset.category; document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip)); $("filterDot").classList.toggle("hidden", selectedCategory === "All"); render(); }));
$("eventGrid").addEventListener("click", e => { const saveBtn = e.target.closest("[data-save]"); const detail = e.target.closest("[data-detail]"); if (saveBtn) toggleSave(Number(saveBtn.dataset.save)); else if (detail) showDetail(Number(detail.dataset.detail)); });
$("savedGrid").addEventListener("click", e => { const saveBtn = e.target.closest("[data-save]"); if (saveBtn) toggleSave(Number(saveBtn.dataset.save)); });
$("filterButton").addEventListener("click", () => $("filterRow").classList.toggle("hidden"));
$("clearSearch").addEventListener("click", () => { $("searchInput").value = ""; selectedCategory = "All"; document.querySelectorAll(".chip").forEach((c,i) => c.classList.toggle("active", i === 0)); render(); });
$("closeDetail").addEventListener("click", () => { $("overlay").classList.add("hidden"); document.body.style.overflow = ""; });
$("overlay").addEventListener("click", e => { if (e.target === $("overlay")) $("closeDetail").click(); });
$("getTickets").addEventListener("click", () => { $("toast").textContent = "Ticket link ready — enjoy the plan!"; $("toast").classList.add("show"); setTimeout(() => $("toast").classList.remove("show"), 2200); });
document.addEventListener("keydown", e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("searchInput").focus(); } if (e.key === "Escape" && !$("overlay").classList.contains("hidden")) $("closeDetail").click(); });
render();

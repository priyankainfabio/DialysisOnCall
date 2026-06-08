const header = document.querySelector("[data-header]");
const glow = document.querySelector(".cursor-glow");
const mapDetail = document.querySelector("[data-map-detail]");
const finderForm = document.querySelector("[data-finder-form]");
const finderInput = document.querySelector("[data-location-search]");
const finderStatus = document.querySelector("[data-finder-status]");
const finderResults = document.querySelector("[data-finder-results]");
const finderMarkers = document.querySelectorAll("[data-map-city]");
const revealTargets = document.querySelectorAll(
  ".reveal, .story-lines, .section-intro, .india-map, .story-track article, .journey-line li, .life-copy, .life-image, .caregiver-content, .benefit-grid article, .support-copy, .support-form, .centre-grid article, .voice-card, .voice-strip, .footer-brand, .footer-column, .footer-disclaimer, .footer-credit-row, .footer-bottom"
);
let lastScrollY = window.scrollY;

const centres = [
  {
    city: "Delhi",
    count: 18,
    centre: "Delhi Verified Dialysis Network",
    area: "South Delhi, Rohini, Dwarka",
    tags: ["verified", "support", "hemodialysis", "holiday"],
  },
  {
    city: "Jaipur",
    count: 7,
    centre: "Jaipur Kidney Care Access",
    area: "Malviya Nagar, Vaishali Nagar",
    tags: ["verified", "support", "hemodialysis"],
  },
  {
    city: "Mumbai",
    count: 22,
    centre: "Mumbai Travel Dialysis Support",
    area: "Andheri, Dadar, Navi Mumbai",
    tags: ["verified", "support", "hemodialysis", "holiday"],
  },
  {
    city: "Haridwar",
    count: 4,
    centre: "Haridwar Pilgrimage Dialysis Help",
    area: "Haridwar and Rishikesh access",
    tags: ["support", "hemodialysis", "holiday"],
  },
  {
    city: "Varanasi",
    count: 6,
    centre: "Varanasi Pilgrimage Care Network",
    area: "Lanka, Sigra, Cantonment",
    tags: ["verified", "support", "hemodialysis", "holiday"],
  },
  {
    city: "Goa",
    count: 5,
    centre: "Goa Holiday Dialysis Options",
    area: "Panaji, Margao, North Goa",
    tags: ["support", "hemodialysis", "holiday"],
  },
  {
    city: "Ahmedabad",
    count: 10,
    centre: "Ahmedabad Verified Centre Access",
    area: "Satellite, Navrangpura, Maninagar",
    tags: ["verified", "support", "hemodialysis"],
  },
  {
    city: "Bengaluru",
    count: 16,
    centre: "Bengaluru Dialysis Centre Network",
    area: "Indiranagar, Whitefield, Jayanagar",
    tags: ["verified", "support", "hemodialysis", "holiday"],
  },
  {
    city: "Chennai",
    count: 13,
    centre: "Chennai Patient Mobility Support",
    area: "T Nagar, Adyar, Anna Nagar",
    tags: ["verified", "support", "hemodialysis"],
  },
  {
    city: "Kolkata",
    count: 14,
    centre: "Kolkata Dialysis Access Network",
    area: "Salt Lake, Park Street, Howrah",
    tags: ["verified", "support", "hemodialysis"],
  },
];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((target) => observer.observe(target));

const onScroll = () => {
  const currentScrollY = window.scrollY;
  header.classList.toggle("is-scrolled", currentScrollY > 30);
  header.classList.toggle("is-hidden", currentScrollY > lastScrollY && currentScrollY > 140);
  document.documentElement.style.setProperty("--scroll", currentScrollY.toString());
  lastScrollY = currentScrollY;
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

window.addEventListener("pointermove", (event) => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

const renderResults = (matches) => {
  if (!finderResults || !finderStatus) return;

  const totalCentres = matches.reduce((sum, item) => sum + item.count, 0);
  finderStatus.textContent = matches.length
    ? `Showing ${totalCentres} centre locations in ${matches.length} Indian cities.`
    : "No matching centre locations found. Try another city or reset the search.";

  finderResults.innerHTML = matches
    .map(
      (item) => `
        <article class="result-card">
          <strong>${item.centre}</strong>
          <span>${item.city} · ${item.area}</span>
          <span>${item.count} listed centre locations · ${item.tags.includes("verified") ? "Verified options available" : "Support-assisted options"}</span>
        </article>
      `
    )
    .join("");
};

const setMapDetail = (cityName) => {
  const item = centres.find((centre) => centre.city === cityName);
  if (!item || !mapDetail) return;

  mapDetail.innerHTML = `
    <span>${item.city}</span>
    <strong>${item.count} centres</strong>
    <p>${item.area}. ${item.tags.includes("support") ? "Patient support coordination available." : "Centre information available."}</p>
  `;
};

const getActiveFilters = () =>
  [...document.querySelectorAll("[data-filter]:checked")].map((input) => input.value);

const filterCentres = () => {
  const query = finderInput?.value.trim().toLowerCase() || "";
  const filters = getActiveFilters();

  const matches = centres.filter((centre) => {
    const textMatch = [centre.city, centre.centre, centre.area].join(" ").toLowerCase().includes(query);
    const filterMatch = filters.length === 0 || filters.some((filter) => centre.tags.includes(filter));
    return textMatch && filterMatch;
  });

  finderMarkers.forEach((marker) => {
    const isMatch = matches.some((centre) => centre.city === marker.dataset.mapCity);
    marker.classList.toggle("is-hidden", !isMatch);
    marker.classList.toggle("is-active", matches.length === 1 && isMatch);
  });

  renderResults(matches);
  if (matches.length === 1) setMapDetail(matches[0].city);
  if (matches.length !== 1 && mapDetail) {
    mapDetail.innerHTML = `<span>India network</span><strong>Select a city to view centre details.</strong>`;
  }
};

finderMarkers.forEach((marker) => {
  const cityName = marker.dataset.mapCity;
  marker.addEventListener("click", () => {
    finderInput.value = cityName;
    filterCentres();
    setMapDetail(cityName);
  });
});

document.querySelectorAll("[data-search-city]").forEach((button) => {
  button.addEventListener("click", () => {
    finderInput.value = button.dataset.searchCity;
    filterCentres();
    setMapDetail(button.dataset.searchCity);
  });
});

document.querySelector("[data-nearby]")?.addEventListener("click", () => {
  finderInput.value = "Delhi";
  filterCentres();
  setMapDetail("Delhi");
});

document.querySelector("[data-reset-finder]")?.addEventListener("click", () => {
  finderInput.value = "";
  document.querySelectorAll("[data-filter]").forEach((input) => {
    input.checked = input.value !== "holiday";
  });
  filterCentres();
});

finderForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  filterCentres();
});

document.querySelectorAll("[data-filter]").forEach((input) => {
  input.addEventListener("change", filterCentres);
});

filterCentres();

document.querySelectorAll("form:not([data-finder-form])").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    const original = button.textContent;
    button.textContent = "Received";
    setTimeout(() => {
      button.textContent = original;
    }, 1600);
  });
});

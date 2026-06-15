/**
 * Homepage section definitions with fetch priority and preload hints.
 * Higher-priority sections load first via the API scheduler.
 */
export const HOME_SECTIONS = [
  {
    title: "Trending Now",
    id: "4516404531735022304",
    priority: "high",
    preload: true,
  },
  {
    title: "Cinema",
    id: "5692654647815587592",
    priority: "high",
    preload: true,
  },
  {
    title: "Hot Short TV",
    id: "537172945375056936",
    priority: "medium",
    preload: false,
  },
  {
    title: "Bollywood",
    id: "414907768299210008",
    priority: "medium",
    preload: false,
  },
  {
    title: "South Indian",
    id: "3859721901924910512",
    priority: "medium",
    preload: false,
  },
  {
    title: "Hollywood",
    id: "8019599703232971616",
    priority: "medium",
    preload: false,
  },
  {
    title: "Top Series This Week",
    id: "4741626294545400336",
    priority: "medium",
    preload: false,
  },
  {
    title: "Indian Drama",
    id: "4903182713986896328",
    priority: "low",
    preload: false,
  },
  {
    title: "Top Anime",
    id: "8434602210994128512",
    priority: "low",
    preload: false,
  },
  {
    title: "Best Asian Series",
    id: "1976033493293449744",
    priority: "low",
    preload: false,
  },
  {
    title: "Western TV",
    id: "3910636007619709856",
    priority: "low",
    preload: false,
  },
];

export default HOME_SECTIONS;

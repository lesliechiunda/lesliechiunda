export type Project = {
  title: string;
  category: string;
  summary: string;
  href: string;
  image?: string;
  tone: "lime" | "clay" | "blue" | "ink";
};

export type Concept = {
  slug: string;
  name: string;
  eyebrow: string;
  headline: string;
  summary: string;
  location: string;
  category: string;
  phone: string;
  accent: string;
  background: string;
  foreground: string;
  services: string[];
  image?: string;
};

export const projects: Project[] = [
  {
    title: "Finlit",
    category: "Financial education app",
    summary:
      "A gamified platform helping South African learners build practical money skills through lessons, challenges and real-world rewards.",
    href: "https://www.finlit.dev/",
    image: "/project-finlit.jpg",
    tone: "lime",
  },
  {
    title: "Remember Us",
    category: "Community platform",
    summary:
      "South Africa's online death-notice platform, designed to make publishing, sharing and remembering feel dignified and accessible.",
    href: "https://www.rememberus.co.za/",
    image: "/project-remember-us.png",
    tone: "blue",
  },
  {
    title: "Kahari Beauty",
    category: "E-commerce + bookings",
    summary:
      "A polished storefront and appointment experience for a beauty professional selling products and services online.",
    href: "https://kaharibeauty.com/",
    image: "/project-kahari.jpg",
    tone: "clay",
  },
  {
    title: "11th Parcel Free",
    category: "Loyalty system",
    summary:
      "A trackable digital rewards platform that replaces physical parcel cards with a simpler customer and staff workflow.",
    href: "https://11thparcelfree.vercel.app/",
    image: "/project-loyalty.png",
    tone: "ink",
  },
  {
    title: "Pass Papers ZA",
    category: "Education portal",
    summary:
      "A fast, focused repository that helps South African learners find past NSC examination papers and marking guides.",
    href: "https://passpapers.co.za/landing",
    image: "/project-pass-papers.jpg",
    tone: "blue",
  },
  {
    title: "Anna Okaria",
    category: "Fashion e-commerce",
    summary:
      "A refined editorial storefront that gives a South African fashion label room for campaigns, collections and confident online shopping.",
    href: "https://annaokaria.com/",
    image: "/project-anna-okaria.jpg",
    tone: "clay",
  },
];

export const concepts: Concept[] = [
  {
    slug: "don-armando",
    name: "Don Armando",
    eyebrow: "Neighbourhood kitchen · Johannesburg",
    headline: "Good food, made for long tables.",
    summary:
      "A warm, confident restaurant concept built around wood-fired plates, easy bookings and a menu that gets to the point.",
    location: "Johannesburg",
    category: "Restaurant",
    phone: "+27 11 000 0000",
    accent: "#ff5a36",
    background: "#f2dfc7",
    foreground: "#28160f",
    services: ["Lunch & dinner", "Group bookings", "Private events"],
  },
  {
    slug: "cataplana",
    name: "Cataplana",
    eyebrow: "Portuguese table · Gauteng",
    headline: "The coast, served in the city.",
    summary:
      "A bright hospitality concept with a strong menu story, direct reservation flow and room for events, reviews and seasonal specials.",
    location: "Gauteng",
    category: "Hospitality",
    phone: "+27 10 000 0000",
    accent: "#0d66ff",
    background: "#e9f0e8",
    foreground: "#10291f",
    services: ["Fresh seafood", "Family tables", "Celebrations"],
  },
  {
    slug: "mctrenz",
    name: "McTrenz",
    eyebrow: "Precision services · Johannesburg",
    headline: "Reliable work. Clear answers. No runaround.",
    summary:
      "A direct, high-trust service-business concept designed to turn local searches into qualified enquiries.",
    location: "Johannesburg",
    category: "Service business",
    phone: "+27 71 000 0000",
    accent: "#c8f16b",
    background: "#151713",
    foreground: "#f4f0e7",
    services: ["Fast quotations", "On-site service", "Ongoing support"],
  },
];

export function getConcept(slug: string) {
  return concepts.find((concept) => concept.slug === slug);
}

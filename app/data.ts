export type Project = {
  title: string;
  category: string;
  summary: string;
  href: string;
  image?: string;
  tone: "lime" | "clay" | "blue" | "ink";
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
    image: "/project-remember-us.jpg",
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

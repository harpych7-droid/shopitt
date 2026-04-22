import feed1 from "@/assets/feed-1.jpg";
import feed2 from "@/assets/feed-2.jpg";
import feed3 from "@/assets/feed-3.jpg";
import feed4 from "@/assets/feed-4.jpg";
import feed5 from "@/assets/feed-5.jpg";
import feed6 from "@/assets/feed-6.jpg";

export type FeedItem = {
  id: string;
  brand: string;
  brandHandle: string;
  title: string;
  drop: string;
  image: string;
  price: number;
  oldPrice?: number;
  currency: string;
  stockLeft: number;
  freeDelivery: boolean;
  category: "For You" | "Fashion" | "Beauty" | "Tech" | "Footwear";
  likes: number;
  sold: number;
  location: string;
  shipsIn: string;
  caption: string;
  hashtags: string[];
  comments: number;
};

export const FEED: FeedItem[] = [
  {
    id: "p1",
    brand: "Maison Noir",
    brandHandle: "maisonnoir",
    title: "Oversized Cashmere Knit",
    drop: "Winter Capsule 🔥",
    image: feed1,
    price: 189,
    oldPrice: 240,
    currency: "$",
    stockLeft: 4,
    freeDelivery: true,
    category: "Fashion",
    likes: 12480,
  },
  {
    id: "p2",
    brand: "Volt Athletic",
    brandHandle: "voltathletic",
    title: "AirGlide 2 — Magenta Fade",
    drop: "Hyped Drop ⚡",
    image: feed2,
    price: 145,
    currency: "$",
    stockLeft: 7,
    freeDelivery: true,
    category: "Footwear",
    likes: 28910,
  },
  {
    id: "p3",
    brand: "Aurea Skin",
    brandHandle: "aureaskin",
    title: "Glow Serum — Limited Edition",
    drop: "New In ✨",
    image: feed3,
    price: 48,
    oldPrice: 62,
    currency: "$",
    stockLeft: 12,
    freeDelivery: true,
    category: "Beauty",
    likes: 5230,
  },
  {
    id: "p4",
    brand: "Nova Scent",
    brandHandle: "novascent",
    title: "Chrome 03 Eau de Parfum",
    drop: "Cult Drop 💎",
    image: feed4,
    price: 92,
    currency: "$",
    stockLeft: 3,
    freeDelivery: false,
    category: "Beauty",
    likes: 9420,
  },
  {
    id: "p5",
    brand: "Atelier Rouge",
    brandHandle: "atelierrouge",
    title: "Bordeaux Mini Tote",
    drop: "Heritage Collection 🍷",
    image: feed5,
    price: 320,
    currency: "$",
    stockLeft: 2,
    freeDelivery: true,
    category: "Fashion",
    likes: 18760,
  },
  {
    id: "p6",
    brand: "Echo Audio",
    brandHandle: "echoaudio",
    title: "Halo Pro ANC Headphones",
    drop: "Tech Drop 🎧",
    image: feed6,
    price: 279,
    oldPrice: 349,
    currency: "$",
    stockLeft: 9,
    freeDelivery: true,
    category: "Tech",
    likes: 7180,
  },
];

export const CATEGORIES = ["For You", "Fashion", "Beauty", "Tech", "Footwear"] as const;

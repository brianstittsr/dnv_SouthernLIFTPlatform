export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: BlogCategory;
  tags: string[];
  readTime: number;
  imageUrl?: string;
}

export type BlogCategory =
  | "U.S. Manufacturing"
  | "Critical Minerals"
  | "Defense Contracting & CMMC"
  | "Access to Capital"
  | "Opportunity Zones"
  | "Cross-Cutting Strategic Topics"
  | "Thought Leadership & Case Studies";

export const BLOG_CATEGORIES: BlogCategory[] = [
  "U.S. Manufacturing",
  "Critical Minerals",
  "Defense Contracting & CMMC",
  "Access to Capital",
  "Opportunity Zones",
  "Cross-Cutting Strategic Topics",
  "Thought Leadership & Case Studies",
];

export const BLOG_CTA = `
## Ready to Take the Next Step?

Whether you're a **small manufacturer seeking defense contracts**, a **government buyer looking for qualified suppliers**, or a **business owner pursuing CMMC certification**, KDM & Associates and the V+KDM Consortium are here to help.

**Join the KDM Consortium Platform today:**

- **[Register as a Supplier (SME)](/register?type=sme)** — Get matched with government contract opportunities, access capacity-building resources, and connect with prime contractors.
- **[Register as a Government Buyer](/register?type=buyer)** — Discover qualified, defense-ready small businesses and streamline your procurement process.

*Schedule a free introductory session to learn how we can accelerate your path to government contracting success.*
`;

import Script from "next/script";
import { getProgramBranding } from "@/lib/branding";

// Organization Schema
export function OrganizationJsonLd() {
  const branding = getProgramBranding();

  if (branding.isLift) {
    const liftSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: branding.siteName,
      alternateName: "Southern University MBDA LIFT Rural Business Center",
      url: branding.siteUrl,
      logo: `${branding.siteUrl}${branding.logoSrc}`,
      description: branding.siteDescription,
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "Southern University and A&M College",
        url: "https://www.sus.edu",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Baton Rouge",
        addressRegion: "LA",
        addressCountry: "US",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: branding.contactEmail,
          telephone: branding.contactPhone,
          contactType: "customer service",
          availableLanguage: ["English"],
        },
      ],
      areaServed: {
        "@type": "State",
        name: "Louisiana",
      },
      knowsAbout: [
        "Small Business Technical Assistance",
        "Rural Business Development",
        "Capital Readiness",
        "Procurement Readiness",
        "Government Contracting",
        "Advanced Manufacturing",
        "Digital & AI Adoption",
        "Rural Entrepreneurship",
      ],
      funder: {
        "@type": "GovernmentOrganization",
        name: "U.S. Department of Commerce, Minority Business Development Agency",
      },
    };

    return (
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(liftSchema) }}
      />
    );
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KDM & Associates",
    alternateName: "KDM Federal Procurement & Industrial Readiness Center",
    url: "https://kdm-assoc.com",
    logo: "https://kdm-assoc.com/kdm-logo.png",
    description:
      "KDM & Associates, LLC is a business development, government affairs, and public relations firm helping businesses become more prepared and competitive for government contracting through strategic teaming, capacity building, and mentorship.",
    foundingDate: "2020",
    founders: [
      {
        "@type": "Person",
        name: "Keith Moore",
        jobTitle: "CEO",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "300 New Jersey Avenue Northwest",
      addressLocality: "Washington",
      addressRegion: "DC",
      postalCode: "20001",
      addressCountry: "US",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+1-202-469-3423",
        contactType: "sales",
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        email: "kmoore@kdm-assoc.com",
        contactType: "customer service",
      },
    ],
    sameAs: [
      "https://www.linkedin.com/company/mbdafpcenter",
      "https://twitter.com/mbdafpcenter",
      "https://www.facebook.com/mbdafpcenter/",
      "https://www.instagram.com/mbdafpcenter",
    ],
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    knowsAbout: [
      "Government Contracting",
      "Emerging Business Enterprise",
      "Federal Procurement",
      "8(a) Certification",
      "WOSB",
      "SDVOSB",
      "HUBZone",
      "SBA Programs",
      "Mentor-Protégé Programs",
      "CMMC Certification",
      "Cybersecurity Maturity Model Certification",
      "Defense Manufacturing",
      "U.S. Manufacturing Reshoring",
      "Critical Minerals Supply Chain",
      "Rare Earth Elements",
      "Defense Industrial Base",
      "Supply Chain Resilience",
      "Opportunity Zones",
      "Access to Capital for Small Business",
      "Government Manufacturing Consulting",
      "Federal Manufacturing Contracts",
      "Aerospace Manufacturing Compliance",
      "Small Business Defense Contracts",
      "Supplier Success Workshops",
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}

// Local Business Schema (for local SEO)
export function LocalBusinessJsonLd() {
  const branding = getProgramBranding();

  if (branding.isLift) {
    const liftLocalSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: branding.siteName,
      image: `${branding.siteUrl}${branding.logoSrc}`,
      url: branding.siteUrl,
      telephone: branding.contactPhone,
      email: branding.contactEmail,
      priceRange: "Free",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Baton Rouge",
        addressRegion: "LA",
        addressCountry: "US",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "17:00",
        },
      ],
    };

    return (
      <Script
        id="localbusiness-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(liftLocalSchema) }}
      />
    );
  }

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "KDM & Associates",
    image: "https://kdm-assoc.com/kdm-logo.png",
    url: "https://kdm-assoc.com",
    telephone: "+1-202-469-3423",
    email: "info@kdm-assoc.com",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "300 New Jersey Avenue Northwest",
      addressLocality: "Washington",
      addressRegion: "DC",
      postalCode: "20001",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.8951,
      longitude: -77.0364,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "300",
    },
  };

  return (
    <Script
      id="localbusiness-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
    />
  );
}

// Service Schema
interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  provider?: string;
  areaServed?: string;
}

export function ServiceJsonLd({
  name,
  description,
  url,
  provider,
  areaServed,
}: ServiceJsonLdProps) {
  const branding = getProgramBranding();
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: provider || branding.siteName,
      url: branding.siteUrl,
    },
    areaServed: {
      "@type": "Country",
      name: areaServed || (branding.isLift ? "Louisiana" : "United States"),
    },
    serviceType: branding.isLift
      ? "Small Business Technical Assistance"
      : "Government Contracting Consulting",
  };

  return (
    <Script
      id={`service-jsonld-${name.toLowerCase().replace(/\s+/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
    />
  );
}

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  faqs: FAQItem[];
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}

// Article/Blog Schema
interface ArticleJsonLdProps {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
}: ArticleJsonLdProps) {
  const branding = getProgramBranding();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: branding.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${branding.siteUrl}${branding.logoSrc}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <Script
      id="article-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
    />
  );
}

// Blog Listing Schema (CollectionPage + ItemList)
interface BlogListItem {
  title: string;
  url: string;
  datePublished: string;
  author: string;
  excerpt: string;
}

interface BlogListJsonLdProps {
  posts: BlogListItem[];
}

export function BlogListJsonLd({ posts }: BlogListJsonLdProps) {
  const branding = getProgramBranding();
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: branding.blogTitle,
    description: branding.blogDescription,
    url: `${branding.siteUrl}/blog`,
    publisher: {
      "@type": "Organization",
      name: branding.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${branding.siteUrl}${branding.logoSrc}`,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 20).map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Article",
          headline: post.title,
          url: post.url,
          datePublished: post.datePublished,
          author: {
            "@type": "Person",
            name: post.author,
          },
          description: post.excerpt,
          publisher: {
            "@type": "Organization",
            name: branding.siteName,
          },
        },
      })),
    },
  };

  return (
    <Script
      id="blog-list-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
    />
  );
}

// WebSite Schema with SearchAction
export function WebsiteJsonLd() {
  const branding = getProgramBranding();
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: branding.siteName,
    alternateName: branding.isLift
      ? "Southern University MBDA LIFT Rural Business Center"
      : "KDM Federal Procurement & Industrial Readiness Center",
    url: branding.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${branding.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
    />
  );
}

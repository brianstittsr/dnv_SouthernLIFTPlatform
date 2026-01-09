import Script from "next/script";

// Organization Schema
export function OrganizationJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KDM & Associates",
    alternateName: "MBDA Federal Procurement Center",
    url: "https://kdm-assoc.com",
    logo: "https://kdm-assoc.com/kdm-logo.png",
    description:
      "KDM & Associates, LLC is a business development, government affairs, and public relations firm helping minority-owned businesses win government contracts through strategic teaming, capacity building, and mentorship.",
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
        email: "info@kdm-assoc.com",
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
      "Minority Business Enterprise",
      "Federal Procurement",
      "8(a) Certification",
      "WOSB",
      "SDVOSB",
      "HUBZone",
      "SBA Programs",
      "Mentor-Protégé Programs",
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
  provider = "KDM & Associates",
  areaServed = "United States",
}: ServiceJsonLdProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "Organization",
      name: provider,
      url: "https://kdm-assoc.com",
    },
    areaServed: {
      "@type": "Country",
      name: areaServed,
    },
    serviceType: "Government Contracting Consulting",
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
      name: "KDM & Associates",
      logo: {
        "@type": "ImageObject",
        url: "https://kdm-assoc.com/kdm-logo.png",
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

// WebSite Schema with SearchAction
export function WebsiteJsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KDM & Associates",
    alternateName: "MBDA Federal Procurement Center",
    url: "https://kdm-assoc.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kdm-assoc.com/search?q={search_term_string}",
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

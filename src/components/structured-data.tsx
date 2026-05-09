/**
 * JSON-LD structured data components.
 *
 * Each component renders a `<script type="application/ld+json">` block.
 * Used to make pages legible to search engines and AI assistants (AEO).
 *
 * All components return server-rendered <script> tags — no hydration cost.
 */

const BASE_URL = "https://stratus-creative.com";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${BASE_URL}/#organization`,
    name: "Stratus Creative",
    legalName: "Stratus Creative",
    url: BASE_URL,
    description:
      "Creative studio building websites, workflows, and online presence for businesses that want to look bigger than they are.",
    email: "business@stratus-creative.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Simpsonville",
      addressRegion: "SC",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    knowsAbout: [
      "Web design",
      "Web development",
      "Workflow automation",
      "AI agents",
      "AI chatbots",
      "Google Business Profile optimization",
      "Reputation management",
      "Local SEO",
    ],
    priceRange: "$$",
    sameAs: [],
    founder: { "@id": `${BASE_URL}/#person-james-farmer` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person-james-farmer`,
    name: "James Farmer",
    givenName: "James",
    familyName: "Farmer",
    jobTitle: "Founder",
    worksFor: { "@id": `${BASE_URL}/#organization` },
    url: `${BASE_URL}/about`,
    description:
      "Solo engineer behind Stratus Creative. Industrial IT engineer at Michelin, builder of Spark Analyzer (300+ users) and AI-native client work.",
    knowsAbout: [
      "Next.js",
      "AI workflows",
      "AI agents",
      "Production engineering",
      "Apache Kafka",
      "Cost-aware AI orchestration",
      "Local SEO",
      "Web performance",
    ],
    sameAs: [
      "https://linkedin.com/in/ja-farmer",
      "https://alecfarmer.com",
    ],
    alumniOf: { "@type": "Organization", name: "Michelin North America" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Stratus Creative",
    description:
      "Websites, workflows, and online presence for businesses that want to look bigger than they are.",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ServiceJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Creative agency services",
    provider: { "@id": `${BASE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Stratus Creative offerings",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Starter Website Build",
          description:
            "Productized website for solo operators and local service businesses. Single-page or compact multi-page site.",
          price: 1495,
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Custom Website / Workflow Engagement",
          description:
            "Custom-quoted multi-page sites, automation, AI tools, and online presence systems.",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: 5000,
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          name: "AI Care · Light",
          description:
            "Monitoring, small fixes, and model upgrades for light-volume single-purpose AI workflows.",
          price: 199,
          priceCurrency: "USD",
          eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "AI Care · Standard",
          description:
            "Care for multi-step AI workflows with memory, integrations, or moderate volume.",
          price: 399,
          priceCurrency: "USD",
          eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "AI Care · Pro",
          description:
            "White-glove care for high-volume or complex multi-agent AI systems.",
          price: 899,
          priceCurrency: "USD",
          eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "Hosting & Maintenance",
          description:
            "Managed hosting on Vercel, SSL, uptime monitoring, security updates.",
          price: 49,
          priceCurrency: "USD",
          eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "Hosting + Monthly Updates",
          description:
            "Managed hosting plus up to 2 content updates per month and priority support.",
          price: 99,
          priceCurrency: "USD",
          eligibleDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        },
        {
          "@type": "Offer",
          name: "Process automation project",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: 3000,
            maxPrice: 8000,
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          name: "AI agent or chatbot build",
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: 5000,
            maxPrice: 15000,
            priceCurrency: "USD",
          },
        },
        {
          "@type": "Offer",
          name: "AI Care · Light",
          price: 199,
          priceCurrency: "USD",
          category: "Subscription",
        },
        {
          "@type": "Offer",
          name: "AI Care · Standard",
          price: 399,
          priceCurrency: "USD",
          category: "Subscription",
        },
        {
          "@type": "Offer",
          name: "AI Care · Pro",
          price: 899,
          priceCurrency: "USD",
          category: "Subscription",
        },
        {
          "@type": "Offer",
          name: "Google Business Profile setup",
          price: 250,
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Reputation & reviews management",
          price: 149,
          priceCurrency: "USD",
          category: "Subscription",
        },
        {
          "@type": "Offer",
          name: "AI Chat Widget",
          price: 800,
          priceCurrency: "USD",
        },
      ],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function CostEstimatorJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Workflow Cost Estimator",
    url: `${BASE_URL}/tools/cost-estimator`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    description:
      "Free interactive tool to estimate the monthly cost of an AI workflow — LLM API calls, third-party APIs, vector storage, and ongoing care fees.",
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    creator: { "@id": `${BASE_URL}/#organization` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FaqJsonLd({ items }: { items: Array<{ q: string; a: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#localbusiness`,
    name: "Stratus Creative",
    image: `${BASE_URL}/opengraph-image`,
    url: BASE_URL,
    email: "business@stratus-creative.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Simpsonville",
      addressRegion: "SC",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 34.7367,
      longitude: -82.2540,
    },
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "AdministrativeArea", name: "South Carolina" },
    ],
    priceRange: "$$",
    openingHours: "Mo-Fr 09:00-18:00",
    sameAs: ["https://linkedin.com/in/ja-farmer"],
    knowsAbout: [
      "Web design",
      "Web development",
      "Workflow automation",
      "AI agents",
      "AI chatbots",
      "Google Business Profile optimization",
      "Reputation management",
      "Local SEO",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  date,
  slug,
  tags,
}: {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags?: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Person",
      name: "James Farmer",
      url: BASE_URL,
    },
    publisher: { "@id": `${BASE_URL}/#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/notes/${slug}`,
    },
    keywords: tags?.join(", "),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

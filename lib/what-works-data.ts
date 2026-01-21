/**
 * What Works Content Data
 * Articles, podcasts, videos, and newsletters from the What Works series
 */

export interface WhatWorksArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string;
  publishedDate: Date;
  category: 'Podcast' | 'Video' | 'Newsletter' | 'Article' | 'Interview';
  tags: string[];
  featuredImage?: string;
  videoUrl?: string;
  videoEmbedId?: string; // YouTube video ID
  podcastUrl?: string;
  duration?: string;
  featured?: boolean;
}

export const whatWorksArticles: WhatWorksArticle[] = [
  {
    id: '1',
    slug: 'mbda-fpc-podcast-series-kimberly-johnston',
    title: 'MBDA FPC Podcast Series – Kimberly Johnston',
    excerpt: 'Timothy sits down with the President of Next Gen Energy Partners to discuss her pioneering work in Energy, from microgrids, carbon reduction to job creation.',
    content: `Timothy sits down with the President of Next Gen Energy Partners to discuss her pioneering work in Energy, from microgrids, carbon reduction to job creation. Johnston also shares how critical her relationship is with MBDA FPC for American and Global energy sustainability.

## About the Guest

Kimberly Johnston is the President of Next Gen Energy Partners, a company focused on innovative energy solutions including microgrids, carbon reduction technologies, and sustainable job creation in the energy sector.

## Key Topics Discussed

- **Microgrids and Energy Independence**: How distributed energy systems are transforming power delivery
- **Carbon Reduction Strategies**: Practical approaches to reducing carbon footprints in energy production
- **Job Creation in Clean Energy**: The economic opportunities in the renewable energy sector
- **MBDA FPC Partnership**: How the Minority Business Development Agency Federal Procurement Center supports energy sustainability initiatives

## Impact and Insights

This conversation highlights the critical intersection of minority business development, energy innovation, and federal procurement opportunities. Johnston's work demonstrates how MBEs can lead in the clean energy transition while creating economic opportunities in their communities.`,
    author: 'KDM & Associates',
    publishedDate: new Date('2025-05-28'),
    category: 'Podcast',
    tags: ['Energy', 'Sustainability', 'Microgrids', 'Carbon Reduction', 'Job Creation', 'MBDA'],
    featuredImage: '/images/what-works/kimberly-johnston-podcast.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    videoEmbedId: 'example1',
    duration: '45:30',
    featured: true
  },
  {
    id: '2',
    slug: 'what-works-international-womens-month-miranda-bouldin',
    title: "What Works International Women's Month – Miranda Bouldin",
    excerpt: 'Celebrating International Women\'s Month with Miranda Bouldin, discussing her journey and contributions to minority business development.',
    content: `In celebration of International Women's Month, we sit down with Miranda Bouldin to discuss her remarkable journey in business development and her contributions to empowering minority-owned enterprises.

## About Miranda Bouldin

Miranda Bouldin is a leader in business development and has been instrumental in creating pathways for minority and women-owned businesses to access federal contracting opportunities.

## Key Discussion Points

- **Breaking Barriers**: Overcoming challenges as a woman in government contracting
- **Mentorship and Leadership**: The importance of supporting the next generation of women entrepreneurs
- **Business Development Strategies**: Proven approaches for MBEs and WBEs to grow their federal contracting portfolios
- **International Women's Month**: Celebrating achievements and looking forward to continued progress

## Inspiration and Impact

Miranda's story serves as an inspiration for women entrepreneurs navigating the complex landscape of federal procurement. Her insights provide practical guidance for building successful businesses while maintaining a commitment to diversity and inclusion.`,
    author: 'KDM & Associates',
    publishedDate: new Date('2024-03-15'),
    category: 'Interview',
    tags: ['Women in Business', 'International Womens Month', 'Leadership', 'Mentorship', 'Federal Contracting'],
    featuredImage: '/images/what-works/miranda-bouldin.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    videoEmbedId: 'example2',
    duration: '38:15'
  },
  {
    id: '3',
    slug: 'gaurrav-bhat-founder-ceo-talin-labs',
    title: 'Gaurrav Bhat, Founder and CEO of Talin Labs',
    excerpt: 'An in-depth conversation with Gaurrav Bhat about innovation, technology, and building a successful tech company.',
    content: `Join us for an engaging conversation with Gaurrav Bhat, Founder and CEO of Talin Labs, as he shares his entrepreneurial journey and insights into building a successful technology company in the competitive federal contracting space.

## About Talin Labs

Talin Labs is a technology company focused on delivering innovative solutions to government and commercial clients. Under Gaurrav's leadership, the company has grown to become a recognized player in the tech sector.

## Topics Covered

- **Entrepreneurial Journey**: From startup to established tech company
- **Innovation in Government Technology**: Bringing cutting-edge solutions to federal agencies
- **Scaling a Tech Business**: Strategies for growth and sustainability
- **Federal Contracting for Tech Companies**: Navigating procurement processes and building relationships
- **Future of Technology**: Emerging trends and opportunities

## Key Takeaways

Gaurrav's experience demonstrates that with the right combination of innovation, persistence, and strategic partnerships, minority-owned tech companies can compete and win in the federal marketplace. His insights are valuable for any entrepreneur looking to break into government contracting.`,
    author: 'KDM & Associates',
    publishedDate: new Date('2024-02-10'),
    category: 'Interview',
    tags: ['Technology', 'Entrepreneurship', 'Innovation', 'Federal Contracting', 'Startups'],
    featuredImage: '/images/what-works/gaurrav-bhat.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    videoEmbedId: 'example3',
    duration: '52:20',
    featured: true
  },
  {
    id: '4',
    slug: 'podcast-change-with-franklin-covey-director-dr-christi-phillips',
    title: 'PODCAST: Change with Franklin Covey Director, Dr. Christi Phillips',
    excerpt: 'Dr. Christi Phillips discusses organizational change, leadership development, and the principles that drive successful transformation.',
    content: `In this enlightening podcast episode, we speak with Dr. Christi Phillips, Director at Franklin Covey, about the principles of effective change management and leadership development in today's dynamic business environment.

## About Dr. Christi Phillips

Dr. Christi Phillips is a Director at Franklin Covey, one of the world's leading organizations in leadership development and organizational change. Her expertise spans change management, leadership training, and organizational effectiveness.

## Discussion Highlights

- **The Science of Change**: Understanding how organizations and individuals adapt to transformation
- **Leadership in Times of Change**: Essential skills for leaders navigating uncertainty
- **Franklin Covey Principles**: Applying proven methodologies to business challenges
- **Building Effective Teams**: Creating cultures that embrace change and innovation
- **Personal Development**: Strategies for continuous growth and improvement

## Practical Applications

Dr. Phillips shares actionable insights that business leaders can implement immediately to improve their organizations' capacity for change. Her expertise is particularly valuable for MBEs looking to scale their operations and compete more effectively in the federal marketplace.

## Key Lessons

- Change is a process, not an event
- Leadership development is essential for organizational success
- Effective communication is the foundation of successful transformation
- Building trust and psychological safety enables innovation`,
    author: 'KDM & Associates',
    publishedDate: new Date('2024-01-25'),
    category: 'Podcast',
    tags: ['Leadership', 'Change Management', 'Organizational Development', 'Franklin Covey', 'Business Transformation'],
    featuredImage: '/images/what-works/christi-phillips.jpg',
    podcastUrl: 'https://example.com/podcast/christi-phillips',
    duration: '48:45'
  },
  {
    id: '5',
    slug: 'what-works-news-u-can-use-newsletter-june-2024',
    title: 'What Works News U Can Use Newsletter – June 2024',
    excerpt: 'Monthly newsletter featuring the latest updates, opportunities, and insights for minority-owned businesses in federal contracting.',
    content: `Welcome to the June 2024 edition of What Works News U Can Use, your monthly source for timely information, opportunities, and insights in federal contracting and minority business development.

## In This Issue

### Featured Opportunities
- New IDIQ contracts open for bidding
- Set-aside opportunities for 8(a) and HUBZone businesses
- Upcoming procurement forecasts from major agencies

### Success Stories
- MBE wins $15M contract with Department of Defense
- Small business partnership leads to major infrastructure project
- Veteran-owned business expands through mentor-protégé program

### Training and Events
- Federal Contracting 101 Webinar Series
- Capability Statement Workshop
- Networking Mixer with Prime Contractors

### Industry Insights
- Trends in federal procurement
- New regulations affecting small businesses
- Technology adoption in government contracting

### Resources and Tools
- Updated SAM.gov registration guide
- Capability statement templates
- Proposal writing best practices

## Stay Connected

Subscribe to receive monthly updates and never miss an opportunity to grow your federal contracting business.`,
    author: 'KDM & Associates',
    publishedDate: new Date('2024-06-01'),
    category: 'Newsletter',
    tags: ['Newsletter', 'Federal Contracting', 'Opportunities', 'Resources', 'Monthly Update'],
    featuredImage: '/images/what-works/newsletter-june-2024.jpg'
  },
  {
    id: '6',
    slug: 'what-works-news-u-can-use-newsletter-may-2024',
    title: 'What Works News U Can Use Newsletter – May 2024',
    excerpt: 'May 2024 newsletter with updates on federal contracting opportunities, success stories, and upcoming events.',
    content: `The May 2024 edition of What Works News U Can Use brings you the latest developments in federal contracting, success stories from the MBE community, and upcoming opportunities to grow your business.

## Highlights This Month

### Major Contract Awards
- Infrastructure projects totaling $500M announced
- New technology contracts for cybersecurity services
- Construction opportunities in multiple states

### Policy Updates
- SBA announces new initiatives for small businesses
- Updated guidelines for 8(a) program participants
- Changes to HUBZone certification requirements

### Upcoming Events
- IAEOZ Summit 2024 registration opens
- Regional matchmaking events across the country
- Virtual training sessions on proposal development

### Expert Insights
- Interview with successful government contractor
- Tips for building relationships with prime contractors
- Understanding past performance requirements

### Community Spotlight
- MBE of the Month feature
- Partnership success story
- New member introductions

## Resources

Access our library of templates, guides, and tools to support your federal contracting journey.`,
    author: 'KDM & Associates',
    publishedDate: new Date('2024-05-01'),
    category: 'Newsletter',
    tags: ['Newsletter', 'Federal Contracting', 'Policy Updates', 'Events', 'Resources'],
    featuredImage: '/images/what-works/newsletter-may-2024.jpg'
  }
];

export function getWhatWorksArticleBySlug(slug: string): WhatWorksArticle | undefined {
  return whatWorksArticles.find(article => article.slug === slug);
}

export function getWhatWorksArticlesByCategory(category: WhatWorksArticle['category']): WhatWorksArticle[] {
  return whatWorksArticles.filter(article => article.category === category);
}

export function getWhatWorksArticlesByTag(tag: string): WhatWorksArticle[] {
  return whatWorksArticles.filter(article => article.tags.includes(tag));
}

export function getFeaturedWhatWorksArticles(): WhatWorksArticle[] {
  return whatWorksArticles.filter(article => article.featured);
}

export function getAllWhatWorksTags(): string[] {
  const tags = new Set<string>();
  whatWorksArticles.forEach(article => {
    article.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getSortedWhatWorksArticles(): WhatWorksArticle[] {
  return [...whatWorksArticles].sort((a, b) => 
    b.publishedDate.getTime() - a.publishedDate.getTime()
  );
}

export function getAllWhatWorksCategories(): WhatWorksArticle['category'][] {
  return ['Podcast', 'Video', 'Newsletter', 'Article', 'Interview'];
}

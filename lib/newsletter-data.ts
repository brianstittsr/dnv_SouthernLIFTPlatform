/**
 * Newsletter Data
 * Monthly newsletters and special editions from KDM & Associates
 */

export interface Newsletter {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  publishedDate: Date;
  volume?: string;
  issue?: string;
  featuredImage: string;
  pdfUrl?: string;
  content: {
    sections: {
      title: string;
      content: string;
    }[];
  };
  highlights: string[];
  tags: string[];
  category: 'Monthly' | 'Special Edition' | 'Annual Report' | 'Policy Brief';
}

export const newsletters: Newsletter[] = [
  {
    id: '1',
    slug: 'navigating-federal-policy-shifts-january-2025',
    title: 'Navigating Federal Policy Shifts',
    subtitle: 'Strategies for What Works to Advance Small Business Growth and Resilience in an "Opportunity for All" Trump Administration',
    description: 'Comprehensive analysis of federal policy changes and their impact on minority-owned businesses in the new administration.',
    publishedDate: new Date('2025-01-01'),
    volume: 'Vol 1',
    issue: 'January 2025 Issue',
    featuredImage: '/images/newsletters/federal-policy-shifts-jan-2025.jpg',
    category: 'Monthly',
    highlights: [
      'Federal policy analysis for small businesses',
      'Strategies for navigating the Trump administration',
      'Opportunities for minority-owned businesses',
      'Resilience building in changing policy landscape'
    ],
    tags: ['Federal Policy', 'Small Business', 'Trump Administration', 'Growth Strategies'],
    content: {
      sections: [
        {
          title: 'Executive Summary',
          content: 'As we enter a new administration, small businesses face both challenges and opportunities. This newsletter provides strategic guidance on navigating federal policy shifts while maintaining growth and resilience.'
        },
        {
          title: 'Key Policy Changes',
          content: 'The Trump administration has signaled several policy priorities that will impact small businesses, particularly in government contracting, tax policy, and regulatory reform.'
        },
        {
          title: 'What Works: Strategic Recommendations',
          content: 'Based on our analysis, we recommend that minority-owned businesses focus on building strong relationships with federal agencies, diversifying their contract portfolios, and investing in capability development.'
        },
        {
          title: 'Opportunities Ahead',
          content: 'Despite uncertainty, the "Opportunity for All" framework presents significant opportunities for small businesses to expand their federal contracting presence and contribute to economic growth.'
        }
      ]
    }
  },
  {
    id: '2',
    slug: 'mbe-success-2024-highlights',
    title: 'A Year of Achievement: MBE Success and Key Takeaways from 2024',
    subtitle: 'At the MBDA Federal Procurement Center - 2024 Highlights',
    description: 'Celebrating a year of success stories, contract wins, and milestones achieved by minority-owned businesses through the MBDA Federal Procurement Center.',
    publishedDate: new Date('2024-12-01'),
    volume: 'Vol 1',
    issue: 'December 2024 Issue',
    featuredImage: '/images/newsletters/mbe-success-2024.jpg',
    category: 'Annual Report',
    highlights: [
      'Major contract wins by MBEs',
      'Success stories from 2024',
      'Key statistics and achievements',
      'Lessons learned and best practices'
    ],
    tags: ['MBE', 'Success Stories', '2024 Highlights', 'MBDA FPC'],
    content: {
      sections: [
        {
          title: '2024 By The Numbers',
          content: 'This year, the MBDA Federal Procurement Center helped minority-owned businesses secure over $500 million in federal contracts, supporting thousands of jobs and driving economic growth in underserved communities.'
        },
        {
          title: 'Success Stories',
          content: 'From small startups to established firms, MBEs across the country achieved remarkable success in 2024. We highlight several inspiring stories of businesses that overcame challenges and won significant contracts.'
        },
        {
          title: 'Key Takeaways',
          content: 'The most successful MBEs in 2024 shared common traits: strong capability statements, strategic partnerships, persistent business development efforts, and a commitment to excellence in contract performance.'
        },
        {
          title: 'Looking Ahead to 2025',
          content: 'Building on 2024\'s momentum, we\'re excited about the opportunities ahead. New initiatives, expanded services, and continued support will help even more MBEs succeed in federal contracting.'
        }
      ]
    }
  },
  {
    id: '3',
    slug: 'celebrating-23-years-kdm',
    title: 'Celebrating 23 Years of KDM: Championing MBEs in Government Contracting',
    subtitle: 'August 2024 Issue - KDM & MBDA FPC',
    description: 'Commemorating 23 years of KDM & Associates\' dedication to empowering minority-owned businesses in federal contracting.',
    publishedDate: new Date('2024-08-01'),
    volume: 'Vol 1',
    issue: 'August 2024 Issue',
    featuredImage: '/images/newsletters/kdm-23-years.jpg',
    category: 'Special Edition',
    highlights: [
      '23 years of supporting MBEs',
      'Milestones and achievements',
      'Evolution of services',
      'Future vision and commitment'
    ],
    tags: ['Anniversary', 'KDM History', 'MBE Support', 'Milestone'],
    content: {
      sections: [
        {
          title: 'A Legacy of Service',
          content: 'For 23 years, KDM & Associates has been at the forefront of helping minority-owned businesses navigate the complex world of federal contracting. Our journey has been marked by countless success stories and lasting partnerships.'
        },
        {
          title: 'Evolution and Growth',
          content: 'From our humble beginnings to becoming a trusted partner of the MBDA Federal Procurement Center, we\'ve continuously evolved our services to meet the changing needs of minority-owned businesses.'
        },
        {
          title: 'Impact and Achievements',
          content: 'Over two decades, we\'ve helped thousands of MBEs secure billions in federal contracts, creating jobs and economic opportunities in communities across the nation.'
        },
        {
          title: 'Our Commitment Moving Forward',
          content: 'As we celebrate this milestone, we renew our commitment to championing MBEs in government contracting, providing the tools, training, and support needed for continued success.'
        }
      ]
    }
  },
  {
    id: '4',
    slug: 'what-works-news-july-2024',
    title: 'What Works News U Can Use July Newsletter',
    description: 'Monthly roundup of opportunities, insights, and resources for minority-owned businesses in federal contracting.',
    publishedDate: new Date('2024-07-01'),
    volume: 'Vol 1',
    issue: 'July 2024',
    featuredImage: '/images/newsletters/what-works-july-2024.jpg',
    category: 'Monthly',
    highlights: [
      'Latest federal contracting opportunities',
      'Training and workshop announcements',
      'Success tips and best practices',
      'Upcoming events and deadlines'
    ],
    tags: ['What Works', 'Monthly Update', 'Opportunities', 'Resources'],
    content: {
      sections: [
        {
          title: 'Featured Opportunities',
          content: 'This month\'s newsletter highlights several high-value contract opportunities across multiple agencies, including infrastructure, technology, and professional services contracts.'
        },
        {
          title: 'Training and Events',
          content: 'Join us for upcoming workshops on proposal writing, capability statement development, and networking events with federal buyers.'
        },
        {
          title: 'What Works This Month',
          content: 'Learn from successful MBEs who recently won contracts. Discover the strategies and approaches that led to their success.'
        },
        {
          title: 'Resources and Tools',
          content: 'Access our latest templates, guides, and tools to help you compete more effectively in the federal marketplace.'
        }
      ]
    }
  },
  {
    id: '5',
    slug: 'juneteenth-justice-minority-businesses',
    title: 'Juneteenth and Justice: How Minority Businesses Contribute to Equitable Economic Growth',
    subtitle: 'June 2024 Newsletter - MBDA FPC',
    description: 'Exploring the connection between Juneteenth, economic justice, and the vital role of minority-owned businesses in building equitable prosperity.',
    publishedDate: new Date('2024-06-19'),
    volume: 'Vol 1',
    issue: 'June 2024 - Juneteenth Special',
    featuredImage: '/images/newsletters/juneteenth-justice-2024.jpg',
    category: 'Special Edition',
    highlights: [
      'Juneteenth significance and economic justice',
      'MBE contributions to equitable growth',
      'Historical context and modern impact',
      'Pathways to economic empowerment'
    ],
    tags: ['Juneteenth', 'Economic Justice', 'MBE Impact', 'Equity'],
    content: {
      sections: [
        {
          title: 'Juneteenth: A Day of Freedom and Economic Promise',
          content: 'Juneteenth commemorates the end of slavery in the United States and represents the ongoing journey toward economic freedom and equity. Today, minority-owned businesses are at the forefront of this journey.'
        },
        {
          title: 'Economic Justice Through Entrepreneurship',
          content: 'Minority-owned businesses are engines of economic growth, creating jobs, building wealth, and revitalizing communities. Their success is essential to achieving true economic justice.'
        },
        {
          title: 'Breaking Barriers in Federal Contracting',
          content: 'Federal contracting provides a pathway to economic empowerment for minority businesses. By securing government contracts, MBEs can scale their operations and create lasting impact.'
        },
        {
          title: 'Building an Equitable Future',
          content: 'As we celebrate Juneteenth, we recommit to supporting minority-owned businesses in their pursuit of economic success and contributing to a more equitable economy for all.'
        }
      ]
    }
  },
  {
    id: '6',
    slug: 'may-showers-success-2024',
    title: 'May Showers of Success: Government Contracting Triumphs and Celebrations',
    subtitle: 'May 2024 Issue - Celebrating Wins',
    description: 'Highlighting recent contract wins, success stories, and celebrating the achievements of minority-owned businesses in government contracting.',
    publishedDate: new Date('2024-05-01'),
    volume: 'Vol 1',
    issue: 'May 2024',
    featuredImage: '/images/newsletters/may-success-2024.jpg',
    category: 'Monthly',
    highlights: [
      'Recent contract wins',
      'Success celebrations',
      'Winning strategies revealed',
      'Community achievements'
    ],
    tags: ['Success Stories', 'Contract Wins', 'Celebrations', 'Best Practices'],
    content: {
      sections: [
        {
          title: 'Celebrating Recent Wins',
          content: 'May brought a wave of success for minority-owned businesses, with several major contract awards across various agencies. We celebrate these achievements and the hard work that made them possible.'
        },
        {
          title: 'Success Strategies',
          content: 'What led to these wins? We analyze the strategies, partnerships, and preparation that positioned these businesses for success in competitive procurements.'
        },
        {
          title: 'Community Impact',
          content: 'These contract wins represent more than business success—they mean jobs, economic growth, and strengthened communities. We highlight the broader impact of these achievements.'
        },
        {
          title: 'Lessons Learned',
          content: 'From proposal development to contract performance, we share key lessons that other MBEs can apply to their own federal contracting pursuits.'
        }
      ]
    }
  }
];

export function getNewsletterBySlug(slug: string): Newsletter | undefined {
  return newsletters.find(newsletter => newsletter.slug === slug);
}

export function getNewslettersByCategory(category: Newsletter['category']): Newsletter[] {
  return newsletters.filter(newsletter => newsletter.category === category);
}

export function getNewslettersByTag(tag: string): Newsletter[] {
  return newsletters.filter(newsletter => newsletter.tags.includes(tag));
}

export function getSortedNewsletters(): Newsletter[] {
  return [...newsletters].sort((a, b) => 
    b.publishedDate.getTime() - a.publishedDate.getTime()
  );
}

export function getAllNewsletterTags(): string[] {
  const tags = new Set<string>();
  newsletters.forEach(newsletter => {
    newsletter.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

export function getAllNewsletterCategories(): Newsletter['category'][] {
  return ['Monthly', 'Special Edition', 'Annual Report', 'Policy Brief'];
}

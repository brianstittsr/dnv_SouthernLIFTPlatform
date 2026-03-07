export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientTitle: string;
  companyName: string;
  companyIndustry: string;
  companyLogoUrl?: string;
  rating?: number;
  featured?: boolean;
  isActive: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialInput {
  quote: string;
  clientName: string;
  clientTitle: string;
  companyName: string;
  companyIndustry: string;
  companyLogoUrl?: string;
  rating?: number;
  featured?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateTestimonialInput extends Partial<CreateTestimonialInput> {
  id: string;
}

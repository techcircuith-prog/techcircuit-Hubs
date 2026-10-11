export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  college?: string;
  year?: string;
  department?: string;
  phone?: string;
  interests?: string[];
  collegeId?: string;
  onboarded: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'VLSI' | 'Embedded' | 'Circuits' | 'Signal Processing' | 'Software/Tools' | 'Communication';
}

export type OpportunityType = 'internship' | 'training' | 'hackathon';
export type OpportunityMode = 'Remote' | 'On-site' | 'Hybrid';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  description: string;
  skillIds: string[];
  location: string;
  mode: OpportunityMode;
  stipendOrFee: string;
  deadline: string;
  applyLink: string;
  status: 'draft' | 'published';
  createdAt: string;
}

export type ApplicationStatus = 'saved' | 'applied' | 'shortlisted' | 'completed';

export interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  status: ApplicationStatus;
  appliedAt?: string;
  shortlistedAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  certificateSubmitted?: boolean;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSkill {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  category?: string;
  points: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  updatedAt: string;
}

export interface Badge {
  id: string;
  userId: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number; // in INR
  type: 'digital' | 'physical';
  files?: { name: string; url: string; size: string }[];
  stock?: number;
  skillIds: string[];
  status: 'draft' | 'published';
  createdAt: string;
}

export interface CartItem {
  projectId: string;
  title: string;
  price: number;
  type: 'digital' | 'physical';
  image?: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: CartItem[];
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'shipped' | 'delivered';
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentSessionId?: string;
  cfOrderId?: string;
  createdAt: string;
  paidAt?: string;
}

export type ResourceType = 'video' | 'playlist' | 'notes' | 'article' | 'datasheet' | 'tool' | 'book' | 'cheatsheet' | 'paper';

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  url: string;
  thumbnailUrl?: string;
  source: string;
  durationMin?: number;
  category: string;
  skillIds: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'English' | 'Tamil' | 'Hindi' | 'Other';
  isFree: boolean;
  status: 'draft' | 'published';
  createdBy?: string;
  createdAt: string;
  brokenFlag?: boolean;
}

export interface ResourceProgress {
  id: string;
  userId: string;
  resourceId: string;
  bookmarked: boolean;
  completed: boolean;
  completedAt?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  resourceIds: string[];
  status: 'draft' | 'published';
  createdAt: string;
}

export interface ComponentOffer {
  distributor: string;
  sku: string;
  unitPrice: number;
  currency: string;
  stock: number;
  moq: number;
  priceBreaks: { quantity: number; price: number }[];
  clickUrl: string;
  isLowestPrice?: boolean;
}

export interface ComponentSearchResponse {
  partNumber: string;
  description: string;
  manufacturer: string;
  offers: ComponentOffer[];
  cached: boolean;
  quotaRemaining?: number;
}

export interface ScoringConfig {
  applied: number;
  shortlisted: number;
  completed: number;
  certificateUploaded: number;
  projectPurchased: number;
  resourceCompleted: number;
  dailyResourceCap: number;
}

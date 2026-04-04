export type PropertyStatus = 'active' | 'inactive' | 'draft' | 'sold' | 'ready';
export type LeadStatus = 'new' | 'qualified' | 'follow_up' | 'won' | 'lost';
export type QueueStatus = 'draft' | 'review' | 'ready' | 'published';
export type AssessmentStatus = 'pending' | 'scheduled' | 'completed';
export type TaskStatus = 'todo' | 'in_progress' | 'approved';
export type Priority = 'low' | 'medium' | 'high';

export type DashboardStats = {
  totalProperties: number;
  activeListings: number;
  totalLeads: number;
  pendingAssessments: number;
  openTasks: number;
  conversionRate: number;
};

export type Property = {
  _id?: string;
  title: string;
  buildingName?: string;
  metaTitle?: string;
  slug?: string;
  metaDescription?: string;
  type?: string;
  subType?: string;
  metaKeywords?: string;
  developer?: string;
  developerType?: string;
  shortDescription?: string;
  category: string;
  city?: string;
  fullDescription?: string;
  appDescription?: string;
  location: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  propertyStatus?: string;
  visibility?: 'mobile' | 'web' | 'both';
  price: number;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  thumbnail?: string;
  gallery?: string[];
  enquireFormImage?: string;
  featured?: boolean;
  active?: boolean;
  hotLaunch?: boolean;
  exclusive?: boolean;
  sortOrder?: number;
  tag?: string;
  url?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ContactQueueItem = {
  _id?: string;
  title: string;
  category: string;
  owner: string;
  updatedAt: string;
  status: QueueStatus;
  priority: Priority;
};

export type FieldMapping = {
  _id?: string;
  sourceField: string;
  targetField: string;
  sourceType: string;
  targetType: string;
  active: boolean;
  notes?: string;
};

export type Lead = {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  budget?: number;
  stage?: string;
  lastTouch?: string;
  assignedTo?: string;
};

export type ScreeningQuestion = {
  _id?: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'toggle';
  required: boolean;
  helper?: string;
  options?: string[];
};

export type Assessment = {
  _id?: string;
  title: string;
  owner: string;
  property: string;
  requestedAt: string;
  status: AssessmentStatus;
};

export type AssessmentRequest = {
  _id?: string;
  name: string;
  city: string;
  budget: string;
  intent: string;
  stage: 'cold' | 'warm' | 'hot';
  avatar: string;
};

export type TaskCard = {
  _id?: string;
  title: string;
  description: string;
  owner: string;
  dueDate: string;
  status: TaskStatus;
};

export type BrandAsset = {
  _id?: string;
  name: string;
  type: string;
  updatedAt: string;
  size: string;
  url?: string;
};

export type IconItem = {
  _id?: string;
  label: string;
  glyph: string;
  category?: string;
};

export type Playbook = {
  _id?: string;
  title: string;
  summary: string;
  updatedAt: string;
  status: 'active' | 'draft';
};

export type AboutSettings = {
  _id?: string;
  companyName: string;
  headline: string;
  primaryEmail: string;
  supportNumber: string;
  location: string;
  website: string;
  overview: string;
  mission: string;
};

export type PlatformSettings = {
  _id?: string;
  theme: string;
  currency: string;
  timezone: string;
  notifications: boolean;
  brandName: string;
};

export type WorkspaceSnapshot = {
  stats: DashboardStats;
  properties: Property[];
  contactQueues: ContactQueueItem[];
  leads: Lead[];
  screeningQuestions: ScreeningQuestion[];
  pendingAssessments: Assessment[];
  assessmentRequests: AssessmentRequest[];
  tasks: TaskCard[];
  brandAssets: BrandAsset[];
  icons: IconItem[];
  playbooks: Playbook[];
  about: AboutSettings;
};

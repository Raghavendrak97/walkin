/**
 * WALKIN - Type Definitions
 * Complete recruitment platform supporting Candidate, Recruiter, and Administrator portals.
 */

export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface CandidateProfile extends User {
  role: 'candidate';
  currentQualification: string;
  experienceYears: number;
  currentCity: string;
  bio: string;
  skills: string[];
  isPremium: boolean;
  premiumExpiresAt?: string;
  applicationCredits: number;
}

export type RecruiterVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface RecruiterProfile extends User {
  role: 'recruiter';
  designation: string;
  officialCompanyEmail: string;
  recruiterLinkedIn: string; // Mandatory
  companyId: string;
  verificationStatus: RecruiterVerificationStatus;
  rejectionReason?: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  website: string; // Mandatory
  companyLinkedIn?: string;
  address: string;
  city: string;
  industry: string;
  companySize: string;
  isVerified: boolean;
  officialDomain: string; // e.g. "tcs.com", "medilife.com"
  createdAt: string;
}

export interface CandidateResume {
  id: string;
  candidateId: string;
  name: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  isDefault: boolean;
  contentSnippet?: string;
  fileData?: string; // base64 or simulated private file reference
}

export type EmploymentCategory = 
  | 'third_party_payroll'
  | 'direct_company_payroll'
  | 'contractual';

export interface ThirdPartyPayrollInfo {
  staffingAgencyName: string;
  actualClientName: string;
  workLocation: string;
}

export type WalkInMode = 'candidate_selected' | 'open_walkin';

export interface WalkInInterviewSettings {
  mode: WalkInMode;
  venueName: string;
  fullAddress: string;
  googleMapsUrl: string; // Standard external link
  interviewDateStart: string;
  interviewDateEnd: string;
  startTime: string;
  endTime: string;
  instructions: string;
  requiredDocuments: string[];
}

export interface ScreeningQuestion {
  id: string;
  questionText: string;
  order: 1 | 2 | 3;
}

export type JobStatus = 'active' | 'closed' | 'draft' | 'flagged';

export interface JobVacancy {
  id: string;
  recruiterId: string;
  companyId: string;
  title: string;
  department: string;
  jobDescription: string;
  responsibilities: string[];
  requiredSkills: string[];
  expMinYears: number;
  expMaxYears: number;
  openings: number;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: 'month' | 'year';
  city: string;
  locality: string;
  workLocation: 'On-site' | 'Hybrid';
  applicationDeadline: string;
  
  // Employment category
  employmentCategory: EmploymentCategory;
  thirdPartyInfo?: ThirdPartyPayrollInfo;
  
  // Qualifications (Mandatory searchable + custom)
  qualifications: string[];
  
  // Walk-in Interview settings (Mode A or Mode B)
  walkInSettings: WalkInInterviewSettings;
  
  // Exactly 3 Screening Questions
  screeningQuestions: [ScreeningQuestion, ScreeningQuestion, ScreeningQuestion];
  
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'applied'
  | 'viewed'
  | 'shortlisted'
  | 'rejected'
  | 'interview_scheduled'
  | 'selected'
  | 'not_attended'
  | 'withdrawn';

export interface ApplicationAnswer {
  questionId: string;
  questionText: string;
  answerText: string; // 1 to 3 words strictly enforced
  wordCount: number;
}

export interface ApplicationStatusHistory {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
  updatedBy: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  companyId: string;
  
  // Immutable snapshot of resume submitted
  resumeSnapshot: CandidateResume;
  
  // Exactly 3 screening answers
  screeningAnswers: [ApplicationAnswer, ApplicationAnswer, ApplicationAnswer];
  
  status: ApplicationStatus;
  statusHistory: ApplicationStatusHistory[];
  
  appliedAt: string;
  updatedAt: string;
  
  // Venue authorization check: true if open walk-in OR shortlisted/scheduled
  isVenueUnlocked: boolean;
}

export type AttendanceStatus = 'scheduled' | 'attended' | 'absent' | 'selected' | 'on_hold';

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  jobId: string;
  candidateId: string;
  recruiterId: string;
  interviewDate: string;
  interviewTime: string;
  roundName: string; // e.g. "Round 1 - Technical Assessment", "HR Final Round"
  interviewerName: string;
  venueSnapshot: {
    venueName: string;
    fullAddress: string;
    googleMapsUrl: string;
  };
  instructions: string;
  attendanceStatus: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSlot {
  id: string;
  jobId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
}

export interface MonthlyApplicationQuota {
  candidateId: string;
  monthKey: string; // e.g. "2026-11"
  usedCount: number;
  maxFreeAllowed: number; // 3
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  messageText: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  recruiterId: string;
  recruiterName: string;
  companyName: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCountCandidate: number;
  unreadCountRecruiter: number;
}

export type NotificationType = 
  | 'profile_viewed'
  | 'application_viewed'
  | 'shortlisted'
  | 'rejected'
  | 'interview_scheduled'
  | 'interview_rescheduled'
  | 'interview_cancelled'
  | 'venue_unlocked'
  | 'job_cancelled'
  | 'new_message'
  | 'interview_reminder'
  | 'company_verified'
  | 'recruiter_approved';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  emailQueued: boolean;
  emailStatus: 'pending' | 'sent' | 'failed';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PlatformStats {
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  verifiedCompanies: number;
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  interviewsScheduled: number;
  premiumSubscribers: number;
  totalRevenue: number;
}

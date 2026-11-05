/**
 * WALKIN - Initial Realistic Mock Data
 * All demo records are clearly structured with walk-in interview specifics.
 */

import {
  CandidateProfile,
  RecruiterProfile,
  User,
  Company,
  JobVacancy,
  JobApplication,
  InterviewSchedule,
  InterviewSlot,
  AppNotification,
  AuditLog,
  CandidateResume,
  Conversation
} from '../types';

export const INITIAL_CANDIDATE: CandidateProfile = {
  id: 'candidate_1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  role: 'candidate',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  isEmailVerified: true,
  createdAt: '2026-09-15T09:00:00Z',
  currentQualification: 'B.Pharm',
  experienceYears: 2,
  currentCity: 'Bengaluru',
  bio: 'Pharmacy graduate with 2 years of quality control & pharmacovigilance experience looking for immediate walk-in opportunities in clinical research or healthcare analytics.',
  skills: ['Pharmacovigilance', 'Medical Terminology', 'ICH-GCP', 'Clinical Research', 'MS Excel', 'Drug Safety'],
  isPremium: false,
  applicationCredits: 0
};

export const INITIAL_RESUMES: CandidateResume[] = [
  {
    id: 'res_1',
    candidateId: 'candidate_1',
    name: 'Pharma_Clinical_Research_2026.pdf',
    fileName: 'Rahul_Sharma_BPharm_Clinical.pdf',
    fileSize: '342 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-10-01T11:20:00Z',
    isDefault: true,
    contentSnippet: 'Rahul Sharma | B.Pharm (2024) | 2 Years Clinical Documentation & Safety Reporting experience at BioCare Labs.'
  },
  {
    id: 'res_2',
    candidateId: 'candidate_1',
    name: 'Drug_Safety_Associate_Resume.pdf',
    fileName: 'Rahul_Sharma_Safety_Associate.pdf',
    fileSize: '298 KB',
    fileType: 'application/pdf',
    uploadedAt: '2026-10-20T15:45:00Z',
    isDefault: false,
    contentSnippet: 'Specialized Pharmacovigilance & Argus Safety Case Processing resume with certification in ICH-GCP guidelines.'
  }
];

export const INITIAL_RECRUITERS: RecruiterProfile[] = [
  {
    id: 'recruiter_1',
    name: 'Priya Sundaram',
    email: 'priya.s@novatixpharma.com',
    phone: '+91 98450 11223',
    role: 'recruiter',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    isEmailVerified: true,
    createdAt: '2026-08-10T10:00:00Z',
    designation: 'Head of Talent Acquisition - Healthcare',
    officialCompanyEmail: 'priya.s@novatixpharma.com',
    recruiterLinkedIn: 'https://linkedin.com/in/priya-sundaram-recruitment',
    companyId: 'comp_1',
    verificationStatus: 'verified'
  },
  {
    id: 'recruiter_2',
    name: 'Vikram Malhotra',
    email: 'vikram.m@nexustech.io',
    phone: '+91 97110 88992',
    role: 'recruiter',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    isEmailVerified: true,
    createdAt: '2026-09-01T14:30:00Z',
    designation: 'Senior Technical Recruiter',
    officialCompanyEmail: 'vikram.m@nexustech.io',
    recruiterLinkedIn: 'https://linkedin.com/in/vikram-malhotra-nexustech',
    companyId: 'comp_2',
    verificationStatus: 'verified'
  },
  {
    id: 'recruiter_3',
    name: 'Ananya Roy',
    email: 'ananya.roy@finovate.corp',
    phone: '+91 99220 55441',
    role: 'recruiter',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    isEmailVerified: true,
    createdAt: '2026-11-02T16:00:00Z',
    designation: 'HR Executive',
    officialCompanyEmail: 'ananya.roy@finovate.corp',
    recruiterLinkedIn: 'https://linkedin.com/in/ananya-roy-finovate',
    companyId: 'comp_3',
    verificationStatus: 'pending' // Pending approval for Admin portal demo!
  }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_1',
    name: 'Novatix Healthcare Labs',
    logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=128&q=80',
    description: 'Leading healthcare clinical trials and drug safety operations research organization with offices across Bengaluru and Hyderabad.',
    website: 'https://novatixpharma.example.com',
    companyLinkedIn: 'https://linkedin.com/company/novatix-healthcare',
    address: 'Plot 42, Electronic City Phase 1, Hosur Road',
    city: 'Bengaluru',
    industry: 'Pharmaceuticals & Clinical Research',
    companySize: '500-1,000 employees',
    isVerified: true,
    officialDomain: 'novatixpharma.com',
    createdAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'comp_2',
    name: 'NexusTech Solutions',
    logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=128&q=80',
    description: 'Enterprise cloud systems, web development, and digital transformation services partner catering to Fortune 500 enterprises.',
    website: 'https://nexustech.io',
    companyLinkedIn: 'https://linkedin.com/company/nexustech-global',
    address: 'Nexus Cyber Gateway, HITEC City, Madhapur',
    city: 'Hyderabad',
    industry: 'Information Technology & Services',
    companySize: '1,000-5,000 employees',
    isVerified: true,
    officialDomain: 'nexustech.io',
    createdAt: '2026-08-15T09:30:00Z'
  },
  {
    id: 'comp_3',
    name: 'Finovate Capital Corp',
    logoUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=128&q=80',
    description: 'Fintech lending and digital credit processing solutions provider servicing retail credit cards and microfinance programs.',
    website: 'https://finovate.corp',
    companyLinkedIn: 'https://linkedin.com/company/finovate-capital',
    address: 'Bandra-Kurla Complex (BKC), G Block',
    city: 'Mumbai',
    industry: 'Financial Services & Banking',
    companySize: '200-500 employees',
    isVerified: false, // For admin verification demo!
    officialDomain: 'finovate.corp',
    createdAt: '2026-11-01T12:00:00Z'
  }
];

export const INITIAL_ADMIN: User = {
  id: 'admin_1',
  name: 'Platform SuperAdmin',
  email: 'admin@walkin.platform',
  phone: '+91 80000 99999',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
  isEmailVerified: true,
  createdAt: '2026-01-01T00:00:00Z'
};

export const INITIAL_JOBS: JobVacancy[] = [
  {
    id: 'job_101',
    recruiterId: 'recruiter_1',
    companyId: 'comp_1',
    title: 'Drug Safety Associate & Medical Coder (Urgent Walk-In)',
    department: 'Pharmacovigilance & Clinical Ops',
    jobDescription: 'Novatix Healthcare Labs is hosting a specialized walk-in recruitment drive for qualified pharmacy & life sciences professionals. Candidates will undergo case intake, adverse drug event processing, and MedDRA coding.',
    responsibilities: [
      'Perform initial triage and narrative writing for adverse drug experience reports.',
      'Apply standardized MedDRA coding for adverse reaction terms and co-morbidities.',
      'Review clinical safety data in compliance with standard ICH-GCP regulations.',
      'Participate in same-day in-person technical evaluation and HR interview.'
    ],
    requiredSkills: ['Pharmacovigilance', 'Medical Coding', 'MedDRA', 'ICH-GCP', 'B.Pharm', 'M.Pharm'],
    expMinYears: 1,
    expMaxYears: 4,
    openings: 15,
    salaryMin: 350000,
    salaryMax: 550000,
    salaryPeriod: 'year',
    city: 'Bengaluru',
    locality: 'Electronic City Phase 1',
    workLocation: 'On-site',
    applicationDeadline: '2026-11-20',
    employmentCategory: 'direct_company_payroll',
    qualifications: ['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Sc', 'M.Sc'],
    walkInSettings: {
      mode: 'candidate_selected', // MODE A: Hidden until HR shortlists!
      venueName: 'Novatix R&D Centre - Building 4B Conference Hall',
      fullAddress: 'Plot 42, Electronic City Phase 1, Hosur Main Road, Bengaluru, Karnataka 560100',
      googleMapsUrl: 'https://maps.google.com/?q=Electronic+City+Phase+1+Bengaluru',
      interviewDateStart: '2026-11-22',
      interviewDateEnd: '2026-11-23',
      startTime: '09:30 AM',
      endTime: '04:00 PM',
      instructions: 'Please bring 2 updated hard copies of your resume, government photo ID card, academic marksheets, and pharmacy council registration certificate.',
      requiredDocuments: ['Updated Resume (2 copies)', 'Aadhaar / Passport ID', 'Pharmacy Degree / Marksheets', 'Current CTC Proof / Payslips']
    },
    screeningQuestions: [
      { id: 'sq_1', questionText: 'Total experience years?', order: 1 },
      { id: 'sq_2', questionText: 'Current CTC amount?', order: 2 },
      { id: 'sq_3', questionText: 'Notice period days?', order: 3 }
    ],
    status: 'active',
    viewsCount: 184,
    applicationsCount: 14,
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z'
  },
  {
    id: 'job_102',
    recruiterId: 'recruiter_2',
    companyId: 'comp_2',
    title: 'Full-Stack React & Node.js Developer (Open Walk-In Drive)',
    department: 'Core Product Engineering',
    jobDescription: 'NexusTech Solutions is conducting a mass open walk-in recruitment drive this weekend for Full-Stack Developers. Immediate offer letters will be issued for qualified candidates on the same day after 2 technical rounds.',
    responsibilities: [
      'Develop reactive web applications with TypeScript, React 19, and Tailwind CSS.',
      'Build robust REST & GraphQL microservices with Node.js and Express.',
      'Optimize database queries and implement clean architectural patterns.',
      'Collaborate with agile sprint teams and participate in code reviews.'
    ],
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'REST APIs'],
    expMinYears: 2,
    expMaxYears: 6,
    openings: 25,
    salaryMin: 700000,
    salaryMax: 1300000,
    salaryPeriod: 'year',
    city: 'Hyderabad',
    locality: 'HITEC City',
    workLocation: 'On-site',
    applicationDeadline: '2026-11-25',
    employmentCategory: 'direct_company_payroll',
    qualifications: ['B.Tech', 'B.E.', 'MCA', 'BCA', 'Any Degree'],
    walkInSettings: {
      mode: 'open_walkin', // MODE B: Immediately visible to everyone!
      venueName: 'Nexus Cyber Gateway Auditorium - 3rd Floor',
      fullAddress: 'TSIIC Software Units Layout, HITEC City, Madhapur, Hyderabad, Telangana 500081',
      googleMapsUrl: 'https://maps.google.com/?q=Cyber+Gateway+HITEC+City+Hyderabad',
      interviewDateStart: '2026-11-15',
      interviewDateEnd: '2026-11-16',
      startTime: '10:00 AM',
      endTime: '05:30 PM',
      instructions: 'Open Walk-in Drive. No appointment necessary. Directly report at registration desk with 2 hard copies of resume and laptop for live coding round.',
      requiredDocuments: ['Hard Copy Resume', 'Valid Photo ID', 'Laptop for machine coding test', 'Relieving letters if experienced']
    },
    screeningQuestions: [
      { id: 'sq_4', questionText: 'Years of React experience?', order: 1 },
      { id: 'sq_5', questionText: 'Notice period days?', order: 2 },
      { id: 'sq_6', questionText: 'Current in-hand CTC?', order: 3 }
    ],
    status: 'active',
    viewsCount: 420,
    applicationsCount: 38,
    createdAt: '2026-11-02T11:30:00Z',
    updatedAt: '2026-11-02T11:30:00Z'
  },
  {
    id: 'job_103',
    recruiterId: 'recruiter_1',
    companyId: 'comp_1',
    title: 'Clinical Data Management Analyst (Third-Party Staffing)',
    department: 'Biostatistics & Trial Analytics',
    jobDescription: 'Immediate vacancy for Clinical Data Coordinators via Apex Staffing deployment at GlobalBio Partner Lab facility.',
    responsibilities: [
      'Maintain electronic case report forms (eCRF) and resolve automated data discrepancy queries.',
      'Perform data validation checks using EDC software systems (Medidata Rave).',
      'Liaise with Principal Investigators to verify source documentation.'
    ],
    requiredSkills: ['Clinical Data', 'EDC', 'Medidata Rave', 'Good Clinical Practice', 'Data Validation'],
    expMinYears: 0,
    expMaxYears: 3,
    openings: 8,
    salaryMin: 28000,
    salaryMax: 42000,
    salaryPeriod: 'month',
    city: 'Bengaluru',
    locality: 'Whitefield Tech Zone',
    workLocation: 'On-site',
    applicationDeadline: '2026-11-18',
    employmentCategory: 'third_party_payroll', // Third party payroll!
    thirdPartyInfo: {
      staffingAgencyName: 'Apex Human Capital Solutions Pvt Ltd',
      actualClientName: 'GlobalBio Research Laboratories Ltd',
      workLocation: 'GlobalBio Campus, ITPL Main Road, Whitefield, Bengaluru'
    },
    qualifications: ['B.Sc', 'M.Sc', 'B.Pharm', 'B.Tech', 'Diploma'],
    walkInSettings: {
      mode: 'candidate_selected', // Mode A
      venueName: 'Apex Staffing Interview Suites - Level 2',
      fullAddress: 'Brigade Tech Park, Block B, Whitefield, Bengaluru, Karnataka 560066',
      googleMapsUrl: 'https://maps.google.com/?q=Brigade+Tech+Park+Whitefield+Bengaluru',
      interviewDateStart: '2026-11-19',
      interviewDateEnd: '2026-11-19',
      startTime: '10:30 AM',
      endTime: '03:30 PM',
      instructions: 'Only candidates with official shortlist email / pass will be permitted by campus security.',
      requiredDocuments: ['Printed Shortlist Pass', '2 Hard Copy Resumes', 'Original Degree Certificate', 'Photo ID']
    },
    screeningQuestions: [
      { id: 'sq_7', questionText: 'Relevant clinical experience?', order: 1 },
      { id: 'sq_8', questionText: 'Immediate joiner possible?', order: 2 },
      { id: 'sq_9', questionText: 'Expected monthly stipend?', order: 3 }
    ],
    status: 'active',
    viewsCount: 112,
    applicationsCount: 9,
    createdAt: '2026-11-03T09:00:00Z',
    updatedAt: '2026-11-03T09:00:00Z'
  },
  {
    id: 'job_104',
    recruiterId: 'recruiter_2',
    companyId: 'comp_2',
    title: 'Customer Success & Tech Support Specialist (Open Walk-In)',
    department: 'Global Customer Operations',
    jobDescription: 'NexusTech is hiring 40 Customer Support Representatives for international inbound technical assistance. Freshers with strong verbal communication skills are welcome to walk in.',
    responsibilities: [
      'Handle enterprise client queries via phone, chat, and email support queues.',
      'Troubleshoot technical issues using internal knowledgebase and diagnostic scripts.',
      'Escalate high-severity incidents to tier-2 engineering leads.'
    ],
    requiredSkills: ['Customer Support', 'English Communication', 'Technical Troubleshooting', 'CRM', 'Problem Solving'],
    expMinYears: 0,
    expMaxYears: 2,
    openings: 40,
    salaryMin: 300000,
    salaryMax: 420000,
    salaryPeriod: 'year',
    city: 'Hyderabad',
    locality: 'Gachibowli',
    workLocation: 'On-site',
    applicationDeadline: '2026-11-30',
    employmentCategory: 'direct_company_payroll',
    qualifications: ['Any Degree', 'B.A.', 'B.Com', 'BBA', 'B.Sc', 'B.Tech'],
    walkInSettings: {
      mode: 'open_walkin', // Mode B: Open walk-in
      venueName: 'Nexus Global Operations Center - Ground Floor Hall',
      fullAddress: 'Financial District, Nanakramguda, Gachibowli, Hyderabad, Telangana 500032',
      googleMapsUrl: 'https://maps.google.com/?q=Financial+District+Nanakramguda+Hyderabad',
      interviewDateStart: '2026-11-17',
      interviewDateEnd: '2026-11-18',
      startTime: '09:00 AM',
      endTime: '04:00 PM',
      instructions: 'Mass walk-in hiring. Walk in directly between 9 AM and 1 PM for voice round and assessment.',
      requiredDocuments: ['Updated Resume', '1 Passport Size Photo', 'Aadhaar Card copy', 'Degree Certificate / Provisional']
    },
    screeningQuestions: [
      { id: 'sq_10', questionText: 'Fluent English speaking?', order: 1 },
      { id: 'sq_11', questionText: 'Willing rotational shifts?', order: 2 },
      { id: 'sq_12', questionText: 'Notice period days?', order: 3 }
    ],
    status: 'active',
    viewsCount: 310,
    applicationsCount: 22,
    createdAt: '2026-11-04T14:00:00Z',
    updatedAt: '2026-11-04T14:00:00Z'
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_1',
    jobId: 'job_101',
    candidateId: 'candidate_1',
    recruiterId: 'recruiter_1',
    companyId: 'comp_1',
    resumeSnapshot: INITIAL_RESUMES[0],
    screeningAnswers: [
      { questionId: 'sq_1', questionText: 'Total experience years?', answerText: 'Two years', wordCount: 2 },
      { questionId: 'sq_2', questionText: 'Current CTC amount?', answerText: '3.6 LPA', wordCount: 2 },
      { questionId: 'sq_3', questionText: 'Notice period days?', answerText: 'Immediate joiner', wordCount: 2 }
    ],
    status: 'interview_scheduled', // Shortlisted and scheduled -> Venue UNLOCKED!
    statusHistory: [
      { status: 'applied', timestamp: '2026-11-02T12:00:00Z', note: 'Application submitted with B.Pharm resume', updatedBy: 'Candidate' },
      { status: 'viewed', timestamp: '2026-11-03T10:15:00Z', note: 'Recruiter viewed profile', updatedBy: 'Priya Sundaram' },
      { status: 'shortlisted', timestamp: '2026-11-03T16:00:00Z', note: 'Profile matched clinical requirements', updatedBy: 'Priya Sundaram' },
      { status: 'interview_scheduled', timestamp: '2026-11-04T11:00:00Z', note: 'Slot booked for Round 1 Technical', updatedBy: 'Priya Sundaram' }
    ],
    appliedAt: '2026-11-02T12:00:00Z',
    updatedAt: '2026-11-04T11:00:00Z',
    isVenueUnlocked: true
  }
];

export const INITIAL_INTERVIEWS: InterviewSchedule[] = [
  {
    id: 'int_1',
    applicationId: 'app_1',
    jobId: 'job_101',
    candidateId: 'candidate_1',
    recruiterId: 'recruiter_1',
    interviewDate: '2026-11-22',
    interviewTime: '10:30 AM',
    roundName: 'Round 1 - Technical Assessment & Drug Safety Viva',
    interviewerName: 'Dr. Suresh Raghavan (PV Lead)',
    venueSnapshot: {
      venueName: 'Novatix R&D Centre - Building 4B Conference Hall',
      fullAddress: 'Plot 42, Electronic City Phase 1, Hosur Main Road, Bengaluru, Karnataka 560100',
      googleMapsUrl: 'https://maps.google.com/?q=Electronic+City+Phase+1+Bengaluru'
    },
    instructions: 'Arrive 15 minutes before your slot. Present this pass at security gate 2.',
    attendanceStatus: 'scheduled',
    notes: 'Candidate has strong pharmacovigilance exposure from previous role.',
    createdAt: '2026-11-04T11:00:00Z',
    updatedAt: '2026-11-04T11:00:00Z'
  }
];

export const INITIAL_SLOTS: InterviewSlot[] = [
  { id: 'slot_1', jobId: 'job_101', date: '2026-11-22', startTime: '10:00 AM', endTime: '10:30 AM', capacity: 5, bookedCount: 5 },
  { id: 'slot_2', jobId: 'job_101', date: '2026-11-22', startTime: '10:30 AM', endTime: '11:00 AM', capacity: 5, bookedCount: 3 },
  { id: 'slot_3', jobId: 'job_101', date: '2026-11-22', startTime: '11:00 AM', endTime: '11:30 AM', capacity: 5, bookedCount: 1 },
  { id: 'slot_4', jobId: 'job_101', date: '2026-11-22', startTime: '11:30 AM', endTime: '12:00 PM', capacity: 5, bookedCount: 0 }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'candidate_1',
    type: 'interview_scheduled',
    title: 'Interview Scheduled & Venue Unlocked!',
    message: 'Novatix Healthcare Labs scheduled your walk-in interview slot for Nov 22 at 10:30 AM. Venue details and directions are now unlocked.',
    link: '/candidate/interviews',
    isRead: false,
    createdAt: '2026-11-04T11:00:00Z',
    emailQueued: true,
    emailStatus: 'sent'
  },
  {
    id: 'notif_2',
    userId: 'candidate_1',
    type: 'shortlisted',
    title: 'Profile Shortlisted by Recruiter',
    message: 'Congratulations! Priya Sundaram shortlisted your application for Drug Safety Associate & Medical Coder.',
    link: '/candidate/applications',
    isRead: true,
    createdAt: '2026-11-03T16:00:00Z',
    emailQueued: true,
    emailStatus: 'sent'
  },
  {
    id: 'notif_3',
    userId: 'recruiter_1',
    type: 'profile_viewed',
    title: 'New Candidate Application Received',
    message: 'Rahul Sharma submitted an application with 3 screening answers for Drug Safety Associate.',
    link: '/recruiter/applications',
    isRead: true,
    createdAt: '2026-11-02T12:01:00Z',
    emailQueued: true,
    emailStatus: 'sent'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    jobId: 'job_101',
    jobTitle: 'Drug Safety Associate & Medical Coder',
    candidateId: 'candidate_1',
    candidateName: 'Rahul Sharma',
    recruiterId: 'recruiter_1',
    recruiterName: 'Priya Sundaram',
    companyName: 'Novatix Healthcare Labs',
    lastMessageText: 'Please remember to bring your original pharmacy council registration certificate.',
    lastMessageAt: '2026-11-04T14:30:00Z',
    unreadCountCandidate: 1,
    unreadCountRecruiter: 0
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    userId: 'candidate_1',
    userName: 'Rahul Sharma',
    userRole: 'candidate',
    action: 'APPLICATION_SUBMITTED',
    details: 'Submitted application for Job ID job_101 with resume res_1 and 3 validated screening answers.',
    ipAddress: '157.49.20.18',
    timestamp: '2026-11-02T12:00:00Z'
  },
  {
    id: 'log_2',
    userId: 'recruiter_1',
    userName: 'Priya Sundaram',
    userRole: 'recruiter',
    action: 'CANDIDATE_SHORTLISTED',
    details: 'Shortlisted candidate Rahul Sharma for Job ID job_101.',
    ipAddress: '115.110.82.4',
    timestamp: '2026-11-03T16:00:00Z'
  },
  {
    id: 'log_3',
    userId: 'recruiter_1',
    userName: 'Priya Sundaram',
    userRole: 'recruiter',
    action: 'INTERVIEW_SCHEDULED',
    details: 'Scheduled slot for Rahul Sharma on 2026-11-22 at 10:30 AM (Round 1). Venue unlocked for candidate.',
    ipAddress: '115.110.82.4',
    timestamp: '2026-11-04T11:00:00Z'
  },
  {
    id: 'log_4',
    userId: 'admin_1',
    userName: 'Platform SuperAdmin',
    userRole: 'admin',
    action: 'COMPANY_VERIFIED',
    details: 'Verified corporate domain novatixpharma.com and approved company Novatix Healthcare Labs.',
    ipAddress: '103.21.144.10',
    timestamp: '2026-08-01T12:00:00Z'
  }
];

export const STANDARD_QUALIFICATIONS = [
  'B.Tech',
  'B.E.',
  'B.Com',
  'B.Sc',
  'B.A.',
  'BBA',
  'MBA',
  'B.Pharm',
  'M.Pharm',
  'Pharm.D',
  'D.Pharm',
  'M.Sc',
  'M.Com',
  'MCA',
  'BCA',
  'Diploma',
  'Any Degree'
];

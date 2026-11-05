/**
 * WALKIN - Storage & Business Logic Service
 * Handles persistence, role switches, 3-question validation, monthly quota enforcement, and venue unlock rules.
 */

import {
  UserRole,
  CandidateProfile,
  RecruiterProfile,
  Company,
  JobVacancy,
  JobApplication,
  InterviewSchedule,
  InterviewSlot,
  AppNotification,
  AuditLog,
  CandidateResume,
  Conversation,
  ChatMessage,
  ApplicationStatus,
  User
} from '../types';

import {
  INITIAL_CANDIDATE,
  INITIAL_RESUMES,
  INITIAL_RECRUITERS,
  INITIAL_COMPANIES,
  INITIAL_ADMIN,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_INTERVIEWS,
  INITIAL_SLOTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_ROLE: 'walkin_current_role',
  CURRENT_USER_ID: 'walkin_current_user_id',
  CANDIDATE: 'walkin_candidate_profile',
  RESUMES: 'walkin_candidate_resumes',
  RECRUITERS: 'walkin_recruiters',
  COMPANIES: 'walkin_companies',
  JOBS: 'walkin_jobs',
  APPLICATIONS: 'walkin_applications',
  INTERVIEWS: 'walkin_interviews',
  SLOTS: 'walkin_slots',
  NOTIFICATIONS: 'walkin_notifications',
  CONVERSATIONS: 'walkin_conversations',
  MESSAGES: 'walkin_messages',
  AUDIT_LOGS: 'walkin_audit_logs'
};

// Helper: Count words in a string
export function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Helper: Validate answer is between 1 and 3 words
export function validateScreeningAnswer(answer: string): { isValid: boolean; wordCount: number; error?: string } {
  const count = countWords(answer);
  if (count === 0) {
    return { isValid: false, wordCount: 0, error: 'Answer cannot be empty.' };
  }
  if (count > 3) {
    return { isValid: false, wordCount: count, error: `Maximum 3 words allowed (you entered ${count} words).` };
  }
  return { isValid: true, wordCount: count };
}

// Current month key format: "YYYY-MM"
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export class WalkinStorageService {
  private static instance: WalkinStorageService;

  private constructor() {
    this.initDefaults();
  }

  public static getInstance(): WalkinStorageService {
    if (!WalkinStorageService.instance) {
      WalkinStorageService.instance = new WalkinStorageService();
    }
    return WalkinStorageService.instance;
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, 'candidate');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'candidate_1');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CANDIDATE)) {
      localStorage.setItem(STORAGE_KEYS.CANDIDATE, JSON.stringify(INITIAL_CANDIDATE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESUMES)) {
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(INITIAL_RESUMES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECRUITERS)) {
      localStorage.setItem(STORAGE_KEYS.RECRUITERS, JSON.stringify(INITIAL_RECRUITERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(INITIAL_COMPANIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTERVIEWS)) {
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(INITIAL_INTERVIEWS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SLOTS)) {
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(INITIAL_SLOTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    }
  }

  // --- Auth & Role Switching ---
  public getCurrentRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as UserRole) || 'candidate';
  }

  public setRole(role: UserRole, userId?: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      if (role === 'candidate') localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'candidate_1');
      if (role === 'recruiter') localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'recruiter_1');
      if (role === 'admin') localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'admin_1');
    }
  }

  public getCurrentUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'candidate_1';
  }

  public getCandidateProfile(): CandidateProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATE);
    return raw ? JSON.parse(raw) : INITIAL_CANDIDATE;
  }

  public updateCandidateProfile(profile: Partial<CandidateProfile>): CandidateProfile {
    const current = this.getCandidateProfile();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEYS.CANDIDATE, JSON.stringify(updated));
    return updated;
  }

  public getRecruiters(): RecruiterProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECRUITERS);
    return raw ? JSON.parse(raw) : INITIAL_RECRUITERS;
  }

  public getCurrentRecruiter(): RecruiterProfile {
    const recruiters = this.getRecruiters();
    const userId = this.getCurrentUserId();
    return recruiters.find(r => r.id === userId) || recruiters[0];
  }

  public updateRecruiter(recruiterId: string, updates: Partial<RecruiterProfile>): RecruiterProfile {
    const recruiters = this.getRecruiters();
    const index = recruiters.findIndex(r => r.id === recruiterId);
    if (index >= 0) {
      recruiters[index] = { ...recruiters[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.RECRUITERS, JSON.stringify(recruiters));
      return recruiters[index];
    }
    throw new Error('Recruiter not found');
  }

  public getCompanies(): Company[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return raw ? JSON.parse(raw) : INITIAL_COMPANIES;
  }

  public getCompanyById(id: string): Company | undefined {
    return this.getCompanies().find(c => c.id === id);
  }

  public updateCompany(companyId: string, updates: Partial<Company>): Company {
    const companies = this.getCompanies();
    const index = companies.findIndex(c => c.id === companyId);
    if (index >= 0) {
      companies[index] = { ...companies[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
      return companies[index];
    }
    throw new Error('Company not found');
  }

  public addCompany(company: Company): Company {
    const companies = this.getCompanies();
    companies.push(company);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    return company;
  }

  // --- Resumes Management ---
  public getCandidateResumes(candidateId?: string): CandidateResume[] {
    const cid = candidateId || this.getCandidateProfile().id;
    const raw = localStorage.getItem(STORAGE_KEYS.RESUMES);
    const all: CandidateResume[] = raw ? JSON.parse(raw) : INITIAL_RESUMES;
    return all.filter(r => r.candidateId === cid);
  }

  public addCandidateResume(resume: Omit<CandidateResume, 'id' | 'uploadedAt'>): CandidateResume {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUMES);
    const all: CandidateResume[] = raw ? JSON.parse(raw) : [];
    
    // If setting default, unset other defaults for this candidate
    if (resume.isDefault) {
      all.forEach(r => {
        if (r.candidateId === resume.candidateId) r.isDefault = false;
      });
    }

    const newResume: CandidateResume = {
      ...resume,
      id: `res_${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    all.unshift(newResume);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(all));
    
    this.addAuditLog('RESUME_UPLOADED', `Uploaded resume: ${newResume.name}`);
    return newResume;
  }

  public setDefaultResume(resumeId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUMES);
    const all: CandidateResume[] = raw ? JSON.parse(raw) : [];
    const target = all.find(r => r.id === resumeId);
    if (target) {
      all.forEach(r => {
        if (r.candidateId === target.candidateId) {
          r.isDefault = (r.id === resumeId);
        }
      });
      localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(all));
    }
  }

  public deleteResume(resumeId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUMES);
    let all: CandidateResume[] = raw ? JSON.parse(raw) : [];
    all = all.filter(r => r.id !== resumeId);
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(all));
  }

  // --- Jobs Management ---
  public getJobs(): JobVacancy[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    return raw ? JSON.parse(raw) : INITIAL_JOBS;
  }

  public getJobById(id: string): JobVacancy | undefined {
    return this.getJobs().find(j => j.id === id);
  }

  public createJob(job: Omit<JobVacancy, 'id' | 'viewsCount' | 'applicationsCount' | 'createdAt' | 'updatedAt'>): JobVacancy {
    const jobs = this.getJobs();
    const newJob: JobVacancy = {
      ...job,
      id: `job_${Date.now()}`,
      viewsCount: 0,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    jobs.unshift(newJob);
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    
    this.addAuditLog('JOB_PUBLISHED', `Published walk-in vacancy: ${newJob.title} (Mode: ${newJob.walkInSettings.mode})`);
    return newJob;
  }

  public updateJob(jobId: string, updates: Partial<JobVacancy>): JobVacancy {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === jobId);
    if (index >= 0) {
      jobs[index] = { ...jobs[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      return jobs[index];
    }
    throw new Error('Job not found');
  }

  // --- Monthly Application Quota (3 free applications / calendar month) ---
  public getCandidateMonthlyApplicationsCount(candidateId: string): number {
    const currentMonthKey = getCurrentMonthKey();
    const apps = this.getApplications().filter(a => {
      if (a.candidateId !== candidateId) return false;
      const appMonth = a.appliedAt.substring(0, 7); // "YYYY-MM"
      return appMonth === currentMonthKey;
    });
    return apps.length;
  }

  public canCandidateApply(candidateId: string): { allowed: boolean; remaining: number; maxFree: number; isPremium: boolean } {
    const candidate = this.getCandidateProfile();
    const maxFree = 3;
    const used = this.getCandidateMonthlyApplicationsCount(candidateId);
    
    if (candidate.isPremium) {
      return { allowed: true, remaining: 999, maxFree, isPremium: true };
    }
    
    const remaining = Math.max(0, maxFree - used + (candidate.applicationCredits || 0));
    return {
      allowed: remaining > 0,
      remaining,
      maxFree,
      isPremium: false
    };
  }

  // --- Applications Management ---
  public getApplications(): JobApplication[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_APPLICATIONS;
  }

  public getApplicationById(id: string): JobApplication | undefined {
    return this.getApplications().find(a => a.id === id);
  }

  public submitApplication(
    jobId: string,
    candidateId: string,
    resumeId: string,
    answers: [string, string, string] // Must be 3 answers
  ): { success: boolean; application?: JobApplication; error?: string } {
    const job = this.getJobById(jobId);
    if (!job) return { success: false, error: 'Job does not exist.' };

    // Check if already applied
    const existing = this.getApplications().find(a => a.jobId === jobId && a.candidateId === candidateId);
    if (existing) {
      return { success: false, error: 'You have already applied for this walk-in vacancy.' };
    }

    // Check monthly quota
    const quota = this.canCandidateApply(candidateId);
    if (!quota.allowed) {
      return {
        success: false,
        error: `Monthly quota reached! Free candidate accounts are strictly limited to 3 applications per calendar month. Upgrade to Premium or purchase additional application credits to apply.`
      };
    }

    // Validate resume
    const candidateResumes = this.getCandidateResumes(candidateId);
    const resume = candidateResumes.find(r => r.id === resumeId);
    if (!resume) {
      return { success: false, error: 'Selected resume not found. Please upload or choose a valid resume.' };
    }

    // Validate screening questions: exactly 3 questions
    if (!answers || answers.length !== 3) {
      return { success: false, error: 'Exactly three screening questions must be answered.' };
    }

    // Validate 1 to 3 words constraint for EACH answer
    const formattedAnswers: [any, any, any] = [null, null, null];
    for (let i = 0; i < 3; i++) {
      const q = job.screeningQuestions[i];
      const ans = answers[i] || '';
      const validation = validateScreeningAnswer(ans);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Question ${i + 1} ("${q.questionText}"): ${validation.error}`
        };
      }
      formattedAnswers[i] = {
        questionId: q.id,
        questionText: q.questionText,
        answerText: ans.trim(),
        wordCount: validation.wordCount
      };
    }

    // Create immutable application snapshot
    const isVenueUnlocked = (job.walkInSettings.mode === 'open_walkin');

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId,
      candidateId,
      recruiterId: job.recruiterId,
      companyId: job.companyId,
      resumeSnapshot: { ...resume }, // Immutable clone!
      screeningAnswers: formattedAnswers as any,
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          timestamp: new Date().toISOString(),
          note: 'Application submitted with screening answers and resume snapshot',
          updatedBy: 'Candidate'
        }
      ],
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVenueUnlocked
    };

    const apps = this.getApplications();
    apps.unshift(newApp);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    // Increment job application counter
    this.updateJob(jobId, { applicationsCount: (job.applicationsCount || 0) + 1 });

    // Deduct credit if candidate was using purchased credits
    const candidate = this.getCandidateProfile();
    const currentFreeUsed = this.getCandidateMonthlyApplicationsCount(candidateId);
    if (currentFreeUsed > 3 && candidate.applicationCredits > 0) {
      this.updateCandidateProfile({ applicationCredits: candidate.applicationCredits - 1 });
    }

    // Create Notification for Recruiter
    this.addNotification({
      userId: job.recruiterId,
      type: 'application_viewed',
      title: 'New Candidate Applied',
      message: `${candidate.name} applied for "${job.title}" with 3 screening answers.`,
      link: `/recruiter/applications`,
      emailQueued: true
    });

    // Create Notification for Candidate
    this.addNotification({
      userId: candidateId,
      type: 'profile_viewed',
      title: 'Application Received',
      message: `Your walk-in application for "${job.title}" has been successfully submitted to ${job.companyId}.`,
      link: `/candidate/applications`,
      emailQueued: true
    });

    this.addAuditLog('APPLICATION_SUBMITTED', `Candidate ${candidate.name} applied to ${job.title} (Job ID: ${job.id})`);

    return { success: true, application: newApp };
  }

  public updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ): JobApplication {
    const apps = this.getApplications();
    const appIndex = apps.findIndex(a => a.id === applicationId);
    if (appIndex < 0) throw new Error('Application not found');

    const app = apps[appIndex];
    const job = this.getJobById(app.jobId);
    const candidate = this.getCandidateProfile();
    const recruiter = this.getCurrentRecruiter();

    // Check if venue should be unlocked:
    // If open_walkin, it's always unlocked.
    // If candidate_selected, unlocks when shortlisted, interview_scheduled, or selected!
    let isVenueUnlocked = app.isVenueUnlocked;
    if (job?.walkInSettings.mode === 'candidate_selected') {
      if (['shortlisted', 'interview_scheduled', 'selected'].includes(newStatus)) {
        isVenueUnlocked = true;
      }
    }

    const updatedApp: JobApplication = {
      ...app,
      status: newStatus,
      isVenueUnlocked,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...app.statusHistory,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${newStatus}`,
          updatedBy: recruiter.name
        }
      ]
    };

    apps[appIndex] = updatedApp;
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));

    // Send notifications based on status change
    if (newStatus === 'shortlisted') {
      this.addNotification({
        userId: app.candidateId,
        type: 'shortlisted',
        title: 'You Have Been Shortlisted!',
        message: `${recruiter.name} shortlisted your application for "${job?.title || 'Walk-in'}". The interview venue is now unlocked!`,
        link: '/candidate/applications',
        emailQueued: true
      });
    } else if (newStatus === 'rejected') {
      this.addNotification({
        userId: app.candidateId,
        type: 'rejected',
        title: 'Application Status Update',
        message: `Thank you for your interest in "${job?.title}". The recruiter has decided not to proceed with your application at this time.`,
        link: '/candidate/applications',
        emailQueued: true
      });
    } else if (newStatus === 'selected') {
      this.addNotification({
        userId: app.candidateId,
        type: 'interview_scheduled',
        title: 'Congratulations! Selected!',
        message: `You have been marked SELECTED for "${job?.title}" at ${job?.walkInSettings.venueName}!`,
        link: '/candidate/applications',
        emailQueued: true
      });
    }

    this.addAuditLog('APPLICATION_STATUS_UPDATED', `Application ${app.id} status changed to ${newStatus} by ${recruiter.name}`);

    return updatedApp;
  }

  // --- Interview Scheduling ---
  public getInterviews(): InterviewSchedule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
    return raw ? JSON.parse(raw) : INITIAL_INTERVIEWS;
  }

  public scheduleInterview(
    applicationId: string,
    interviewDate: string,
    interviewTime: string,
    roundName: string,
    interviewerName: string,
    instructions: string
  ): InterviewSchedule {
    const app = this.getApplicationById(applicationId);
    if (!app) throw new Error('Application not found');
    const job = this.getJobById(app.jobId);
    if (!job) throw new Error('Job not found');

    const newInterview: InterviewSchedule = {
      id: `int_${Date.now()}`,
      applicationId,
      jobId: app.jobId,
      candidateId: app.candidateId,
      recruiterId: app.recruiterId,
      interviewDate,
      interviewTime,
      roundName: roundName || 'Walk-in In-Person Round 1',
      interviewerName: interviewerName || 'Hiring Panel',
      venueSnapshot: {
        venueName: job.walkInSettings.venueName,
        fullAddress: job.walkInSettings.fullAddress,
        googleMapsUrl: job.walkInSettings.googleMapsUrl
      },
      instructions: instructions || job.walkInSettings.instructions,
      attendanceStatus: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const interviews = this.getInterviews();
    interviews.unshift(newInterview);
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));

    // Update application status to 'interview_scheduled'
    this.updateApplicationStatus(applicationId, 'interview_scheduled', `Interview scheduled for ${interviewDate} at ${interviewTime} (${roundName})`);

    this.addNotification({
      userId: app.candidateId,
      type: 'interview_scheduled',
      title: 'Interview Scheduled & Venue Unlocked!',
      message: `Your interview for "${job.title}" has been scheduled for ${interviewDate} at ${interviewTime}. Check venue details and directions.`,
      link: '/candidate/interviews',
      emailQueued: true
    });

    this.addAuditLog('INTERVIEW_SCHEDULED', `Scheduled interview for Candidate ${app.candidateId} on ${interviewDate} at ${interviewTime}`);
    return newInterview;
  }

  public updateInterviewAttendance(interviewId: string, status: 'scheduled' | 'attended' | 'absent' | 'selected' | 'on_hold', notes?: string): InterviewSchedule {
    const interviews = this.getInterviews();
    const index = interviews.findIndex(i => i.id === interviewId);
    if (index < 0) throw new Error('Interview not found');

    interviews[index].attendanceStatus = status;
    if (notes) interviews[index].notes = notes;
    interviews[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(interviews));

    // If attended or selected, update application status
    const app = this.getApplicationById(interviews[index].applicationId);
    if (app) {
      if (status === 'attended') {
        this.updateApplicationStatus(app.id, 'interview_scheduled', 'Candidate attended walk-in interview.');
      } else if (status === 'absent') {
        this.updateApplicationStatus(app.id, 'not_attended', 'Candidate was absent for walk-in interview slot.');
      } else if (status === 'selected') {
        this.updateApplicationStatus(app.id, 'selected', 'Candidate successfully cleared rounds and was selected!');
      }
    }

    this.addAuditLog('INTERVIEW_ATTENDANCE_UPDATED', `Interview ${interviewId} marked as ${status}`);
    return interviews[index];
  }

  // --- Interview Slots ---
  public getInterviewSlots(jobId?: string): InterviewSlot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SLOTS);
    const slots: InterviewSlot[] = raw ? JSON.parse(raw) : INITIAL_SLOTS;
    return jobId ? slots.filter(s => s.jobId === jobId) : slots;
  }

  public addInterviewSlot(slot: Omit<InterviewSlot, 'id' | 'bookedCount'>): InterviewSlot {
    const slots = this.getInterviewSlots();
    const newSlot: InterviewSlot = {
      ...slot,
      id: `slot_${Date.now()}`,
      bookedCount: 0
    };
    slots.push(newSlot);
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    return newSlot;
  }

  // --- Conversations & Messaging ---
  public getConversations(userId: string): Conversation[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const convs: Conversation[] = raw ? JSON.parse(raw) : INITIAL_CONVERSATIONS;
    return convs.filter(c => c.candidateId === userId || c.recruiterId === userId);
  }

  public getMessages(conversationId: string): ChatMessage[] {
    const raw = localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`);
    return raw ? JSON.parse(raw) : [
      {
        id: 'msg_1',
        conversationId,
        senderId: 'recruiter_1',
        senderRole: 'recruiter',
        senderName: 'Priya Sundaram',
        messageText: 'Hello! Looking forward to meeting you at our Novatix walk-in recruitment drive.',
        timestamp: '2026-11-04T12:00:00Z',
        isRead: true
      },
      {
        id: 'msg_2',
        conversationId,
        senderId: 'candidate_1',
        senderRole: 'candidate',
        senderName: 'Rahul Sharma',
        messageText: 'Thank you Priya! I will be there on Nov 22 at 10:30 AM with all requested certificates.',
        timestamp: '2026-11-04T12:30:00Z',
        isRead: true
      },
      {
        id: 'msg_3',
        conversationId,
        senderId: 'recruiter_1',
        senderRole: 'recruiter',
        senderName: 'Priya Sundaram',
        messageText: 'Please remember to bring your original pharmacy council registration certificate.',
        timestamp: '2026-11-04T14:30:00Z',
        isRead: false
      }
    ];
  }

  public sendMessage(conversationId: string, senderId: string, senderRole: UserRole, senderName: string, text: string): ChatMessage {
    const messages = this.getMessages(conversationId);
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderRole,
      senderName,
      messageText: text,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    messages.push(newMsg);
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${conversationId}`, JSON.stringify(messages));

    // Update conversation last message
    const convs = this.getConversations(senderId);
    const conv = convs.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessageText = text;
      conv.lastMessageAt = newMsg.timestamp;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convs));
    }
    return newMsg;
  }

  // --- Notifications ---
  public getNotifications(userId: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    return notifs.filter(n => n.userId === userId);
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead' | 'emailStatus'>): AppNotification {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = raw ? JSON.parse(raw) : [];
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      emailStatus: 'sent' // Simulated hosting SMTP execution
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = raw ? JSON.parse(raw) : [];
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notifs: AppNotification[] = raw ? JSON.parse(raw) : [];
    notifs.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  }

  public addAuditLog(action: string, details: string): void {
    const logs = this.getAuditLogs();
    const role = this.getCurrentRole();
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      userId: this.getCurrentUserId(),
      userName: role === 'admin' ? 'Platform SuperAdmin' : role === 'recruiter' ? this.getCurrentRecruiter().name : this.getCandidateProfile().name,
      userRole: role,
      action,
      details,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 100))); // keep latest 100
  }

  // --- Reset All Mock Data ---
  public resetToFactoryDefaults(): void {
    localStorage.clear();
    this.initDefaults();
  }
}

export const storageService = WalkinStorageService.getInstance();

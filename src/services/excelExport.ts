/**
 * WALKIN - Excel (.xlsx) and CSV Export Service
 * Generates formatted multi-column spreadsheets for HR recruitment pipelines.
 */

import * as XLSX from 'xlsx';
import { JobApplication, JobVacancy, InterviewSchedule, CandidateProfile } from '../types';

export interface ExportFilters {
  jobId?: string;
  status?: string;
  qualification?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function exportRecruiterData(
  type: 'all' | 'shortlisted' | 'rejected' | 'selected' | 'interviews' | 'attendance' | 'screening',
  format: 'xlsx' | 'csv',
  applications: JobApplication[],
  jobs: JobVacancy[],
  interviews: InterviewSchedule[],
  candidates: Record<string, CandidateProfile>,
  filters?: ExportFilters
) {
  // 1. Filter applications
  let filteredApps = [...applications];
  if (filters?.jobId && filters.jobId !== 'all') {
    filteredApps = filteredApps.filter(a => a.jobId === filters.jobId);
  }
  if (filters?.status && filters.status !== 'all') {
    filteredApps = filteredApps.filter(a => a.status === filters.status);
  }

  // Type-specific filters
  if (type === 'shortlisted') {
    filteredApps = filteredApps.filter(a => ['shortlisted', 'interview_scheduled', 'selected'].includes(a.status));
  } else if (type === 'rejected') {
    filteredApps = filteredApps.filter(a => a.status === 'rejected');
  } else if (type === 'selected') {
    filteredApps = filteredApps.filter(a => a.status === 'selected');
  }

  const jobMap = new Map<string, JobVacancy>();
  jobs.forEach(j => jobMap.set(j.id, j));

  const interviewMap = new Map<string, InterviewSchedule>();
  interviews.forEach(i => interviewMap.set(i.applicationId, i));

  // 2. Build rows
  const rows = filteredApps.map((app, index) => {
    const job = jobMap.get(app.jobId);
    const candidate = candidates[app.candidateId] || {
      name: 'Applicant ' + app.candidateId,
      email: 'candidate@example.com',
      phone: '+91 90000 00000',
      currentQualification: 'Graduate',
      experienceYears: 1,
      skills: []
    };
    const interview = interviewMap.get(app.id);

    // Screening answers formatting
    const q1Text = app.screeningAnswers[0]?.questionText || 'Q1';
    const a1Text = app.screeningAnswers[0]?.answerText || 'N/A';
    const q2Text = app.screeningAnswers[1]?.questionText || 'Q2';
    const a2Text = app.screeningAnswers[1]?.answerText || 'N/A';
    const q3Text = app.screeningAnswers[2]?.questionText || 'Q3';
    const a3Text = app.screeningAnswers[2]?.answerText || 'N/A';

    return {
      'S.No': index + 1,
      'Application ID': app.id,
      'Job Title': job?.title || 'Unknown Vacancy',
      'Walk-In Mode': job?.walkInSettings.mode === 'open_walkin' ? 'Open Walk-in' : 'Candidate-Selected Walk-in',
      'Candidate Name': candidate.name,
      'Candidate Email': candidate.email,
      'Candidate Phone': candidate.phone,
      'Educational Qualification': candidate.currentQualification,
      'Experience (Years)': candidate.experienceYears,
      'Candidate Skills': candidate.skills.join(', '),
      'Resume Submitted': app.resumeSnapshot.fileName || app.resumeSnapshot.name,
      'Applied Date': new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      'Current Status': app.status.toUpperCase().replace('_', ' '),
      [`Q1: ${q1Text}`]: a1Text,
      [`Q2: ${q2Text}`]: a2Text,
      [`Q3: ${q3Text}`]: a3Text,
      'Interview Date': interview ? interview.interviewDate : 'Not Scheduled',
      'Interview Time Slot': interview ? interview.interviewTime : 'N/A',
      'Interview Round': interview ? interview.roundName : 'N/A',
      'Interviewer': interview ? interview.interviewerName : 'N/A',
      'Attendance Status': interview ? interview.attendanceStatus.toUpperCase() : 'PENDING',
      'Final Outcome': app.status === 'selected' ? 'HIRED / SELECTED' : app.status === 'rejected' ? 'REJECTED' : 'IN PROGRESS'
    };
  });

  if (rows.length === 0) {
    // Add empty fallback row with headers
    rows.push({
      'S.No': 1,
      'Application ID': 'NO_RECORDS',
      'Job Title': 'No applicants found matching filter criteria',
      'Walk-In Mode': '-',
      'Candidate Name': '-',
      'Candidate Email': '-',
      'Candidate Phone': '-',
      'Educational Qualification': '-',
      'Experience (Years)': 0,
      'Candidate Skills': '-',
      'Resume Submitted': '-',
      'Applied Date': '-',
      'Current Status': '-',
      'Q1: Total experience?': '-',
      'Q2: Current CTC?': '-',
      'Q3: Notice period?': '-',
      'Interview Date': '-',
      'Interview Time Slot': '-',
      'Interview Round': '-',
      'Interviewer': '-',
      'Attendance Status': '-',
      'Final Outcome': '-'
    });
  }

  // 3. Create Workbook & Sheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  const colWidths = [
    { wch: 6 },  // S.No
    { wch: 14 }, // App ID
    { wch: 30 }, // Job Title
    { wch: 24 }, // Mode
    { wch: 20 }, // Candidate Name
    { wch: 25 }, // Email
    { wch: 16 }, // Phone
    { wch: 18 }, // Qualification
    { wch: 12 }, // Experience
    { wch: 28 }, // Skills
    { wch: 26 }, // Resume
    { wch: 14 }, // Applied Date
    { wch: 18 }, // Current Status
    { wch: 22 }, // Q1
    { wch: 22 }, // Q2
    { wch: 22 }, // Q3
    { wch: 14 }, // Interview Date
    { wch: 16 }, // Interview Time
    { wch: 24 }, // Round
    { wch: 20 }, // Interviewer
    { wch: 18 }, // Attendance
    { wch: 18 }  // Outcome
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = type.toUpperCase().substring(0, 31);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `WALKIN_Report_${type}_${timestamp}.${format}`;

  if (format === 'csv') {
    XLSX.writeFile(workbook, filename, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
  }
}

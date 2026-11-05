/**
 * WALKIN - Recruiter / HR Portal Component
 * Includes Multi-Step Walk-In Job Creation (Mode A & Mode B, Exactly 3 Questions, Custom Degrees),
 * Candidate Pipeline Management, Interview Scheduling & Slots, Excel/CSV Exports, and Company Profile.
 */

import React, { useState, useMemo } from 'react';
import {
  JobVacancy,
  JobApplication,
  RecruiterProfile,
  Company,
  InterviewSchedule,
  InterviewSlot,
  ApplicationStatus,
  WalkInMode,
  EmploymentCategory,
  ScreeningQuestion
} from '../../types';
import { storageService } from '../../services/storage';
import { exportRecruiterData } from '../../services/excelExport';
import { STANDARD_QUALIFICATIONS } from '../../data/mockData';
import {
  Briefcase,
  Users,
  Calendar,
  FileSpreadsheet,
  PlusCircle,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
  Unlock,
  ExternalLink,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Send,
  MessageSquare,
  HelpCircle,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface RecruiterPortalProps {
  initialTab?: string;
  onRefresh: () => void;
}

export const RecruiterPortal: React.FC<RecruiterPortalProps> = ({
  initialTab = 'overview',
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const recruiter = storageService.getCurrentRecruiter();
  const company = storageService.getCompanyById(recruiter.companyId);

  // Storage data
  const allJobs = storageService.getJobs().filter(j => j.companyId === recruiter.companyId);
  const allApplications = storageService.getApplications().filter(a => a.companyId === recruiter.companyId);
  const allInterviews = storageService.getInterviews().filter(i => i.recruiterId === recruiter.id || allJobs.some(j => j.id === i.jobId));
  const candidate = storageService.getCandidateProfile();

  // Candidate map for exports and lookups
  const candidateMap: Record<string, any> = {
    [candidate.id]: candidate
  };

  // Pipeline Filter state
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [applicantSearch, setApplicantSearch] = useState('');

  // Selected Application for Inspection / Status update
  const [inspectedApp, setInspectedApp] = useState<JobApplication | null>(null);

  // Interview Scheduling Modal state
  const [schedulingApp, setSchedulingApp] = useState<JobApplication | null>(null);
  const [interviewDate, setInterviewDate] = useState('2026-11-22');
  const [interviewTime, setInterviewTime] = useState('10:30 AM');
  const [roundName, setRoundName] = useState('Round 1 - Technical Assessment');
  const [interviewerName, setInterviewerName] = useState('Hiring Manager');
  const [interviewNotes, setInterviewNotes] = useState('Please arrive 15 minutes prior with 2 hard copy resumes.');

  // Excel Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'shortlisted' | 'rejected' | 'selected' | 'interviews' | 'attendance' | 'screening'>('all');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // ==========================================
  // MULTI-STEP JOB CREATION STATE (6 STEPS)
  // ==========================================
  const [jobStep, setJobStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('Conduct initial screening and evaluate candidate skills.\nCoordinate in-person interview rounds.\nMaintain accurate hiring documentation.');
  const [requiredSkills, setRequiredSkills] = useState('Communication, Domain Knowledge, Problem Solving');
  const [expMin, setExpMin] = useState(1);
  const [expMax, setExpMax] = useState(3);
  const [openings, setOpenings] = useState(10);
  const [salaryMin, setSalaryMin] = useState(350000);
  const [salaryMax, setSalaryMax] = useState(550000);
  const [salaryPeriod, setSalaryPeriod] = useState<'month' | 'year'>('year');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('Electronic City');
  const [workLocation, setWorkLocation] = useState<'On-site' | 'Hybrid'>('On-site');
  const [deadline, setDeadline] = useState('2026-11-30');

  // Step 2: Payroll
  const [employmentCategory, setEmploymentCategory] = useState<EmploymentCategory>('direct_company_payroll');
  const [staffingAgencyName, setStaffingAgencyName] = useState('');
  const [actualClientName, setActualClientName] = useState('');
  const [clientWorkLocation, setClientWorkLocation] = useState('');

  // Step 3: Qualifications (Searchable multi-select + custom degree add)
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(['B.Pharm', 'M.Pharm']);
  const [customDegreeInput, setCustomDegreeInput] = useState('');

  // Step 4: Walk-in Settings (Mode A vs Mode B)
  const [walkInMode, setWalkInMode] = useState<WalkInMode>('candidate_selected');
  const [venueName, setVenueName] = useState('Corporate Office Auditorium');
  const [fullAddress, setFullAddress] = useState('Plot 42, Tech Park, Hosur Main Road, Bengaluru, Karnataka 560100');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=Electronic+City+Phase+1+Bengaluru');
  const [interviewDateStart, setInterviewDateStart] = useState('2026-11-22');
  const [interviewDateEnd, setInterviewDateEnd] = useState('2026-11-23');
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [instructions, setInstructions] = useState('Bring 2 copies of resume, government ID card, and academic marksheets.');
  const [requiredDocuments, setRequiredDocuments] = useState('Updated Resume (2 copies), Valid Photo ID (Aadhaar/Passport), Academic Degree Certificates');

  // Step 5: EXACTLY 3 SCREENING QUESTIONS (MANDATORY)
  const [sq1, setSq1] = useState('Total years of experience?');
  const [sq2, setSq2] = useState('Current CTC in LPA?');
  const [sq3, setSq3] = useState('Notice period in days?');

  const [createJobError, setCreateJobError] = useState<string | null>(null);
  const [createJobSuccess, setCreateJobSuccess] = useState<string | null>(null);

  // Quick preset loader for 3 screening questions
  const applyQuestionPreset = (type: 'experience' | 'notice' | 'skills' | 'fresher') => {
    if (type === 'experience') {
      setSq1('Total experience years?');
      setSq2('Current CTC amount?');
      setSq3('Notice period days?');
    } else if (type === 'notice') {
      setSq1('Immediate joiner available?');
      setSq2('Expected monthly salary?');
      setSq3('Willing to relocate?');
    } else if (type === 'skills') {
      setSq1('Primary skill rating?');
      setSq2('Hands-on project experience?');
      setSq3('Comfortable with shifts?');
    } else if (type === 'fresher') {
      setSq1('Graduation year passed?');
      setSq2('Aggregate percentage score?');
      setSq3('Ready for on-site?');
    }
  };

  // Add custom degree to qualifications
  const handleAddCustomDegree = () => {
    if (!customDegreeInput.trim()) return;
    const clean = customDegreeInput.trim();
    if (!selectedQualifications.includes(clean)) {
      setSelectedQualifications([...selectedQualifications, clean]);
    }
    setCustomDegreeInput('');
  };

  // Toggle standard qualification
  const toggleQualification = (qual: string) => {
    if (selectedQualifications.includes(qual)) {
      if (selectedQualifications.length === 1) {
        alert('At least one educational qualification is mandatory.');
        return;
      }
      setSelectedQualifications(selectedQualifications.filter(q => q !== qual));
    } else {
      setSelectedQualifications([...selectedQualifications, qual]);
    }
  };

  // Handle Publish Vacancy
  const handlePublishJob = () => {
    setCreateJobError(null);

    // Validation
    if (!jobTitle.trim()) {
      setCreateJobError('Job title is required.');
      setJobStep(1);
      return;
    }
    if (!jobDescription.trim()) {
      setCreateJobError('Job description is required.');
      setJobStep(1);
      return;
    }
    if (selectedQualifications.length === 0) {
      setCreateJobError('At least one eligible educational qualification is mandatory.');
      setJobStep(3);
      return;
    }
    if (!venueName.trim() || !fullAddress.trim() || !googleMapsUrl.trim()) {
      setCreateJobError('Complete interview venue details & Google Maps URL are mandatory.');
      setJobStep(4);
      return;
    }
    if (!sq1.trim() || !sq2.trim() || !sq3.trim()) {
      setCreateJobError('EXACTLY THREE screening questions are mandatory.');
      setJobStep(5);
      return;
    }

    // Publish
    const newJob = storageService.createJob({
      recruiterId: recruiter.id,
      companyId: recruiter.companyId,
      title: jobTitle.trim(),
      department: department.trim() || 'Recruitment Operations',
      jobDescription: jobDescription.trim(),
      responsibilities: responsibilities.split('\n').filter(Boolean),
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      expMinYears: Number(expMin),
      expMaxYears: Number(expMax),
      openings: Number(openings),
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      salaryPeriod,
      city,
      locality,
      workLocation,
      applicationDeadline: deadline,
      employmentCategory,
      thirdPartyInfo: employmentCategory === 'third_party_payroll' ? {
        staffingAgencyName: staffingAgencyName.trim() || 'Apex Staffing Partners',
        actualClientName: actualClientName.trim() || 'Client Enterprise Corp',
        workLocation: clientWorkLocation.trim() || city
      } : undefined,
      qualifications: selectedQualifications,
      walkInSettings: {
        mode: walkInMode,
        venueName: venueName.trim(),
        fullAddress: fullAddress.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        interviewDateStart,
        interviewDateEnd,
        startTime,
        endTime,
        instructions: instructions.trim(),
        requiredDocuments: requiredDocuments.split(',').map(d => d.trim()).filter(Boolean)
      },
      screeningQuestions: [
        { id: `sq_${Date.now()}_1`, questionText: sq1.trim(), order: 1 },
        { id: `sq_${Date.now()}_2`, questionText: sq2.trim(), order: 2 },
        { id: `sq_${Date.now()}_3`, questionText: sq3.trim(), order: 3 }
      ],
      status: 'active'
    });

    setCreateJobSuccess('Walk-in vacancy published successfully free of charge!');
    onRefresh();
    setTimeout(() => {
      setCreateJobSuccess(null);
      setActiveTab('vacancies');
      setJobStep(1);
    }, 1200);
  };

  // Pipeline Filter logic
  const filteredApplicants = useMemo(() => {
    return allApplications.filter(app => {
      if (selectedJobFilter !== 'all' && app.jobId !== selectedJobFilter) return false;
      if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) return false;

      if (applicantSearch.trim()) {
        const q = applicantSearch.toLowerCase();
        const cand = candidateMap[app.candidateId] || candidate;
        const job = allJobs.find(j => j.id === app.jobId);
        const matchName = cand.name.toLowerCase().includes(q);
        const matchEmail = cand.email.toLowerCase().includes(q);
        const matchPhone = cand.phone.toLowerCase().includes(q);
        const matchTitle = job?.title.toLowerCase().includes(q) || false;
        if (!matchName && !matchEmail && !matchPhone && !matchTitle) return false;
      }
      return true;
    });
  }, [allApplications, selectedJobFilter, selectedStatusFilter, applicantSearch, allJobs, candidateMap, candidate]);

  // Handle Status Update
  const handleUpdateStatus = (appId: string, status: ApplicationStatus, note?: string) => {
    storageService.updateApplicationStatus(appId, status, note);
    onRefresh();
    if (inspectedApp && inspectedApp.id === appId) {
      setInspectedApp(storageService.getApplicationById(appId) || null);
    }
  };

  // Handle Interview Schedule Confirm
  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingApp) return;

    storageService.scheduleInterview(
      schedulingApp.id,
      interviewDate,
      interviewTime,
      roundName,
      interviewerName,
      interviewNotes
    );

    setSchedulingApp(null);
    onRefresh();
    alert('Interview slot successfully scheduled! The walk-in venue has been unlocked for the candidate.');
  };

  // Handle Export Execute
  const handleExecuteExport = () => {
    exportRecruiterData(
      exportScope,
      exportFormat,
      allApplications,
      allJobs,
      allInterviews,
      candidateMap,
      { jobId: selectedJobFilter }
    );
    setShowExportModal(false);
  };

  // Dashboard Stats Calculations
  const totalVacancies = allJobs.length;
  const totalApps = allApplications.length;
  const viewedApps = allApplications.filter(a => a.status === 'viewed').length;
  const shortlistedApps = allApplications.filter(a => ['shortlisted', 'interview_scheduled', 'selected'].includes(a.status)).length;
  const rejectedApps = allApplications.filter(a => a.status === 'rejected').length;
  const scheduledInterviews = allInterviews.length;
  const selectedApps = allApplications.filter(a => a.status === 'selected').length;
  const absentCandidates = allApplications.filter(a => a.status === 'not_attended').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Recruiter Navigation Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>HR Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Walk-In Vacancy</span>
          </button>

          <button
            onClick={() => setActiveTab('vacancies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'vacancies'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Manage Vacancies</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {allJobs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Candidate Pipeline</span>
            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
              {allApplications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'interviews'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Interview Slots</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
              {allInterviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'company'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>
        </div>

        {/* Excel Export CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & DASHBOARD METRICS */}
      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          {/* Welcome / Verification Status Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img
                src={company?.logoUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=128&q=80'}
                alt={company?.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900">{company?.name}</h1>
                  {company?.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Company Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Verification Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Recruiter: <strong>{recruiter.name}</strong> ({recruiter.designation}) • Official Domain: <code>@{company?.officialDomain}</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                Free Unlimited Vacancy Posting
              </span>
            </div>
          </div>

          {/* HR KPI Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Active Vacancies</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{totalVacancies}</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Live on portal</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Total Applications</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{totalApps}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">With screening answers</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Shortlisted Candidates</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{shortlistedApps}</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Venues unlocked</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Interviews Scheduled</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{scheduledInterviews}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Slot assigned</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Selected / Hired</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{selectedApps}</span>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Cleared rounds</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Rejected</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">{rejectedApps}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Status updated</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Candidate Absent</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{absentCandidates}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">No-show for drive</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Applications Viewed</span>
              <span className="text-2xl font-black text-slate-700 mt-1 block">{viewedApps}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Under evaluation</span>
            </div>
          </div>

          {/* Recent Candidates & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Walk-In Applicants</h3>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View All Pipeline
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {allApplications.slice(0, 4).map(app => {
                  const job = allJobs.find(j => j.id === app.jobId);
                  const cand = candidateMap[app.candidateId] || candidate;

                  return (
                    <div key={app.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{cand.name}</span>
                        <span className="text-slate-500 text-[11px]">
                          Applied for: <strong>{job?.title}</strong> • {cand.currentQualification}
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                          <span>Q1 Ans: <strong>{app.screeningAnswers[0]?.answerText}</strong></span>
                          <span>•</span>
                          <span>Q2 Ans: <strong>{app.screeningAnswers[1]?.answerText}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectedApp(app)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                        >
                          Review Answers
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Export / Walk-in rules helper */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Walk-In Modes Reference</span>
              </h3>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block text-xs">Mode A: Candidate-Selected</span>
                <p className="text-[11px] text-slate-500">
                  Venue is confidential. Address and Google Maps directions unlock automatically only when HR changes status to Shortlisted or Schedules an Interview.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block text-xs">Mode B: Open Walk-In</span>
                <p className="text-[11px] text-slate-500">
                  Public recruitment drive. Venue address, dates, and Google Maps URL are immediately visible to all candidates on the portal.
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Generate HR Excel Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CREATE WALK-IN VACANCY (MULTI-STEP WIZARD) */}
      {activeTab === 'create' && (
        <div className="mt-6 max-w-4xl mx-auto space-y-6">
          {/* Multi-Step Progress Indicator */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              {[
                { num: 1, label: 'Job Details' },
                { num: 2, label: 'Payroll Category' },
                { num: 3, label: 'Qualifications' },
                { num: 4, label: 'Walk-In Venue' },
                { num: 5, label: '3 Screening Qs' },
                { num: 6, label: 'Preview & Publish' }
              ].map(s => (
                <div
                  key={s.num}
                  onClick={() => setJobStep(s.num as any)}
                  className={`flex items-center gap-1.5 cursor-pointer ${
                    jobStep === s.num
                      ? 'text-blue-600 font-bold'
                      : jobStep > s.num
                      ? 'text-emerald-600 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      jobStep === s.num
                        ? 'bg-blue-600 text-white'
                        : jobStep > s.num
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {jobStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {createJobError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createJobError}</span>
            </div>
          )}

          {createJobSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{createJobSuccess}</span>
            </div>
          )}

          {/* STEP 1: JOB DETAILS */}
          {jobStep === 1 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 1: Core Job Details</h3>
                <p className="text-slate-500">Specify job title, description, skills, and compensation parameters.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="e.g. Junior Pharmacovigilance Associate"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Clinical Operations / R&D"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Comprehensive description of the walk-in vacancy, project context, and daily duties..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Key Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={responsibilities}
                  onChange={e => setResponsibilities(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Required Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={e => setRequiredSkills(e.target.value)}
                  placeholder="e.g. Drug Safety, Argus, MedDRA, ICH-GCP"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Exp Min (Yrs)</label>
                  <input
                    type="number"
                    min={0}
                    value={expMin}
                    onChange={e => setExpMin(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Exp Max (Yrs)</label>
                  <input
                    type="number"
                    min={0}
                    value={expMax}
                    onChange={e => setExpMax(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={openings}
                    onChange={e => setOpenings(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Work Location</label>
                  <select
                    value={workLocation}
                    onChange={e => setWorkLocation(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Salary Min (₹)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={e => setSalaryMin(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Salary Max (₹)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={e => setSalaryMax(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Salary Period</label>
                  <select
                    value={salaryPeriod}
                    onChange={e => setSalaryPeriod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="year">Per Year (LPA)</option>
                    <option value="month">Per Month</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Locality</label>
                  <input
                    type="text"
                    value={locality}
                    onChange={e => setLocality(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setJobStep(2)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Next: Employment Category →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EMPLOYMENT CATEGORY */}
          {jobStep === 2 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 2: Employment & Payroll Category</h3>
                <p className="text-slate-500">
                  Select whether the position is direct company payroll, contractual, or third-party staffing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'direct_company_payroll', label: 'Direct Company Payroll', desc: 'Permanent full-time employment with the company.' },
                  { id: 'third_party_payroll', label: 'Third-Party Payroll', desc: 'Employed via a staffing agency deployed to a client facility.' },
                  { id: 'contractual', label: 'Contractual Employment', desc: 'Fixed-term contract position.' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      employmentCategory === opt.id
                        ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="employmentCategory"
                      value={opt.id}
                      checked={employmentCategory === opt.id}
                      onChange={() => setEmploymentCategory(opt.id as any)}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-slate-900 block mt-2">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{opt.desc}</span>
                  </label>
                ))}
              </div>

              {/* If Third-party payroll selected, show required fields */}
              {employmentCategory === 'third_party_payroll' && (
                <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-purple-900">Third-Party Staffing Specifics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-purple-900 block mb-1">Staffing Agency Name</label>
                      <input
                        type="text"
                        value={staffingAgencyName}
                        onChange={e => setStaffingAgencyName(e.target.value)}
                        placeholder="e.g. Apex Staffing Partners"
                        className="w-full bg-white border border-purple-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-purple-900 block mb-1">Actual Client / Company Name</label>
                      <input
                        type="text"
                        value={actualClientName}
                        onChange={e => setActualClientName(e.target.value)}
                        placeholder="e.g. GlobalBio Pharma Labs"
                        className="w-full bg-white border border-purple-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-purple-900 block mb-1">Client Work Location</label>
                      <input
                        type="text"
                        value={clientWorkLocation}
                        onChange={e => setClientWorkLocation(e.target.value)}
                        placeholder="e.g. Whitefield Campus"
                        className="w-full bg-white border border-purple-300 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setJobStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setJobStep(3)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Next: Educational Qualifications →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: EDUCATIONAL QUALIFICATIONS (MANDATORY SEARCHABLE + CUSTOM) */}
          {jobStep === 3 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Step 3: Eligible Educational Qualifications <span className="text-rose-500">*</span>
                </h3>
                <p className="text-slate-500">
                  Mandatory requirement. Select all degrees eligible for this vacancy, or type and add custom qualifications.
                </p>
              </div>

              {/* Standard Qualifications Chips */}
              <div>
                <label className="font-semibold text-slate-800 block mb-2">Standard Qualifications:</label>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_QUALIFICATIONS.map(deg => {
                    const isSelected = selectedQualifications.includes(deg);
                    return (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => toggleQualification(deg)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {deg} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Degree Input */}
              <div className="pt-3 border-t border-slate-100">
                <label className="font-semibold text-slate-800 block mb-1">
                  Add Custom Degree / Specialization:
                </label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={customDegreeInput}
                    onChange={e => setCustomDegreeInput(e.target.value)}
                    placeholder="e.g. BDS, MBBS, M.Tech (Bio), Pharm.D..."
                    className="flex-1 border border-slate-300 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDegree}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
                  >
                    + Add Degree
                  </button>
                </div>
              </div>

              {/* Currently Selected Summary */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Currently Eligible ({selectedQualifications.length}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedQualifications.map(deg => (
                    <span
                      key={deg}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-blue-800 font-semibold border border-blue-200"
                    >
                      {deg}
                      <X
                        className="w-3 h-3 cursor-pointer text-slate-400 hover:text-rose-500"
                        onClick={() => toggleQualification(deg)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setJobStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setJobStep(4)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Next: Walk-In Venue Settings →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: WALK-IN INTERVIEW SETTINGS (MODE A vs MODE B) */}
          {jobStep === 4 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 4: Walk-In Interview Settings</h3>
                <p className="text-slate-500">
                  Select the walk-in privacy mode and enter coordinates, dates, and instructions.
                </p>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-2">
                  Select Walk-In Mode <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      walkInMode === 'candidate_selected'
                        ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="walkInMode"
                      value="candidate_selected"
                      checked={walkInMode === 'candidate_selected'}
                      onChange={() => setWalkInMode('candidate_selected')}
                      className="text-amber-600"
                    />
                    <div className="flex items-center gap-1.5 mt-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-slate-900">MODE A: Candidate-Selected Walk-In</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Venue is confidential and locked from public view. Unlocks only after HR shortlists the candidate!
                    </p>
                  </label>

                  <label
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      walkInMode === 'open_walkin'
                        ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="walkInMode"
                      value="open_walkin"
                      checked={walkInMode === 'open_walkin'}
                      onChange={() => setWalkInMode('open_walkin')}
                      className="text-emerald-600"
                    />
                    <div className="flex items-center gap-1.5 mt-2">
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">MODE B: Open Walk-In Drive</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Venue address and Google Maps directions are immediately visible to all candidates browsing the vacancy.
                    </p>
                  </label>
                </div>
              </div>

              {/* Venue Coordinates & Google Maps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Interview Venue Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={e => setVenueName(e.target.value)}
                    placeholder="e.g. Novatix R&D Centre - Building 4B"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Google Maps URL (External Link) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={googleMapsUrl}
                    onChange={e => setGoogleMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Zero paid map APIs needed. Standard Google Maps share link.
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Full Venue Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={fullAddress}
                  onChange={e => setFullAddress(e.target.value)}
                  placeholder="Street, Landmark, City, State, PIN code..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={interviewDateStart}
                    onChange={e => setInterviewDateStart(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={interviewDateEnd}
                    onChange={e => setInterviewDateEnd(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Special Candidate Instructions</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Required Documents to Carry (Comma-separated)</label>
                <input
                  type="text"
                  value={requiredDocuments}
                  onChange={e => setRequiredDocuments(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setJobStep(3)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setJobStep(5)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Next: Exactly 3 Screening Questions →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: MANDATORY EXACTLY 3 SCREENING QUESTIONS */}
          {jobStep === 5 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    PLATFORM MANDATORY RULE
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Step 5: Exactly Three Screening Questions
                  </h3>
                </div>
                <p className="text-slate-500 mt-1">
                  Every vacancy must contain <strong>EXACTLY THREE</strong> screening questions. Not two, not four. Candidates must answer in 1 to 3 words.
                </p>
              </div>

              {/* Template Presets Bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-2">Apply Question Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyQuestionPreset('experience')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    Experience & Notice Period Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuestionPreset('notice')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    Immediate Joiner Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuestionPreset('skills')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    Technical Rating Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => applyQuestionPreset('fresher')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium"
                  >
                    Fresh Graduate Preset
                  </button>
                </div>
              </div>

              {/* 3 Questions Inputs */}
              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-xl border border-blue-200">
                  <label className="font-bold text-slate-900 block mb-1">
                    Question 1 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sq1}
                    onChange={e => setSq1(e.target.value)}
                    placeholder="e.g. Total years of experience?"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Candidate will be prompted for 1-3 words (e.g. "2 years")
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-blue-200">
                  <label className="font-bold text-slate-900 block mb-1">
                    Question 2 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sq2}
                    onChange={e => setSq2(e.target.value)}
                    placeholder="e.g. Current CTC amount?"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Candidate will be prompted for 1-3 words (e.g. "4.5 LPA")
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-blue-200">
                  <label className="font-bold text-slate-900 block mb-1">
                    Question 3 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sq3}
                    onChange={e => setSq3(e.target.value)}
                    placeholder="e.g. Notice period days?"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Candidate will be prompted for 1-3 words (e.g. "Immediate joiner")
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setJobStep(4)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setJobStep(6)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Next: Preview & Publish →
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW & PUBLISH */}
          {jobStep === 6 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 6: Review & Publish Walk-In Drive</h3>
                <p className="text-slate-500">Verify all walk-in coordinates before making the listing live.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900">{jobTitle || 'Untitled Vacancy'}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    walkInMode === 'open_walkin' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {walkInMode === 'open_walkin' ? 'OPEN WALK-IN' : 'CANDIDATE-SELECTED WALK-IN'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                  <div>Department: <strong>{department || 'General'}</strong></div>
                  <div>Openings: <strong>{openings}</strong></div>
                  <div>Location: <strong>{city}, {locality}</strong></div>
                  <div>Salary: <strong>₹{(salaryMin / 100000).toFixed(1)} - {(salaryMax / 100000).toFixed(1)} LPA</strong></div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700">Eligible Degrees:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedQualifications.map(deg => (
                      <span key={deg} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-blue-700 font-semibold">
                        {deg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Venue Coordinates:</span>
                  <p className="text-slate-600 mt-0.5">{venueName} • {fullAddress}</p>
                  <p className="text-[11px] text-blue-600 truncate mt-0.5">Link: {googleMapsUrl}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800">3 Mandatory Screening Questions:</span>
                  <ol className="list-decimal list-inside text-slate-700 space-y-0.5 mt-1">
                    <li>{sq1}</li>
                    <li>{sq2}</li>
                    <li>{sq3}</li>
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setJobStep(5)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handlePublishJob}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Walk-In Vacancy Free</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE VACANCIES */}
      {activeTab === 'vacancies' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Posted Walk-In Vacancies</h2>
            <button
              onClick={() => {
                setActiveTab('create');
                setJobStep(1);
              }}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Vacancy</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Job ID & Title</th>
                  <th className="p-3">Walk-In Mode</th>
                  <th className="p-3">Applications</th>
                  <th className="p-3">Eligible Degrees</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{job.title}</span>
                      <span className="text-[10px] text-slate-400">ID: {job.id} • {job.city}</span>
                    </td>
                    <td className="p-3">
                      {job.walkInSettings.mode === 'open_walkin' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Open Walk-In
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Candidate-Selected
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800">{job.applicationsCount}</span> applicants
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-blue-700 font-medium">
                        {job.qualifications.slice(0, 2).join(', ')}
                        {job.qualifications.length > 2 && ` +${job.qualifications.length - 2}`}
                      </span>
                    </td>
                    <td className="p-3 text-[11px]">
                      {job.walkInSettings.interviewDateStart}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedJobFilter(job.id);
                          setActiveTab('pipeline');
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold mr-1"
                      >
                        Pipeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CANDIDATE PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Walk-In Applicant Pipeline</h2>
              <p className="text-xs text-slate-500">
                Review candidate resumes and validated screening answers. Shortlisting instantly unlocks restricted venues.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Pipeline to Excel</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={applicantSearch}
                onChange={e => setApplicantSearch(e.target.value)}
                placeholder="Search candidate name, email, phone..."
                className="w-full focus:outline-none text-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-500">Vacancy:</label>
              <select
                value={selectedJobFilter}
                onChange={e => setSelectedJobFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
              >
                <option value="all">All Vacancies</option>
                {allJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-500">Status:</label>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="applied">Applied</option>
                <option value="viewed">Viewed</option>
                <option value="shortlisted">Shortlisted (Venue Unlocked)</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Candidates Pipeline Cards / Table */}
          <div className="space-y-3">
            {filteredApplicants.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No applicants found matching this filter.</p>
              </div>
            ) : (
              filteredApplicants.map(app => {
                const job = allJobs.find(j => j.id === app.jobId);
                const cand = candidateMap[app.candidateId] || candidate;

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{cand.name}</span>
                          <span className="text-slate-400 text-xs">• {cand.currentQualification}</span>
                          <span className="text-slate-400 text-xs">• {cand.experienceYears} Yrs Exp</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Applying for: <strong>{job?.title}</strong> • Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status and Action Buttons */}
                      <div className="flex items-center gap-2">
                        {app.status === 'applied' && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-[11px] border border-blue-200">
                            New Application
                          </span>
                        )}
                        {app.status === 'shortlisted' && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[11px] border border-emerald-200">
                            Shortlisted (Venue Unlocked)
                          </span>
                        )}
                        {app.status === 'interview_scheduled' && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full font-bold text-[11px] border border-purple-200">
                            Slot Scheduled
                          </span>
                        )}
                        {app.status === 'selected' && (
                          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full font-bold text-[11px]">
                            Selected / Hired
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full font-bold text-[11px] border border-rose-200">
                            Rejected
                          </span>
                        )}

                        <button
                          onClick={() => setInspectedApp(app)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          Details & Qs
                        </button>
                      </div>
                    </div>

                    {/* Direct 3 Screening Answers Inspection */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {app.screeningAnswers.map((ans, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[10px] text-slate-400 block font-medium">Q{idx + 1}: {ans.questionText}</span>
                          <span className="font-bold text-slate-800 text-xs">{ans.answerText}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({ans.wordCount} words)</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar: Shortlist / Reject / Schedule */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>Resume: <strong>{app.resumeSnapshot.fileName}</strong></span>
                        <button
                          onClick={() => alert(`Simulating authenticated download of resume ${app.resumeSnapshot.fileName}`)}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 ml-2"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {app.status !== 'shortlisted' && app.status !== 'interview_scheduled' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'shortlisted', 'Candidate shortlisted for interview.')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Shortlist (Unlock Venue)</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSchedulingApp(app)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Schedule Slot</span>
                        </button>

                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected', 'Candidate rejected after screening.')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: INTERVIEW SLOTS & ATTENDANCE */}
      {activeTab === 'interviews' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Scheduled Walk-In Slots & Attendance Records</h2>
              <p className="text-xs text-slate-500">
                Manage interview timing, capacity slots, and record live on-site attendance.
              </p>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Attendance Sheet</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Vacancy</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Round & Interviewer</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInterviews.map(int => {
                  const job = allJobs.find(j => j.id === int.jobId);
                  const cand = candidateMap[int.candidateId] || candidate;

                  return (
                    <tr key={int.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{cand.name}</span>
                        <span className="text-[10px] text-slate-400">{cand.phone}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800">{job?.title}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {int.interviewDate} @ {int.interviewTime}
                      </td>
                      <td className="p-3 text-[11px]">
                        <span className="font-semibold text-slate-800 block">{int.roundName}</span>
                        <span className="text-slate-400">Panel: {int.interviewerName}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                          int.attendanceStatus === 'attended'
                            ? 'bg-emerald-100 text-emerald-800'
                            : int.attendanceStatus === 'absent'
                            ? 'bg-rose-100 text-rose-800'
                            : int.attendanceStatus === 'selected'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {int.attendanceStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              storageService.updateInterviewAttendance(int.id, 'attended', 'Candidate arrived on time.');
                              onRefresh();
                            }}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold"
                          >
                            Mark Attended
                          </button>
                          <button
                            onClick={() => {
                              storageService.updateInterviewAttendance(int.id, 'absent', 'No show.');
                              onRefresh();
                            }}
                            className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold"
                          >
                            Mark Absent
                          </button>
                          <button
                            onClick={() => {
                              storageService.updateInterviewAttendance(int.id, 'selected', 'Cleared all rounds.');
                              onRefresh();
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[11px] font-semibold"
                          >
                            Selected
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: COMPANY & RECRUITER PROFILE */}
      {activeTab === 'company' && (
        <div className="mt-6 max-w-3xl mx-auto space-y-6 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Company & Recruiter Verification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  disabled
                  value={company?.name}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Website (Mandatory)</label>
                <input
                  type="url"
                  disabled
                  value={company?.website}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Domain</label>
                <input
                  type="text"
                  disabled
                  value={`@${company?.officialDomain}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-medium text-purple-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Company Email</label>
                <input
                  type="email"
                  disabled
                  value={recruiter.officialCompanyEmail}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recruiter LinkedIn Profile (Mandatory)</label>
                <input
                  type="url"
                  disabled
                  value={recruiter.recruiterLinkedIn}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Verification Status</label>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved & Verified by Administrator</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
              <p className="font-semibold">Security Policy:</p>
              <p>Personal Gmail or Yahoo addresses are strictly prohibited for recruiter corporate registrations. All recruiter profiles require corporate domain emails and admin authorization prior to posting.</p>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Assign Walk-In Interview Slot</h3>
              <button
                onClick={() => setSchedulingApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="mt-4 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                <span className="font-bold block">Candidate: {candidateMap[schedulingApp.candidateId]?.name || 'Candidate'}</span>
                <span className="text-[11px] text-slate-500">Vacany ID: {schedulingApp.jobId}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Interview Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={interviewTime}
                    onChange={e => setInterviewTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Interview Round Title</label>
                <input
                  type="text"
                  required
                  value={roundName}
                  onChange={e => setRoundName(e.target.value)}
                  placeholder="e.g. Round 1 - Technical Assessment"
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Interviewer / Panel Name</label>
                <input
                  type="text"
                  required
                  value={interviewerName}
                  onChange={e => setInterviewerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Candidate Entry Notes</label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Scheduling this slot will instantly unlock the venue coordinates & Google Maps link for the candidate.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Confirm Slot & Unlock Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT CANDIDATE MODAL */}
      {inspectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Applicant Screening Review</h3>
              <button
                onClick={() => setInspectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  {candidateMap[inspectedApp.candidateId]?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{candidateMap[inspectedApp.candidateId]?.name}</h4>
                  <p className="text-slate-500">
                    {candidateMap[inspectedApp.candidateId]?.email} • {candidateMap[inspectedApp.candidateId]?.phone}
                  </p>
                </div>
              </div>

              {/* 3 Answers */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">Candidate's Screening Answers:</span>
                {inspectedApp.screeningAnswers.map((ans, i) => (
                  <div key={i} className="p-2 bg-white rounded border border-slate-200">
                    <p className="text-[11px] text-slate-500 font-medium">{ans.questionText}</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{ans.answerText}</p>
                  </div>
                ))}
              </div>

              {/* Resume Info */}
              <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-200">
                <div>
                  <span className="font-semibold text-blue-900 block">{inspectedApp.resumeSnapshot.fileName}</span>
                  <span className="text-[10px] text-slate-400">{inspectedApp.resumeSnapshot.fileSize}</span>
                </div>
                <button
                  onClick={() => alert(`Simulating authenticated download of resume ${inspectedApp.resumeSnapshot.fileName}`)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Resume</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setInspectedApp(null)}
                className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleUpdateStatus(inspectedApp.id, 'shortlisted');
                    setInspectedApp(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                >
                  Shortlist Candidate
                </button>
                <button
                  onClick={() => {
                    setSchedulingApp(inspectedApp);
                    setInspectedApp(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Schedule Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXCEL / CSV EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Export HR Spreadsheet</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Export Data Scope:</label>
                <select
                  value={exportScope}
                  onChange={e => setExportScope(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option value="all">1. All Applicants (Complete Pipeline)</option>
                  <option value="shortlisted">2. Shortlisted Candidates</option>
                  <option value="rejected">3. Rejected Candidates</option>
                  <option value="selected">4. Selected / Hired Candidates</option>
                  <option value="interviews">5. Interview Schedules & Rounds</option>
                  <option value="attendance">6. On-Site Attendance Sheets</option>
                  <option value="screening">7. Screening Questions & Answers</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">File Format:</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                      exportFormat === 'xlsx'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value="xlsx"
                      checked={exportFormat === 'xlsx'}
                      onChange={() => setExportFormat('xlsx')}
                    />
                    <span>Excel (.xlsx)</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                      exportFormat === 'csv'
                        ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-800'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={() => setExportFormat('csv')}
                    />
                    <span>CSV (.csv)</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Included Columns:</p>
                <p>Candidate Name, Email, Phone, Qualification, Experience, Skills, Applied Date, Status, 3 Screening Answers, Interview Date/Time Slot, Attendance, and Final Outcome.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {exportFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

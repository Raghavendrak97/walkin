/**
 * WALKIN - Candidate Portal Component
 * Includes Job Discovery, Walk-In Venue Unlocking, 3-Question Application Flow,
 * Multiple Resume Management, Monthly Quota Tracker, and Applied Recruiter Messaging.
 */

import React, { useState, useMemo } from 'react';
import {
  JobVacancy,
  JobApplication,
  CandidateProfile,
  CandidateResume,
  InterviewSchedule,
  Conversation
} from '../../types';
import { storageService, countWords, validateScreeningAnswer } from '../../services/storage';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  ExternalLink,
  FileText,
  Upload,
  AlertCircle,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Filter,
  Trash2,
  Star,
  Download,
  Info,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';

interface CandidatePortalProps {
  initialTab?: string;
  onRefresh: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  initialTab = 'browse',
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQualification, setSelectedQualification] = useState('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'open_walkin' | 'candidate_selected'>('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selected Job for Detail Modal
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState<JobVacancy | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [answers, setAnswers] = useState<[string, string, string]>(['', '', '']);
  const [appError, setAppError] = useState<string | null>(null);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);

  // Resume Upload Modal
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [newResumeSnippet, setNewResumeSnippet] = useState('');

  // Active Chat State
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Data from storage
  const candidate = storageService.getCandidateProfile();
  const resumes = storageService.getCandidateResumes(candidate.id);
  const allJobs = storageService.getJobs();
  const applications = storageService.getApplications().filter(a => a.candidateId === candidate.id);
  const interviews = storageService.getInterviews().filter(i => i.candidateId === candidate.id);
  const conversations = storageService.getConversations(candidate.id);
  const quota = storageService.canCandidateApply(candidate.id);
  const companies = storageService.getCompanies();

  const companyMap = useMemo(() => {
    const map = new Map<string, any>();
    companies.forEach(c => map.set(c.id, c));
    return map;
  }, [companies]);

  // Search and Filter Logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      if (job.status !== 'active') return false;

      // Text query across title, description, skills, company name, qualifications
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const comp = companyMap.get(job.companyId);
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchDesc = job.jobDescription.toLowerCase().includes(q);
        const matchSkills = job.requiredSkills.some(s => s.toLowerCase().includes(q));
        const matchComp = comp ? comp.name.toLowerCase().includes(q) : false;
        const matchQual = job.qualifications.some(deg => deg.toLowerCase().includes(q));
        const matchLoc = job.city.toLowerCase().includes(q) || job.locality.toLowerCase().includes(q);

        if (!matchTitle && !matchDesc && !matchSkills && !matchComp && !matchQual && !matchLoc) {
          return false;
        }
      }

      // Qualification filter
      if (selectedQualification !== 'all') {
        const hasQual = job.qualifications.some(
          deg => deg.toLowerCase() === selectedQualification.toLowerCase() || deg === 'Any Degree'
        );
        if (!hasQual) return false;
      }

      // Walk-in mode filter
      if (selectedMode !== 'all' && job.walkInSettings.mode !== selectedMode) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && job.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Employment Category filter
      if (selectedCategory !== 'all' && job.employmentCategory !== selectedCategory) {
        return false;
      }

      // Experience filter
      if (selectedExp === 'fresher' && job.expMinYears > 0) return false;
      if (selectedExp === 'mid' && (job.expMinYears > 3 || job.expMaxYears < 2)) return false;
      if (selectedExp === 'senior' && job.expMaxYears < 5) return false;

      return true;
    });
  }, [allJobs, searchQuery, selectedQualification, selectedMode, selectedCity, selectedCategory, selectedExp, companyMap]);

  // Open Apply Modal
  const handleOpenApply = (job: JobVacancy) => {
    setApplyingJob(job);
    setAnswers(['', '', '']);
    setAppError(null);
    setAppSuccess(null);
    const def = resumes.find(r => r.isDefault) || resumes[0];
    setSelectedResumeId(def ? def.id : '');
  };

  // Submit Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    if (!selectedResumeId) {
      setAppError('Please select or upload a resume to submit.');
      return;
    }

    // Submit via storage service
    const result = storageService.submitApplication(
      applyingJob.id,
      candidate.id,
      selectedResumeId,
      answers
    );

    if (!result.success) {
      setAppError(result.error || 'Submission failed.');
      return;
    }

    setAppSuccess('Application submitted successfully! Your recruiter has been notified.');
    onRefresh();
    setTimeout(() => {
      setApplyingJob(null);
      setAppSuccess(null);
      setActiveTab('applications');
    }, 1500);
  };

  // Handle Upload Resume
  const handleCreateResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeName.trim()) return;

    const res = storageService.addCandidateResume({
      candidateId: candidate.id,
      name: newResumeName.trim().endsWith('.pdf') ? newResumeName.trim() : `${newResumeName.trim()}.pdf`,
      fileName: newResumeName.trim().replace(/\s+/g, '_') + '.pdf',
      fileSize: `${Math.floor(Math.random() * 300 + 150)} KB`,
      fileType: 'application/pdf',
      isDefault: resumes.length === 0,
      contentSnippet: newResumeSnippet || `${candidate.name} - ${candidate.currentQualification} (${candidate.experienceYears} Years Exp)`
    });

    setNewResumeName('');
    setNewResumeSnippet('');
    setShowUploadResume(false);
    setSelectedResumeId(res.id);
    onRefresh();
  };

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !chatInput.trim()) return;

    storageService.sendMessage(
      activeConversationId,
      candidate.id,
      'candidate',
      candidate.name,
      chatInput.trim()
    );
    setChatInput('');
    onRefresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Candidate Dashboard Sub-Nav */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'browse'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Walk-Ins</span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>My Applications</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-current rounded-full text-[10px]">
              {applications.length}
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
              {interviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'resumes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Resumes</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {resumes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Recruiter Messages</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quota')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'quota'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Premium & Quota</span>
          </button>
        </div>

        {/* Free Monthly Quota Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
            <span className="text-slate-500">Free Monthly Quota:</span>
            <span className="font-bold text-slate-900">
              {quota.remaining} of 3 remaining
            </span>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(quota.remaining / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: BROWSE JOBS */}
      {activeTab === 'browse' && (
        <div className="mt-6 space-y-6">
          {/* Hero Banner with Walk-In Focus */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
            <div className="max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified In-Person Walk-In Recruitment Platform
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Direct Walk-In Drives & On-Site Interviews
              </h1>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Connect directly with corporate hiring managers. Skip endless online applications—attend open walk-in drives with immediate offer decisions or unlock restricted venues when shortlisted.
              </p>

              {/* Quick Search Bar */}
              <div className="mt-5 flex items-center bg-white rounded-xl p-1.5 shadow-lg max-w-xl">
                <div className="flex items-center gap-2 px-3 flex-1 text-slate-400">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search M.Pharm, B.Tech, React, Medical Coder, Freshers..."
                    className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {}}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Search
                </button>
              </div>

              {/* Popular tags */}
              <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-300">
                <span className="text-slate-400">Popular:</span>
                {['M.Pharm', 'B.Pharm', 'B.Tech', 'Medical Coding', 'React', 'Fresher', 'Clinical Research'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Filters Row */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold pr-2 border-r border-slate-200">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Walk-In Mode Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">Mode:</label>
              <select
                value={selectedMode}
                onChange={e => setSelectedMode(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-blue-500"
              >
                <option value="all">All Walk-In Modes</option>
                <option value="open_walkin">Open Walk-In (Venue Public)</option>
                <option value="candidate_selected">Candidate-Selected (Venue Locked)</option>
              </select>
            </div>

            {/* Qualification Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">Qualification:</label>
              <select
                value={selectedQualification}
                onChange={e => setSelectedQualification(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-blue-500"
              >
                <option value="all">All Qualifications</option>
                <option value="B.Pharm">B.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Sc">M.Sc</option>
                <option value="MCA">MCA / BCA</option>
                <option value="MBA">MBA / BBA</option>
                <option value="Any Degree">Any Degree</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">Location:</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-blue-500"
              >
                <option value="all">All Cities</option>
                <option value="bengaluru">Bengaluru</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="mumbai">Mumbai</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">Experience:</label>
              <select
                value={selectedExp}
                onChange={e => setSelectedExp(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-blue-500"
              >
                <option value="all">Any Experience</option>
                <option value="fresher">Freshers (0 Yrs)</option>
                <option value="mid">Mid Level (1 - 3 Yrs)</option>
                <option value="senior">Senior (3+ Yrs)</option>
              </select>
            </div>

            {/* Payroll Category Filter */}
            <div className="flex items-center gap-1.5">
              <label className="text-slate-500">Payroll:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-blue-500"
              >
                <option value="all">All Payroll Types</option>
                <option value="direct_company_payroll">Direct Company Payroll</option>
                <option value="third_party_payroll">Third-Party Staffing</option>
                <option value="contractual">Contractual</option>
              </select>
            </div>

            {(selectedMode !== 'all' || selectedQualification !== 'all' || selectedCity !== 'all' || selectedExp !== 'all' || selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedMode('all');
                  setSelectedQualification('all');
                  setSelectedCity('all');
                  setSelectedExp('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="ml-auto text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No walk-in vacancies found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  We couldn't find any walk-in opportunities matching your exact keywords and filters. Try resetting the filters or searching for degrees like B.Pharm, B.Tech, or Freshers.
                </p>
                <button
                  onClick={() => {
                    setSelectedMode('all');
                    setSelectedQualification('all');
                    setSelectedCity('all');
                    setSelectedExp('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredJobs.map(job => {
                const company = companyMap.get(job.companyId);
                const hasApplied = applications.some(a => a.jobId === job.id);
                const isModeB = job.walkInSettings.mode === 'open_walkin';

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Mode Badge & Verification Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {isModeB ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            OPEN WALK-IN DRIVE (Venue Visible)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                            <Lock className="w-3 h-3 text-amber-600" />
                            CANDIDATE-SELECTED (Venue on Shortlist)
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium">
                          {job.openings} Openings
                        </span>
                      </div>

                      {/* Job Title & Company */}
                      <div className="flex items-start gap-3">
                        <img
                          src={company?.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=128&q=80'}
                          alt={company?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h2
                            onClick={() => setSelectedJob(job)}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition line-clamp-1"
                          >
                            {job.title}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-600 font-medium">
                            <span>{company?.name}</span>
                            {company?.isVerified && (
                              <span title="Verified Company">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Walk-in Drive Date & Venue Indicator */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1.5 font-medium text-slate-900">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            Walk-In Dates: {job.walkInSettings.interviewDateStart} to {job.walkInSettings.interviewDateEnd}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {job.walkInSettings.startTime} - {job.walkInSettings.endTime}
                          </span>
                        </div>

                        {/* Venue details based on Walk-In Mode */}
                        {isModeB ? (
                          <div className="pt-2 border-t border-slate-200/60 flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div className="text-slate-700">
                                <p className="font-semibold text-slate-900">{job.walkInSettings.venueName}</p>
                                <p className="text-[11px] text-slate-500 line-clamp-1">{job.walkInSettings.fullAddress}</p>
                              </div>
                            </div>
                            <a
                              href={job.walkInSettings.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded-md border border-blue-200"
                            >
                              <span>Directions</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-amber-800">
                            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="text-[11px]">
                              Venue address & Google Maps link unlocks upon HR shortlist pass.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Key Badges: Qualification, Exp, Payroll */}
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          {job.qualifications.slice(0, 3).join(', ')}
                          {job.qualifications.length > 3 && ` +${job.qualifications.length - 3}`}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          Exp: {job.expMinYears === 0 ? 'Fresher' : `${job.expMinYears}-${job.expMaxYears} Yrs`}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          ₹{(job.salaryMin / 100000).toFixed(1)} - {(job.salaryMax / 100000).toFixed(1)} LPA
                        </span>

                        {job.employmentCategory === 'third_party_payroll' ? (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-100" title={`Agency: ${job.thirdPartyInfo?.staffingAgencyName}`}>
                            Third-Party Payroll
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                            Direct Payroll
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {hasApplied ? (
                        <button
                          onClick={() => setActiveTab('applications')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-200 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Applied (View Status)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenApply(job)}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs transition flex items-center gap-1.5"
                        >
                          <span>Apply for Walk-In</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Pipeline & Venue Passes</h2>
              <p className="text-xs text-slate-500">
                Track status updates from recruiters. Restricted walk-in venues unlock here as soon as HR shortlists you.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('browse')}
              className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
            >
              Browse More Walk-Ins
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore open walk-in drives and submit your application with exactly 3 screening questions.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Find Walk-In Drives
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => {
                const job = storageService.getJobById(app.jobId);
                const company = job ? companyMap.get(job.companyId) : null;
                const isUnlocked = app.isVenueUnlocked;
                const interview = interviews.find(i => i.applicationId === app.id);

                return (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
                  >
                    {/* Top Row: Job Title, Company, Status Badge */}
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={company?.logoUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=128&q=80'}
                          alt={company?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{job?.title || 'Walk-In Vacancy'}</h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600">
                            <span>{company?.name}</span>
                            <span>•</span>
                            <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status pill */}
                      <div>
                        {app.status === 'applied' && (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                            Applied (Under Review)
                          </span>
                        )}
                        {app.status === 'viewed' && (
                          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                            Viewed by HR
                          </span>
                        )}
                        {app.status === 'shortlisted' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Shortlisted! Venue Unlocked
                          </span>
                        )}
                        {app.status === 'interview_scheduled' && (
                          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Interview Slot Scheduled
                          </span>
                        )}
                        {app.status === 'selected' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                            Selected / Hired!
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            Not Shortlisted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* VENUE CARD - Unlocked vs Locked Rule */}
                    {isUnlocked && job ? (
                      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                            <Unlock className="w-4 h-4 text-emerald-600" />
                            Walk-In Venue Details & Entry Pass
                          </span>
                          <a
                            href={job.walkInSettings.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg transition"
                          >
                            <span>Open Google Maps</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 pt-2 border-t border-emerald-200/60">
                          <div>
                            <p className="font-bold text-slate-900">{job.walkInSettings.venueName}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5">{job.walkInSettings.fullAddress}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              Dates: {job.walkInSettings.interviewDateStart} ({job.walkInSettings.startTime} - {job.walkInSettings.endTime})
                            </p>
                            <p className="text-slate-600 text-[11px] mt-0.5">
                              Instructions: {job.walkInSettings.instructions}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>Venue Protected (Candidate-Selected Mode):</strong> The interview venue address and Google Maps directions will unlock automatically once HR shortlists your profile.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Screening Answers Submitted Snapshot */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <p className="font-semibold text-slate-700 mb-2">Screening Questions & Your Answers (1-3 words):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {app.screeningAnswers.map((ans, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[11px] text-slate-400 block font-medium">Q{idx + 1}: {ans.questionText}</span>
                            <span className="font-bold text-slate-800 text-xs">{ans.answerText}</span>
                            <span className="text-[10px] text-slate-400 block">({ans.wordCount} words)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata & Message Recruiter button */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Resume snapshot: <strong>{app.resumeSnapshot.fileName || app.resumeSnapshot.name}</strong></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setActiveTab('messages');
                            setActiveConversationId('conv_1');
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message Recruiter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTERVIEWS */}
      {activeTab === 'interviews' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Scheduled Walk-In Interview Slots</h2>
              <p className="text-xs text-slate-500">
                Official interview slot assignments with verified venue coordinates, dates, and instructions.
              </p>
            </div>
          </div>

          {interviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No scheduled interview slots yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once a recruiter reviews and shortlists your walk-in application, you will receive an assigned interview slot here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interviews.map(int => {
                const job = storageService.getJobById(int.jobId);
                const company = job ? companyMap.get(job.companyId) : null;

                return (
                  <div key={int.id} className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        Slot Confirmed
                      </span>
                      <span className="text-xs text-slate-500">
                        {int.roundName}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{job?.title}</h3>
                      <p className="text-xs text-slate-500">{company?.name}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>Date: {int.interviewDate}</span>
                        <span>Time: {int.interviewTime}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Interviewer: <strong>{int.interviewerName}</strong>
                      </p>
                      <div className="pt-2 border-t border-slate-200">
                        <p className="font-bold text-slate-800">{int.venueSnapshot.venueName}</p>
                        <p className="text-slate-500 text-[11px]">{int.venueSnapshot.fullAddress}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Attendance: <strong className="capitalize">{int.attendanceStatus}</strong>
                      </span>
                      <a
                        href={int.venueSnapshot.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
                      >
                        <span>Open Directions</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MULTIPLE RESUME MANAGEMENT */}
      {activeTab === 'resumes' && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Multiple Resume Library</h2>
              <p className="text-xs text-slate-500">
                Upload and tailor different resumes (e.g. Clinical Research, Pharma Sales, Software). Each application locks an immutable snapshot.
              </p>
            </div>
            <button
              onClick={() => setShowUploadResume(true)}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Resume</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map(res => (
              <div
                key={res.id}
                className={`bg-white rounded-xl p-5 border shadow-xs flex flex-col justify-between ${
                  res.isDefault ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{res.name}</h3>
                        <p className="text-[11px] text-slate-400">
                          {res.fileSize} • Uploaded {new Date(res.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {res.isDefault ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200">
                        Default Resume
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          storageService.setDefaultResume(res.id);
                          onRefresh();
                        }}
                        className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set Default</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 italic">
                    "{res.contentSnippet || 'Full professional candidate profile summary.'}"
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Private authenticated storage
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Simulating authenticated download of ${res.fileName}`)}
                      className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    {resumes.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete resume ${res.name}?`)) {
                            storageService.deleteResume(res.id);
                            onRefresh();
                          }
                        }}
                        className="text-rose-500 hover:text-rose-700 font-medium ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Direct Recruiter Messaging</h2>
            <p className="text-xs text-slate-500">
              Per platform security rules, candidates can message only recruiters of vacancies they have applied for.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[460px]">
            {/* Conversations list */}
            <div className="border-r border-slate-200 p-3 space-y-2">
              <span className="text-xs font-semibold text-slate-400 px-2 block uppercase tracking-wider">
                Recruiters
              </span>
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No active conversations yet. Apply to walk-in jobs to connect with recruiters.
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`p-3 rounded-xl cursor-pointer transition text-xs ${
                      activeConversationId === conv.id ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{conv.recruiterName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{conv.companyName}</p>
                    <p className="text-slate-600 text-[11px] mt-1 line-clamp-1">{conv.lastMessageText}</p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Box */}
            <div className="col-span-2 flex flex-col justify-between p-4 bg-slate-50">
              {activeConversationId ? (
                <>
                  <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Priya Sundaram</h3>
                      <p className="text-xs text-slate-500">Talent Acquisition • Novatix Healthcare Labs</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                      Eligible Applied Recruiter
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {storageService.getMessages(activeConversationId).map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.senderRole === 'candidate' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-3.5 py-2 rounded-2xl text-xs ${
                            msg.senderRole === 'candidate'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                          }`}
                        >
                          {msg.messageText}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Type a message to the recruiter..."
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                  <span>Select a conversation to start messaging.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PREMIUM & MONTHLY APPLICATION QUOTA */}
      {activeTab === 'quota' && (
        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Monthly Application Quota & Business Model</h2>
            <p className="text-xs text-slate-500 mt-1">
              WALKIN provides free access with 3 application credits every calendar month. Browsing walk-in drives is 100% free and unlimited.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Quota Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Month Status
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-700">
                    {quota.remaining}
                  </span>
                  <span className="text-xs text-slate-500">/ 3 free applications remaining</span>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${(quota.remaining / 3) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Resets on the 1st of next calendar month</span>
                </p>
              </div>

              {/* Free Tier Details */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Free Plan (Included)
                </span>
                <p className="text-xl font-bold text-slate-900 mt-1">₹0 / forever</p>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Unlimited walk-in job browsing</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Multiple resume library (up to 5)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>3 free walk-in applications / month</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>In-app and email notifications</span>
                  </li>
                </ul>
              </div>

              {/* Premium Plan Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white relative shadow-lg">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                  Candidate Premium
                </span>
                <p className="text-xl font-bold mt-1">₹499 / month</p>
                <ul className="mt-3 space-y-2 text-xs text-blue-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unlimited walk-in applications</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct messaging with eligible recruiters</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Priority application highlight tag</span>
                  </li>
                </ul>

                <button
                  onClick={() => {
                    storageService.updateCandidateProfile({ isPremium: true });
                    alert('Premium membership activated for Rahul Sharma! Unlimited applications and direct messaging enabled.');
                    onRefresh();
                  }}
                  className="mt-4 w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition"
                >
                  {candidate.isPremium ? 'Premium Active' : 'Upgrade to Premium'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JOB DETAIL MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Walk-In Vacancy Details
                </span>
                <h2 className="text-lg font-bold text-slate-900">{selectedJob.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {companyMap.get(selectedJob.companyId)?.name} • {selectedJob.city}, {selectedJob.locality}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[65vh] overflow-y-auto text-xs text-slate-700">
              {/* Walk-in Mode Banner */}
              {selectedJob.walkInSettings.mode === 'open_walkin' ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      Open Walk-In Drive (Direct Venue Access)
                    </span>
                    <a
                      href={selectedJob.walkInSettings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold flex items-center gap-1"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="mt-1 text-slate-600 text-[11px]">
                    Venue: <strong>{selectedJob.walkInSettings.venueName}</strong>, {selectedJob.walkInSettings.fullAddress}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Candidate-Selected Walk-In:</strong> Exact venue address and directions unlock only after recruiter reviews and shortlists your application.
                  </span>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">About the Role</h4>
                <p className="text-slate-600 leading-relaxed">{selectedJob.jobDescription}</p>
              </div>

              {/* Responsibilities */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {selectedJob.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Required Skills & Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Eligible Qualifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.qualifications.map((deg, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-semibold text-blue-700">
                        {deg}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Skills Required</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedJob.requiredSkills.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Required Documents to carry */}
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Documents to Carry to Interview</h4>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {selectedJob.walkInSettings.requiredDocuments.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => {
                  setSelectedJob(null);
                  handleOpenApply(selectedJob);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPLICATION MODAL WITH STRICT 3 QUESTIONS VALIDATION */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Walk-In Application
                </span>
                <h2 className="text-base font-bold text-slate-900">{applyingJob.title}</h2>
                <p className="text-xs text-slate-500">
                  {companyMap.get(applyingJob.companyId)?.name} • {applyingJob.city}
                </p>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="py-4 space-y-5 text-xs">
              {appError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{appError}</span>
                </div>
              )}

              {appSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{appSuccess}</span>
                </div>
              )}

              {/* Step 1: Select Resume */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  1. Select Resume from Your Library <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  An immutable snapshot of the chosen resume will be recorded for this application.
                </p>
                <div className="space-y-2">
                  {resumes.map(r => (
                    <label
                      key={r.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        selectedResumeId === r.id
                          ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="selectedResume"
                          value={r.id}
                          checked={selectedResumeId === r.id}
                          onChange={() => setSelectedResumeId(r.id)}
                          className="text-blue-600"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block">{r.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {r.fileSize} • Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {r.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          Default
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: MANDATORY EXACTLY 3 SCREENING QUESTIONS */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block">
                    2. Mandatory Screening Questions (Strictly 1 to 3 words) <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    The hiring team requires concise 1-3 word answers for instant screening.
                  </p>
                </div>

                {applyingJob.screeningQuestions.map((q, idx) => {
                  const currentAns = answers[idx] || '';
                  const wordCount = countWords(currentAns);
                  const isExceeded = wordCount > 3;

                  return (
                    <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-800 text-xs">
                          Q{idx + 1}: {q.questionText}
                        </label>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isExceeded
                              ? 'bg-rose-100 text-rose-700'
                              : wordCount > 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {wordCount} / 3 words
                        </span>
                      </div>

                      <input
                        type="text"
                        required
                        value={currentAns}
                        onChange={e => {
                          const updated = [...answers] as [string, string, string];
                          updated[idx] = e.target.value;
                          setAnswers(updated);
                        }}
                        placeholder="e.g. 2 years, Immediate joiner, 4.5 LPA..."
                        className={`w-full bg-white border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                          isExceeded ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {isExceeded && (
                        <p className="text-[10px] text-rose-600 font-semibold">
                          Maximum 3 words exceeded. Please shorten your response.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Monthly Quota Notice */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between text-[11px] text-blue-900">
                <span>Monthly application limit: <strong>{quota.remaining} of 3 free credits left</strong></span>
                <span className="text-slate-500">Zero fee for applying</span>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!quota.allowed || answers.some(a => countWords(a) === 0 || countWords(a) > 3)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Confirm & Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD RESUME MODAL */}
      {showUploadResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Upload New Resume to Library</h3>
              <button
                onClick={() => setShowUploadResume(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateResume} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Resume Title / Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newResumeName}
                  onChange={e => setNewResumeName(e.target.value)}
                  placeholder="e.g. Rahul_BPharm_Pharmacovigilance_2026.pdf"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Key Skills & Summary Snippet
                </label>
                <textarea
                  rows={3}
                  value={newResumeSnippet}
                  onChange={e => setNewResumeSnippet(e.target.value)}
                  placeholder="e.g. Pharmacovigilance Associate with 2 years Argus Safety Case experience..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                <p className="font-medium text-slate-700">Supported Formats: PDF, DOCX</p>
                <p>Resumes are stored privately in non-public storage directories with authenticated access.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadResume(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

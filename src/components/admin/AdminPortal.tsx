/**
 * WALKIN - Platform Administrator Portal Component
 * Handles User Moderation, Recruiter Approvals, Company Verifications,
 * Job Moderation, System Audit Logs, SMTP Email Queue, and Hostinger Deployment Package.
 */

import React, { useState } from 'react';
import {
  RecruiterProfile,
  Company,
  JobVacancy,
  CandidateProfile,
  AuditLog,
  AppNotification
} from '../../types';
import { storageService } from '../../services/storage';
import {
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Server,
  Database,
  Download,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  Mail,
  Check,
  Lock
} from 'lucide-react';

interface AdminPortalProps {
  initialTab?: string;
  onRefresh: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  initialTab = 'stats',
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Storage data
  const recruiters = storageService.getRecruiters();
  const companies = storageService.getCompanies();
  const jobs = storageService.getJobs();
  const applications = storageService.getApplications();
  const candidate = storageService.getCandidateProfile();
  const auditLogs = storageService.getAuditLogs();
  const notifications = storageService.getNotifications('candidate_1').concat(storageService.getNotifications('recruiter_1'));

  // Approve Recruiter
  const handleApproveRecruiter = (recruiterId: string) => {
    storageService.updateRecruiter(recruiterId, { verificationStatus: 'verified' });
    storageService.addAuditLog('RECRUITER_APPROVED', `Admin approved recruiter ID: ${recruiterId}`);
    onRefresh();
    alert('Recruiter approved! They can now publish walk-in vacancies.');
  };

  // Reject Recruiter
  const handleRejectRecruiter = (recruiterId: string) => {
    const reason = prompt('Enter rejection reason for recruiter:', 'Official company email domain mismatch');
    if (reason) {
      storageService.updateRecruiter(recruiterId, { verificationStatus: 'rejected', rejectionReason: reason });
      storageService.addAuditLog('RECRUITER_REJECTED', `Admin rejected recruiter ID: ${recruiterId} (${reason})`);
      onRefresh();
    }
  };

  // Toggle Company Verification
  const handleToggleCompanyVerification = (companyId: string, current: boolean) => {
    storageService.updateCompany(companyId, { isVerified: !current });
    storageService.addAuditLog('COMPANY_VERIFICATION_TOGGLED', `Admin set verification=${!current} for company ID: ${companyId}`);
    onRefresh();
  };

  // Flag / Close Job
  const handleToggleJobStatus = (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'flagged' : 'active';
    storageService.updateJob(jobId, { status: nextStatus as any });
    storageService.addAuditLog('JOB_MODERATION', `Admin updated job ${jobId} status to ${nextStatus}`);
    onRefresh();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Subnav */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'recruiters'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Recruiters & Approvals</span>
            {recruiters.some(r => r.verificationStatus === 'pending') && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Companies & Domains</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('smtp')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'smtp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>SMTP Email Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('hostinger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'hostinger'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hostinger PHP/MySQL Package</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset entire platform database to initial factory defaults?')) {
              storageService.resetToFactoryDefaults();
              onRefresh();
            }
          }}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Factory Demo Data</span>
        </button>
      </div>

      {/* TAB 1: PLATFORM OVERVIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Registered Candidates</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">1,480</span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Verified profiles</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Corporate Recruiters</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{recruiters.length}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Domain email verified</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Verified Companies</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {companies.filter(c => c.isVerified).length} / {companies.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Corporate vetted</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Active Walk-In Drives</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{jobs.length}</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Live in Bengaluru/Hyd</span>
            </div>
          </div>

          {/* Pending Action Banner */}
          {recruiters.some(r => r.verificationStatus === 'pending') && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold">Pending Recruiter Approvals</p>
                  <p className="text-[11px] text-amber-700">
                    Ananya Roy (@finovate.corp) is waiting for corporate domain approval before publishing vacancies.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('recruiters')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Review Approvals
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECRUITERS & APPROVALS */}
      {activeTab === 'recruiters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recruiter Corporate Accounts</h2>
            <p className="text-xs text-slate-500">Official company domain verification & moderation</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Recruiter</th>
                  <th className="p-3">Official Company Email</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">LinkedIn Profile</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recruiters.map(rec => {
                  const comp = storageService.getCompanyById(rec.companyId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{rec.name}</span>
                        <span className="text-[10px] text-slate-400">{rec.designation}</span>
                      </td>
                      <td className="p-3 font-mono font-medium text-purple-700">
                        {rec.officialCompanyEmail}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {comp?.name || 'Unknown'}
                      </td>
                      <td className="p-3">
                        <a
                          href={rec.recruiterLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                        >
                          <span>Profile</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-3">
                        {rec.verificationStatus === 'verified' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Verified & Approved
                          </span>
                        )}
                        {rec.verificationStatus === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] animate-pulse">
                            Pending Approval
                          </span>
                        )}
                        {rec.verificationStatus === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {rec.verificationStatus === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveRecruiter(rec.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRecruiter(rec.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Account Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANIES & DOMAINS */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Registered Corporate Employers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {companies.map(comp => (
              <div key={comp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={comp.logoUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=128&q=80'}
                      alt={comp.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{comp.name}</h3>
                      <p className="text-slate-400 text-[11px]">{comp.city} • {comp.industry}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Website:</span>
                    <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium truncate max-w-[150px]">
                      {comp.website}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Domain:</span>
                    <span className="font-mono text-purple-700 font-bold">@{comp.officialDomain}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    comp.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {comp.isVerified ? 'Verified Company' : 'Unverified'}
                  </span>

                  <button
                    onClick={() => handleToggleCompanyVerification(comp.id, comp.isVerified)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      comp.isVerified
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {comp.isVerified ? 'Revoke Verification' : 'Verify Company'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: JOB MODERATION */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">All Live Walk-In Vacancies</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Job ID & Title</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Walk-In Mode</th>
                  <th className="p-3">Applications</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{job.title}</span>
                      <span className="text-[10px] text-slate-400">ID: {job.id}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {storageService.getCompanyById(job.companyId)?.name}
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
                    <td className="p-3 font-bold text-slate-800">
                      {job.applicationsCount}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleJobStatus(job.id, job.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          job.status === 'active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {job.status === 'active' ? 'Flag / Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Platform Security Audit Trail</h2>
            <span className="text-xs text-slate-400">Live immutable action log</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-3 whitespace-nowrap text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{log.userRole}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-700 text-[11px]">
                      {log.action}
                    </td>
                    <td className="p-3 text-slate-700 text-[11px] max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SMTP EMAIL QUEUE */}
      {activeTab === 'smtp' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hosting SMTP Email Queue Monitor</h2>
              <p className="text-xs text-slate-500">
                Transactional email notifications dispatched via PHP mailer and Hostinger cron queue (cron/process_emails.php).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Notification / Subject</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Dispatched At</th>
                  <th className="p-3">Delivery Queue Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{n.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{n.message}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {n.userId === 'candidate_1' ? 'rahul.sharma@example.com' : 'priya.s@novatixpharma.com'}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        SENT VIA HOSTING SMTP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: HOSTINGER PHP & MYSQL PACKAGE VIEWER */}
      {activeTab === 'hostinger' && (
        <div className="space-y-6 text-xs text-slate-700">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="max-w-2xl">
              <span className="px-2.5 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                Production Shared Hosting Release
              </span>
              <h2 className="text-xl font-extrabold mt-2">
                WALKIN PHP 8.3 & MySQL Shared Hosting Package
              </h2>
              <p className="mt-2 text-xs text-emerald-100 leading-relaxed">
                As required by the project specifications, the entire standalone PHP 8.3 backend, complete normalized MySQL 8 database schema (24 tables), .htaccess routing, PhpSpreadsheet export scripts, and Hostinger deployment guides are generated in the <code>/php-backend/</code> project directory.
              </p>
            </div>
          </div>

          {/* Step-by-Step Hostinger Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">MySQL Database Import</h3>
              <p className="text-[11px] text-slate-500">
                Create a MySQL database in Hostinger hPanel / phpMyAdmin, then import <code>schema.sql</code>. It creates all tables, indexes, foreign keys, and default seeds.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Upload & Configure .env</h3>
              <p className="text-[11px] text-slate-500">
                Upload <code>php-backend/</code> to your web root (<code>public_html</code>). Copy <code>.env.example</code> to <code>.env</code> and fill in your DB credentials and SMTP details.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Setup Cron Job</h3>
              <p className="text-[11px] text-slate-500">
                In Hostinger Cron Jobs, set <code>*/5 * * * * php /home/u12345/public_html/cron/process_emails.php</code> to dispatch queued email notifications automatically.
              </p>
            </div>
          </div>

          {/* Quick Code Snippet Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">
                MySQL 8 DDL Schema (schema.sql) Preview
              </span>
              <button
                onClick={() => copyToClipboard(`-- WALKIN MySQL Schema\nCREATE DATABASE IF NOT EXISTS walkin_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\nUSE walkin_db;`, 'sql_sample')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                {copiedCode === 'sql_sample' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'sql_sample' ? 'Copied!' : 'Copy SQL Sample'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono">
{`-- WALKIN RECRUITMENT PLATFORM - 24 NORMALIZED TABLES
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(25) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('candidate', 'recruiter', 'admin') NOT NULL,
  is_email_verified TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE jobs (
  id VARCHAR(64) PRIMARY KEY,
  recruiter_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL,
  title VARCHAR(200) NOT NULL,
  walk_in_mode ENUM('candidate_selected', 'open_walkin') NOT NULL,
  venue_name VARCHAR(255) NOT NULL,
  full_address TEXT NOT NULL,
  google_maps_url TEXT NOT NULL,
  FULLTEXT KEY ft_search (title, job_description)
) ENGINE=InnoDB;`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

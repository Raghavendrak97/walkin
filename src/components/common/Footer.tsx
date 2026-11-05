import React from 'react';
import { UserRole } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Briefcase,
  MapPin,
  CheckCircle2,
  Server,
  Download,
  Lock,
  Smartphone
} from 'lucide-react';

interface FooterProps {
  onRoleChange: (role: UserRole) => void;
  onTabChange: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onRoleChange, onTabChange }) => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-extrabold flex items-center justify-center text-sm">
                W
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">WALKIN</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Dedicated walk-in and in-person recruitment platform connecting verified employers with qualified jobseekers across India.
            </p>
            <p className="text-[11px] font-medium text-slate-700 italic">
              "Find opportunities. Walk in. Get hired."
            </p>
          </div>

          {/* Candidate Portal Links */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
              Candidate Workspace
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => {
                    onRoleChange('candidate');
                    onTabChange('browse');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Discover Open Walk-Ins
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onRoleChange('candidate');
                    onTabChange('applications');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  My Applications & Venue Passes
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onRoleChange('candidate');
                    onTabChange('resumes');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Multiple Resume Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onRoleChange('candidate');
                    onTabChange('quota');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Monthly Quota & Premium
                </button>
              </li>
            </ul>
          </div>

          {/* Recruiter / HR Portal Links */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
              Recruiter / HR Portal
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => {
                    onRoleChange('recruiter');
                    onTabChange('create');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Post Walk-In Vacancy Free
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onRoleChange('recruiter');
                    onTabChange('pipeline');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Applicant Pipeline & Screening
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onRoleChange('recruiter');
                    onTabChange('interviews');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Interview Slots & Attendance
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onRoleChange('recruiter');
                    onTabChange('company');
                  }}
                  className="hover:text-blue-600 transition"
                >
                  Company Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Deployment & Architecture Col */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
              Architecture & Shared Hosting
            </span>
            <p className="text-[11px] text-slate-500">
              Designed for budget-friendly PHP 8.3 & MySQL shared hosting (Hostinger, cPanel) without expensive cloud dependencies.
            </p>
            <div className="pt-1">
              <button
                onClick={() => {
                  onRoleChange('admin');
                  onTabChange('hostinger');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 hover:bg-emerald-100 transition"
              >
                <Server className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hostinger Package Files</span>
              </button>
            </div>
            <div className="pt-2">
              <PWAInstallButton compact />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} WALKIN Recruitment Technologies. Production Walk-In Platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Private Secure Storage</span>
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-slate-400" />
              <span>Installable PWA</span>
            </span>
            <span>PHP 8.3 + MySQL 8</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

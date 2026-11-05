import React, { useState } from 'react';
import { UserRole, AppNotification } from '../../types';
import { storageService } from '../../services/storage';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Briefcase,
  UserCheck,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  Building2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  notifications,
  onRefresh
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const candidate = storageService.getCandidateProfile();
  const recruiter = storageService.getCurrentRecruiter();
  const company = storageService.getCompanyById(recruiter.companyId);

  const quota = storageService.canCandidateApply(candidate.id);
  const unreadNotifs = notifications.filter(n => !n.isRead);

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsAsRead(
      currentRole === 'candidate' ? candidate.id : currentRole === 'recruiter' ? recruiter.id : 'admin_1'
    );
    onRefresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onTabChange(currentRole === 'candidate' ? 'browse' : 'overview')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition">
                <span className="font-extrabold text-xl tracking-tighter">W</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 border-2 border-white"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900">WALKIN</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Recruitment
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-slate-500 font-medium tracking-tight">
                  Find opportunities. Walk in. Get hired.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Role Switcher Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onRoleChange('candidate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                currentRole === 'candidate'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Candidate</span>
            </button>

            <button
              onClick={() => onRoleChange('recruiter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                currentRole === 'recruiter'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Recruiter / HR</span>
              {recruiter.verificationStatus === 'verified' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verified Recruiter" />
              )}
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                currentRole === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </button>
          </div>

          {/* Right Action Icons & Badges */}
          <div className="flex items-center gap-3">
            {/* Candidate Monthly Quota Indicator */}
            {currentRole === 'candidate' && (
              <div
                onClick={() => onTabChange('quota')}
                className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-900 cursor-pointer hover:bg-amber-100 transition"
                title="Free quota resets 1st of every calendar month"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Quota: <strong className="text-amber-800">{quota.remaining}</strong>/3 left this month
                </span>
              </div>
            )}

            {/* Recruiter Company Badge */}
            {currentRole === 'recruiter' && company && (
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate max-w-[140px]">{company.name}</span>
                {company.isVerified ? (
                  <span className="flex items-center text-emerald-600 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3 ml-0.5 inline" />
                  </span>
                ) : (
                  <span className="text-amber-600 text-[11px] font-semibold flex items-center">
                    <AlertCircle className="w-3 h-3 ml-0.5 inline" />
                  </span>
                )}
              </div>
            )}

            {/* PWA Install Button */}
            <PWAInstallButton compact />

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900">Notifications</span>
                      <span className="text-[11px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full">
                        {notifications.length}
                      </span>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            storageService.markNotificationAsRead(notif.id);
                            setShowNotifMenu(false);
                            onRefresh();
                          }}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            !notif.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-800">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>SMTP Queue: {notif.emailStatus === 'sent' ? 'Delivered' : 'Pending'}</span>
                            {!notif.isRead && (
                              <span className="text-blue-600 font-semibold">• Unread</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={
                  currentRole === 'candidate'
                    ? candidate.avatarUrl
                    : currentRole === 'recruiter'
                    ? recruiter.avatarUrl
                    : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800">
                  {currentRole === 'candidate'
                    ? candidate.name
                    : currentRole === 'recruiter'
                    ? recruiter.name
                    : 'Platform SuperAdmin'}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {currentRole === 'recruiter' ? recruiter.designation : currentRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

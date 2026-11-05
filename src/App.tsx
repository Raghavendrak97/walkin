/**
 * WALKIN - Main Application Component
 * Seamless two-sided walk-in recruitment platform connecting candidates, recruiters, and administrators.
 */

import React, { useState, useEffect } from 'react';
import { UserRole, AppNotification } from './types';
import { storageService } from './services/storage';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { CandidatePortal } from './components/candidate/CandidatePortal';
import { RecruiterPortal } from './components/recruiter/RecruiterPortal';
import { AdminPortal } from './components/admin/AdminPortal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getCurrentRole());
  const [activeTab, setActiveTab] = useState<string>('browse');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync notifications on mount and role change
  useEffect(() => {
    const currentUserId = storageService.getCurrentUserId();
    const notifs = storageService.getNotifications(currentUserId);
    setNotifications(notifs);
  }, [currentRole, refreshTrigger]);

  const handleRoleChange = (newRole: UserRole) => {
    storageService.setRole(newRole);
    setCurrentRole(newRole);
    if (newRole === 'candidate') setActiveTab('browse');
    if (newRole === 'recruiter') setActiveTab('overview');
    if (newRole === 'admin') setActiveTab('stats');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header with Quick Role Switcher, PWA button, and notifications */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notifications={notifications}
        onRefresh={handleRefresh}
      />

      {/* Main Workspace Body */}
      <main className="flex-1">
        {currentRole === 'candidate' && (
          <CandidatePortal
            initialTab={activeTab}
            key={`candidate_${refreshTrigger}_${activeTab}`}
            onRefresh={handleRefresh}
          />
        )}

        {currentRole === 'recruiter' && (
          <RecruiterPortal
            initialTab={activeTab}
            key={`recruiter_${refreshTrigger}_${activeTab}`}
            onRefresh={handleRefresh}
          />
        )}

        {currentRole === 'admin' && (
          <AdminPortal
            initialTab={activeTab}
            key={`admin_${refreshTrigger}_${activeTab}`}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Footer */}
      <Footer onRoleChange={handleRoleChange} onTabChange={handleTabChange} />
    </div>
  );
}

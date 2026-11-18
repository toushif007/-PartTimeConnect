import React from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  XCircle,
  Award,
  AlertCircle,
  PauseCircle,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const config = {
    applied: { label: 'Applied', className: 'badge-applied', icon: Clock },
    shortlisted: { label: 'Shortlisted', className: 'badge-shortlisted', icon: CheckCircle2 },
    interview_scheduled: { label: 'Interview Scheduled', className: 'badge-interview_scheduled', icon: Calendar },
    hired: { label: 'Hired', className: 'badge-hired', icon: Award },
    rejected: { label: 'Rejected', className: 'badge-rejected', icon: XCircle },
    withdrawn: { label: 'Withdrawn', className: 'badge-withdrawn', icon: AlertCircle },
    active: { label: 'Active', className: 'badge-active', icon: CheckCircle2 },
    paused: { label: 'Paused', className: 'badge-paused', icon: PauseCircle },
    closed: { label: 'Closed', className: 'badge-withdrawn', icon: XCircle },
    pending: { label: 'Pending Review', className: 'badge-interview_scheduled', icon: Clock },
    reviewed: { label: 'Reviewed', className: 'badge-applied', icon: CheckCircle2 },
    action_taken: { label: 'Action Taken', className: 'badge-rejected', icon: Award },
    dismissed: { label: 'Dismissed', className: 'badge-withdrawn', icon: XCircle },
  };

  const current = config[normalized] || {
    label: status || 'Unknown',
    className: 'badge-applied',
    icon: Clock,
  };

  const Icon = current.icon;

  return (
    <span className={`badge ${current.className}`}>
      <Icon size={12} />
      {current.label}
    </span>
  );
};

export default StatusBadge;

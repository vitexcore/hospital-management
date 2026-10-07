import { format, formatDistanceToNow, parseISO } from 'date-fns';
import API from '../services/api';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  try { return format(typeof date === 'string' ? parseISO(date) : new Date(date), fmt); }
  catch { return 'Invalid date'; }
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm');

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  try { return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : new Date(date), { addSuffix: true }); }
  catch { return 'N/A'; }
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-purple-100 text-purple-800',
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    partial: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    requested: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    'sample-collected': 'bg-teal-100 text-teal-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
    normal: 'bg-green-100 text-green-800',
    high: 'bg-red-100 text-red-800',
    low: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-200 text-red-900',
    draft: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getRoleColor = (role) => {
  const colors = {
    patient: 'bg-blue-100 text-blue-800',
    doctor: 'bg-teal-100 text-teal-800',
    receptionist: 'bg-purple-100 text-purple-800',
    admin: 'bg-orange-100 text-orange-800',
    super_admin: 'bg-red-100 text-red-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  const base = (API.defaults.baseURL || '').replace(/\/api$/, '');
  return `${base}/uploads/avatars/${avatar}`;
};

export const generateTimeSlots = (start = '09:00', end = '17:00', interval = 30) => {
  const slots = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let current = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  while (current + interval <= endMinutes) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += interval;
  }
  return slots;
};

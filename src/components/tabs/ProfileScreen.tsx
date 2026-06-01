import React from 'react';
import { Phone, LogOut, Gift, BadgeCheck, Building2, CircleDollarSign, MapPin, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../data/appSchema';
import { OwnerRecord } from '../../lib/supabase';

interface ProfileScreenProps {
  owner: OwnerRecord | null;
  role: UserRole;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  owner,
  role,
  onSignOut
}) => {
  const userName = String(owner?.name ?? '').trim() || 'Owner';
  const phone = String(owner?.number ?? '').trim() || '--';
  const address = String(owner?.address ?? '').trim() || 'Address not available';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'GK';

  return (
    <div className="pb-24 page-shell">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 pt-4 pb-3 pr-18 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <h1 className="text-lg font-bold font-display text-gray-900 dark:text-white">Owner profile</h1>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {!owner && (
          <div className="surface-card rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            Owner profile data is not available yet. Please sign in again so Basai.com can refresh your owner record from the database.
          </div>
        )}

        <div className="surface-card bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-2xs flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#1D9E75] text-white font-bold font-display text-lg flex items-center justify-center shrink-0 shadow-2xs">
            {initials}
          </div>
          <div className="grow overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">{userName}</h2>
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[8px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
              <Phone className="w-2.5 h-2.5 mr-1 text-gray-400 shrink-0" />
              <span>+977 {phone}</span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">{address}</p>
            <p className="text-[10px] text-[#1D9E75] font-medium mt-1">
              Active mode: <strong className="uppercase underline">{role}</strong>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Owner account overview</h3>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="surface-card bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#1D9E75]/10 text-[#1D9E75]">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="block text-xs font-bold text-gray-900 dark:text-white">Property Posting</span>
              <span className="block text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Listings can go live from your owner panel</span>
            </div>
            <div className="surface-card bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <CircleDollarSign className="h-4 w-4" />
              </span>
              <span className="block text-xs font-bold text-gray-900 dark:text-white">Brokerage</span>
              <span className="block text-[9px] text-[#1D9E75] font-bold mt-0.5">0% Charged</span>
            </div>
            <div className="surface-card bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <span className="block text-xs font-bold text-gray-900 dark:text-white">Listing Status</span>
              <span className="block text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">Edit, rent, or remove rooms anytime</span>
            </div>
            <div className="surface-card bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
              <span className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Phone className="h-4 w-4" />
              </span>
              <span className="block text-xs font-bold text-gray-900 dark:text-white">Contact Number</span>
              <span className="block text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">+977 {phone}</span>
            </div>
          </div>
        </div>

        <div className="surface-card bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
          <div className="p-3 flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Registered owner name</span>
            <span className="text-[10px] text-gray-400 truncate max-w-30 text-right">{userName}</span>
          </div>
          <div className="p-3 flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Owner role access</span>
            <span className="text-[10px] font-bold text-[#1D9E75] bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded">Enabled</span>
          </div>
          <div className="p-3 flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Listing management tools</span>
            <span className="text-[10px] text-gray-400">Available</span>
          </div>
          <div className="p-3 flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Registered address</span>
            <span className="text-[10px] text-gray-400 truncate max-w-32 text-right">{address}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="surface-card rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center gap-2 text-[#1D9E75]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-bold">Owner access</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Verified profile mode</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your room posts and contact details are linked to this owner account.
            </p>
          </div>

          <div className="surface-card rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 flex items-center gap-2 text-[#1D9E75]">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-bold">Registered address</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{address}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Update the database record if this owner address changes.
            </p>
          </div>
        </div>

        <div className="surface-card bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-purple-950/30 dark:via-gray-800 dark:to-purple-950/20 p-3.5 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 text-center relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 bg-[#5C2E91] text-white text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-widest">
            Khalti QR
          </div>

          <div className="flex items-center justify-center space-x-1.5 mb-2">
            <Gift className="w-4 h-4 text-[#5C2E91] dark:text-purple-400 shrink-0" />
            <h4 className="text-xs font-bold text-gray-900 dark:text-white font-display">Support our mission</h4>
          </div>

          <p className="text-[10px] text-gray-600 dark:text-gray-300 leading-snug mb-3 px-1">
            Your support helps us keep room discovery simple, fast, and broker-free for students and families across Nepal.
          </p>

          <div
            className="w-24 h-24 bg-white p-1.5 rounded-xl border-2 border-[#5C2E91] mx-auto shadow-xs flex flex-col items-center justify-between cursor-pointer"
            onClick={() => alert('Scan this code in Khalti mobile app to donate to number 9812174843')}
          >
            <svg className="w-full h-full text-gray-900" viewBox="0 0 32 32" fill="currentColor">
              <path d="M2 2h8v8H2zM4 4h4v4H4zM22 2h8v8h-8zM24 4h4v4h-4zM2 22h8v8H2zM4 24h4v4H4z" />
              <rect x="12" y="4" width="2" height="2" />
              <rect x="16" y="2" width="2" height="4" />
              <rect x="18" y="6" width="2" height="2" />
              <rect x="12" y="10" width="4" height="2" />
              <rect x="22" y="12" width="2" height="4" />
              <rect x="26" y="16" width="4" height="2" />
              <rect x="2" y="14" width="6" height="2" />
              <rect x="8" y="18" width="2" height="4" />
              <rect x="12" y="14" width="8" height="8" fill="#5C2E91" />
              <rect x="22" y="22" width="2" height="2" />
              <rect x="26" y="24" width="2" height="2" />
              <rect x="24" y="28" width="4" height="2" />
              <rect x="16" y="26" width="2" height="4" />
              <rect x="14" y="24" width="2" height="2" />
            </svg>
          </div>

          <div className="mt-2 text-[10px]">
            <span className="text-gray-400">Khalti ID: </span>
            <span className="font-mono font-bold text-[#5C2E91] dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded select-all">
              9812174843
            </span>
          </div>
          <span className="text-[8px] text-gray-400 block mt-1">Tap the QR code to view payment details</span>
        </div>

        <div className="pt-2">
          <button
            onClick={onSignOut}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out and start over</span>
          </button>
        </div>
      </div>
    </div>
  );
};

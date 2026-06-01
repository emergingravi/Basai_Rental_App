import React from 'react';
import { UserCheck, Home, ArrowRight, ShieldCheck, House } from 'lucide-react';
import { UserRole } from '../../data/appSchema';

type ExtendedRole = UserRole | 'Admin'

interface RolePickerProps {
  onSelectRole: (role: ExtendedRole) => void;
}

export const RolePickerScreen: React.FC<RolePickerProps> = ({ onSelectRole }) => {
  return (
    <div className="page-shell flex flex-col justify-between h-full px-6 py-6 bg-white dark:bg-gray-900 transition-colors overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[12px] font-bold text-[#dd7316] dark:bg-emerald-950/40">
              <House className="h-4 w-4" />
              <span>Basai.com</span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1D9E75]">Direct rental access</p>
            <h1 className="text-2xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              Choose your role
            </h1>
          </div>

          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-[#1D9E75] border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>No Broker Fee</span>
          </span>
        </div>

        <div className="mb-6 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 p-3 rounded-xl border border-teal-500/20 text-center surface-card">
          <p className="text-xs font-bold text-[#1D9E75] uppercase tracking-wider">100% direct verification feed</p>
          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
            Connect directly with genuine house owners and room seekers.
          </p>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">
          Select how you want to use the marketplace today. You can switch roles later inside the app.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onSelectRole('Customer')}
            className="surface-card w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-[#1D9E75] dark:hover:border-[#1D9E75] active:bg-[#1D9E75]/5 transition-all group relative overflow-hidden block bg-white dark:bg-gray-800/50 shadow-2xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex space-x-3 items-center min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#1D9E75]/10 dark:bg-[#1D9E75]/20 flex items-center justify-center text-[#1D9E75] shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#1D9E75] transition-colors truncate">
                    I am a Customer
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    Browse verified flats, rooms, and homes directly
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#1D9E75] group-hover:translate-x-1 transition-all self-center shrink-0 ml-2" />
            </div>
          </button>

          <button
            onClick={() => onSelectRole('Owner')}
            className="surface-card w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-[#1D9E75] dark:hover:border-[#1D9E75] active:bg-[#1D9E75]/5 transition-all group relative overflow-hidden block bg-white dark:bg-gray-800/50 shadow-2xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex space-x-3 items-center min-w-0">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-[#1D9E75] transition-colors truncate">
                    I am a Property Owner
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    List properties and receive verified customer inquiries
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-[#1D9E75] group-hover:translate-x-1 transition-all self-center shrink-0 ml-2" />
            </div>
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => onSelectRole('Admin')}
            className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100"
            style={{ fontSize: 11 }}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
        <div className="text-[11px] text-gray-400 flex items-center justify-center space-x-2">
          <span>Made for Nepal</span>
          <span>•</span>
          <span>Zero brokerage policy</span>
        </div>
      </div>
    </div>
  );
};

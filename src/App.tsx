import React, { useEffect, useState } from 'react';
import { Home as HomeIcon, Search as SearchIcon, PlusCircle, Heart, User as UserIcon, Gift, ShieldCheck } from 'lucide-react';
import { PropertyDetailScreen } from './components/listings/PropertyDetailScreen';
import { RolePickerScreen } from './components/auth/RolePickerScreen';
import OwnerAuthScreen from './components/auth/OwnerAuthScreen';
import AdminLoginScreen from './components/auth/AdminLoginScreen';
import AdminDashboard from './components/tabs/AdminDashboard';

import { HomeScreen } from './components/tabs/HomeScreen';
import { SearchScreen } from './components/tabs/SearchScreen';
import { AddListingScreen } from './components/tabs/AddListingScreen';
import { SavedScreen } from './components/tabs/SavedScreen';
import { ProfileScreen } from './components/tabs/ProfileScreen';
import OwnerDashboard from './components/tabs/OwnerDashboard';
import { Listing, UserRole } from './data/appSchema';
import listingsLib from './lib/listings';
import { mapDbListingToUiListing } from './lib/listingAdapter';
import { getOwnerById, getOwnerSession, OwnerRecord, signOutOwner } from './lib/supabase';

export default function App() {
  const [authStage, setAuthStage] = useState<'picker' | 'ownerAuth' | 'adminAuth' | 'main'>('picker');
  const [role, setRole] = useState<UserRole | 'Admin'>('Customer');
  const [userName, setUserName] = useState('');
  const [ownerProfile, setOwnerProfile] = useState<OwnerRecord | null>(null);

  const [currentTab, setCurrentTab] = useState<'Home' | 'Search' | 'Add' | 'Saved' | 'Profile' | 'OwnerDashboard'>('Home');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Listing | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const showOwnerProfile = role === 'Owner';

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const result: any = await listingsLib.getAllListings();
        console.debug('getAllListings result:', result);
        if (!mounted) return;
        if (result?.error) {
          console.error('Failed to load listings:', result.error);
          setFetchError(result.error?.message || 'Failed to load listings from database.');
          return;
        }
        if (!result?.data) {
          setListings([]);
          return;
        }
        // ensure owner details are fetched when the joined `owner` is missing
        const rawRows = Array.isArray(result.data) ? result.data : []
        const enhancedRows = await Promise.all(
          rawRows.map(async (r: any) => {
            if (!r.owner && r.owner_id) {
              try {
                const ownerRes = await getOwnerById(r.owner_id)
                console.debug('owner fetch result for', r.owner_id, ownerRes)
                if (!ownerRes?.error && ownerRes?.data) {
                  r.owner = ownerRes.data
                }
              } catch (e) {
                // ignore per-row owner fetch errors
              }
            }
            return r
          })
        )

        const mapped = enhancedRows.map(mapDbListingToUiListing)
        try {
          console.debug('First raw listing row (stringified):', enhancedRows && JSON.stringify(enhancedRows[0], null, 2))
        } catch (e) {
          console.debug('First raw listing row:', enhancedRows && enhancedRows[0])
        }
        try {
          console.debug('First mapped listing (stringified):', mapped && JSON.stringify(mapped[0], null, 2))
        } catch (e) {
          console.debug('First mapped listing:', mapped && mapped[0])
        }
        setListings(mapped);
      } catch (error) {
        if (!mounted) return;
        console.error('Unexpected error loading listings:', error);
        setFetchError((error as any)?.message || String(error));
        setListings([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showOwnerProfile && currentTab === 'Profile') {
      setCurrentTab('Home');
    }
  }, [showOwnerProfile, currentTab]);

  useEffect(() => {
    if (role !== 'Owner' || authStage !== 'main') {
      setOwnerProfile(null);
      return;
    }

    const sessionOwner = getOwnerSession();
    if (!sessionOwner) {
      setOwnerProfile(null);
      return;
    }

    setOwnerProfile(sessionOwner);
    setUserName(sessionOwner.name || '');

    if (!sessionOwner.id) {
      return;
    }

    let active = true;

    ;(async () => {
      const result = await getOwnerById(sessionOwner.id as string | number);
      if (!active || result?.error || !result?.data) return;
      setOwnerProfile(result.data);
      setUserName(result.data.name || '');
    })();

    return () => {
      active = false;
    };
  }, [role, authStage]);

  const handleSelectRole = (selectedRole: UserRole | 'Admin') => {
    setRole(selectedRole as any);
    if (selectedRole === 'Customer') {
      // customers directly enter dashboard
      setAuthStage('main');
      setCurrentTab('Home');
    } else if (selectedRole === 'Owner') {
      // show owner auth (login or register)
      setAuthStage('ownerAuth');
    } else {
      // Admin must sign in with email/password
      setAuthStage('adminAuth');
    }
  };

  const handleRegistered = (owner: OwnerRecord | null) => {
    setRole('Owner')
    if (owner) {
      setOwnerProfile(owner)
      setUserName(owner.name || '')
    }
    // after registration, enter main dashboard (owner)
    setAuthStage('main')
    setCurrentTab('OwnerDashboard')
  }

  const handleLoggedIn = (session: any) => {
    // on successful login (admin/owner), enter main
    if (role === 'Owner') {
      setOwnerProfile(session ?? null);
      setUserName(session?.name || '');
    }
    setAuthStage('main')
    if (role === 'Admin') {
      setCurrentTab('Home')
    } else if (role === 'Owner') {
      setCurrentTab('OwnerDashboard')
    } else {
      setCurrentTab('Home')
    }
  }

  const handleSignOut = () => {
    signOutOwner();
    setAuthStage('picker');
    setUserName('');
    // phone state removed; owner session cleared via ownerProfile
    setOwnerProfile(null);
    setSelectedProperty(null);
    setCurrentTab('Home');
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const openListingMapView = (listing?: Listing) => {
    if (listing) {
      setSelectedProperty(listing);
      return;
    }
    if (listings[0]) {
      setSelectedProperty(listings[0]);
    }
  };

  const renderTabContent = () => {
    if (role === 'Admin') return <AdminDashboard />
    switch (currentTab) {
      case 'Home':
        return (
          <HomeScreen
            listings={listings}
            userName={userName || 'Guest User'}
            role={role}
            savedIds={savedIds}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onToggleSave={handleToggleSave}
            onSelectProperty={(listing) => setSelectedProperty(listing)}
            onOpenMapTab={openListingMapView}
            onChangeTab={(tab) => setCurrentTab(tab)}
          />
        );
      case 'Search':
        return (
          <SearchScreen
            listings={listings}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectProperty={(listing) => setSelectedProperty(listing)}
          />
        );
      case 'Add':
        return (
          <AddListingScreen
            onListingCreated={(listing) => {
              setListings((prev) => [listing, ...prev.filter((item) => item.id !== listing.id)]);
            }}
          />
        );
      case 'OwnerDashboard':
        return <OwnerDashboard />;
      case 'Saved':
        return (
          <SavedScreen
            listings={listings}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectProperty={(listing) => setSelectedProperty(listing)}
            onChangeTab={(tab) => setCurrentTab(tab as 'Home' | 'Search')}
          />
        );
      case 'Profile':
        if (!showOwnerProfile) {
          return null;
        }
        return (
          <ProfileScreen
            owner={ownerProfile}
            role={role}
            onSignOut={handleSignOut}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 font-sans transition-colors ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col justify-between transition-colors">
        {authStage === 'main' && !selectedProperty && (
          <div className="hidden md:block bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 px-6 py-3 sticky top-0 z-40 transition-colors backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#1D9E75] dark:bg-emerald-950/40">
                  {role} Feed
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Explore verified rooms without brokers
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    The layout auto-adjusts for laptop and mobile screens.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/60 dark:border-gray-700">
                <button
                  onClick={() => setCurrentTab('Home')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'Home'
                      ? 'bg-[#1D9E75] text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <HomeIcon className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => setCurrentTab('Search')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'Search'
                      ? 'bg-[#1D9E75] text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <SearchIcon className="w-3.5 h-3.5" />
                  <span>Explore</span>
                </button>
                <button
                  onClick={() => setCurrentTab('Saved')}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'Saved'
                      ? 'bg-[#1D9E75] text-white shadow-2xs'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Saved</span>
                  {savedIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center scale-90">
                      {savedIds.length}
                    </span>
                  )}
                </button>
                {showOwnerProfile && (
                  <button
                    onClick={() => setCurrentTab('Profile')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      currentTab === 'Profile'
                        ? 'bg-[#1D9E75] text-white shadow-2xs'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Profile</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {role === 'Owner' ? (
                  <button
                    onClick={() => setCurrentTab('Add')}
                    className="flex items-center space-x-1.5 bg-[#1D9E75] hover:bg-[#147B5A] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Listing</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/60 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zero Broker Commissions</span>
                  </div>
                )}

                {showOwnerProfile && (
                  <button
                    onClick={() => setCurrentTab('Profile')}
                    className="w-9 h-9 rounded-full bg-[#1D9E75]/10 text-[#1D9E75] font-bold font-display text-xs flex items-center justify-center border border-[#1D9E75]/30"
                    title="Open profile"
                  >
                    {userName ? userName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'GK'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grow max-w-7xl w-full mx-auto p-0 md:p-6 flex flex-col justify-center">
          {authStage !== 'main' ? (
            <div className="w-full max-w-md mx-auto my-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 page-shell">
              {authStage === 'picker' && <RolePickerScreen onSelectRole={handleSelectRole} />}
              {authStage === 'ownerAuth' && (
                <div className="p-4">
                  {/* OwnerAuthScreen will show login or register */}
                  {/* dynamic import to avoid circular references */}
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <OwnerAuthScreen onBack={() => setAuthStage('picker')} onRegistered={handleRegistered} onLoggedIn={handleLoggedIn} />
                  </React.Suspense>
                </div>
              )}

              {authStage === 'adminAuth' && (
                <div className="p-4">
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <AdminLoginScreen onBack={() => setAuthStage('picker')} onLoggedIn={handleLoggedIn} />
                  </React.Suspense>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full relative page-shell">
              {fetchError && (
                <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 text-rose-900 p-3 text-sm">
                  <strong>Data load error:</strong> {fetchError}. Check your Supabase env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
                </div>
              )}
              {renderTabContent()}

              {selectedProperty && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 md:p-6 animate-fade-in">
                  <div className="w-full max-w-4xl max-h-[94vh] bg-white dark:bg-gray-900 rounded-none md:rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
                    <PropertyDetailScreen
                      listing={selectedProperty}
                      isSaved={savedIds.includes(selectedProperty.id)}
                      onToggleSave={handleToggleSave}
                      onBack={() => setSelectedProperty(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {authStage === 'main' && !selectedProperty && (
          <div className="block md:hidden fixed bottom-0 inset-x-0 h-16 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 z-40 transition-colors shadow-xl backdrop-blur-md">
            <button
              onClick={() => setCurrentTab('Home')}
              className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
                currentTab === 'Home' ? 'text-[#1D9E75] scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>
            <button
              onClick={() => setCurrentTab('Search')}
              className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
                currentTab === 'Search' ? 'text-[#1D9E75] scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <SearchIcon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Explore</span>
            </button>
            {role === 'Owner' && (
              <button
                onClick={() => setCurrentTab('Add')}
                className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-[#1D9E75] text-white shadow-md hover:bg-[#147B5A] active:scale-95 transition-all ring-4 ring-white dark:ring-gray-900"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={() => setCurrentTab('Saved')}
              className={`flex flex-col items-center justify-center w-12 py-1 relative transition-all ${
                currentTab === 'Saved' ? 'text-[#1D9E75] scale-105 font-bold' : 'text-gray-400'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Saved</span>
              {savedIds.length > 0 && (
                <span className="absolute top-0.5 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>
            {showOwnerProfile && (
              <button
                onClick={() => setCurrentTab('Profile')}
                className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
                  currentTab === 'Profile' ? 'text-[#1D9E75] scale-105 font-bold' : 'text-gray-400'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Profile</span>
              </button>
            )}
          </div>
        )}

        <footer className="border-t border-slate-800 text-center py-8 px-4 text-xs text-slate-400 mt-12 bg-slate-950/40">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-purple-950/40 p-4 rounded-2xl border border-purple-900/50 text-center relative overflow-hidden surface-card">
              <div className="flex items-center justify-center space-x-1.5 mb-1 text-purple-300">
                <Gift className="w-4 h-4 text-purple-400" />
                <span className="font-bold font-display text-xs text-white">Support the Product Team</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed max-w-md mx-auto mb-3">
                This project is built to make finding rooms easier and faster for people across Nepal. Scan the feedback QR code below to help improve the project.
              </p>

              <div className="inline-flex items-center space-x-3 bg-slate-950 p-2 rounded-xl border border-purple-800/60">
                <div className="w-20 h-20 bg-white p-1 rounded-md shrink-0 flex items-center justify-center">
                  <img
                    src="/Screenshot%202026-06-01%20183748.png"
                    alt="Feedback QR code"
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
               
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-300">Basai.com. Built for modern room discovery.</p>
              <p className="mt-1 text-[11px] text-slate-500">Geolocation search, map previews, and fast mobile-friendly browsing.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

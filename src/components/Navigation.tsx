import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  BarChart3,
  BookOpen,
  Bookmark,
  Layers,
  Menu,
  X,
  Sparkles,
  TreePine,
  UserCheck,
  LogIn,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavTab =
  | 'overview'
  | 'map'
  | 'insights'
  | 'explorer'
  | 'journal'
  | 'stories'
  | 'saved'
  | 'dashboard'
  | 'not-found';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  savedCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openAuthModal, signOut } = useAuth();

  interface NavItem {
    id: NavTab;
    label: string;
    icon: any;
    badge?: number;
  }

  // Strict public vs authenticated navigation items as required by specification
  const publicNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'map', label: 'Living Map', icon: MapPin },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  const authenticatedNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'map', label: 'Living Map', icon: MapPin },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'dashboard', label: 'Dashboard', icon: UserCheck },
    {
      id: 'saved',
      label: 'Saved Places',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : undefined,
    },
    { id: 'journal', label: 'My Journal', icon: BookOpen },
  ];

  const currentNavItems = user ? authenticatedNavItems : publicNavItems;

  const handleSelect = (id: NavTab) => {
    onTabChange(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#AAB29A]/15 bg-[#0E120F]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleSelect('overview')}
          className="flex items-center gap-3 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AAB29A] rounded-lg p-1 cursor-pointer"
          aria-label="TERAVIA Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#25352A] to-[#41483A] border border-[#727B5A]/40 flex items-center justify-center text-[#AAB29A] group-hover:border-[#AAB29A] transition-colors shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-medium tracking-[0.16em] text-lg text-[#F4F3EC] group-hover:text-white transition-colors">
              TERAVIA
            </span>
            <span className="text-[9.5px] uppercase tracking-[0.2em] text-[#777B70] -mt-0.5">
              Environmental Intelligence
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#151A16]/80 p-1.5 rounded-full border border-[#25352A]/80 shadow-inner">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AAB29A] ${
                  isActive
                    ? 'text-white bg-[#25352A] shadow-sm font-semibold'
                    : 'text-[#AAB29A] hover:text-[#F4F3EC] hover:bg-[#1C231E]/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#AAB29A]' : 'opacity-70'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-[#727B5A] text-[#FAF9F4] rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2 bg-[#151A16] border border-[#25352A] rounded-full pl-3 pr-1.5 py-1">
              <span className="text-xs text-[#F4F3EC] font-medium max-w-[130px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-full hover:bg-[#25352A] text-[#777B70] hover:text-white transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  openAuthModal({
                    mode: 'signin',
                    prompt: 'Sign in to access your saved places and nature observations.',
                  })
                }
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#AAB29A] hover:text-white hover:bg-[#1C231E] border border-[#25352A] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-[#727B5A]" />
                <span>Log In</span>
              </button>

              <button
                onClick={() =>
                  openAuthModal({
                    mode: 'signup',
                    prompt: 'Create an account to save your favourite green spaces and keep your nature observations.',
                  })
                }
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#727B5A]" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#AAB29A] hover:text-white hover:bg-[#151A16] border border-[#25352A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AAB29A] cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#25352A] bg-[#0E120F]/95 backdrop-blur-xl px-4 pt-4 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Ambient Platform Status Pill on Mobile */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#151A16] border border-[#25352A]/80 text-[11px] text-[#AAB29A]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Singapore Sensor Grid Active</span>
            </div>
            <span className="text-[#727B5A] font-semibold">18 Sanctuaries</span>
          </div>

          <div className="space-y-1.5">
            <p className="px-2 text-[10px] uppercase tracking-wider text-[#777B70] font-semibold">
              {user ? 'Account Navigation' : 'Platform Exploration'}
            </p>
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left text-sm transition-all cursor-pointer touch-target ${
                    isActive
                      ? 'bg-[#25352A] text-white font-medium border border-[#727B5A]/40 shadow-sm'
                      : 'bg-[#151A16]/70 text-[#AAB29A] hover:bg-[#1C231E] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-[#1C231E] text-emerald-400' : 'bg-[#1C231E]/60 text-[#727B5A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] bg-[#727B5A] text-white rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#25352A]/80">
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#151A16] border border-[#25352A]">
                <div className="flex items-center gap-2.5 text-xs text-[#F4F3EC] truncate">
                  <div className="w-7 h-7 rounded-full bg-[#25352A] flex items-center justify-center text-emerald-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-medium truncate">{user.displayName || 'Observer'}</span>
                    <span className="text-[10px] text-[#777B70] truncate">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#E08A7C] hover:bg-[#25352A] transition-colors flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-[#E08A7C]/30"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal({
                      mode: 'signin',
                      prompt: 'Sign in to access your saved places and nature observations.',
                    });
                  }}
                  className="py-3 rounded-2xl text-xs font-semibold text-[#AAB29A] bg-[#151A16] hover:bg-[#1C231E] border border-[#25352A] flex items-center justify-center gap-2 cursor-pointer touch-target"
                >
                  <LogIn className="w-4 h-4 text-[#727B5A]" />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal({
                      mode: 'signup',
                      prompt: 'Create an account to save your favourite green spaces and keep your nature observations.',
                    });
                  }}
                  className="py-3 rounded-2xl text-xs font-semibold bg-[#F4F3EC] text-[#252820] hover:bg-white flex items-center justify-center gap-2 cursor-pointer shadow-md touch-target"
                >
                  <Sparkles className="w-4 h-4 text-[#727B5A]" />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

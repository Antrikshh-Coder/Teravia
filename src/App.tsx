import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { Footer } from './components/Footer';
import { Overview } from './components/Overview';
import { LivingMap } from './components/LivingMap';
import { InsightsDashboard } from './components/InsightsDashboard';
import { NeighbourhoodExplorer } from './components/NeighbourhoodExplorer';
import { NatureJournal } from './components/NatureJournal';
import { SavedPlaces } from './components/SavedPlaces';
import { Stories } from './components/Stories';
import { PersonalDashboard } from './components/PersonalDashboard';
import { NotFound } from './components/NotFound';
import { getSavedPlaces } from './services/storage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ProtectedRouteGate } from './components/ProtectedRouteGate';
import { CinematicIntro } from './components/CinematicIntro';
import { api } from './services/apiClient';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState<string | null>(null);
  const [prefilledLocationForJournal, setPrefilledLocationForJournal] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      const alreadyPlayed = sessionStorage.getItem('teravia_intro_played');
      return !alreadyPlayed;
    } catch {
      return false;
    }
  });

  // Sync saved count
  const updateSavedCount = useCallback(async () => {
    try {
      const data = await api.getSavedPlaces();
      setSavedCount(data.total);
    } catch {
      setSavedCount(getSavedPlaces().length);
    }
  }, []);

  const normalizeTab = (raw: string): NavTab => {
    const clean = raw.replace('#', '').toLowerCase();
    if (!clean) return 'overview';
    if (clean === 'neighbourhoods') return 'explorer';
    if (['overview', 'map', 'insights', 'explorer', 'journal', 'stories', 'saved', 'dashboard'].includes(clean)) {
      return clean as NavTab;
    }
    return 'not-found';
  };

  useEffect(() => {
    updateSavedCount();

    // Read initial hash if present
    if (window.location.hash) {
      setActiveTab(normalizeTab(window.location.hash));
    }

    // Listen to hash changes for browser forward/back buttons
    const handleHashChange = () => {
      setActiveTab(normalizeTab(window.location.hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [updateSavedCount]);

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: NavTab, placeId?: string) => {
    if (placeId) {
      setSelectedPlaceForMap(placeId);
    }
    handleTabChange(tab);
  };

  const handleSelectPlaceForJournal = (placeName: string) => {
    setPrefilledLocationForJournal(placeName);
    handleTabChange('journal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E120F] text-[#F4F3EC] selection:bg-[#727B5A]/30 selection:text-white">
      {/* 5.6-Second Cinematic Introduction */}
      {showIntro && (
        <CinematicIntro
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Persistent Responsive Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        savedCount={savedCount}
      />

      {/* Main Routed Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {activeTab === 'overview' && (
          <Overview
            onNavigate={handleNavigate}
            onReplayIntro={() => setShowIntro(true)}
          />
        )}

        {activeTab === 'map' && (
          <LivingMap
            initialSelectedPlaceId={selectedPlaceForMap}
            onSelectPlaceForJournal={handleSelectPlaceForJournal}
            onSavedChange={updateSavedCount}
          />
        )}

        {activeTab === 'insights' && <InsightsDashboard />}

        {activeTab === 'explorer' && (
          <NeighbourhoodExplorer
            onNavigateToMap={(id) => handleNavigate('map', id)}
          />
        )}

        {activeTab === 'journal' && (
          user ? (
            <NatureJournal
              prefilledLocation={prefilledLocationForJournal}
              onEntriesChange={updateSavedCount}
            />
          ) : (
            <ProtectedRouteGate target="journal" onNavigate={handleTabChange} />
          )
        )}

        {activeTab === 'stories' && <Stories />}

        {activeTab === 'saved' && (
          user ? (
            <SavedPlaces
              onNavigateToMap={(id) => handleNavigate('map', id)}
              onSelectForJournal={handleSelectPlaceForJournal}
              onSavedChange={updateSavedCount}
            />
          ) : (
            <ProtectedRouteGate target="saved" onNavigate={handleTabChange} />
          )
        )}

        {activeTab === 'dashboard' && (
          user ? (
            <PersonalDashboard onNavigate={handleNavigate} />
          ) : (
            <ProtectedRouteGate target="dashboard" onNavigate={handleTabChange} />
          )
        )}

        {activeTab === 'not-found' && (
          <NotFound
            onNavigateHome={() => handleTabChange('overview')}
            onNavigateTab={handleTabChange}
          />
        )}
      </main>

      {/* Persistent Global Footer */}
      <Footer onTabChange={handleTabChange} />

      {/* Cloud Authentication & Sync Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

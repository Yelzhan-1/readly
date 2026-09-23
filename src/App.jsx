import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import ProfilePicker from './pages/ProfilePicker.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Diagnostic from './pages/Diagnostic.jsx';
import NotFound from './pages/NotFound.jsx';

import ChildLayout from './components/child/ChildLayout.jsx';
import Home from './pages/child/Home.jsx';
import Learn from './pages/child/Learn.jsx';
import SessionPage from './pages/child/SessionPage.jsx';
import ReadingList from './pages/child/ReadingList.jsx';
import Reader from './pages/child/Reader.jsx';
import Writing from './pages/child/Writing.jsx';
import Stories from './pages/child/Stories.jsx';
import ProgressPage from './pages/child/ProgressPage.jsx';
import ProfilePage from './pages/child/ProfilePage.jsx';
import SettingsPage from './pages/child/SettingsPage.jsx';

import ParentGate from './pages/parent/ParentGate.jsx';
import ParentLayout from './components/parent/ParentLayout.jsx';
import ParentOverview from './pages/parent/Overview.jsx';
import ParentProgress from './pages/parent/Progress.jsx';
import ParentSkills from './pages/parent/Skills.jsx';
import ParentHistory from './pages/parent/History.jsx';
import ParentSettings from './pages/parent/ParentSettings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/profiles" element={<ProfilePicker />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/diagnostic" element={<Diagnostic />} />

      <Route path="/parent" element={<ParentGate />} />
      <Route element={<ParentLayout />}>
        <Route path="/parent/overview" element={<ParentOverview />} />
        <Route path="/parent/progress" element={<ParentProgress />} />
        <Route path="/parent/skills" element={<ParentSkills />} />
        <Route path="/parent/history" element={<ParentHistory />} />
        <Route path="/parent/settings" element={<ParentSettings />} />
      </Route>

      <Route element={<ChildLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/session/:module" element={<SessionPage />} />
        <Route path="/read" element={<ReadingList />} />
        <Route path="/read/:storyId" element={<Reader />} />
        <Route path="/write" element={<Writing />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

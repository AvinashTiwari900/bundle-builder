import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import Dashboard from './pages/Dashboard'
import JobsPage from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import ProfilePage from './pages/Profile'
import ApplicationsPage from './pages/Applications'
import InterviewPage from './pages/Interview'
import InterviewRoom from './pages/InterviewRoom'
import VoiceScreening from './pages/VoiceScreening'
import ResumePage from './pages/Resume'
import NotificationsPage from './pages/Notifications'
import DocumentsPage from './pages/Documents'
import AutoApplyPage from './pages/AutoApply'
import PortfolioPage from './pages/Portfolio'
import PortfolioSetupPage from './pages/PortfolioSetup'
import SettingsPage from './pages/Settings'
import AIAgent from './pages/AIAgent'
import ProjectsPage from './pages/Projects'
import InterviewPractice from './pages/InterviewPractice'
import InterviewSetup from './pages/InterviewSetup'
import InterviewSession from './pages/InterviewSession'
import PostsPage from './pages/Posts'
import MeetingsPage from './pages/Meetings'
import PreJoinPage from './pages/PreJoin'
import ConnectionsPage from './pages/Connections'
import UserProfilePage from './pages/UserProfile'
import { AuthProvider, useAuth } from './context/auth'
import Layout from './components/Layout'

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function ProtectedStandalone({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/portfolio-setup"
          element={
            <ProtectedStandalone>
              <PortfolioSetupPage />
            </ProtectedStandalone>
          }
        />

        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/jobs"
          element={
            <Protected>
              <JobsPage />
            </Protected>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <Protected>
              <JobDetails />
            </Protected>
          }
        />
        <Route
          path="/connections"
          element={
            <Protected>
              <ConnectionsPage />
            </Protected>
          }
        />
        <Route
          path="/network/user/:id"
          element={
            <Protected>
              <UserProfilePage />
            </Protected>
          }
        />
        <Route
          path="/posts"
          element={
            <Protected>
              <PostsPage />
            </Protected>
          }
        />
        <Route
          path="/meetings"
          element={
            <Protected>
              <MeetingsPage />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <ProfilePage />
            </Protected>
          }
        />
        <Route
          path="/resume"
          element={
            <Protected>
              <ResumePage />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <NotificationsPage />
            </Protected>
          }
        />
        <Route
          path="/documents"
          element={
            <Protected>
              <DocumentsPage />
            </Protected>
          }
        />
        <Route
          path="/auto-apply"
          element={
            <Protected>
              <AutoApplyPage />
            </Protected>
          }
        />
        <Route
          path="/portfolio"
          element={
            <Protected>
              <PortfolioPage />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <SettingsPage />
            </Protected>
          }
        />
        <Route
          path="/applications"
          element={
            <Protected>
              <ApplicationsPage />
            </Protected>
          }
        />
        <Route
          path="/interview/room/:id"
          element={<InterviewRoom />}
        />
        <Route
          path="/meeting/room/:id"
          element={<InterviewRoom />}
        />
        <Route
          path="/meet/:code"
          element={<PreJoinPage />}
        />
        <Route
          path="/meet/join/:code"
          element={<PreJoinPage />}
        />
        <Route
          path="/interview/:id"
          element={
            <Protected>
              <InterviewPage />
            </Protected>
          }
        />
        <Route
          path="/voice-screening"
          element={
            <Protected>
              <VoiceScreening />
            </Protected>
          }
        />
        <Route
          path="/ai-agent"
          element={
            <Protected>
              <AIAgent />
            </Protected>
          }
        />
        <Route
          path="/projects"
          element={
            <Protected>
              <ProjectsPage />
            </Protected>
          }
        />
        <Route
          path="/interview-practice"
          element={
            <Protected>
              <InterviewPractice />
            </Protected>
          }
        />
        <Route
          path="/interview-practice/setup"
          element={
            <Protected>
              <InterviewSetup />
            </Protected>
          }
        />
        <Route
          path="/interview-practice/session/:id"
          element={
            <ProtectedStandalone>
              <InterviewSession />
            </ProtectedStandalone>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

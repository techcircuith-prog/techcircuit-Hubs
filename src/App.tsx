import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { OnboardingModal } from './components/modals/OnboardingModal';

// Student Pages
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { PaymentReturnPage } from './pages/PaymentReturnPage';
import { SkillsDashboardPage } from './pages/SkillsDashboardPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PoliciesPage } from './pages/PoliciesPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOpportunities } from './pages/admin/AdminOpportunities';
import { AdminResources } from './pages/admin/AdminResources';
import { AdminLearningPaths } from './pages/admin/AdminLearningPaths';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminSettings } from './pages/admin/AdminSettings';

const StudentLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Student UI Routes */}
            <Route element={<StudentLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/opportunity/:id" element={<OpportunityDetailPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/project/:id" element={<ProjectDetailPage />} />
              <Route path="/cart" element={<CartCheckoutPage />} />
              <Route path="/payment/return" element={<PaymentReturnPage />} />
              <Route path="/skills" element={<SkillsDashboardPage />} />
              <Route path="/components" element={<ComponentsPage />} />
              <Route path="/dashboard" element={<StudentDashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<StudentLoginPage />} />
              <Route path="/student/login" element={<StudentLoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/policies/:type" element={<PoliciesPage />} />
            </Route>

            {/* Admin Dedicated Login (No links in Student UI) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Console (Protected & Redirection for non-admins) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="opportunities" element={<AdminOpportunities />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="learning-paths" element={<AdminLearningPaths />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'

import DashboardLayout from './layouts/DashboardLayout'
import DHLayout from './layouts/DHLayout'
import DeanLayout from './layouts/DeanLayout'
import VPAALayout from './layouts/VPAALayout'
import SystemAdminLayout from './layouts/SystemAdminLayout'

import PresidentOverview from './pages/president/PresidentOverview'
import PresidentReports from './pages/president/PresidentReports'

import DHOverview from './pages/dh/DHOverview'
import DHEnrollment from './pages/dh/DHEnrollment'
import DHRetention from './pages/dh/DHRetention'

import DeanOverview from './pages/dean/DeanOverview'
import DeanApprovals from './pages/dean/DeanApprovals'
import DeanReviewReport from './pages/dean/DeanReviewReport'
import DeanRetention from './pages/dean/DeanRetention'
import DeanFaculty from './pages/dean/DeanFaculty'
import DeanAchievements from './pages/dean/DeanAchievements'

import VPAAOverview from './pages/vpaa/VPAAOverview'
import VPAAApprovals from './pages/vpaa/VPAAApprovals'
import VPAAReviewReport from './pages/vpaa/VPAAReviewReport'
import VPAAFaculty from './pages/vpaa/VPAAFaculty'
import VPAAAchievements from './pages/vpaa/VPAAAchievements'
import VPAAClassMonitoring from './pages/vpaa/VPAAClassMonitoring'

import SystemAdminDashboard from './pages/admin/SystemAdminDashboard'
import SystemAdminUsers from './pages/admin/SystemAdminUsers'
import AdminAcademicPeriods from './pages/admin/AdminAcademicPeriods'
import SystemAdminBackup from './pages/admin/SystemAdminBackup'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* President — read-only, fully approved data only */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['president']}><DashboardLayout /></ProtectedRoute>
      }>
        <Route index element={<PresidentOverview />} />
        <Route path="reports" element={<PresidentReports />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Department Head — records enrollment and retention for their own program */}
      <Route path="/dh" element={
        <ProtectedRoute allowedRoles={['department_head']}><DHLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DHOverview />} />
        <Route path="enrollment" element={<DHEnrollment />} />
        <Route path="retention" element={<DHRetention />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Dean — pre-approves reports, records faculty status and achievements */}
      <Route path="/dean" element={
        <ProtectedRoute allowedRoles={['dean']}><DeanLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DeanOverview />} />
        <Route path="approvals" element={<DeanApprovals />} />
        <Route path="approvals/:kind/:id" element={<DeanReviewReport />} />
        <Route path="retention" element={<DeanRetention />} />
        <Route path="faculty" element={<DeanFaculty />} />
        <Route path="achievements" element={<DeanAchievements />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* VPAA — final approval, faculty and achievement approval, class monitoring */}
      <Route path="/vpaa" element={
        <ProtectedRoute allowedRoles={['vpaa']}><VPAALayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VPAAOverview />} />
        <Route path="approvals" element={<VPAAApprovals />} />
        <Route path="approvals/:kind/:id" element={<VPAAReviewReport />} />
        <Route path="faculty" element={<VPAAFaculty />} />
        <Route path="achievements" element={<VPAAAchievements />} />
        <Route path="class-monitoring" element={<VPAAClassMonitoring />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* System Admin — accounts and academic periods (plan to follow) */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['system_admin']}><SystemAdminLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SystemAdminDashboard />} />
        <Route path="users" element={<SystemAdminUsers />} />
        <Route path="academic-periods" element={<AdminAcademicPeriods />} />
        <Route path="backup" element={<SystemAdminBackup />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
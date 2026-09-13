import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import DHLayout from './layouts/DHLayout'
import DeanLayout from './layouts/DeanLayout'
import VPAALayout from './layouts/VPAALayout'
import RegistrarLayout from './layouts/RegistrarLayout'
import DHDashboard from './pages/dh/DHDashboard'
import DHEnrollment from './pages/dh/DHEnrollment'
import DHRetention from './pages/dh/DHRetention'
import DHFacultyPerformance from './pages/dh/DHFacultyPerformance'
import DHAchievements from './pages/dh/DHAchievements'
import DHStudentPerformance from './pages/dh/DHStudentPerformance'
import DHBoardExam from './pages/dh/DHBoardExam'
import DHShifteeTransferee from './pages/dh/DHShifteeTransferee'
import DeanDashboard from './pages/dean/DeanDashboard'
import DeanEnrollment from './pages/dean/DeanEnrollment'
import DeanRetention from './pages/dean/DeanRetention'
import DeanFacultyPerformance from './pages/dean/DeanFacultyPerformance'
import DeanAchievements from './pages/dean/DeanAchievements'
import DeanStudentPerformance from './pages/dean/DeanStudentPerformance'
import DeanBoardExam from './pages/dean/DeanBoardExam'
import DeanShifteeTransferee from './pages/dean/DeanShifteeTransferee'
import VPAADashboard from './pages/vpaa/VPAADashboard'
import VPAAEnrollment from './pages/vpaa/VPAAEnrollment'
import VPAARetention from './pages/vpaa/VPAARetention'
import VPAAShifteeTransferee from './pages/vpaa/VPAAShifteeTransferee'
import VPAAFacultyPerformance from './pages/vpaa/VPAAFacultyPerformance'
import VPAAAchievements from './pages/vpaa/VPAAAchievements'
import VPAABoardExam from './pages/vpaa/VPAABoardExam'
import VPAAClassMonitoring from './pages/vpaa/VPAAClassMonitoring'
import VPAAStudentPerformance from './pages/vpaa/VPAAStudentPerformance'
import VPAAUsers from './pages/vpaa/VPAAUsers'
import VPAABackup from './pages/vpaa/VPAABackup'
import RegistrarDashboard from './pages/registrar/RegistrarDashboard'
import RegistrarEnrollment from './pages/registrar/RegistrarEnrollment'
import RegistrarRetention from './pages/registrar/RegistrarRetention'
import RegistrarShifteeTransferee from './pages/registrar/RegistrarShifteeTransferee'
import ChangePassword from './pages/ChangePassword'
import Enrollment from './pages/Enrollment'
import Retention from './pages/Retention'
import FacultyPerformance from './pages/FacultyPerformance'
import Achievements from './pages/Achievements'
import StudentPerformance from './pages/StudentPerformance'
import BoardExam from './pages/BoardExam'
import ClassMonitoring from './pages/ClassMonitoring'
import ShifteeTransferee from './pages/ShifteeTransferee'
import DeanEmployees from './pages/dean/DeanEmployees'
import VPAAEmployees from './pages/vpaa/VPAAEmployees'
import SystemAdminLayout from './layouts/SystemAdminLayout'
import SystemAdminDashboard from './pages/admin/SystemAdminDashboard'
import SystemAdminUsers from './pages/admin/SystemAdminUsers'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* President Routes */}
      <Route path="/dashboard" element={<DashboardLayout title="Overview" />}>
        <Route index element={<Dashboard />} />
        <Route path="enrollment" element={<Enrollment />} />
        <Route path="retention" element={<Retention />} />
        <Route path="shiftee-transferee" element={<ShifteeTransferee />} />
        <Route path="faculty-performance" element={<FacultyPerformance />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="board-exam" element={<BoardExam />} />
        <Route path="class-monitoring" element={<ClassMonitoring />} />
        <Route path="student-performance" element={<StudentPerformance />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Dean Routes */}
      <Route path="/dean" element={<DeanLayout />}>
        <Route path="dashboard" element={<DeanDashboard />} />
        <Route path="enrollment" element={<DeanEnrollment />} />
        <Route path="retention" element={<DeanRetention />} />
        <Route path="shiftee-transferee" element={<DeanShifteeTransferee />} />
        <Route path="faculty-performance" element={<DeanFacultyPerformance />} />
        <Route path="achievements" element={<DeanAchievements />} />
        <Route path="board-exam" element={<DeanBoardExam />} />
        <Route path="student-performance" element={<DeanStudentPerformance />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="employees" element={<DeanEmployees />} />
      </Route>

      {/* VPAA Routes */}
      <Route path="/vpaa" element={<VPAALayout />}>
        <Route path="dashboard" element={<VPAADashboard />} />
        <Route path="enrollment" element={<VPAAEnrollment />} />
        <Route path="retention" element={<VPAARetention />} />
        <Route path="shiftee-transferee" element={<VPAAShifteeTransferee />} />
        <Route path="faculty-performance" element={<VPAAFacultyPerformance />} />
        <Route path="achievements" element={<VPAAAchievements />} />
        <Route path="board-exam" element={<VPAABoardExam />} />
        <Route path="class-monitoring" element={<VPAAClassMonitoring />} />
        <Route path="student-performance" element={<VPAAStudentPerformance />} />
        <Route path="users" element={<VPAAUsers />} />
        <Route path="backup" element={<VPAABackup />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="employees" element={<VPAAEmployees />} />
      </Route>

      {/* Registrar Routes */}
      <Route path="/registrar" element={<RegistrarLayout />}>
        <Route path="dashboard" element={<RegistrarDashboard />} />
        <Route path="enrollment" element={<RegistrarEnrollment />} />
        <Route path="retention" element={<RegistrarRetention />} />
        <Route path="shiftee-transferee" element={<RegistrarShifteeTransferee />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Department Head Routes — kept temporarily; remove once all DH
          accounts are confirmed migrated to registrar/dean */}
      <Route path="/dh" element={<DHLayout />}>
        <Route path="dashboard" element={<DHDashboard />} />
        <Route path="enrollment" element={<DHEnrollment />} />
        <Route path="retention" element={<DHRetention />} />
        <Route path="shiftee-transferee" element={<DHShifteeTransferee />} />
        <Route path="faculty-performance" element={<DHFacultyPerformance />} />
        <Route path="achievements" element={<DHAchievements />} />
        <Route path="board-exam" element={<DHBoardExam />} />
        <Route path="student-performance" element={<DHStudentPerformance />} />
      </Route>

      {/* System Admin Routes */}
      <Route path="/admin" element={<SystemAdminLayout />}>
        <Route path="dashboard" element={<SystemAdminDashboard />} />
        <Route path="users" element={<SystemAdminUsers />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>


    </Routes>
  )
}

export default App
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import DHLayout from './layouts/DHLayout'
import DeanLayout from './layouts/DeanLayout'
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
import Enrollment from './pages/Enrollment'
import Retention from './pages/Retention'
import FacultyPerformance from './pages/FacultyPerformance'
import Achievements from './pages/Achievements'
import StudentPerformance from './pages/StudentPerformance'
import BoardExam from './pages/BoardExam'
import ClassMonitoring from './pages/ClassMonitoring'
import ShifteeTransferee from './pages/ShifteeTransferee'

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
      </Route>

      {/* Department Head Routes */}
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
    </Routes>
  )
}

export default App
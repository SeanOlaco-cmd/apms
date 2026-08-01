import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import DHLayout from './layouts/DHLayout'
import DHDashboard from './pages/dh/DHDashboard'
import DHEnrollment from './pages/dh/DHEnrollment'
import DHRetention from './pages/dh/DHRetention'
import DHFacultyPerformance from './pages/dh/DHFacultyPerformance'
import DHAchievements from './pages/dh/DHAchievements'
import DHStudentPerformance from './pages/dh/DHStudentPerformance'
import DHBoardExam from './pages/dh/DHBoardExam'
import DHClassMonitoring from './pages/dh/DHClassMonitoring'
import DHShifteeTransferee from './pages/dh/DHShifteeTransferee'
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

      {/* Department Head Routes */}
      <Route path="/dh" element={<DHLayout />}>
        <Route path="dashboard" element={<DHDashboard />} />
        <Route path="enrollment" element={<DHEnrollment />} />
        <Route path="retention" element={<DHRetention />} />
        <Route path="shiftee-transferee" element={<DHShifteeTransferee />} />
        <Route path="faculty-performance" element={<DHFacultyPerformance />} />
        <Route path="achievements" element={<DHAchievements />} />
        <Route path="board-exam" element={<DHBoardExam />} />
        <Route path="class-monitoring" element={<DHClassMonitoring />} />
        <Route path="student-performance" element={<DHStudentPerformance />} />
      </Route>
    </Routes>
  )
}

export default App
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'
import DHLayout from './layouts/DHLayout'
import DeanLayout from './layouts/DeanLayout'
import DHDashboard from './pages/dh/DHDashboard'
import DHEnrollment from './pages/dh/DHEnrollment'
import DHRecruitment from './pages/dh/DHRecruitment'
import DHRetention from './pages/dh/DHRetention'
import DHFacultyPerformance from './pages/dh/DHFacultyPerformance'
import DHWorkforce from './pages/dh/DHWorkforce'
import DHAchievements from './pages/dh/DHAchievements'
import DHAccreditation from './pages/dh/DHAccreditation'
import DHPartnerships from './pages/dh/DHPartnerships'
import DHStudentPerformance from './pages/dh/DHStudentPerformance'
import DeanDashboard from './pages/dean/DeanDashboard'
import DeanEnrollment from './pages/dean/DeanEnrollment'
import Enrollment from './pages/Enrollment'
import Recruitment from './pages/Recruitment'
import Retention from './pages/Retention'
import FacultyPerformance from './pages/FacultyPerformance'
import WorkforceNeeds from './pages/WorkforceNeeds'
import Achievements from './pages/Achievements'
import Accreditation from './pages/Accreditation'
import Partnerships from './pages/Partnerships'
import StudentPerformance from './pages/StudentPerformance'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* President Routes */}
      <Route path="/dashboard" element={<DashboardLayout title="Overview" />}>
        <Route index element={<Dashboard />} />
        <Route path="enrollment" element={<Enrollment />} />
        <Route path="recruitment" element={<Recruitment />} />
        <Route path="retention" element={<Retention />} />
        <Route path="faculty-performance" element={<FacultyPerformance />} />
        <Route path="workforce" element={<WorkforceNeeds />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="accreditation" element={<Accreditation />} />
        <Route path="partnerships" element={<Partnerships />} />
        <Route path="student-performance" element={<StudentPerformance />} />
      </Route>

      {/* Dean Routes */}
      <Route path="/dean" element={<DeanLayout />}>
        <Route path="dashboard" element={<DeanDashboard />} />
        <Route path="enrollment" element={<DeanEnrollment />} />
      </Route>

      {/* Department Head Routes */}
      <Route path="/dh" element={<DHLayout />}>
        <Route path="dashboard" element={<DHDashboard />} />
        <Route path="enrollment" element={<DHEnrollment />} />
        <Route path="recruitment" element={<DHRecruitment />} />
        <Route path="retention" element={<DHRetention />} />
        <Route path="faculty-performance" element={<DHFacultyPerformance />} />
        <Route path="workforce" element={<DHWorkforce />} />
        <Route path="achievements" element={<DHAchievements />} />
        <Route path="accreditation" element={<DHAccreditation />} />
        <Route path="partnerships" element={<DHPartnerships />} />
        <Route path="student-performance" element={<DHStudentPerformance />} />
      </Route>
    </Routes>
  )
}

export default App
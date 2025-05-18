import React from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import './scss/examples.scss'
import { Login, Reports } from './components/pages'
import Employees from './components/pages/employees/Employess'
import EmployeeDetails from './components/pages/employee-details/EmployeeDetails'
import Tasks from './components/pages/tasks/Tasks'
import Clients from './components/pages/clients/Clients'
import StarterPage from './components/pages/starter-page/StarterPage'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<StarterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/clients" element={<Clients />} />
          </Route>
          <Route path="/tasks" element={<Tasks />} />
          {/* 
          <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route path="/tasks" element={<Tasks />} />
          </Route> */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App

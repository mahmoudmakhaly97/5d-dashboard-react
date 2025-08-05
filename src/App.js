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
import ProtectedRoutes from './ProtectedRouts'
import Requests from './components/pages/requests/Requests'

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<StarterPage />} />

          {/* HR-only protected routes */}
          <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
            <Route
              path="/employees"
              element={
                <ProtectedRoutes>
                  <Employees />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoutes>
                  <Reports />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoutes>
                  <EmployeeDetails />
                </ProtectedRoutes>
              }
            />
          </Route>

          {/* Routes accessible by both HR and employees */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoutes>
                <Tasks />
              </ProtectedRoutes>
            }
          />
          {/* <Route path="/tasks" element={<Tasks />} /> */}
          <Route
            path="/clients"
            element={
              <ProtectedRoutes>
                <Clients />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoutes>
                <Requests />
              </ProtectedRoutes>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App

import React from 'react'
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import './scss/examples.scss'
import { Login, Reports } from './components/pages'
import Employees from './components/pages/employees/Employess'
import EmployeeDetails from './components/pages/employee-details/EmployeeDetails'
import Tasks from './components/pages/tasks/Tasks'
import Clients from './components/pages/clients/Clients'
import StarterPage from './components/pages/starter-page/StarterPage'

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route exact path="/login" element={<Login />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/employee" element={<EmployeeDetails />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/tasks" element={<Tasks />} />

        <Route path="/" element={<StarterPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App

/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [userType, setUserType] = useState(null)

  useEffect(() => {
    // Check for existing auth data on initial load
    const hrToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    const employeeData = JSON.parse(localStorage.getItem('authData') || 'null')

    if (hrToken) {
      setUserType('hr')
    } else if (employeeData && employeeData.token) {
      setUserType('employee')
    }
  }, [])

  const loginAsHR = (token, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem('authToken', token)
    } else {
      sessionStorage.setItem('authToken', token)
    }
    setUserType('hr')
  }

  const loginAsEmployee = (token) => {
    localStorage.setItem('authData', JSON.stringify({ token }))
    setUserType('employee')
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    localStorage.removeItem('authData')
    setUserType(null)
  }

  return (
    <AuthContext.Provider value={{ userType, loginAsHR, loginAsEmployee, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}

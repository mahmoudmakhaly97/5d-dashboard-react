import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilDescription } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { useAuth } from '../../context/AuthContext'

export const useNavItems = () => {
  const { userType } = useAuth()

  const common = [
    {
      component: CNavTitle,
      name: 'GENERAL',
    },
  ]

  const employeeNav = [
    {
      component: CNavItem,
      name: 'Tasks',
      to: '/tasks',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
  ]

  const hrNav = [
    {
      component: CNavItem,
      name: 'Employees',
      to: '/employees',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Reports',
      to: '/reports',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Clients',
      to: '/clients',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
  ]

  return [...common, ...(userType === 'employee' ? employeeNav : hrNav)]
}

export default useNavItems

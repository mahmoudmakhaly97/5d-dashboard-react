import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilDescription } from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'
import { useAuth } from '../../../../context/AuthContext'

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
    {
      component: CNavItem,
      name: 'Clients',
      to: '/clients',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Requests',
      to: '/requests',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    },
  ]

  return [...common, ...employeeNav]
}

export default useNavItems

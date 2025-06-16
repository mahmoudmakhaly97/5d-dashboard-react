import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from '/assets/images/profile-user.png'
import './index.scss'
const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authData')
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    navigate('/login')
  }
  console.log('Decoded token payload:', localStorage.getItem('authData'))
  // Extract user email from JWT token
  let userName = 'Unknown User'
  try {
    const stored = localStorage.getItem('authData') || sessionStorage.getItem('authData')
    const tokenObj = JSON.parse(stored)
    const token = tokenObj.token

    if (token) {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      console.log('Decoded token payload:', payload)
      const email = payload.email
      if (email) {
        userName = email.split('@')[0]
      }
    }
  } catch (error) {
    console.error('Failed to parse token:', error)
  }
  return (
    <CDropdown variant="nav-item d-flex align-items-center border-0">
      <span className=" fw-medium d-none d-md-inline">{userName}</span>

      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>

        <CDropdownItem href="#" onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
        <CDropdownItem href="#" onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          my tasks
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown

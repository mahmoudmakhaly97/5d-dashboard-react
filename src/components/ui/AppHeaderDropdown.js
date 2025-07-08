import React, { useEffect, useState } from 'react'
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
  const [userData, setUserData] = useState({
    name: 'Unknown User',
    email: '',
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('authTasks')
      if (stored) {
        const authTasks = JSON.parse(stored)

        if (authTasks.user) {
          setUserData({
            name: authTasks.user.name || authTasks.user.email.split('@')[0],
            email: authTasks.user.email,
          })
        } else {
          // Fallback to parsing token if user data isn't stored separately
          const token = authTasks.token
          if (token) {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            setUserData({
              name: payload.name || payload.email.split('@')[0],
              email: payload.email,
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse authTasks data:', error)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authTasks')
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    navigate('/login')
  }

  const handleMyTasksClick = () => {
    navigate('/my-tasks', { state: { fromMyTasks: true } })
  }

  return (
    <CDropdown variant="nav-item d-flex align-items-center border-0">
      <span className="fw-medium d-none d-md-inline">{userData.name}</span>

      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>

      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <button>
          <CDropdownItem component="button" onClick={handleMyTasksClick}>
            <CIcon icon={cilLockLocked} className="me-2" />
            My Tasks
          </CDropdownItem>
        </button>
        <CDropdownItem href="#" onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown

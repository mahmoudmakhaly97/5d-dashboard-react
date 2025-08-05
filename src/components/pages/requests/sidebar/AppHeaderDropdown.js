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

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    name: 'Unknown User',
    email: '',
  })

  useEffect(() => {
    try {
      // First, try to get employee data from authTasks
      const authTasksStored = localStorage.getItem('authTasks')
      if (authTasksStored) {
        const authTasks = JSON.parse(authTasksStored)

        if (authTasks.user) {
          setUserData({
            name: authTasks.user.name || authTasks.user.email.split('@')[0],
            email: authTasks.user.email,
          })
          return // Exit early if employee data found
        }
      }

      // If no employee data, try to get HR token data
      const hrToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      if (hrToken) {
        try {
          // Decode JWT token to get user info
          const base64Url = hrToken.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const payload = JSON.parse(atob(base64))

          setUserData({
            name: payload.name || payload.email?.split('@')[0] || 'HR User',
            email: payload.email || '',
          })
        } catch (tokenError) {
          console.error('Failed to decode HR token:', tokenError)
          // If token decoding fails, set a default HR user
          setUserData({
            name: 'HR User',
            email: '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to parse user data:', error)
    }
  }, [])

  const handleLogout = () => {
    navigate('/login')
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    // Navigate to login and replace the entire history stack
    navigate('/login', { replace: true })

    // Optional: Clear the entire history stack
    window.history.replaceState(null, null, '/login')
  }

  const handleMyTasksClick = () => {
    navigate('/my-tasks', { state: { fromMyTasks: true } })
  }

  return (
    <div>
      <CDropdown variant="nav-item d-flex align-items-center border-0">
        <span className="fw-medium d-none d-md-inline">{userData.name}</span>

        <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>

        <CDropdownMenu className="pt-0" placement="bottom-end" style={{ zIndex: 9999 }}>
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
    </div>
  )
}

export default AppHeaderDropdown

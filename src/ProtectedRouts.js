/* eslint-disable prettier/prettier */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ProtectedRoutes = ({ children }) => {
  const navigate = useNavigate()
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
    }
  }, [token, navigate])

  return token ? children : null
}
export default ProtectedRoutes

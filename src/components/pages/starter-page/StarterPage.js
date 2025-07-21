/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from 'reactstrap'
import axios from 'axios'
import './starter-page.scss'
import { ModalMaker } from '../../ui'
import { useAuth } from '../../../context/AuthContext'
import { BASE_URL } from '../../../api/base'

const StarterPage = () => {
  const navigate = useNavigate()
  const [emailModal, setEmailModal] = useState(false)
  const [toggleInputs, setToggleInputs] = useState(true)
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [uuid, setUuid] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { loginAsEmployee } = useAuth()

  // Configure axios to use the token from localStorage for all requests
  axios.interceptors.request.use(
    (config) => {
      const authData = localStorage.getItem('authData')
      if (authData) {
        const { token } = JSON.parse(authData)
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  const sendOtpEmail = async (email) => {
    if (!email || email.trim() === '') {
      setError('Please enter your email.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await axios.post(
        `${BASE_URL}/QRLogin/qr/send-otp-email`,
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      )

      if (response.data.message === 'OTP sent successfully') {
        setUuid(response.data.uid)
        setToggleInputs(false)
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      console.error('❌ OTP sending error:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'this email does not exist')
    } finally {
      setIsLoading(false)
    }
  }

  // In your verifyUuid function in StarterPage.js
  // In your verifyUuid function in StarterPage.js
  // In your verifyUuid function in StarterPage.js
  const verifyUuid = async () => {
    if (!otp || otp.trim() === '') {
      setError('Please enter the OTP.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await axios.post(
        `${BASE_URL}/QRLogin/qr/verify-otp`,
        { uid: uuid, otp },
        { headers: { 'Content-Type': 'application/json' } },
      )

      if (response.data.token || response.data.success === true) {
        const authData = {
          token: response.data.token,
          role: 'employee',
          user: {
            name: response.data.user?.name || email.split('@')[0], // Falls back to email prefix if no name
            email: email,
          },
        }

        // Save to localStorage as authData (consistent with your AuthContext)
        localStorage.setItem('authData', JSON.stringify(authData))

        // Save to sessionStorage as authToken (consistent with your AuthContext)
        sessionStorage.setItem('authToken', response.data.token)

        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

        // **IMPORTANT: Call loginAsEmployee from your auth context**
        loginAsEmployee(response.data.token, {
          name: response.data.user?.name || email.split('@')[0],
          email: email,
        })

        // Navigate to tasks
        navigate('/tasks')
      } else {
        setError(
          response.data.message || 'Verification failed. Please check the OTP and try again.',
        )
      }
    } catch (err) {
      console.error('❌ Verification error:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Error verifying OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitEmail = async (e) => {
    e.preventDefault()
    await sendOtpEmail(email)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    verifyUuid()
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 starter-page gap-3">
      <div>
        <h2 className="fw-medium mb-4">SELECT YOUR TYPE</h2>
        <div className="d-flex gap-4">
          <Card
            className="p-4 rounded-4 cursor-pointer d-flex flex-column align-items-center justify-content-center bg-white border-0"
            onClick={() => setEmailModal(true)}
            // onClick={() => navigate('/tasks')}
          >
            <img src="./assets/images/employees.svg" className="employees-img" alt="employees" />
            <img
              src="./assets/images/employees-h.svg"
              className="employees-img-h"
              alt="employees"
            />
            <h3>Employee</h3>
          </Card>
          <Card
            className="p-4 rounded-4 cursor-pointer d-flex flex-column align-items-center justify-content-center bg-white border-0"
            onClick={() => navigate('/login')}
          >
            <img src="./assets/images/hr.svg" alt="hr" className="employees-img" />
            <img src="./assets/images/hr-h.svg" alt="hr" className="employees-img-h" />
            <h3>human resources</h3>
          </Card>
        </div>
      </div>

      {/* Email and OTP Modal */}
      <ModalMaker modal={emailModal} toggle={() => setEmailModal(false)} size="md">
        {toggleInputs ? (
          <form onSubmit={handleSubmitEmail}>
            <input
              className="form-control"
              type="email"
              placeholder="Enter Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <div className="text-danger mt-2">{error}</div>}
            <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <p className="mb-2">
              ✅ We've sent an OTP code to your email. <strong>Enter it below</strong>
            </p>
            <input
              className="form-control"
              type="text"
              placeholder="Enter Your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error && <div className="text-danger mt-2">{error}</div>}
            <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </ModalMaker>
    </div>
  )
}

export default StarterPage

/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { QRCodeSVG } from 'qrcode.react'
import axios from 'axios'
import './starter-page.scss'
import { ModalMaker } from '../../ui'
import { useAuth } from '../../../context/AuthContext'

const StarterPage = () => {
  const navigate = useNavigate()
  const [qrModal, setQrModal] = useState(false)
  const [qrUid, setQrUid] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { loginAsEmployee } = useAuth()

  const handleEmployeeClick = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.post('http://attendance-service.5d-dev.com/api/QRLogin/qr/start')
      setQrUid(response.data.uid)
      setIsLoading(false)
      setQrModal(true)

      setTimeout(() => {
        if (qrModal) {
          setQrModal(false)
          setOtpModal(true)
        }
      }, 30000)
    } catch (err) {
      console.error('Error generating QR code:', err)
      setError('Failed to generate QR code. Please try again.')
      setIsLoading(false)
    }
  }
  const verifyUuid = async (uuid) => {
    if (!otp || otp.trim() === '') {
      setError('Please enter the OTP.')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await axios.post(
        'http://attendance-service.5d-dev.com/api/QRLogin/qr/verify-otp',
        { uid: uuid, otp },
        { headers: { 'Content-Type': 'application/json' } },
      )

      console.log('✅ Verification response:', response.data)

      // Assuming response includes a token or useful data
      if (response.data.token || response.data.success === true) {
        localStorage.setItem(
          'authData',
          JSON.stringify({
            token: response.data.token || 'default-employee-token',
            role: 'employee',
          }),
        )

        loginAsEmployee(response.data.token || 'default-employee-token')
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

  // Fix the timeout issue:
  useEffect(() => {
    let timer
    if (qrModal) {
      timer = setTimeout(() => {
        setQrModal(false)
        setError('QR code expired. Please generate a new one.')
      }, 30000)
    }
    return () => clearTimeout(timer)
  }, [qrModal])

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 starter-page gap-3">
      <div>
        <h2 className="fw-medium mb-4">SELECT YOUR TYPE</h2>
        <div className="d-flex gap-4">
          <Card
            className="p-4 rounded-4 cursor-pointer d-flex flex-column align-items-center justify-content-center bg-white border-0"
            // onClick={handleEmployeeClick}
            onClick={() => navigate('/tasks')}
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

      {/* QR Code Modal */}
      <ModalMaker modal={qrModal} toggle={() => setQrModal(false)} size="md">
        {qrUid && (
          <div className="d-flex flex-column align-items-center">
            <QRCodeSVG value={qrUid} size={200} level="H" includeMargin={true} />
            <Input
              type="text"
              placeholder="Enter OTP received on your device"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value)
                setError('')
              }}
            />
            {error && <p className="text-danger mt-2 me-auto text-start">{error}</p>}

            <Button
              className="mt-3"
              color="primary"
              onClick={() => verifyUuid(qrUid)} // FIXED
              block
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <p className="mt-3">Scan this QR code with your mobile app</p>
            <p className="text-muted small">The app will send the UUID back to our server</p>
            <p className="text-muted small">We'll then generate an OTP for verification</p>
          </div>
        )}
      </ModalMaker>
    </div>
  )
}

export default StarterPage

/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { QRCodeSVG } from 'qrcode.react'
import axios from 'axios'
import './starter-page.scss'
import { ModalMaker } from '../../ui'

const StarterPage = () => {
  const navigate = useNavigate()
  const [qrModal, setQrModal] = useState(false)
  const [qrUid, setQrUid] = useState('')
  const [otp, setOtp] = useState('')
  const [otpModal, setOtpModal] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pollingInterval, setPollingInterval] = useState(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [pollingInterval])

  const handleEmployeeClick = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.post('http://attendance-service.5d-dev.com/api/QRLogin/qr/start')
      setQrUid(response.data.uid)
      setIsLoading(false)
      setQrModal(true)

      // Start polling for device linking
      const interval = setInterval(async () => {
        try {
          const res = await axios.post(
            'http://attendance-service.5d-dev.com/api/QRLogin/qr/link-device',
            { uid: response.data.uid },
          )

          // Modified this part to handle UUID response
          if (res.data.uid) {
            clearInterval(interval)
            await verifyUuid(res.data.uid)
          }
        } catch (err) {
          console.error('Error checking device link:', err)
        }
      }, 2000)

      setPollingInterval(interval)

      setTimeout(() => {
        clearInterval(interval)
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
    setIsLoading(true)
    try {
      const response = await axios.post(
        'http://attendance-service.5d-dev.com/api/QRLogin/qr/verify-otp',
        { uuid: uuid },
      )

      if (response.data.success) {
        navigate('/tasks')
      } else {
        setError(response.data.message || 'Verification failed. Please try again.')
      }
    } catch (err) {
      console.error('Error verifying UUID:', err)
      setError(err.response?.data?.message || 'Error verifying UUID. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 starter-page gap-3">
      <div>
        <h2 className="fw-medium mb-4">SELECT YOUR TYPE</h2>
        <div className="d-flex gap-4">
          <Card
            className="p-4 rounded-4 cursor-pointer d-flex flex-column align-items-center justify-content-center bg-white border-0"
            onClick={handleEmployeeClick}
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
              onClick={verifyUuid}
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

/* eslint-disable prettier/prettier */
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  Input,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
import { Loader, ModalMaker } from '../../../ui'
import check from '/assets/images/check.png'
import './ClientContent.scss'
import { Pen, X, ChevronDown } from 'lucide-react'
import { BASE_URL } from '../../../../api/base'

const ClientsContent = () => {
  const [addClientModal, setAddClientModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalMessage, setModalMessage] = useState(null)
  const [modalMessageVisible, setModalMessageVisible] = useState(false)
  const [clients, setClients] = useState([])
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editClientId, setEditClientId] = useState(null)
  const [isHR, setIsHR] = useState(false)

  // New states for badge dropdown and status change confirmation
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [confirmStatusModal, setConfirmStatusModal] = useState(false)
  const [clientToChangeStatus, setClientToChangeStatus] = useState(null)
  const [newStatusToSet, setNewStatusToSet] = useState(null)

  // Get auth data from localStorage
  const authData = JSON.parse(localStorage.getItem('authData'))
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

  const [clientData, setClientData] = useState({
    name: '',
    code: '',
    isActive: true,
  })

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(window.atob(base64))
    } catch (e) {
      return null
    }
  }

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true
    try {
      const decoded = parseJwt(token)
      const currentTime = Date.now() / 1000
      return decoded.exp < currentTime
    } catch (e) {
      return true
    }
  }

  // Get request headers with auth
  const getAuthHeaders = () => {
    if (!authToken || isTokenExpired(authToken)) {
      console.warn('Auth token is missing or expired')
      setModalMessage('Authentication expired. Please login again.')
      setModalMessageVisible(true)
      return null
    }

    return {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    }
  }

  // Fetch all clients
  const fetchClients = async () => {
    try {
      const headers = getAuthHeaders()
      if (!headers) return

      const response = await axios.get(`${BASE_URL}/Clients/GetAllClients`, {
        headers,
      })
      setClients(response.data)
    } catch (error) {
      console.error('Error fetching clients:', error)
      if (error.response?.status === 401) {
        setModalMessage('Authentication failed. Please login again.')
      } else {
        setModalMessage(
          'Error fetching clients: ' + (error.response?.data?.message || error.message),
        )
      }
      setModalMessageVisible(true)
    }
  }

  useEffect(() => {
    const fetchUserDataAndClients = async () => {
      try {
        setIsLoading(true)
        // Extract employeeId from token
        const tokenData = parseJwt(authToken)
        const employeeId = tokenData?.id
        console.log('Extracted employeeId:', employeeId)

        // First fetch user data to check HR status
        if (employeeId) {
          const userResponse = await axios.get(
            `${BASE_URL}/Employee/GetEmployeeWithId?id=${employeeId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
          )
          console.log('Employee data:', userResponse.data)
          setIsHR(userResponse.data?.department?.toLowerCase() === 'hr')
        }

        // Fetch clients
        await fetchClients()
      } catch (error) {
        console.error('Error fetching data:', error)
        setModalMessage('Error loading data: ' + (error.response?.data?.message || error.message))
        setModalMessageVisible(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDataAndClients()
  }, [authToken])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.badge-dropdown-container')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggle = () => {
    setAddClientModal(!addClientModal)
    if (!addClientModal) {
      setIsEditing(false)
      setEditClientId(null)
      setClientData({ name: '', code: '', isActive: true })
    }
  }

  const handleClientDataChange = (e) => {
    const { name, value } = e.target
    setClientData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      if (isEditing) {
        // Handle edit case - use the correct update endpoint structure
        const payload = {
          id: editClientId,
          name: clientData.name,
          clientCode: parseInt(clientData.code), // Ensure clientCode is number
          isActive: clientData.isActive,
        }

        console.log('Update payload:', payload)

        await axios.post(`${BASE_URL}/Clients/UpdateClient/${editClientId}`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        setModalMessage('Client updated successfully')
      } else {
        // Handle create case
        const payload = {
          name: clientData.name,
          clientCode: parseInt(clientData.code), // Ensure clientCode is number
          isActive: clientData.isActive,
        }

        console.log('Create payload:', payload)

        await axios.post(`${BASE_URL}/Clients/CreateClient`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        setModalMessage('Client added successfully')
      }

      // Refresh the clients list
      await fetchClients()

      // Reset form and close modal
      setAddClientModal(false)
      setClientData({ name: '', code: '', isActive: true })
      setIsEditing(false)
      setEditClientId(null)
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message)

      let errorMessage = isEditing ? 'Error updating client: ' : 'Error adding client: '

      if (error.response?.data?.errors) {
        // Handle validation errors
        errorMessage += Object.values(error.response.data.errors).flat().join(', ')
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message
      } else if (error.response?.data) {
        errorMessage += JSON.stringify(error.response.data)
      } else {
        errorMessage += error.message
      }

      setModalMessage(errorMessage)
    } finally {
      setIsLoading(false)
      setModalMessageVisible(true)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      setIsLoading(true)

      // Debug logs
      console.log('Auth token:', authToken ? 'Present' : 'Missing')
      console.log('Delete URL:', `${BASE_URL}/Clients/DeleteClient/${clientToDelete.id}`)
      console.log('Client to delete:', clientToDelete)

      // Make the delete request with proper headers
      const response = await axios.post(
        `${BASE_URL}/Clients/DeleteClient/${clientToDelete.id}`,
        {}, // empty body if needed
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      setModalMessage('Client deleted successfully')
      await fetchClients()
    } catch (error) {
      console.error('Delete error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url,
        method: error.config?.method,
      })

      let errorMessage = 'Error deleting client: '
      if (error.response?.status === 401) {
        errorMessage += 'Unauthorized - Please check your permissions or login again'
      } else {
        errorMessage += error.response?.data?.message || error.message
      }

      setModalMessage(errorMessage)
    } finally {
      setIsLoading(false)
      setConfirmDeleteModal(false)
      setClientToDelete(null)
      setModalMessageVisible(true)
    }
  }

  const confirmDelete = (client) => {
    setClientToDelete(client)
    setConfirmDeleteModal(true)
  }

  const handleEditClient = (client) => {
    console.log('Editing client:', client)
    setClientData({
      name: client.name,
      code: client.clientCode.toString(),
      isActive: client.isActive,
    })
    setEditClientId(client.id)
    setIsEditing(true)
    setAddClientModal(true)
  }

  // Handle badge dropdown toggle
  const toggleBadgeDropdown = (clientId, event) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveDropdown(activeDropdown === clientId ? null : clientId)
  }

  // Handle status change request
  const handleStatusChangeRequest = (client, newStatus) => {
    setClientToChangeStatus(client)
    setNewStatusToSet(newStatus)
    setConfirmStatusModal(true)
    setActiveDropdown(null) // Close dropdown
  }

  // Confirm and execute status change
  const confirmStatusChange = async () => {
    if (!clientToChangeStatus) return

    try {
      setIsLoading(true)

      await axios.post(
        `${BASE_URL}/Clients/UpdateClientWithFlagActive/${clientToChangeStatus.id}`,
        {
          id: clientToChangeStatus.id,
          name: clientToChangeStatus.name,
          clientCode: clientToChangeStatus.clientCode,
          isActive: newStatusToSet,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      setModalMessage(`Client ${newStatusToSet ? 'activated' : 'deactivated'} successfully`)

      // Refresh the clients list
      await fetchClients()
    } catch (error) {
      console.error('Toggle active status error:', error)
      setModalMessage(
        'Error updating client status: ' + (error.response?.data?.message || error.message),
      )
    } finally {
      setIsLoading(false)
      setConfirmStatusModal(false)
      setClientToChangeStatus(null)
      setNewStatusToSet(null)
      setModalMessageVisible(true)
    }
  }

  return (
    <div className="client-content">
      {/* Only show Add Client button for HR users */}
      {isHR && (
        <div className="d-flex justify-content-end my-3">
          <Button color="primary" onClick={toggle} className="px-3 py-2">
            Add Client
          </Button>
        </div>
      )}

      <ModalMaker modal={addClientModal} toggle={toggle} centered size={'md'}>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="Enter Client Name"
                value={clientData.name}
                onChange={handleClientDataChange}
                required
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Input
                type="number"
                id="code"
                name="code"
                placeholder="Enter Client Code"
                value={clientData.code}
                onChange={handleClientDataChange}
                required
              />
            </Col>
          </Row>

          <Button
            color="primary"
            type="submit"
            className="px-3 w-100 py-2 mt-2"
            disabled={isLoading}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </Form>
      </ModalMaker>

      {modalMessageVisible && (
        <ModalMaker
          size="md"
          modal={modalMessageVisible}
          toggle={() => setModalMessageVisible(false)}
          centered
        >
          <div className="d-flex flex-column justify-content-center align-items-center gap-3">
            <img src={check} width={70} height={70} alt="success" />
            <h1 className="font-bold">{modalMessage}</h1>
          </div>
        </ModalMaker>
      )}

      {isLoading && (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Loader />
        </div>
      )}

      <Row>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center mt-5">
            <Loader />
          </div>
        ) : clients.length === 0 ? (
          <Col md={12} className="d-flex justify-content-center align-items-center mt-5">
            <h4>No clients found</h4>
          </Col>
        ) : (
          clients.map((client) => (
            <Col md={6} key={client.id} className="mb-2">
              <Alert color="secondary" className="border-0 mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <span>
                      {client.name} - {client.clientCode}
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      {/* Badge with dropdown for HR users */}
                      {isHR ? (
                        <div className="badge-dropdown-container position-relative">
                          <Badge
                            color={client.isActive ? 'success' : 'danger'}
                            className="ms-2 cursor-pointer d-flex align-items-center gap-1"
                            pill
                            onClick={(e) => toggleBadgeDropdown(client.id, e)}
                            style={{ cursor: 'pointer' }}
                            title="Click to change status"
                          >
                            {client.isActive ? 'Active' : 'Not Active'}
                            <ChevronDown size={12} />
                          </Badge>

                          {/* Dropdown Menu */}
                          {activeDropdown === client.id && (
                            <div
                              className="position-absolute bg-white border rounded shadow-sm"
                              style={{
                                top: '100%',
                                right: '0',
                                minWidth: '120px',
                                zIndex: 1050,
                                marginTop: '2px',
                              }}
                            >
                              <div
                                className="dropdown-item px-3 py-2"
                                style={{ cursor: 'pointer', fontSize: '0.875rem' }}
                                onClick={() => handleStatusChangeRequest(client, true)}
                              >
                                <span className="text-success">● Active</span>
                              </div>
                              <div
                                className="dropdown-item px-3 py-2"
                                style={{ cursor: 'pointer', fontSize: '0.875rem' }}
                                onClick={() => handleStatusChangeRequest(client, false)}
                              >
                                <span className="text-danger">● Not Active</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Regular badge for non-HR users
                        <Badge color={client.isActive ? 'success' : 'danger'} className="ms-2" pill>
                          {client.isActive ? 'Active' : 'Not Active'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Only show edit/delete controls for HR users */}
                  {isHR && (
                    <div className="d-flex gap-2">
                      <Pen
                        className="pointer mx-2"
                        size={16}
                        onClick={() => handleEditClient(client)}
                        title="Edit client"
                      />
                    </div>
                  )}
                </div>
              </Alert>
            </Col>
          ))
        )}
      </Row>

      {/* Status Change Confirmation Modal */}
      {confirmStatusModal && (
        <ModalMaker
          size="md"
          modal={confirmStatusModal}
          toggle={() => setConfirmStatusModal(false)}
          centered
        >
          <div className="d-flex flex-column justify-content-center align-items-center gap-3">
            <h4 className="text-center">
              Are you sure you want to change the status of{' '}
              <strong>{clientToChangeStatus?.name}</strong> to{' '}
              <span className={newStatusToSet ? 'text-success' : 'text-danger'}>
                {newStatusToSet ? 'Active' : 'Not Active'}
              </span>
              ?
            </h4>
            <div className="d-flex gap-3 mt-4">
              <Button color="primary" onClick={confirmStatusChange} disabled={isLoading}>
                Yes, Change Status
              </Button>
              <Button
                color="secondary"
                onClick={() => {
                  setConfirmStatusModal(false)
                  setClientToChangeStatus(null)
                  setNewStatusToSet(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </ModalMaker>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteModal && (
        <ModalMaker
          size="md"
          modal={confirmDeleteModal}
          toggle={() => setConfirmDeleteModal(false)}
          centered
        >
          <div className="d-flex flex-column justify-content-center align-items-center gap-3">
            <h4>
              Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
            </h4>
            <div className="d-flex gap-3 mt-4">
              <Button color="danger" onClick={handleDeleteClient} disabled={isLoading}>
                Yes, Delete
              </Button>
              <Button color="secondary" onClick={() => setConfirmDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </ModalMaker>
      )}
    </div>
  )
}

export default ClientsContent

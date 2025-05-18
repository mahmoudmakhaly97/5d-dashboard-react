/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef } from 'react'
import { Dashboard } from 'react-employee-calendar'
import 'react-employee-calendar/dist/index.css'
import { Button, Col, Input, Row, Form, FormGroup, Label } from 'reactstrap'
import { ModalMaker } from '../../../ui'
import { format } from 'date-fns'
import { Tooltip } from 'reactstrap'

import check from '/assets/images/check.png'
import './Tasks.scss'
import { useLocation, useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
// Modify your initial state to use location state

const TasksContent = () => {
  const [modal, setModal] = useState(false)
  const [clients, setClients] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [taskCreated, setTaskCreated] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [tooltipMessage, setTooltipMessage] = useState('')
  const [deleteModal, setDeleteModal] = useState(false) // State for delete confirmation modal
  const [editModal, setEditModal] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  const authTasks = JSON.parse(localStorage.getItem('authData'))
  const Navigate = useNavigate()
  const location = useLocation()
  const [selectedEmployee, setSelectedEmployee] = useState(
    location.state?.employeeId
      ? {
          id: location.state.employeeId,
          name: location.state.employeeName,
        }
      : null,
  )
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedToEmployeeId: 0,
    assignedToEmployeeName: '',
    createdByEmployeeId: 0,
    createdByEmployeeName: '',
    updatedByEmployeeId: 0,
    departmentId: 0,
    departmentName: '',
    slotCount: 1,
    clientId: '',
    startTime: '',
    endTime: '',
    createdAt: new Date().toISOString(),
  })
  const [modalMessage, setModalMessage] = useState(null)
  const [modalMessageVisible, setModalMessageVisible] = useState(false)
  const dashboardRef = useRef()
  const [taskToDelete, setTaskToDelete] = useState(null) // Task to be deleted

  const toggle = () => setModal(!modal)
  const toggleDeleteModal = () => setDeleteModal(!deleteModal)

  const fetchData = async () => {
    try {
      // Fetch clients
      const clientsResponse = await fetch(
        'http://attendance-service.5d-dev.com/api/Clients/GetAllClients',
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMzMiIsInN1YiI6IjMzMiIsImVtYWlsIjoibWFobW91ZDEyM0BnbWFpbC5jb20iLCJqdGkiOiI3OWNkODZjMi05NzE3LTQxYjEtYjIzNC0zMTNlYzhhODk3YjkiLCJleHAiOjE3NDgwMTAzMzMsImlzcyI6IkF0dGVuZGFuY2VBcHAiLCJhdWQiOiJBdHRlbmRhbmNlQXBpVXNlciJ9.D3hgfDm6yKhc-Po86DO5PYxf20DLUawdz2blgtjT8h8`,
          },
        },
      )
      const clientsData = await clientsResponse.json()
      setClients(clientsData)

      // Fetch departments
      const departmentsResponse = await fetch(
        'http://attendance-service.5d-dev.com/api/Employee/GetDepartments',
      )
      const departmentsData = await departmentsResponse.json()
      setDepartments(departmentsData)

      // Fetch all employees without pagination
      const employeesResponse = await fetch(
        'http://attendance-service.5d-dev.com/api/Employee/GetAllEmployees?pageNumber=1&pageSize=1000',
      )
      const employeesData = await employeesResponse.json()
      setEmployees(employeesData.employees)
      setFilteredEmployees(employeesData.employees)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(
        `http://attendance-service.5d-dev.com/api/Tasks/DeleteTask/${taskToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMzMiIsInN1YiI6IjMzMiIsImVtYWlsIjoibWFobW91ZDEyM0BnbWFpbC5jb20iLCJqdGkiOiI3OWNkODZjMi05NzE3LTQxYjEtYjIzNC0zMTNlYzhhODk3YjkiLCJleHAiOjE3NDgwMTAzMzMsImlzcyI6IkF0dGVuZGFuY2VBcHAiLCJhdWQiOiJBdHRlbmRhbmNlQXBpVXNlciJ9.D3hgfDm6yKhc-Po86DO5PYxf20DLUawdz2blgtjT8h8`,
          },
        },
        {
          method: 'DELETE',
        },
      )

      if (response.ok) {
        setModalMessage('Task deleted successfully')
        setModalMessageVisible(true)
        setTaskToDelete(null)
        toggleDeleteModal()
        setRefreshKey((prev) => prev + 1) // This will force a re-render

        // Refresh the dashboard
        if (dashboardRef.current) {
          dashboardRef.current.refresh()
        }

        // Refresh data
        await fetchData()
      } else {
        const errorData = await response.json()
        setModalMessage(`Error deleting task: ${errorData.message || 'Unknown error'}`)
        setModalMessageVisible(true)
      }
    } catch (error) {
      setModalMessage('Error deleting task. Please try again.')
      setModalMessageVisible(true)
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Fetches all the data needed for the task creation form. This includes all
     * clients, departments, and employees. The data is fetched from the tasks and
     * attendance services.
     *
     * @returns {Promise<void>}
     */
    /*******  f68bb810-6e8d-451e-a13b-eea84224ecc2  *******/

    fetchData()
  }, [])
  // Add this useEffect to listen for selection changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (dashboardRef.current) {
        const currentEmployee = dashboardRef.current.getSelectedEmployee?.()
        const currentDate = dashboardRef.current.getSelectedDate?.()

        if (currentEmployee && currentEmployee.id !== selectedEmployee?.id) {
          setSelectedEmployee(currentEmployee)
        }

        if (currentDate && currentDate !== selectedDate) {
          setSelectedDate(currentDate)
        }
      }
    }, 500) // Check every 500ms for changes

    return () => clearInterval(interval)
  }, [selectedEmployee, selectedDate])
  const handleInputChange = (e) => {
    const { name, value } = e.target
    // For client selection
    if (name === 'clientId') {
      setFormData((prev) => ({
        ...prev,
        clientId: value,
      }))
      return
    } else if (name === 'departmentId') {
      const selectedDept = departments.find((dept) => dept.id === Number(value))
      const filtered = selectedDept
        ? employees.filter((emp) => emp.department === selectedDept.name)
        : employees

      setFilteredEmployees(filtered)

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        departmentName: selectedDept ? selectedDept.name : '',
        assignedToEmployeeId: 0,
        assignedToEmployeeName: '',
      }))
    } else if (name === 'assignedToEmployeeId') {
      const selectedEmployee = employees.find((emp) => emp.id === Number(value))
      setFormData((prev) => ({
        ...prev,
        assignedToEmployeeId: value,
        assignedToEmployeeName: selectedEmployee ? selectedEmployee.name : '',
      }))
    } else if (name === 'createdByEmployeeId') {
      const selectedEmployee = employees.find((emp) => emp.id === Number(value))
      setFormData((prev) => ({
        ...prev,
        createdByEmployeeId: value,
        createdByEmployeeName: selectedEmployee ? selectedEmployee.name : '',
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }
  useEffect(() => {
    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        assignedToEmployeeId: Number(selectedEmployee.id),
        assignedToEmployeeName: selectedEmployee.name,
        departmentId: selectedEmployee.departmentId || 0,
        departmentName: selectedEmployee.department || '',
        startTime: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '',
      }))
    }
  }, [selectedEmployee, selectedDate])

  // Replace the polling with a more efficient approach
  // Replace your current useEffect with this more efficient version:
  useEffect(() => {
    const handleSelectionChange = () => {
      if (dashboardRef.current) {
        const currentEmployee = dashboardRef.current.getSelectedEmployee?.()
        const currentDate = dashboardRef.current.getSelectedDate?.()

        if (currentEmployee && currentEmployee.id) {
          setSelectedEmployee(currentEmployee) // Always set - force re-render
        }

        if (currentDate) {
          setSelectedDate(currentDate)
        }
      }
    }

    // Add event listeners if your Dashboard component emits events
    // Or use a more immediate polling mechanism
    const interval = setInterval(handleSelectionChange, 100) // Faster polling

    return () => clearInterval(interval)
  }, [selectedEmployee, selectedDate])
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const getValidISODate = (timeStr, date = selectedDate) => {
        if (!timeStr || !date) return null
        const datePart = format(new Date(date), 'yyyy-MM-dd')
        const dateTimeString = `${datePart}T${timeStr}`
        const parsed = new Date(dateTimeString + 'Z')
        return isNaN(parsed) ? null : parsed.toISOString()
      }

      const apiData = {
        id: 0,
        title: formData.title,
        description: formData.description,
        assignedToEmployeeId: Number(formData.assignedToEmployeeId || selectedEmployee?.id),
        createdByEmployeeId: Number(formData.createdByEmployeeId),
        updatedByEmployeeId: Number(formData.updatedByEmployeeId || formData.createdByEmployeeId),
        departmentId: Number(formData.departmentId || selectedEmployee?.departmentId || 0),
        slotCount: Number(formData.slotCount),
        startTime: getValidISODate(formData.startTime),
        endTime: getValidISODate(formData.endTime),
        createdAt: new Date().toISOString(),
      }
      console.log('Submitting task with data:', apiData)

      const response = await fetch('http://attendance-service.5d-dev.com/api/Tasks/CreateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMzMiIsInN1YiI6IjMzMiIsImVtYWlsIjoibWFobW91ZDEyM0BnbWFpbC5jb20iLCJqdGkiOiI3OWNkODZjMi05NzE3LTQxYjEtYjIzNC0zMTNlYzhhODk3YjkiLCJleHAiOjE3NDgwMTAzMzMsImlzcyI6IkF0dGVuZGFuY2VBcHAiLCJhdWQiOiJBdHRlbmRhbmNlQXBpVXNlciJ9.D3hgfDm6yKhc-Po86DO5PYxf20DLUawdz2blgtjT8h8`,
        },
        body: JSON.stringify(apiData),
      })

      const responseData = await response.json() // Always parse the response

      if (!response.ok) {
        // Try to read as text first
        const errorText = await response.text()

        // Check if it's the time slot conflict message
        if (errorText.includes('Time slot conflict') || errorText.includes('overlaps')) {
          setTooltipMessage(
            'Oops! This time slot overlaps with an existing task. Please choose a different time.',
          )
          setTooltipOpen(true)
          setTimeout(() => setTooltipOpen(false), 4000)
          return
        }

        // If not the expected message, show generic error
        setModalMessage(`Error creating task: ${errorText || 'Unknown error'}`)
        setModalMessageVisible(true)
        return
      }

      // Success case
      setModalMessage('Task created successfully')
      setModalMessageVisible(true)
      toggle()
      setTaskCreated(true)
      window.location.reload()

      if (dashboardRef.current) {
        dashboardRef.current.refresh()
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        assignedToEmployeeId: 0,
        assignedToEmployeeName: '',
        createdByEmployeeId: 0,
        createdByEmployeeName: '',
        updatedByEmployeeId: 0,
        departmentId: 0,
        departmentName: '',
        slotCount: 1,
        clientId: '',
        startTime: '',
        endTime: '',
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error submitting task:', error)
      setTooltipMessage(
        'Oops! This time slot overlaps with an existing task. Please choose a different time. ',
      )
      setTooltipOpen(true)
      setTimeout(() => setTooltipOpen(false), 4000)
    }
  }

  // Generate slot options (each slot is 20 minutes)
  const slotOptions = Array.from({ length: 24 * 3 }, (_, i) => {
    const totalMinutes = (i + 1) * 20 // Each slot is 20 minutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    // Format display text
    let displayText = ''
    if (hours > 0 && minutes > 0) {
      displayText = `${hours}h ${minutes}m`
    } else if (hours > 0) {
      displayText = `${hours}h`
    } else {
      displayText = `${minutes}m`
    }

    const slotCount = i + 1
    return (
      <option key={slotCount} value={slotCount}>
        {`${slotCount} slot${slotCount > 1 ? 's' : ''} (${displayText})`}
      </option>
    )
  })

  useEffect(() => {
    if (selectedDate) {
      console.log('Selected date:', selectedDate)
    }
  }, [selectedDate])
  useEffect(() => {
    if (dashboardRef.current) {
      console.log('Dashboard methods:', dashboardRef.current)
    }
  }, [])
  useEffect(() => {
    if (taskCreated) {
      fetchData() // Re-fetch the data after task creation
      setTaskCreated(false) // Reset the flag after fetching data
    }
  }, [taskCreated])
  const handleEditTask = async (taskId) => {
    try {
      setModalMessage('Loading task details...')
      setModalMessageVisible(true)

      const response = await fetch(
        `http://attendance-service.5d-dev.com/api/Tasks/GetTaskById/${taskId}`,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMzMiIsInN1YiI6IjMzMiIsImVtYWlsIjoibWFobW91ZDEyM0BnbWFpbC5jb20iLCJqdGkiOiI3OWNkODZjMi05NzE3LTQxYjEtYjIzNC0zMTNlYzhhODk3YjkiLCJleHAiOjE3NDgwMTAzMzMsImlzcyI6IkF0dGVuZGFuY2VBcHAiLCJhdWQiOiJBdHRlbmRhbmNlQXBpVXNlciJ9.D3hgfDm6yKhc-Po86DO5PYxf20DLUawdz2blgtjT8h8`,
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to fetch task details (Status: ${response.status})`,
        )
      }

      const taskData = await response.json()

      setModalMessageVisible(false)
      setTaskToEdit(taskData)

      const startTime = taskData.startTime ? format(new Date(taskData.startTime), 'HH:mm') : ''
      const endTime = taskData.endTime ? format(new Date(taskData.endTime), 'HH:mm') : ''

      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        assignedToEmployeeId: taskData.assignedToEmployeeId || 0,
        assignedToEmployeeName: taskData.assignedToEmployeeName || '',
        createdByEmployeeId: taskData.createdByEmployeeId || 0,
        createdByEmployeeName: taskData.createdByEmployeeName || '',
        updatedByEmployeeId: taskData.updatedByEmployeeId || 0,
        departmentId: taskData.departmentId || 0,
        departmentName: taskData.departmentName || '',
        slotCount: taskData.slotCount || 1,
        clientId: taskData.clientId || '', // Make sure this is set from taskData
        startTime: startTime,
        endTime: endTime,
        createdAt: taskData.createdAt || new Date().toISOString(),
      })

      setEditModal(true)
    } catch (error) {
      console.error('Error fetching task details:', error)
      setModalMessage(`Error loading task details: ${error.message}`)
      setModalMessageVisible(true)
      setEditModal(false)
    }
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()

    if (!taskToEdit) return

    try {
      const getValidISODate = (timeStr, date = selectedDate) => {
        if (!timeStr || !date) return null
        const datePart = format(new Date(date), 'yyyy-MM-dd')
        const dateTimeString = `${datePart}T${timeStr}`
        const parsed = new Date(dateTimeString + 'Z')
        return isNaN(parsed) ? null : parsed.toISOString()
      }

      const apiData = {
        id: taskToEdit.id,
        title: formData.title,
        description: formData.description,
        assignedToEmployeeId: Number(formData.assignedToEmployeeId || selectedEmployee?.id),
        createdByEmployeeId: Number(formData.createdByEmployeeId),
        updatedByEmployeeId: Number(formData.updatedByEmployeeId || formData.createdByEmployeeId),
        departmentId: Number(formData.departmentId || selectedEmployee?.departmentId || 0),
        slotCount: Number(formData.slotCount),
        clientId: formData.clientId, // Make sure this is included
        startTime: getValidISODate(formData.startTime),
        endTime: getValidISODate(formData.endTime),
        createdAt: formData.createdAt,
      }

      const response = await fetch('http://attendance-service.5d-dev.com/api/Tasks/UpdateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMzMiIsInN1YiI6IjMzMiIsImVtYWlsIjoibWFobW91ZDEyM0BnbWFpbC5jb20iLCJqdGkiOiI3OWNkODZjMi05NzE3LTQxYjEtYjIzNC0zMTNlYzhhODk3YjkiLCJleHAiOjE3NDgwMTAzMzMsImlzcyI6IkF0dGVuZGFuY2VBcHAiLCJhdWQiOiJBdHRlbmRhbmNlQXBpVXNlciJ9.D3hgfDm6yKhc-Po86DO5PYxf20DLUawdz2blgtjT8h8`,
        },
        body: JSON.stringify(apiData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (
          responseData.message?.includes('Time slot conflict') ||
          responseData.error?.includes('Time slot conflict') ||
          responseData.message?.includes('overlaps') ||
          responseData.error?.includes('overlaps')
        ) {
          setTooltipMessage(
            'Oops! This time slot overlaps with an existing task. Please choose a different time.',
          )
          setTooltipOpen(true)
          setTimeout(() => setTooltipOpen(false), 4000)
        } else {
          console.error('Unhandled task update error:', responseData)
          setModalMessage('Error updating task. Please try again.')
          setModalMessageVisible(true)
        }
        return
      }

      // Success case
      window.location.reload()
      setModalMessage('Task updated successfully')
      setModalMessageVisible(true)
      setEditModal(false)
      setTaskToEdit(null)

      if (dashboardRef.current) {
        dashboardRef.current.refresh()
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        assignedToEmployeeId: 0,
        assignedToEmployeeName: '',
        createdByEmployeeId: 0,
        createdByEmployeeName: '',
        updatedByEmployeeId: 0,
        departmentId: 0,
        departmentName: '',
        slotCount: 1,
        clientId: '',
        startTime: '',
        endTime: '',
        createdAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error updating task:', error)
      setTooltipMessage('Oops! Something went wrong while updating the task. Please try again.')
      setTooltipOpen(true)
      setTimeout(() => setTooltipOpen(false), 4000)
    }
  }
  // if (!selectedEmployee && !location.state?.employeeId) {
  //   return (
  //     <div className="alert alert-danger">
  //       No employee selected. Please scan the QR code again.
  //       <Button onClick={() => navigate('/')}>Go Back</Button>
  //     </div>
  //   )
  // }
  return (
    <div className="tasks-container">
      {/* Button should only appear when an employee is selected */}
      {selectedEmployee?.id && selectedEmployee?.name && (
        <div className="d-flex justify-content-end align-items-center mb-4 pe-5">
          <Button color="primary" onClick={toggle} className="add-task">
            Add Task for {selectedEmployee.name}
          </Button>
        </div>
      )}
      <ModalMaker modal={modal} toggle={toggle} centered size={'lg'}>
        <Row>
          <Col md={12}>
            <h1 className="my-4">Create New Task</h1>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="title">Title</Label>
                    <Input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="clientId">Client</Label>
                    <Input
                      type="select"
                      id="clientId"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option
                          key={client.id}
                          value={client.id}
                          selected={client.id === formData.clientId} // Ensure selected client is highlighted
                        >
                          {client.name} (Code: {client.clientCode})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row className="my-3">
                <Col>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="startTime">Start Time</Label>
                    <Input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="slotCount">Duration</Label>
                    <Input
                      type="number"
                      id="slotCount"
                      name="slotCount"
                      min="1"
                      value={formData.slotCount}
                      onChange={handleInputChange}
                      required
                    />
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen}
                      target="slotCount"
                      popperClassName="tooltip-style"
                    >
                      <p className="text-danger fw-bold">{tooltipMessage}</p>
                    </Tooltip>
                    <small className="text-muted">
                      Total time:{' '}
                      {formData.slotCount * 20 >= 60
                        ? `${Math.floor((formData.slotCount * 20) / 60)}h ${
                            (formData.slotCount * 20) % 60
                          }m`
                        : `${formData.slotCount * 20}m`}
                    </small>
                  </FormGroup>
                </Col>

                <Col md={6} className="d-none">
                  <FormGroup>
                    <Label for="endTime">End Time</Label>
                    <Input
                      type="datetime-local"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="d-none">
                  <FormGroup>
                    <Label for="departmentId">Department</Label>
                    <Input
                      type="select"
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row className="my-3 d-none">
                <Col md={6}>
                  <FormGroup>
                    <Label for="assignedToEmployeeId">Assigned To</Label>
                    <Input
                      type="select"
                      id="assignedToEmployeeId"
                      name="assignedToEmployeeId"
                      value={formData.assignedToEmployeeId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select an employee</option>
                      {filteredEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="createdByEmployeeId">Created By</Label>
                    <Input
                      type="select"
                      id="createdByEmployeeId"
                      name="createdByEmployeeId"
                      value={formData.createdByEmployeeId}
                      onChange={handleInputChange}
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.department})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <div>
                <Button
                  id="submitTaskBtn"
                  color="primary"
                  type="submit"
                  className="px-3 w-100 py-2 mt-4"
                >
                  Create Task
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </ModalMaker>

      {/* Success/Error Modal */}
      {modalMessageVisible && (
        <ModalMaker
          size="md"
          modal={modalMessageVisible}
          toggle={() => setModalMessageVisible(false)}
          centered
        >
          <div className="d-flex flex-column justify-content-center align-items-center gap-3 p-4">
            <img src={check} width={70} height={70} alt="success" />
            <h4 className="text-center">{modalMessage}</h4>
            <Button color="primary" onClick={() => setModalMessageVisible(false)}>
              OK{' '}
            </Button>
          </div>
        </ModalMaker>
      )}
      <ModalMaker modal={deleteModal} toggle={toggleDeleteModal} centered size="md">
        <div className="p-4 text-center">
          <h4>Are you sure you want to delete this task?</h4>
          <p className="text-muted mb-4">"{taskToDelete?.title}" will be permanently removed.</p>
          <div className="d-flex justify-content-center gap-3">
            <Button color="secondary" onClick={toggleDeleteModal}>
              Cancel
            </Button>
            <Button color="danger" onClick={handleDeleteTask}>
              Delete Task
            </Button>
          </div>
        </div>
      </ModalMaker>
      {/* Edit Task Modal */}
      <ModalMaker modal={editModal} toggle={() => setEditModal(false)} centered size={'lg'}>
        <Row>
          <Col md={12}>
            <h1 className="my-4">Edit Task</h1>
            <Form onSubmit={handleUpdateTask}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="title">Title</Label>
                    <Input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="clientId">Client</Label>
                    <Input
                      type="select"
                      id="clientId"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} (Code: {client.clientCode})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row className="my-3">
                <Col>
                  <FormGroup>
                    <Label for="description">Description</Label>
                    <Input
                      type="textarea"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="startTime">Start Time</Label>
                    <Input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="slotCount">Duration</Label>
                    <Input
                      type="number"
                      id="slotCount"
                      name="slotCount"
                      min="1"
                      value={formData.slotCount}
                      onChange={handleInputChange}
                      required
                    />
                    <Tooltip
                      placement="top"
                      isOpen={tooltipOpen}
                      target="slotCount"
                      popperClassName="tooltip-style"
                    >
                      <p className="text-danger fw-bold">{tooltipMessage}</p>
                    </Tooltip>
                    <small className="text-muted">
                      Total time:{' '}
                      {formData.slotCount * 20 >= 60
                        ? `${Math.floor((formData.slotCount * 20) / 60)}h ${
                            (formData.slotCount * 20) % 60
                          }m`
                        : `${formData.slotCount * 20}m`}
                    </small>
                  </FormGroup>
                </Col>
              </Row>

              <div>
                <Button
                  id="updateTaskBtn"
                  color="primary"
                  type="submit"
                  className="px-3 w-100 py-2 mt-4"
                >
                  Update Task
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </ModalMaker>
      <div className="dashboard-container">
        <Dashboard ref={dashboardRef} onEditTask={handleEditTask} key={refreshKey} />
      </div>
    </div>
  )
}

export default TasksContent

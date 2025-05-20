/* eslint-disable prettier/prettier */
import { useState, useEffect, useRef } from 'react'
import { Dashboard } from 'react-employee-calendar'
import { UncontrolledTooltip } from 'reactstrap'

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
  const [managerTeam, setManagerTeam] = useState([])
  const [isManager, setIsManager] = useState(false)
  const [isLoadingTeam, setIsLoadingTeam] = useState(false)
  const [teamError, setTeamError] = useState(null)
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
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen)

  useEffect(() => {
    const fetchManagerTeam = async () => {
      setIsLoadingTeam(true)
      setTeamError(null)
      try {
        const response = await fetch(
          'http://attendance-service.5d-dev.com/api/Employee/GetManagerTeam',
          {
            headers: {
              Authorization: `Bearer ${authTasks.token}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        // 4. Handle potential nested data (adjust based on actual response)
        const teamMembers = Array.isArray(data) ? data : data.employees || []
        setManagerTeam(teamMembers)
      } catch (error) {
        console.error('Failed to fetch manager team:', error)
        setTeamError(error.message)
      } finally {
        setIsLoadingTeam(false)
      }
    }

    fetchManagerTeam()
  }, [authTasks.token])
  // 5. Robust employee check with type safety
  const isEmployeeUnderManager = (employeeId) => {
    if (!employeeId || !managerTeam.length) return false

    // Convert both IDs to numbers for comparison
    const employeeIdNum = Number(employeeId)
    return managerTeam.some((employee) => employee && Number(employee.id) === employeeIdNum)
  }

  const fetchData = async () => {
    try {
      // Fetch clients
      const clientsResponse = await fetch(
        'http://attendance-service.5d-dev.com/api/Clients/GetAllClients',
        {
          headers: {
            Authorization: `Bearer  ${authTasks.token}`,
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
  const handleDeleteTask = async (task) => {
    if (!task.id) return
    const taskId = Number(task.id)

    try {
      const response = await fetch(
        `http://attendance-service.5d-dev.com/api/Tasks/DeleteTask/${taskId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${authTasks.token}`,
          },
          body: JSON.stringify(taskId),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setModalMessage(data.message)
      setModalMessageVisible(true)

      // Refresh the dashboard after successful deletion
      if (dashboardRef.current) {
        dashboardRef.current.refresh()
      }

      // Alternatively, you can increment the refreshKey to force a complete re-render
      setRefreshKey((prevKey) => prevKey + 1)
    } catch (error) {
      console.error('Failed to delete task:', error)
      setModalMessage('Failed to delete task. Please try again.')
      setModalMessageVisible(true)
    }

    toggleDeleteModal()
    setTaskToDelete(null)
  }
  const handleTaskDeleted = (task) => {
    setTaskToDelete(task)
    toggleDeleteModal()
  }
  // Fetch data when component mounts
  useEffect(() => {
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

      const response = await fetch('http://attendance-service.5d-dev.com/api/Tasks/CreateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer  ${authTasks.token}`,
        },
        body: JSON.stringify(apiData),
      })

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
      if (response.ok) {
        setModalMessage('Task created successfully')
        setModalMessageVisible(true)
        toggle()
        setTaskCreated(true)
        if (dashboardRef.current) {
          dashboardRef.current.refresh()
        }

        if (dashboardRef.current) {
          dashboardRef.current.refresh()
        }
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
        await fetchData()
      }
      // Success case

      // Reset form
    } catch (error) {
      console.error('Error submitting task:', error)
      setTooltipMessage(
        'Oops! This time slot overlaps with an existing task. Please choose a different time. ',
      )
      setTooltipOpen(true)
      setTimeout(() => setTooltipOpen(false), 4000)
    }
  }

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
            Authorization: `Bearer  ${authTasks.token}`,
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
          Authorization: `Bearer  ${authTasks.token}`,
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

  return (
    <div className="tasks-container">
      {isLoadingTeam ? (
        <div>Loading team data...</div>
      ) : teamError ? (
        <div className="text-danger">Error loading team: {teamError}</div>
      ) : selectedEmployee?.id &&
        selectedEmployee?.name &&
        isEmployeeUnderManager(selectedEmployee.id) ? (
        <div className="d-flex justify-content-end align-items-center mb-4 pe-5">
          <Button color="primary" onClick={toggle} className="add-task">
            Add Task for {selectedEmployee.name}
          </Button>
        </div>
      ) : (
        selectedEmployee?.name && (
          <div className="d-flex justify-content-end align-items-center mb-4 pe-5">
            <span
              id="disabledButtonWrapper"
              style={{
                display: 'inline-block',
                cursor: 'not-allowed',
              }}
            >
              <Button color="primary" disabled style={{ pointerEvents: 'none' }}>
                Add Task for {selectedEmployee?.name}
              </Button>
            </span>

            <UncontrolledTooltip
              target="disabledButtonWrapper"
              placement="top"
              delay={{ show: 0, hide: 0 }}
            >
              ⚠️ You are not allowed to add a task to this employee.
            </UncontrolledTooltip>
          </div>
        )
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
            <Button color="danger" onClick={() => handleDeleteTask(taskToDelete)}>
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
        <Dashboard
          ref={dashboardRef}
          onEditTask={handleEditTask}
          onDeleteTask={handleTaskDeleted} // Note: Changed from handleDeleteTask to handleTaskDeleted
          key={refreshKey} // This will force a re-render when refreshKey changes
        />
      </div>
    </div>
  )
}

export default TasksContent

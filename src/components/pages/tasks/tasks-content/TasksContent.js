/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react'
import { Dashboard } from 'react-employee-calendar'
import 'react-employee-calendar/dist/index.css'
import { Button, Col, Input, Row, Form, FormGroup, Label } from 'reactstrap'
import { ModalMaker } from '../../../ui'

const TasksContent = () => {
  const [modal, setModal] = useState(false)
  const [clients, setClients] = useState([])
  const [departments, setDepartments] = useState([])
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [tasks, setTasks] = useState([]) // Add tasks state
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

  const toggle = () => setModal(!modal)

  // Fetch all necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const clientsResponse = await fetch(
          'http://tasks-service.5d-dev.com/api/Clients/GetAllClients',
        )
        const clientsData = await clientsResponse.json()
        setClients(clientsData)

        // Fetch departments
        const departmentsResponse = await fetch(
          'http://attendance-service.5d-dev.com/api/Employee/GetDepartments',
        )
        const departmentsData = await departmentsResponse.json()
        setDepartments(departmentsData)

        // Fetch employees
        const employeesResponse = await fetch(
          'http://attendance-service.5d-dev.com/api/Employee/SearchEmployees?pageNumber=1&pageSize=1000&searchTerm=&departmentId=&isActive=',
        )
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData)
        setFilteredEmployees(employeesData)

        // Fetch tasks
        const tasksResponse = await fetch('http://tasks-service.5d-dev.com/api/Tasks/GetAllTasks')
        const tasksData = await tasksResponse.json()
        setTasks(tasksData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'departmentId') {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const apiData = {
        ...formData,
        assignedToEmployeeId: Number(formData.assignedToEmployeeId),
        createdByEmployeeId: Number(formData.createdByEmployeeId),
        departmentId: Number(formData.departmentId),
        slotCount: Number(formData.slotCount),
        clientId: Number(formData.clientId),
      }

      const response = await fetch('http://tasks-service.5d-dev.com/api/Tasks/CreateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      })

      if (response.ok) {
        const newTask = await response.json()
        // Update tasks state with the new task
        setTasks((prevTasks) => [...prevTasks, newTask])
        // Reset form and close modal
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
        toggle()
      } else {
        console.error('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  // Generate slot options
  const slotOptions = Array.from({ length: 24 * 3 }, (_, i) => {
    const hours = Math.floor(i / 3)
    const minutes = (i % 3) * 20
    const slotCount = i + 1
    const displayText = `${slotCount} slot${slotCount > 1 ? 's' : ''} (${hours}h ${minutes}m)`
    return (
      <option key={slotCount} value={slotCount}>
        {displayText}
      </option>
    )
  })

  return (
    <div>
      <div className="d-flex justify-content-end align-items-center mb-4 pe-5">
        <Button color="primary" onClick={toggle}>
          Add New Task
        </Button>
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
                        type="datetime-local"
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
                      <Label for="endTime">End Time</Label>
                      <Input
                        type="datetime-local"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="my-3">
                  <Col md={6}>
                    <FormGroup>
                      <Label for="slotCount">Duration</Label>
                      <Input
                        type="select"
                        id="slotCount"
                        name="slotCount"
                        value={formData.slotCount}
                        onChange={handleInputChange}
                      >
                        {slotOptions}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="departmentId">Department</Label>
                      <Input
                        type="select"
                        id="departmentId"
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={handleInputChange}
                        required
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

                <Row className="my-3">
                  <Col md={6}>
                    <FormGroup>
                      <Label for="assignedToEmployeeId">Assigned To</Label>
                      <Input
                        type="select"
                        id="assignedToEmployeeId"
                        name="assignedToEmployeeId"
                        value={formData.assignedToEmployeeId}
                        onChange={handleInputChange}
                        required
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
                        required
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

                <Button color="primary" type="submit" className="px-3 w-100 py-2 mt-4">
                  Create Task
                </Button>
              </Form>
            </Col>
          </Row>
        </ModalMaker>
      </div>
      {/* Pass tasks to Dashboard component */}
      <Dashboard tasks={tasks} />
    </div>
  )
}

export default TasksContent

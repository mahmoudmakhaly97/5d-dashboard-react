import React, { useEffect, useState } from 'react'
import {
  Backpack,
  BadgeCheck,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleDot,
  Mail,
  MoveRight,
  Palmtree,
  Pencil,
  PhoneCall,
  Search,
  UserCog,
} from 'lucide-react'
import { MultiSelect } from 'primereact/multiselect'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Badge,
  Col,
  Button,
  InputGroup,
  Row,
  Form,
  FormGroup,
  Label,
  Card,
  Input,
  InputGroupText,
  Table,
} from 'reactstrap'

import check from '/assets/images/check.png'
import errorIcon from '/assets/images/error.png'
import employee from '/assets/images/employee.jpg'
import { Loader, Pagination, ModalMaker } from '../../../ui'
import EmployeeDetails from './../../employee-details/EmployeeDetails'
import './EmployeesContent.scss'

const Dashboard = () => {
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    department: '',
    manager: '',
    mobileNumber: '',
    jobTitle: '',
    isPassedProbation: false,
    isRemote: false,
    isManager: false,
  })

  const [employees, setEmployees] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState([])
  const [selectedManager, setSelectedManager] = useState([])
  const ITEMS_PER_PAGE = 10
  const [modal, setModal] = useState(false)
  const [modalMessageVisible, setModalMessageVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState(null)
  const [employeeDetails, setEmployeeDetails] = useState(null)

  const toggle = () => setModal(!modal)

  const navigate = useNavigate()

  const handleRowClick = (employeeId) => {
    // navigate('/employee', { state: { employeeId } })

    const fetchEmployeeDetails = async () => {
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

      if (!authToken) {
        setModalMessageVisible(true)
        setModalMessage(
          <div className="d-flex flex-column align-items-center gap-4">
            <img src={errorIcon} width={70} height={70} />
            <h4> Oops! Please Login And Try Again</h4>
          </div>,
        )
        return
      }

      try {
        const res = await axios.get(
          `http://attendance-service.5d-dev.com/api/Employee/GetEmployeeWithId?id=${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )

        const employeeData = res.data

        const modalContent = (
          <div className="employee-details-modal">
            <Pencil
              className="edit pointer "
              size={20}
              onClick={() => navigate('/employee', { state: { employeeId } })}
            />

            <div className="d-flex flex-column align-items-center gap-1 mb-4">
              <img
                className="img-thumbnail rounded-circle "
                src={
                  employeeData.ImagePath
                    ? `http://attendance-service.5d-dev.com${employeeData.ImagePath}`
                    : 'https://placehold.co/30x30'
                }
              />

              <h4 className="text-primary mb-0">{employeeData.name}</h4>
              <h6 className="title">{employeeData.jobTitle}</h6>
            </div>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <Mail size={20} />
                  <span> Email</span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3 text-dark ">{employeeData.email}</p>
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <Backpack size={20} />
                  <span> Department</span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3 text-dark ">{employeeData.department}</p>
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <CalendarCheck size={20} />
                  <span> VacationBalance </span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3 text-dark ">{employeeData.normalVacationBalance}</p>
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <CalendarCheck size={20} />
                  <span> incidental Balance </span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3 text-dark ">{employeeData.incidentalVacationBalance}</p>
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <UserCog size={20} />
                  <span> managerName </span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3 text-dark ">{employeeData.managerName}</p>
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <PhoneCall size={20} />
                  <span> mobileNumber </span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3 text-dark ">{employeeData.mobileNumber}</p>
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                {employeeData.isActive && (
                  <h6 className="title d-flex align-items-center gap-2 mb-3">
                    <CircleDot size={20} />
                    <span> IsActive </span>
                  </h6>
                )}
              </Col>
              <Col sm="6">
                {employeeData.isActive && (
                  <p className="mb-3">
                    {employeeData.isActive ? (
                      <Badge color="success">Active</Badge>
                    ) : (
                      <Badge severity="danger">Non Active</Badge>
                    )}
                  </p>
                )}
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                {employeeData.isPassedProbation || (
                  <h6 className="title d-flex align-items-center gap-2 mb-3">
                    <BadgeCheck size={22} />
                    <span> Status </span>
                  </h6>
                )}
              </Col>
              <Col sm="6">
                {' '}
                {employeeData.isPassedProbation || (
                  <p className="mb-3">
                    {employeeData.isPassedProbation || <Badge color="danger">In Probation</Badge>}
                  </p>
                )}
              </Col>
            </Row>
            <Row>
              <Col sm="6">
                {' '}
                <h6 className="title d-flex align-items-center gap-2 mb-3">
                  <Backpack size={22} />
                  <span> Work From Home </span>
                </h6>
              </Col>
              <Col sm="6">
                {' '}
                <p className="mb-3">
                  {employeeData.isRemote ? (
                    <Badge color="warning">Work From Home</Badge>
                  ) : (
                    <Badge color="success"> On Site </Badge>
                  )}
                </p>
              </Col>
            </Row>
          </div>
        )

        setEmployeeDetails(res.data)

        // Set modal after data is available
        setModalMessage(modalContent)
        setModalMessageVisible(true)
      } catch (error) {
        setModalMessageVisible(true)
        setModalMessage(<div>Error fetching employee details.</div>)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeDetails()
  }
  useEffect(() => {
    // Fetch departments and managers
    axios
      .get('http://attendance-service.5d-dev.com/api/Employee/GetDepartments')
      .then((res) => setDepartments(res.data))

    axios
      .get('http://attendance-service.5d-dev.com/api/Employee/GetAllManagers')
      .then((res) => setManagers(res.data))
  }, [])

  const handleEmployeeChange = (e) => {
    const { name, value, type, checked } = e.target
    setEmployeeData((prev) => {
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      name: employeeData.name,
      email: employeeData.email,
      department: employeeData.department,
      managerId: employeeData.manager,
      jobTitle: employeeData.jobTitle,
      mobileNumber: employeeData.mobileNumber,
      isPassedProbation: employeeData.isPassedProbation,
      isNormal: true,
      isManager: employeeData.isManager,
      isRemote: employeeData.isRemote,
    }

    try {
      await axios.post('http://attendance-service.5d-dev.com/api/Employee/AddEmployee', formData)

      setModal(false)
      setModalMessageVisible(true)
      setModalMessage(
        <div className="d-flex flex-column align-items-center gap-4">
          <img src={check} width={70} height={70} />
          <h4>Email Added Successfully</h4>
        </div>,
      )
      fetchEmployees(currentPage, ITEMS_PER_PAGE)
    } catch (error) {
      setModal(false)
      setModalMessageVisible(true)
      setModalMessage(
        <div className="d-flex flex-column align-items-center gap-4">
          <img src={errorIcon} width={70} height={70} />
          <h4> Oops ! this email already exists</h4>
        </div>,
      )
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage) // Set current page to new page
    fetchEmployees(newPage, ITEMS_PER_PAGE)
  }

  const filteredEmployees = employees
    .filter((employee) => {
      const filteredDepartments =
        selectedDepartment.length === 0 ||
        selectedDepartment.includes(Number(employee.department)) ||
        selectedDepartment.includes(departments.find((d) => d.name === employee.department)?.id)

      const filteredManagers =
        selectedManager.length === 0 || selectedManager.includes(employee.managerId)

      return filteredDepartments && filteredManagers
    })
    .map((employee) => {
      // Find the department name for this employee
      const department = departments.find(
        (dept) => dept.id === Number(employee.department) || dept.name === employee.department,
      )

      return {
        ...employee,
        department: department ? department.name : employee.department,
      }
    })
  const fetchEmployees = async (pageNumber, pageSize, filters = {}) => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

    if (!authToken) {
      setModalMessageVisible(true)
      setModalMessage(
        <div className="d-flex flex-column align-items-center gap-4">
          <img src={errorIcon} width={70} height={70} />
          <h4> Oops ! Please Login And Try Again</h4>
        </div>,
      )
      return
    }

    setLoading(true)
    try {
      let queryParams = []
      if (filters.searchTerm)
        queryParams.push(`searchTerm=${encodeURIComponent(filters.searchTerm)}`)
      if (filters.department && filters.department.length > 0)
        queryParams.push(`departments=${filters.department.toLowerCse().join(',')}`)
      if (filters.manager && filters.manager.length > 0)
        queryParams.push(`managerId=${filters.manager.toLowerCse().join(',')}`)

      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''

      const response = await axios.get(
        `http://attendance-service.5d-dev.com/api/Employee/SearchEmployees${queryString}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )
      if (Array.isArray(response.data)) {
        setEmployees(response.data)
        setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE))
      } else {
        console.error('Unexpected API response format:', response.data)
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees(currentPage, ITEMS_PER_PAGE)
  }, [currentPage])

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.id,
  }))

  const managersOptions = managers.map((manager) => ({
    label: manager.name,
    value: manager.id,
  }))

  const handleSearchChange = (e) => {
    const searchValue = e.target.value
    setSearchTerm(searchValue)

    fetchEmployees(currentPage, ITEMS_PER_PAGE, {
      searchTerm: searchValue,
      department: selectedDepartment,
      manager: selectedManager,
    })
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'department') {
      setSelectedDepartment(value)
      fetchEmployees(currentPage, ITEMS_PER_PAGE, {
        searchTerm: searchTerm,
        department: value,
        manager: selectedManager,
      })
    } else if (filterType === 'manager') {
      setSelectedManager(value)
      fetchEmployees(currentPage, ITEMS_PER_PAGE, {
        searchTerm: searchTerm,
        department: selectedDepartment,
        manager: value,
      })
    }
  }

  const noFiltersApplied =
    !searchTerm && selectedDepartment.length === 0 && selectedManager.length === 0

  const indexOfLastEmployee = currentPage * ITEMS_PER_PAGE
  const indexOfFirstEmployee = indexOfLastEmployee - ITEMS_PER_PAGE
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee)

  useEffect(() => {
    setTotalPages(Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE))
  }, [filteredEmployees])

  // Reset to first page if filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, selectedManager])

  return (
    <div className="employees">
      <div className="title">
        <h4 className="fw-bold mb-0">Employees</h4>
        <p>Lorem Ipsum is simply dummy text </p>
      </div>

      <Row>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
          <div className="d-flex gap-2 pt-4 pb-3 ">
            <MultiSelect
              options={departmentOptions}
              placeholder="Department"
              value={selectedDepartment}
              onChange={(e) => handleFilterChange('department', e.value)}
              optionLabel="label"
              display="chip"
              style={{ maxWidth: '300px' }}
              disabled={loading}
              filter
              showSelectAll={true}
            />
            <MultiSelect
              options={managersOptions}
              placeholder="Manager"
              value={selectedManager}
              onChange={(e) => handleFilterChange('manager', e.value)}
              optionLabel="label"
              display="chip"
              style={{ maxWidth: '300px' }}
              disabled={loading}
              filter
              showSelectAll={true}
            />
          </div>

          <div className="d-flex gap-2 algin-items-center w-auto mb-3 mb-md-0">
            <InputGroup className="flex-nowrap">
              <InputGroupText>
                <Search size={18} />
              </InputGroupText>
              <Input
                id="autoSizingInputGroup"
                placeholder="Search In Table"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </InputGroup>
            <Button color="primary" className="w-100" onClick={toggle}>
              Add Employee
            </Button>
            <ModalMaker modal={modal} toggle={toggle} centered size={'xl'}>
              <div className="add-employee pe-5 ">
                <Row>
                  <Col md={6}>
                    <div className="position-relative">
                      <div className="position-absolute end-0 p-4">
                        <Button outline color="light" className="rounded-pill back-btn">
                          Back To Website <MoveRight />
                        </Button>
                      </div>

                      <img
                        src={employee}
                        className="img-fluid rounded-3"
                        style={{ height: '650px' }}
                      />
                    </div>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={5}>
                    <h1 className="my-4">Add Employee</h1>
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter Employee Name"
                            value={employeeData.name}
                            onChange={handleEmployeeChange}
                          />
                        </Col>
                        <Col>
                          <Input
                            required
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter Employee Email"
                            value={employeeData.email}
                            onChange={handleEmployeeChange}
                          />
                        </Col>
                      </Row>
                      <Row className="my-4">
                        <Col>
                          <Input
                            type="select"
                            id="department"
                            name="department"
                            required
                            value={employeeData.department}
                            onChange={handleEmployeeChange}
                          >
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.name}>
                                {dept.name}
                              </option>
                            ))}
                          </Input>
                        </Col>
                      </Row>

                      <Row>
                        <Col>
                          <Input
                            type="select"
                            id="manager"
                            name="manager"
                            required
                            value={employeeData.manager}
                            onChange={handleEmployeeChange}
                          >
                            {managers.map((manager) => (
                              <option key={manager.id} value={manager.id}>
                                {manager.name}
                              </option>
                            ))}
                          </Input>
                        </Col>
                      </Row>
                      <Row className="my-4">
                        <Col>
                          <Input
                            type="tell"
                            id="mobileNumber"
                            name="mobileNumber"
                            required
                            placeholder="Enter Employee Mobile Number"
                            value={employeeData.mobileNumber}
                            onChange={handleEmployeeChange}
                          />
                        </Col>
                      </Row>
                      <Row className="mb-4">
                        <Col>
                          <Input
                            type="text"
                            id="jobTitle"
                            name="jobTitle"
                            placeholder="Enter Employee  jobTitle"
                            value={employeeData.jobTitle}
                            onChange={handleEmployeeChange}
                          />
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                          <FormGroup className="d-flex gap-2 align-items-center" switch>
                            <Input
                              type="switch"
                              id="isPassedProbation"
                              name="isPassedProbation"
                              onChange={handleEmployeeChange}
                              checked={employeeData.isPassedProbation}
                            ></Input>
                            <Label htmlFor="isPassedProbation" className="mb-0">
                              {' '}
                              isPassedProbation{' '}
                            </Label>
                          </FormGroup>
                        </Col>
                        <Col>
                          <FormGroup className="d-flex gap-2 align-items-center" switch>
                            <Input
                              type="switch"
                              id="isRemote"
                              name="isRemote"
                              onChange={handleEmployeeChange}
                              checked={employeeData.isRemote}
                            ></Input>
                            <Label htmlFor="isRemote" className="mb-0">
                              {' '}
                              isRemote{' '}
                            </Label>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row className="mt-4">
                        <Col>
                          <FormGroup className="d-flex gap-2 align-items-center " switch>
                            <Input
                              type="switch"
                              id="isManager"
                              name="isManager"
                              onChange={handleEmployeeChange}
                              checked={employeeData.isManager}
                            ></Input>
                            <Label htmlFor="isManager" className="mb-0">
                              is Manager{' '}
                            </Label>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Button color="primary" type="submit" className="px-3 w-100 py-2 mt-4">
                        Add
                      </Button>
                    </Form>
                  </Col>
                </Row>
              </div>
            </ModalMaker>
            {modalMessageVisible && (
              <ModalMaker
                size=" md"
                modal={modalMessageVisible}
                toggle={() => setModalMessageVisible(false)}
                centered
                // modalControls={
                //   <Button
                //     color="secondary"
                //     onClick={() => setModalMessageVisible(false)}
                //     className="px-3 w-100"
                //   >
                //     Ok
                //   </Button>
                // }
              >
                {modalMessage}
              </ModalMaker>
            )}
          </div>
        </div>
        <Col xs>
          <Card className="mb-4 border-0">
            <>
              <Table align="middle" className="mb-0 rounded-top overflow-hidden " hover responsive>
                <thead className="text-nowrap ">
                  <tr>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <span>NAME</span>
                        <ChevronDown size={21} />
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <span>EMAIL</span>
                        <ChevronDown size={21} />
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <span>DEPARTMENT</span>
                        <ChevronDown size={21} />
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <span>MANAGER</span>
                        <ChevronDown size={21} />
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <span>WORK MODE</span>
                        <ChevronDown size={21} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <Loader />
                      </td>
                    </tr>
                  ) : currentEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        {noFiltersApplied ? (
                          <span>No filters applied. Showing all employees.</span>
                        ) : (
                          <span>No results found for selected filters.</span>
                        )}
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((employee) => (
                      <tr
                        className="pointer"
                        v-for="item in tableItems"
                        key={employee.id}
                        onClick={() => handleRowClick(employee.id)}
                      >
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {employee.imagePath ? (
                              <img
                                width={40}
                                height={40}
                                className="rounded-circle"
                                src={`http://attendance-service.5d-dev.com${employee.imagePath}`}
                              />
                            ) : (
                              <img
                                className="rounded-circle"
                                width={40}
                                height={40}
                                src="https://placehold.co/30x30"
                              />
                            )}
                            <div>
                              <div className="employee-name">{employee.name}</div>
                              <div className="small text-body-secondary text-nowrap">
                                {employee.jobTitle}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="email">{employee.email}</div>
                        </td>
                        <td>
                          <div className="department">
                            {departments.find((d) => d.id === Number(employee.department))?.name ||
                              employee.department}
                          </div>
                        </td>
                        <td>
                          <div>{employee.managerName}</div>
                        </td>
                        <td>
                          <div>
                            {' '}
                            {employee.isRemote ? (
                              'Remote'
                            ) : (
                              <Badge className="px-4 py-2 ">
                                {' '}
                                <div className="d-flex align-items-center gap-2">
                                  {' '}
                                  <Check size={15} />
                                  <span>OnSite</span>
                                </div>
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </>
            <div className="pt-4">
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

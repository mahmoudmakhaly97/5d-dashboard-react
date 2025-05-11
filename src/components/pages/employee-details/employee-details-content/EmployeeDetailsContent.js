/* eslint-disable prettier/prettier */
import { Button, Col, Form, FormGroup, InputGroup, Label, Row, Table } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { MoveLeft } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import check from '/assets/images/check.png'
import errorIcon from '/assets/images/error.png'
import { useLocation } from 'react-router-dom' // Import useLocation

import axios from 'axios'
import { Loader, ModalMaker } from '../../../ui'
import { Badge, Input } from 'reactstrap'
import { TabView, TabPanel } from 'primereact/tabview'

import './EmployeeDetails.scss'
const EmployeeDetailsContent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { employeeId } = location.state || {}
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editFormData, setEditFormData] = useState(employee || {})

  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState([])
  const [modal, setModal] = useState(false)
  const [modalMessageVisible, setModalMessageVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState(null)
  const toggle = () => setModal(!modal)
  useEffect(() => {
    axios
      .get('http://attendance-service.5d-dev.com/api/Employee/GetDepartments')
      .then((response) => setDepartments(response.data))

    axios
      .get('http://attendance-service.5d-dev.com/api/Employee/GetAllManagers')
      .then((response) => setManagers(response.data))
  }, [])

  // Fetch employee details
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
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
        const response = await axios.get(
          `http://attendance-service.5d-dev.com/api/Employee/GetEmployeeWithId?id=${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        setEmployee(response.data)

        setEditFormData({
          name: response.data.name,
          email: response.data.email,
          department: response.data.department,
          jobTitle: response.data.jobTitle || '',
          managerId: +response.data.managerId || '',
          mobileNumber: response.data.mobileNumber || '',
          id: parseInt(response.data.id),
          secondName: '',
          isActive: response.data.isActive,
          normalVacationBalance: response.data.normalVacationBalance,
          incidentalVacationBalance: response.data.incidentalVacationBalance || 0,
          arrivalDepartureBalance: response.data.arrivalDepartureBalance || 0,
          keyAddress: '',
          isRemote: response.data.isRemote,
          isManager: response.data.isManager,
        })
      } catch (error) {
        setModal(false)
        setModalMessageVisible(true)
        setModalMessage(
          <div className="d-flex flex-column align-items-center gap-4">
            <img src={errorIcon} width={70} height={70} />
            <h4> Oops ! An Error Occurred </h4>
          </div>,
        )
      } finally {
        setLoading(false)
      }
    }

    if (employeeId) {
      fetchEmployeeDetails()
    }
  }, [employeeId])
  useEffect(() => {
    if (employee) {
      setEditFormData({
        name: employee.name,
        email: employee.email,
        department: employee.department,
        jobTitle: employee.jobTitle || '',
        managerId: +employee.managerId || '',
        mobileNumber: employee.mobileNumber || '',
        id: parseInt(employee.id),
        secondName: '',
        isActive: employee.isActive,
        normalVacationBalance: +employee.normalVacationBalance || 0,
        incidentalVacationBalance: +employee.incidentalVacationBalance || 0,
        arrivalDepartureBalance: employee.arrivalDepartureBalance || 0,
        keyAddress: '',
        isRemote: employee.isRemote,
        isManager: employee.isManager,
      })
    }
  }, [employee])

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  // Handle edit form submission
  const handleEditFormSubmit = async (e) => {
    e.preventDefault()

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

    const payload = {
      id: parseInt(employeeId),
      name: editFormData.name,
      secondName: '',
      department: editFormData.department,
      email: editFormData.email,
      jobTitle: editFormData.jobTitle,
      mobileNumber: editFormData.mobileNumber,
      isActive: editFormData.isActive,
      managerId: parseInt(editFormData.managerId) || 0,
      normalVacationBalance: parseInt(editFormData.normalVacationBalance),
      incidentalVacationBalance: parseInt(editFormData.incidentalVacationBalance),
      arrivalDepartureBalance: 0,
      keyAddress: '',
      isRemote: editFormData.isRemote,
      isManager: editFormData.isManager,
    }

    try {
      await axios.post(
        `http://attendance-service.5d-dev.com/api/Employee/UpdateEmployee?id=${employeeId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      // Find the new manager's name
      const newManager = managers.find((m) => m.id === parseInt(editFormData.managerId))

      // Update local employee state immediately
      setEmployee((prev) => ({
        ...prev,
        ...editFormData,
        managerName: newManager ? newManager.name : prev.managerName, // Update managerName
      }))
      setModal(false)
      setModalMessageVisible(true)
      setModalMessage(
        <div className="d-flex flex-column align-items-center gap-4">
          <img src={check} width={70} height={70} />
          <h4> Employee updated successfully!</h4>
        </div>,
      )
      // Close the modal
      const modal = document.getElementById('modal-fadein')
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return <Loader />
  }

  if (!employee) {
    return <div>Employee not found.</div>
  }

  return (
    <div className="employee-details  ">
      <div className="d-flex align-items-center mb-5 gap-3 ">
        <Button onClick={handleBack} color="primary" outline className="d-flex gap-2">
          <MoveLeft />
          Back
        </Button>
        <h5 className="mb-0 text-primary">Edit Profile</h5>
      </div>

      <div>
        <div className="w-100">
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-start">
                <Form onSubmit={handleEditFormSubmit}>
                  <Row>
                    <Col className="col-6">
                      <FormGroup>
                        <Label for="name">Employee Name</Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter Employee Name"
                          value={editFormData.name}
                          onChange={handleEditFormChange}
                        />
                      </FormGroup>
                    </Col>
                    <Col className="col-6">
                      <FormGroup>
                        <Label for="email">Employee Email</Label>
                        <Input
                          type="text"
                          id="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditFormChange}
                        />
                      </FormGroup>
                    </Col>
                    <FormGroup>
                      <Label for="department"> Department</Label>
                      <Input
                        type="select"
                        id="department"
                        name="department"
                        required
                        value={editFormData.department}
                        onChange={handleEditFormChange}
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                    <Row>
                      <Col className="col-6">
                        {' '}
                        <FormGroup>
                          <Label for="normalVacationBalance"> normal Vacation Balance </Label>
                          <Input
                            type="number"
                            id="normalVacationBalance"
                            name="normalVacationBalance"
                            value={editFormData.normalVacationBalance}
                            onChange={handleEditFormChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col className="col-6">
                        <FormGroup>
                          <Label for="incidentalVacationBalance">
                            {' '}
                            Incidental Vacation Balance
                          </Label>
                          <Input
                            type="number"
                            id="incidentalVacationBalance"
                            name="incidentalVacationBalance"
                            value={editFormData.incidentalVacationBalance}
                            onChange={handleEditFormChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup>
                      <Label for="jobTitle"> Job Title</Label>
                      <Input
                        type="text"
                        id="jobTitle"
                        name="jobTitle"
                        value={editFormData.jobTitle}
                        onChange={handleEditFormChange}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="managerId"> Manager Name</Label>
                      <Input
                        type="select"
                        id="managerId"
                        name="managerId"
                        required
                        value={editFormData.managerId}
                        onChange={handleEditFormChange}
                      >
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label for="mobileNumber"> Mobile Number</Label>
                      <Input
                        type="text"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={editFormData.mobileNumber}
                        onChange={handleEditFormChange}
                      />
                    </FormGroup>
                    <div className="d-flex gap-4 ">
                      <FormGroup switch className="d-flex align-items-center gap-5 ps-0">
                        <Label for="isActive" className="mb-0">
                          {' '}
                          Is Active{' '}
                        </Label>
                        <Input
                          type="switch"
                          id="isActive"
                          name="isActive"
                          checked={editFormData.isActive}
                          onChange={handleEditFormChange}
                        />
                      </FormGroup>
                      <FormGroup switch className="d-flex align-items-center gap-5 ps-0">
                        <Label for="isRemote" className="mb-0">
                          {' '}
                          From Home{' '}
                        </Label>
                        <Input
                          type="switch"
                          id="isRemote"
                          name="isRemote"
                          checked={editFormData.isRemote}
                          onChange={handleEditFormChange}
                        />
                      </FormGroup>
                      <FormGroup switch className="d-flex align-items-center gap-5 ps-0">
                        <Label className="mb-0" for="isManager">
                          {' '}
                          Is Manager{' '}
                        </Label>
                        <Input
                          type="switch"
                          id="isManager"
                          name="isManager"
                          checked={editFormData.isManager}
                          onChange={handleEditFormChange}
                        />
                      </FormGroup>
                    </div>
                    <Col sm={12}>
                      <Button color="primary" className="mt-4 w-100" type="submit">
                        Save
                      </Button>
                    </Col>
                  </Row>
                </Form>
                {modalMessageVisible && (
                  <ModalMaker
                    modal={modalMessageVisible}
                    toggle={() => setModalMessageVisible(false)}
                    centered
                    modalControls={
                      <Button
                        color="secondary"
                        onClick={() => {
                          setModalMessageVisible(false)
                          navigate('/employees')
                        }}
                        className="px-3 w-100"
                      >
                        Ok
                      </Button>
                    }
                  >
                    {modalMessage}
                  </ModalMaker>
                )}
              </div>
            </Col>
          </Row>
          {/* <Row className="w-100">
                  <Col xl={6}>
                    <tr>
                      <td>
                        <span className="fw-bold pe-4  ">Full Name</span>
                      </td>
                      <td>
                        {' '}
                        : <span className="ps-3"> {employee.name && employee.name}</span>{' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">
                        <span className="fw-bold pe-4">Email</span>
                      </td>
                      <td>
                        : <span className="ps-3">{employee.email && employee.email}</span>{' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4">Job Title </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">{employee.jobTitle && employee.jobTitle}</span>{' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> Department </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">
                          {employee.department && employee.department}
                        </span>{' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> normalVacationBalance </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">
                          {employee.normalVacationBalance && employee.normalVacationBalance}
                        </span>{' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> managerName </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">
                          {employee.managerName && employee.managerName}
                        </span>{' '}
                      </td>
                    </tr>
                  </Col>

                  <Col xl={6}>
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> mobileNumber </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">
                          {employee.mobileNumber && employee.mobileNumber}
                        </span>{' '}
                      </td>
                    </tr>
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> Is Active </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">
                          {employee.isActive ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge severity="danger">Non Active</Badge>
                          )}
                        </span>{' '}
                      </td>
                    </tr>
                    {employee.isPassedProbation || (
                      <tr>
                        <td className="label-cell">
                          {' '}
                          <span className="fw-bold pe-4"> Is Passed Probation </span>
                        </td>
                        <td>
                          :{' '}
                          <span className="ps-3">
                            {employee.isPassedProbation || (
                              <Badge color="danger">In Probation</Badge>
                            )}
                          </span>{' '}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> Is Remote </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">
                          {employee.isRemote ? (
                            <Badge color="warning">Remote</Badge>
                          ) : (
                            <Badge color="warning">Onsite</Badge>
                          )}
                        </span>{' '}
                      </td>
                    </tr>
                    {employee.isManager && (
                      <tr>
                        <td className="label-cell">
                          {' '}
                          <span className="fw-bold pe-4"> Is Manager </span>
                        </td>
                        <td>
                          :{' '}
                          <span className="ps-3">
                            {employee.isManager && <Badge color="success">Manager</Badge>}
                          </span>{' '}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="label-cell">
                        {' '}
                        <span className="fw-bold pe-4"> incidentalVacationBalance </span>
                      </td>
                      <td>
                        :{' '}
                        <span className="ps-3">{employee.incidentalVacationBalance || 0}</span>{' '}
                      </td>
                    </tr>
                  </Col>
                </Row> */}
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailsContent

/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import { MultiSelect } from 'primereact/multiselect'
import { Badge } from 'primereact/badge'
import { CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem } from '@coreui/react'

import { Calendar } from 'primereact/calendar'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { Loader, Pagination } from '../../../ui'
import './ReportsContent.scss'
import { Button, Col, Row, Table } from 'reactstrap'
const ReportsContent = () => {
  const [reportData, setReportData] = useState({
    employees: [],
    totalPages: 1,
  })
  const [departments, setDepartments] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [isFiltered, setIsFiltered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const deptResponse = await fetch(
          'http://attendance-service.5d-dev.com/api/Employee/GetDepartments',
        )
        const deptData = await deptResponse.json()
        setDepartments(deptData)
      } catch (err) {
        console.error('Error fetching initial data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.name, // Using name instead of id since API filters by department names
  }))

  const formatDateForApi = (date) => {
    if (!date) return ''
    const isoString = date.toISOString()
    return isoString.replace('Z', '').replace(/\.\d+/, '.0000000')
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatHoursAndMinutes = (hoursDecimal) => {
    if (!hoursDecimal || isNaN(hoursDecimal)) return '0H - 0Min'
    const hours = Math.floor(hoursDecimal)
    const minutes = Math.round((hoursDecimal - hours) * 60)
    return `${hours}H - ${minutes}Min`
  }

  const handleFilter = async (page = 1) => {
    try {
      setLoading(true)
      const start = formatDateForApi(startDate)
      const end = formatDateForApi(endDate)

      // Create comma-separated string of department names
      const deptNames = selectedDepartments.length > 0 ? selectedDepartments.join(',') : ''

      const query = new URLSearchParams({
        ...(start && { startDate: start }),
        ...(end && { endDate: end }),
        ...(deptNames && { departmentName: deptNames }),
        pageNumber: page,
        pageSize: ITEMS_PER_PAGE,
      })

      const res = await fetch(
        `http://attendance-service.5d-dev.com/api/Request/GetAbsentDays?${query.toString()}`,
      )
      const data = await res.json()

      // Sort employees by department before setting
      const sortedEmployees = (data.employees || []).sort((a, b) =>
        a.department.localeCompare(b.department),
      )

      setReportData({
        employees: sortedEmployees,
        totalPages: data.totalPages || 1,
      })

      setCurrentPage(page)
      setIsFiltered(true)
    } catch (err) {
      console.error('Error fetching filtered reports:', err)
      setReportData({
        employees: [],
        totalPages: 1,
      })
      setIsFiltered(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > reportData.totalPages) return
    handleFilter(newPage)
  }

  return (
    <div className="reports">
      {' '}
      <div className="filters d-flex gap-3 mb-3 filters">
        <MultiSelect
          options={departmentOptions}
          placeholder="Select Departments"
          value={selectedDepartments}
          onChange={(e) => setSelectedDepartments(e.value)} // e.value is an array of strings
          optionLabel="label"
          optionValue="value" // ✅ This makes sure value is just the department name
          display="chip"
          style={{ maxWidth: '300px' }}
          disabled={loading}
          filter
          showSelectAll={true}
        />

        <Calendar
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.value)}
          showIcon
          dateFormat="yy-mm-dd"
          disabled={loading}
        />
        <Calendar
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.value)}
          showIcon
          dateFormat="yy-mm-dd"
          disabled={loading}
        />
        <Button
          color="primary"
          className="filter-btn"
          onClick={() => handleFilter(1)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Filter'}
        </Button>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <>
            {reportData.employees.length === 0 && isFiltered && (
              <Row>
                <Col xl={9}>
                  <p className="text-center">No results found for selected filters</p>
                </Col>
              </Row>
            )}

            {reportData.employees.length === 0 && !isFiltered && (
              <Row>
                <Col xl={9}>
                  <p className="text-center">Please apply filters to see reports</p>
                </Col>
              </Row>
            )}

            {isFiltered && reportData.employees.length > 0 && (
              <CAccordion>
                {' '}
                {/* or remove alwaysOpen to allow only one open at a time */}
                {[...reportData.employees]
                  .sort((a, b) => a.department.localeCompare(b.department))
                  .map((employee, index) => (
                    <CAccordionItem
                      itemKey={index}
                      key={index}
                      className="mb-2 border border-1 rounded"
                    >
                      <CAccordionHeader>
                        <div className="accordion-header  w-100 d-flex justify-content-between pe-2">
                          <span>{employee.employeeName}</span>
                          <span className="department">{employee.department}</span>
                        </div>
                      </CAccordionHeader>
                      <CAccordionBody>
                        {' '}
                        <Table align="middle" className="mb-0 " hover responsive>
                          <thead className="text-nowrap ">
                            <tr>
                              <th>Date</th>
                              <th>Difference Hours</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employee.days.map((day, i) => (
                              <tr key={`${index}-${i}`}>
                                <td>{formatDateForDisplay(day.date)}</td>
                                <td>
                                  {day.workHours > 0 ? (
                                    <Badge
                                      value={formatHoursAndMinutes(8 - day.workHours)}
                                      severity="warning"
                                    />
                                  ) : (
                                    ''
                                  )}
                                </td>
                                <td>
                                  {day.status === 'Absent' ? (
                                    <Badge value="Absent" severity="danger" />
                                  ) : day.status === 'Incomplete Workday' ? (
                                    <>Incomplete Workday</>
                                  ) : (
                                    ''
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
              </CAccordion>
            )}
          </>
        </>
      )}
      {isFiltered && reportData.employees.length > 0 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination
            currentPage={currentPage}
            totalPages={reportData.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

export default ReportsContent

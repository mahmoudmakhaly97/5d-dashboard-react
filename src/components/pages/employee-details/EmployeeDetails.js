/* eslint-disable prettier/prettier */
import React from 'react'

import { Row } from 'reactstrap'
import { AppFooter, AppHeader, AppSidebar } from '../../ui'
import { EmployeeDetailsContent } from './employee-details-content'
const EmployeeDetails = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <Row className="px-5">
          <EmployeeDetailsContent />
        </Row>
        <AppFooter />
      </div>
    </div>
  )
}

export default EmployeeDetails

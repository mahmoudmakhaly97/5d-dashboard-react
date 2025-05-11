/* eslint-disable prettier/prettier */
import React from 'react'

import { Row } from 'reactstrap'
import { AppFooter, AppHeader, AppSidebar } from '../../ui'
import ReportsContent from './reports-content/ReportsContent'
const Employees = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <Row className="px-5">
          <ReportsContent />
        </Row>
        <AppFooter />
      </div>
    </div>
  )
}

export default Employees

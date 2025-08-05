/* eslint-disable prettier/prettier */
import React from 'react'

import { Row } from 'reactstrap'
import { AppFooter, AppHeader, AppSidebar } from './sidebar'
import ClientsContent from './clients-contemt/ClientsContent'
const Clients = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <Row className="px-5">
          <div>
            <ClientsContent />
          </div>
        </Row>
        <AppFooter />
      </div>
    </div>
  )
}

export default Clients

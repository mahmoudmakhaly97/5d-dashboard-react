/* eslint-disable prettier/prettier */
import React from 'react'

import { Row } from 'reactstrap'
import { AppFooter, AppHeader, AppSidebar } from '../../ui'
import TasksContent from './tasks-content/TasksContent'
const Tasks = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <Row>
          <TasksContent />
        </Row>
        <AppFooter />
      </div>
    </div>
  )
}

export default Tasks

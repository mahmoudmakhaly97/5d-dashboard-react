/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { Dashboard } from 'react-employee-calendar'
import 'react-employee-calendar/dist/index.css'
import { Button, Col, Input, Row, Form } from 'reactstrap'
import { ModalMaker } from '../../../ui'

const TasksContent = () => {
  const [modal, setModal] = useState(false)
  const toggle = () => setModal(!modal)

  return (
    <div>
      <div className="d-flex justify-content-end align-items-center mb-4 pe-5">
        <Button color="primary" onClick={toggle}>
          Add New Task
        </Button>
        {/*...........................................  */}
        <ModalMaker modal={modal} toggle={toggle} centered size={'lg'}>
          <Row>
            <Col md={12}>
              <h1 className="my-4">Add Employee</h1>
              <Form>
                <Row>
                  <Col>
                    <Input type="text" id="name" name="name" placeholder="Enter Employee Name" />
                  </Col>
                  <Col>
                    <Input
                      required
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter Employee Email"
                    />
                  </Col>
                </Row>
                <Row className="my-4">
                  <Col>
                    <Input type="select" id="department" name="department" required></Input>
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
                    />
                  </Col>
                </Row>
                <Row className="mb-4">
                  <Col>
                    <Input type="text" id="jobTitle" name="jobTitle" />
                  </Col>
                </Row>

                <Button color="primary" type="submit" className="px-3 w-100 py-2 mt-4">
                  Add
                </Button>
              </Form>
            </Col>
          </Row>
        </ModalMaker>
        {/*...........................................  */}
      </div>
      <Dashboard />
    </div>
  )
}
export default TasksContent

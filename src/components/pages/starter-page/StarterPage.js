/* eslint-disable prettier/prettier */
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardSubtitle, CardText, CardTitle } from 'reactstrap'
import './starter-page.scss'

/* eslint-disable prettier/prettier */
const StarterPage = () => {
  const navigate = useNavigate()
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 starter-page gap-3">
      <div>
        <h2 className="fw-medium mb-4">SELECT YOUR TYPE</h2>
        <div className="d-flex   gap-4">
          <Card
            className="p-4 rounded-4 cursor-pointer d-flex flex-column align-items-center justify-content-center bg-white border-0"
            onClick={() => navigate('/tasks')}
          >
            <img src="./assets/images/employees.svg" className="employees-img" alt="employees" />
            <img
              src="./assets/images/employees-h.svg"
              className="employees-img-h"
              alt="employees"
            />
            <h3>Employee</h3>
          </Card>
          <Card
            className="p-4 rounded-4 cursor-pointer d-flex flex-column align-items-center justify-content-center bg-white border-0"
            onClick={() => navigate('/login')}
          >
            <img src="./assets/images/hr.svg" alt="hr" className="employees-img" />
            <img src="./assets/images/hr-h.svg" alt="hr" className="employees-img-h" />
            <h3>human resources</h3>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default StarterPage

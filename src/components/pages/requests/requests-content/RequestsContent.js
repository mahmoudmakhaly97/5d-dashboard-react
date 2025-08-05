import { Button, Card, CardText, CardTitle, Col, Row } from 'reactstrap'
import './requests.scss'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BASE_URL } from '../../../../api/base'
import { Axios } from 'axios'
import { Loader } from '../../../ui'
const RequestsContent = () => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const getAllRequests = async () => {
      try {
        setIsLoading(true)
        const res = await Axios.get(`${BASE_URL}/Request/GetAllRequests`)
        setRequests(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }
    getAllRequests()
  }, [])
  if (isLoading) return <Loader />
  return (
    <div className="requests">
      <h3 className="text-2xl font-medium mb-4">Requests</h3>
      {/* {requests.length > 0 ? (
        requests.map((request) => (
          <Row className="g-3" key={request.id}>
            <Col sm="6" lg="4">
              <Card body>
                <CardTitle tag="h5">Special Title Treatment</CardTitle>
                <CardText className="my-3">
                  With supporting text below as a natural lead-in to additional content.
                </CardText>
                <div className="d-flex  gap-3">
                  <Button color="danger" className="flex-1 text-white">
                    Decline
                  </Button>
                  <Button
                    color="success"
                    className="flex-1 text-white d-flex align-items-center justify-center gap-2"
                  >
                    {' '}
                    Accept <Check size={20} />
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        ))
      ) : (
        <p className="text-center  py-5 mt-5">No Requests Found Yet</p>
      )} */}

      <Row className="g-3">
        <Col sm="6" lg="4">
          <Card body>
            <CardTitle tag="h5">Special Title Treatment</CardTitle>
            <CardText className="my-3">
              With supporting text below as a natural lead-in to additional content.
            </CardText>
            <div className="d-flex  gap-3">
              <Button color="danger" className="flex-1 text-white">
                Decline
              </Button>
              <Button
                color="success"
                className="flex-1 text-white d-flex align-items-center justify-center gap-2"
              >
                {' '}
                Accept <Check size={20} />
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
export default RequestsContent

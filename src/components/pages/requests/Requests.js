import { Row } from 'reactstrap'
import RequestsContent from './requests-content/RequestsContent'
import { AppFooter, AppHeader, AppSidebar } from './sidebar'
const Requests = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <Row className="px-5">
          <div>
            <RequestsContent />
          </div>
        </Row>
        <AppFooter />
      </div>
    </div>
  )
}
export default Requests

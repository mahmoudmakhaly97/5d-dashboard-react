/* eslint-disable prettier/prettier */
import { Badge, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Row } from 'reactstrap'

const ModalMaker = ({
  modal,
  toggle,
  children,
  modalControls,
  size,
  className,
  viewHeader = true,
}) => {
  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      centered
      size={size}
      className={className}
      style={{ zIndex: 99999999999999999999999999999999999999 }}
    >
      {viewHeader && (
        <ModalHeader toggle={toggle} className="border-0">
          {' '}
        </ModalHeader>
      )}{' '}
      <ModalBody className="py-0">{children}</ModalBody>
      <ModalFooter className="border-0">{modalControls}</ModalFooter>
    </Modal>
  )
}
export default ModalMaker

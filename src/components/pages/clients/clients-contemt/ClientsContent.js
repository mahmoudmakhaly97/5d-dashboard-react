/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Alert, Button, Col, Form, Input, Row } from 'reactstrap'
import { Loader, ModalMaker } from '../../../ui'
import check from '/assets/images/check.png'
import './ClientContent.scss'
import { Delete, Pen, X } from 'lucide-react'
const ClientsContent = () => {
  const [addClientModal, setAddClientModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalMessage, setModalMessage] = useState(null)
  const [modalMessageVisible, setModalMessageVisible] = useState(false)
  const [clients, setClients] = useState([])
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editClientId, setEditClientId] = useState(null)

  const [clientData, setClientData] = useState({
    name: '',
    code: '',
  })
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(
          'http://tasks-service.5d-dev.com/api/Clients/GetAllClients',
        )
        setClients(response.data)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])
  const toggle = () => {
    setAddClientModal(!addClientModal)
    if (!addClientModal) {
      setIsEditing(false)
      setEditClientId(null)
      setClientData({ name: '', code: '' })
    }
  }

  const handleClientDataChange = (e) => {
    const { name, value } = e.target
    setClientData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: clientData.name,
        clientCode: clientData.code,
      }

      if (isEditing) {
        const payload = {
          id: editClientId,
          name: clientData.name,
          clientCode: clientData.code,
        }

        await axios.post(
          `http://tasks-service.5d-dev.com/api/Clients/UpdateClient/${editClientId}`,
          payload,
        )

        setModalMessage('Client updated successfully')
      } else {
        await axios.post('http://tasks-service.5d-dev.com/api/Clients/CreateClient', payload)
        setModalMessage('Client added successfully')
      }

      setAddClientModal(false)

      setClientData({ name: '', code: '' })
      setIsEditing(false)
      const response = await axios.get('http://tasks-service.5d-dev.com/api/Clients/GetAllClients')
      setClients(response.data)
    } catch (error) {
      setModalMessage(
        (isEditing ? 'Error updating client: ' : 'Error adding client: ') +
          (error.response?.data?.message || error.message),
      )
    } finally {
      setModalMessageVisible(true)
    }
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      setIsLoading(true)
      await axios.post(
        `http://tasks-service.5d-dev.com/api/Clients/DeleteClient/${clientToDelete.id}`,
      )
      setModalMessage('Client deleted successfully')

      const response = await axios.get('http://tasks-service.5d-dev.com/api/Clients/GetAllClients')
      setClients(response.data)
    } catch (error) {
      setModalMessage('Error deleting client: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsLoading(false)
      setConfirmDeleteModal(false)
      setClientToDelete(null)
      setModalMessageVisible(true)
      setIsEditing(false)
    }
  }
  const confirmDelete = (client) => {
    setClientToDelete(client)
    setConfirmDeleteModal(true)
  }
  const handleEditClient = (client) => {
    setClientData({
      name: client.name,
      code: client.clientCode,
    })
    setEditClientId(client.id)
    setIsEditing(true)
    setAddClientModal(true)
  }

  return (
    <div className="client-content">
      <div className="d-flex justify-content-end my-3">
        <Button color="primary" onClick={toggle} className="px-3 py-2">
          Add Client
        </Button>
        <ModalMaker modal={addClientModal} toggle={toggle} centered size={'md'}>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter Client Name"
                  value={clientData.name}
                  onChange={handleClientDataChange}
                  required
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  placeholder="Enter Client Code"
                  value={clientData.code}
                  onChange={handleClientDataChange}
                  required
                />
              </Col>
            </Row>

            <Button color="primary" type="submit" className="px-3 w-100 py-2 mt-4">
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </Form>
        </ModalMaker>

        {modalMessageVisible && (
          <ModalMaker
            size="md"
            modal={modalMessageVisible}
            toggle={() => setModalMessageVisible(false)}
            centered
          >
            <div className="d-flex flex-column justify-content-center align-items-center gap-3">
              <img src={check} width={70} height={70} alt="success" />
              <h1 className="font-bold">{modalMessage}</h1>
            </div>
          </ModalMaker>
        )}
      </div>
      {isLoading && (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Loader />
        </div>
      )}

<Row>
  {/* If loading, show the loader */}
  {isLoading ? (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <Loader />
    </div>
  ) : clients.length === 0 ? (
    // Show "No clients found" if no clients are available after loading
    <Col md={12} className="d-flex justify-content-center align-items-center mt-5">
      <h4>No clients found</h4>
    </Col>
  ) : (
    // Show clients if they exist
    clients.map((client) => (
      <Col md={6} key={client.id} className="mb-2">
        <Alert color="secondary" className="border-0 mb-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {client.name} - {client.clientCode}
            </div>
            <div className="d-flex gap-2">
              <Pen
                className="pointer mx-2"
                size={16}
                onClick={() => handleEditClient(client)}
              />

              <X className="pointer" size={16} onClick={() => confirmDelete(client)} />
            </div>
          </div>
        </Alert>
      </Col>
    ))
  )}
</Row>

      {confirmDeleteModal && (
        <ModalMaker
          size="md"
          modal={confirmDeleteModal}
          toggle={() => setConfirmDeleteModal(false)}
          centered
        >
          <div className="d-flex flex-column justify-content-center align-items-center gap-3">
            <h4>
              Are you sure you want to delete <strong>{clientToDelete?.name}</strong>?
            </h4>
            <div className="d-flex gap-3 mt-4">
              <Button color="danger" onClick={handleDeleteClient}>
                Yes, Delete
              </Button>
              <Button color="secondary" onClick={() => setConfirmDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </ModalMaker>
      )}
    </div>
  )
}

export default ClientsContent

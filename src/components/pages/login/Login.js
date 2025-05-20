import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, User } from 'lucide-react'

import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap'
import logo from '/assets/images/5d-logo.png'

import './login.scss'
import { useAuth } from '../../../context/AuthContext'

const Login = () => {
  const { loginAsHR } = useAuth()

  const [login, setLogin] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const onChangeHandler = (e) => {
    const { name, value, type, checked } = e.target
    setLogin({
      ...login,
      [name]: type === 'checkbox' ? checked : value,
    })
  }
  const handleLogin = async (email, password) => {
    try {
      const res = await fetch('http://attendance-service.5d-dev.com/api/Employee/DashboardLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          keyAddress: password,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (login.rememberMe) {
        localStorage.setItem('authToken', data.token)
      } else {
        sessionStorage.setItem('authToken', data.token)
      }

      loginAsHR(data.token, login.rememberMe)
      navigate('/employees')
    } catch (error) {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!login.email || !login.password) {
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Missing Fields',
      //   text: 'Please fill in both email and password fields.',
      // })
      return
    }

    setIsLoading(true)
    await handleLogin(login.email, login.password)
    setIsLoading(false)
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center login">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="d-flex align-items-center  back">
              <div className="icon">
                <ArrowLeft size={18} className="cursor-pointer " onClick={() => navigate('/')} />
              </div>
              <h4 className="pt-4">Back</h4>
            </div>
            <Card className="p-5">
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <div className="d-flex flex-column align-items-center">
                    <p className="text-body-secondary">
                      <img src={logo} alt="logo" className="mb-3" />
                    </p>
                  </div>
                  <InputGroup className="mb-3">
                    <InputGroupText>
                      <User color="#721996" size={18} />
                    </InputGroupText>
                    <Input
                      placeholder="Email"
                      name="email"
                      value={login.email}
                      onChange={onChangeHandler}
                    />
                  </InputGroup>
                  <InputGroup className="mb-4">
                    <InputGroupText>
                      <Lock color="#721996" size={16} />
                    </InputGroupText>
                    <Input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={login.password}
                      onChange={onChangeHandler}
                    />
                  </InputGroup>
                  <FormGroup switch className="d-flex align-items-center  ps-0 gap-5  mb-4">
                    <Label for="rememberMe" className="mb-0">
                      Remember Me
                    </Label>
                    <Input
                      type="switch"
                      id="rememberMe"
                      name="rememberMe"
                      checked={login.rememberMe}
                      onChange={onChangeHandler}
                    />
                  </FormGroup>

                  <Row>
                    <Button
                      type="submit"
                      className="px-4 login-btn"
                      disabled={isLoading}
                      aria-label={isLoading ? 'Logging in...' : 'Log in'}
                    >
                      {isLoading ? 'Logging in...' : 'Log in'}
                    </Button>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login

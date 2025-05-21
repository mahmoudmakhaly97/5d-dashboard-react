/* eslint-disable prettier/prettier */
import { useState } from 'react'
import { FormGroup, Label, Input, Button } from 'reactstrap'
import { ChevronUp, ChevronDown } from 'lucide-react'
import './Tasks.scss'

const TimeSelector = ({ label, name, onChange, value }) => {
  const [hours, setHours] = useState(value.hours || 1)
  const [minutes, setMinutes] = useState(value.minutes || 0)
  const [period, setPeriod] = useState(value.period || 'AM') // 'AM' or 'PM'

  const minuteOptions = [0, 20, 40]

  const updateTime = (newHours, newMinutes, newPeriod = period) => {
    setHours(newHours)
    setMinutes(newMinutes)
    setPeriod(newPeriod)
    const formatted = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')} ${newPeriod}`
    onChange({ target: { name, value: formatted } })
  }

  const togglePeriod = () => {
    const newPeriod = period === 'AM' ? 'PM' : 'AM'
    updateTime(hours, minutes, newPeriod)
  }

  const incrementHours = () => updateTime((hours % 12) + 1, minutes)
  const decrementHours = () => updateTime(hours - 1 || 12, minutes)

  const incrementMinutes = () => {
    const index = minuteOptions.indexOf(minutes)
    const newIndex = (index + 1) % minuteOptions.length
    updateTime(hours, minuteOptions[newIndex])
  }

  const decrementMinutes = () => {
    const index = minuteOptions.indexOf(minutes)
    const newIndex = (index - 1 + minuteOptions.length) % minuteOptions.length
    updateTime(hours, minuteOptions[newIndex])
  }

  return (
    <FormGroup>
      <Label className="fw-bold">{label}</Label>
      <div className="d-flex align-items-center border p-2 rounded-3 hour-container">
        {/* Hours Block */}
        <div className="text-center position-relative">
          <Input
            readOnly
            value={String(hours).padStart(2, '0')}
            className="text-center"
            style={{ width: '50px' }}
          />
          <div className="position-absolute top-50 start-100 translate-middle ms-3">
            <Button color="link" onClick={incrementHours} className="p-0">
              <ChevronUp size={18} color="#000" />
            </Button>
            <Button color="link" onClick={decrementHours} className="p-0">
              <ChevronDown size={18} color="#000" />
            </Button>
          </div>
        </div>

        {/* Colon Separator */}
        <div className="fs-3 fw-bold ms-5 me-3">:</div>

        {/* Minutes Block */}
        <div className="text-center position-relative">
          <Input
            readOnly
            value={String(minutes).padStart(2, '0')}
            className="text-center"
            style={{ width: '50px' }}
          />
          <div className="position-absolute top-50 start-100 translate-middle ms-3">
            <Button color="link" onClick={incrementMinutes} className="p-0">
              <ChevronUp size={18} color="#000" />
            </Button>
            <Button color="link" onClick={decrementMinutes} className="p-0">
              <ChevronDown size={18} color="#000" />
            </Button>
          </div>
        </div>

        {/* AM/PM Toggle */}
        <div className="ms-5">
          <Button color="secondary" outline onClick={togglePeriod} className="period">
            {period}
          </Button>
        </div>
      </div>
    </FormGroup>
  )
}

export default TimeSelector

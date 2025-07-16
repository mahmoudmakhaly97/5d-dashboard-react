import React, { createContext, useContext, useState } from 'react'

interface DatePermissionContextValue {
  selectedDate: Date | null
  setSelectedDate: (date: Date) => void
  allowCreateTask: boolean
  setAllowCreateTask: (allow: boolean) => void
}

const DatePermissionContext = createContext<DatePermissionContextValue | undefined>(undefined)

export const DatePermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [allowCreateTask, setAllowCreateTask] = useState<boolean>(true)

  return (
    <DatePermissionContext.Provider
      value={{ selectedDate, setSelectedDate, allowCreateTask, setAllowCreateTask }}
    >
      {children}
    </DatePermissionContext.Provider>
  )
}

export const useDatePermission = () => {
  const context = useContext(DatePermissionContext)
  if (!context) {
    throw new Error('useDatePermission must be used within a DatePermissionProvider')
  }
  return context
}
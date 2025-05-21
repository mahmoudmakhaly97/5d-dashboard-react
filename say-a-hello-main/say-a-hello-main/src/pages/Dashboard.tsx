import { useState, useEffect } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import { Trash2 } from 'lucide-react' // Import delete icon

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import TaskTimeline from '@/components/dashboard/TaskTimeline'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import './Dashboard.css'
import TaskCard from '@/components/dashboard/TaskCard'
export interface Task {
  createdAt: Date
  assignedToEmployeeId?: number
  departmentId?: number
  description?: string
  endTime?: string
  time: string
  id: string
  title: string
  employeeName?: string
  employeeAvatar?: string
  assignees?: { id: string; name: string; avatar?: string }[]
  left?: string
  color?: 'red' | 'green' | 'blue'
  date: Date
}

export interface Employee {
  id: string
  name: string
  position: string
  avatar?: string
  tasks: Task[]
  department?: string
}

export interface Department {
  id: string
  name: string
  employees: Employee[]
}
interface DashboardProps {
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onAllowCreateTaskChange?: (allow: boolean) => void
}
const Dashboard = forwardRef((props: DashboardProps, ref) => {
  const { onEditTask, onDeleteTask, onAllowCreateTaskChange } = props
  const today = new Date()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false) // State for delete confirmation modal
  const [taskToDelete, setTaskToDelete] = useState(null) // Task to be deleted
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [currentDate, setCurrentDate] = useState(today)

  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  const authTasks = JSON.parse(localStorage.getItem('authData'))
  const handleAllowCreateTaskChange = (allow: boolean) => {
    if (props.onAllowCreateTaskChange) {
      props.onAllowCreateTaskChange(allow)
    }
  }
  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch departments
      const departmentsResponse = await fetch(
        'http://attendance-service.5d-dev.com/api/Employee/GetDepartments',
        {
          headers: {
            Authorization: `Bearer   ${authToken}`,
          },
        },
      )
      const departmentsData = await departmentsResponse.json()

      // Fetch tasks
      const tasksResponse = await fetch(
        'http://attendance-service.5d-dev.com/api/Tasks/GetAllTasks',
        {
          headers: {
            Authorization: `Bearer    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE2MCIsInN1YiI6IjE2MCIsImVtYWlsIjoiYUBzLmNvbSIsImp0aSI6IjUzMDMxYTgwLWU2NmEtNDU0OS04OTQ0LWI3ZjcxOWQzMjc5ZCIsImV4cCI6MTc0ODI0NDk1NywiaXNzIjoiQXR0ZW5kYW5jZUFwcCIsImF1ZCI6IkF0dGVuZGFuY2VBcGlVc2VyIn0.YXYOmxubjBXvwgpolZ1soPS3FvEAggAZm-ics2o1lFk`,
          },
        },
      )
      const tasksData = await tasksResponse.json()

      // Process data and create department structure
      const processedDepartments = await Promise.all(
        departmentsData.map(async (dept: any) => {
          // Fetch employees for this department
          const employeesResponse = await fetch(
            `http://attendance-service.5d-dev.com/api/Employee/SearchEmployees?departments=${dept.name.toLowerCase()}`,
          )
          const employeesData = await employeesResponse.json()

          // Process employees and their tasks
          const employees = employeesData.map((emp: any) => {
            // Find tasks assigned to this employee
            const employeeTasks = tasksData
              .filter((task: any) => task.assignedToEmployeeId?.toString() === emp.id.toString())
              .map((task: any) => ({
                id: task.id.toString(),
                title: task.title,
                description: task.description,
                time: formatTime(task.startTime),
                endTime: task.endTime ? formatTime(task.endTime) : undefined,
                date: new Date(task.startTime),
                departmentId: task.departmentId,
                assignedToEmployeeId: task.assignedToEmployeeId,
                // Add color based on some condition if needed
                color: getRandomColor(),
              }))

            return {
              id: emp.id.toString(),
              name: emp.name,
              position: emp.jobTitle || 'Employee',
              avatar: emp.imagePath
                ? `http://attendance-service.5d-dev.com${emp.imagePath}`
                : undefined,
              department: emp.department,
              tasks: employeeTasks,
            }
          })

          return {
            id: dept.id.toString(),
            name: dept.name,
            employees: employees,
          }
        }),
      )

      setDepartments(processedDepartments)

      // Select first department by default
    } catch (err) {
      setError('Failed to fetch data from server')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }
  const toggleDeleteModal = () => setDeleteModal(!deleteModal)

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchData()
    },
    getSelectedEmployee: () => selectedEmployee,
    getSelectedDate: () => currentDate,
    setSelectedDate: (date: Date) => setCurrentDate(date),
  }))

  useEffect(() => {
    fetchData()
  }, [])

  // Helper function to format time from ISO string to "2:00 PM" format
  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  // Replace your current useEffect with this more efficient version:

  // Helper function to generate random color for tasks
  const getRandomColor = (): 'red' | 'green' | 'blue' => {
    const colors: ('red' | 'green' | 'blue')[] = ['red', 'green', 'blue']
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Handle employee selection with department
  // In Dashboard's handleEmployeeSelect
  const handleEmployeeSelect = (department: Department, employee: Employee | null) => {
    setSelectedDepartment(department)
    setSelectedEmployee(employee)
    window.dispatchEvent(new CustomEvent('employeeSelected'))
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <div className="loader-container    flex justify-center items-center w-3/4">
          <span className="loader "></span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <div>No departments found</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen bg-background ">
      <div className="flex h-full w-full flex-col  ">
        {/* Main content area */}
        <div className="flex flex-1 h-screen overflow-hidden">
          {/* Accordion sidebar for departments and employees */}
          <div className="w-64 border-r overflow-auto bg-muted/10 p-4">
            <Accordion type="multiple" className="w-full">
              {departments.map((department) => (
                <AccordionItem key={department.id} value={department.id}>
                  <AccordionTrigger
                    onClick={() => handleEmployeeSelect(department, null)}
                    className={` px-1 font-medium hover:no-underline py-4   ${
                      selectedDepartment?.id === department.id && !selectedEmployee
                        ? 'bg-accent text-accent-foreground'
                        : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{department.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-2 space-y-1">
                      {department.employees.map((employee) => (
                        <div
                          key={employee.id}
                          className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-slate-200 hover:text-accent-foreground ${
                            selectedEmployee?.id === employee.id
                              ? 'bg-accent text-accent-foreground'
                              : ''
                          }`}
                          onClick={() => handleEmployeeSelect(department, employee)}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>
                              <img src="https://placehold.co/30x30" alt={employee.name} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.position}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Task Timeline */}
          <TaskTimeline
            department={selectedDepartment}
            employee={selectedEmployee}
            currentDate={currentDate}
            onDateSelect={(date) => setCurrentDate(date)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onAllowCreateTaskChange={handleAllowCreateTaskChange} // Add this
          />
        </div>
      </div>
    </div>
  )
})

export default Dashboard

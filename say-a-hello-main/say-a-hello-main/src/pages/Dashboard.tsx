import { useState, useEffect } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import { Trash2, Menu, X, ChevronUp, ChevronDown } from 'lucide-react' // Import menu icons

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
import { BASE_URL, IMAGE_PATH } from './../api/base'
import '../components/dashboard/index.scss'
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
  showOnlyMyTasks?: boolean
  currentUserId?: string
  managerTeam?: any[]
  handleViewDetails?: (task: Task) => void
  refreshKey?: number
}

const Dashboard = forwardRef((props: DashboardProps, ref) => {
  const {
    onEditTask,
    onDeleteTask,
    showOnlyMyTasks,
    currentUserId,
    managerTeam,
    handleViewDetails,
    refreshKey,
  } = props
  const today = new Date()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [currentDate, setCurrentDate] = useState(today)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false) // Mobile sidebar state
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([])
  const [initialUserLoaded, setInitialUserLoaded] = useState(false)

  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  const authTasks = JSON.parse(localStorage.getItem('authData'))

  const handleAllowCreateTaskChange = (allow: boolean) => {
    if (props.onAllowCreateTaskChange) {
      props.onAllowCreateTaskChange(allow)
    }
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Fetches data from server and processes it to create department structure.
   * Includes fetching departments, tasks and employees.
   * @returns {Promise<void>}
   */
  /*******  253f91a1-f112-4c41-b0b9-33b7bda0ea3a  *******/
  const fetchData = async () => {
    try {
      setLoading(true)
      setLoading(true)
      setDepartments([])
      setSelectedDepartment(null)
      setSelectedEmployee(null)

      // Fetch departments
      const departmentsResponse = await fetch(`${BASE_URL}/Employee/GetDepartments`, {
        headers: {
          Authorization: `Bearer   ${authToken}`,
        },
      })
      const departmentsData = await departmentsResponse.json()

      // Fetch tasks
      const tasksResponse = await fetch(`${BASE_URL}/Tasks/GetAllTasks`, {
        headers: {
          Authorization: `Bearer  ${authTasks.token}`,
        },
      })
      const tasksData = await tasksResponse.json()

      // Process data and create department structure
      const processedDepartments = await Promise.all(
        departmentsData.map(async (dept: any) => {
          // Fetch employees for this department
          const employeesResponse = await fetch(
            `${BASE_URL}/Employee/SearchEmployees?departments=${dept.name.toLowerCase()}`,
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
                color: getRandomColor(),
              }))

            return {
              id: emp.id.toString(),
              name: emp.name,
              position: emp.jobTitle || 'Employee',
              avatar: emp.imagePath ? `${IMAGE_PATH}/${emp.imagePath}` : undefined,
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
    } catch (err) {
      setError('Failed to fetch data from server')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDeleteModal = () => setDeleteModal(!deleteModal)

  const refresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      setIsRefreshing(true)
      await fetchData()
      setIsRefreshing(false)
    },
    getSelectedEmployee: () => selectedEmployee,
    getSelectedDate: () => currentDate,
    getSelectedDepartment: () => selectedDepartment,
    setSelectedDate: (date: Date) => setCurrentDate(date),
    setSelectedEmployee: (emp: Employee) => {
      if (emp) {
        const dept = departments.find((d) => d.employees.some((e) => e.id === emp.id))
        if (dept) {
          handleEmployeeSelect(dept, emp)
        }
      }
    },
    setSelectedDepartment: (dept: Department) => {
      if (dept) {
        setSelectedDepartment(dept)
      }
    },
  }))

  useEffect(() => {
    fetchData()
  }, [props.refreshKey])

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      const menuButton = document.getElementById('menu-button')

      if (
        isMobileSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsMobileSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileSidebarOpen])

  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getRandomColor = (): 'red' | 'green' | 'blue' => {
    const colors: ('red' | 'green' | 'blue')[] = ['red', 'green', 'blue']
    return colors[Math.floor(Math.random() * colors.length)]
  }
  // Then in the useEffect that fetches data:
  useEffect(() => {
    fetchData()
  }, [props.refreshKey]) // Add refreshKey as dependency
  const handleEmployeeSelect = (department: Department, employee: Employee | null) => {
    setSelectedDepartment(department)
    setSelectedEmployee(employee)

    // For initial load, keep the accordion open
    if (!initialUserLoaded && employee?.id === currentUserId?.toString()) {
      setOpenAccordionItems([department.id])
      setInitialUserLoaded(true)
      return
    }

    // Only toggle accordion when clicking department header (employee is null)
    if (!employee) {
      setOpenAccordionItems(
        (prev) =>
          prev.includes(department.id)
            ? prev.filter((id) => id !== department.id) // Close
            : [...prev, department.id], // Open
      )
    } else {
      // When selecting employee, keep the accordion open
      setOpenAccordionItems([department.id])
    }

    const today = new Date()
    setCurrentDate(today)

    if (employee) {
      setIsMobileSidebarOpen(false)
    }
    window.dispatchEvent(new CustomEvent('employeeSelected'))
  }
  const handleEmployeeClick = (department: Department, employee: Employee) => {
    handleEmployeeSelect(department, employee)
    // Keep department open
    setOpenAccordionItems((prev) =>
      prev.includes(department.id) ? prev : [...prev, department.id],
    )
  }
  useEffect(() => {
    if (currentUserId && !selectedEmployee && departments.length > 0 && !initialUserLoaded) {
      for (const dept of departments) {
        const foundEmployee = dept.employees.find((emp) => emp.id === currentUserId.toString())
        if (foundEmployee) {
          handleEmployeeSelect(dept, foundEmployee)
          break
        }
      }
    }
  }, [currentUserId, departments, selectedEmployee, initialUserLoaded])
  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <div className="loader-container flex justify-center items-center w-3/4">
          <span className="loader"></span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <div className="text-red-500 text-center px-4">{error}</div>
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="flex h-screen w-screen bg-background items-center justify-center">
        <div className="text-center px-4">No departments found</div>
      </div>
    )
  }
  const handleAccordionChange = (value: string[]) => {
    setOpenAccordionItems(value)
  }

  return (
    <div className="flex h-[700px] overflow-hidden    w-screen bg-background">
      <div className="flex h-full w-full flex-col">
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
          <button
            id="menu-button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-2 rounded-md hover:bg-muted"
          >
            {isMobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="text-sm font-medium">
            {selectedEmployee ? (
              <span>{selectedEmployee.name}</span>
            ) : selectedDepartment ? (
              <span>{selectedDepartment.name}</span>
            ) : (
              <span>Select Department</span>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 h-full overflow-x-hidden relative">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-[19rem] border-r overflow-auto bg-muted/10 p-4">
            <Accordion
              type="multiple"
              className="w-full"
              value={openAccordionItems}
              onValueChange={handleAccordionChange}
            >
              {departments.map((department) => (
                <AccordionItem key={department.id} value={department.id}>
                  <AccordionTrigger
                    onClick={(e) => {
                      e.preventDefault()
                      // Pass null as employee to indicate we're clicking the department header
                      handleEmployeeSelect(department, null)
                    }}
                    className={`px-1 font-medium hover:no-underline py-4 ${
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
                      {department.employees.map((employee) => {
                        const isInManagerTeam = props.managerTeam?.some(
                          (member) => member.id === employee.id,
                        )

                        return (
                          <div
                            key={employee.id}
                            className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-slate-200 hover:text-accent-foreground ${
                              selectedEmployee?.id === employee.id
                                ? 'bg-accent text-accent-foreground'
                                : ''
                            } ${props.managerTeam && !isInManagerTeam ? 'opacity-50' : ''}`}
                            onClick={() => {
                              if (!props.managerTeam || isInManagerTeam) {
                                handleEmployeeSelect(department, employee)
                              }
                            }}
                          >
                            <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
                              <AvatarImage src={employee.avatar} alt={employee.name} />
                              <AvatarFallback>
                                <img src="https://placehold.co/30x30" alt={employee.name} />
                              </AvatarFallback>
                            </Avatar>
                            <div className="truncate min-w-0">
                              <div className="font-medium truncate">{employee.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {employee.position}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Mobile sidebar overlay */}
          {isMobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
              <div
                id="mobile-sidebar"
                className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out"
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Departments</h2>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-2 rounded-md hover:bg-muted"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 overflow-auto h-full pb-20">
                  <Accordion className="w-full">
                    {departments.map((department) => (
                      <AccordionItem key={department.id} value={department.id}>
                        <AccordionTrigger
                          onClick={() => handleEmployeeSelect(department, null)}
                          className={`px-1 font-medium hover:no-underline py-4 ${
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
                            {department.employees.map((employee) => {
                              const isInManagerTeam = props.managerTeam?.some(
                                (member) => member.id === employee.id,
                              )

                              return (
                                <div
                                  key={employee.id}
                                  className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-slate-200 hover:text-accent-foreground ${
                                    selectedEmployee?.id === employee.id
                                      ? 'bg-accent text-accent-foreground'
                                      : ''
                                  } ${props.managerTeam && !isInManagerTeam ? 'opacity-50' : ''}`}
                                  onClick={() => {
                                    if (!props.managerTeam || isInManagerTeam) {
                                      handleEmployeeSelect(department, employee)
                                    }
                                  }}
                                >
                                  <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
                                    <AvatarImage src={employee.avatar} alt={employee.name} />
                                    <AvatarFallback>
                                      <img src="https://placehold.co/30x30" alt={employee.name} />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="truncate min-w-0">
                                    <div className="font-medium truncate">{employee.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {employee.position}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          )}

          {/* Task Timeline - now takes full width on mobile */}
          <div className="flex-1 min-w-0">
            {!selectedDepartment ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center p-4 empty-department">
                  <h3 className="text-lg font-medium">Loading your tasks...</h3>
                </div>
              </div>
            ) : (
              <TaskTimeline
                department={selectedDepartment}
                employee={selectedEmployee}
                currentDate={currentDate}
                onDateSelect={(date) => setCurrentDate(date)}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onAllowCreateTaskChange={handleAllowCreateTaskChange}
                showOnlyMyTasks={showOnlyMyTasks}
                currentUserId={currentUserId}
                managerTeam={managerTeam}
                handleViewDetails={handleViewDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default Dashboard

import React, { useEffect, useState } from 'react'
import { Department, Employee, Task } from '@/pages/Dashboard'
import Stopwatch from '@/components/dashboard/Stopwatch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, isSameDay, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import TaskCard from './TaskCard'
import * as Dialog from '@radix-ui/react-dialog'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { addWeeks, subWeeks } from 'date-fns'
import { Button } from '../ui/button'
import './index.scss'
import { BASE_URL } from './../../api/base'

interface TaskTimelineProps {
  department: Department | null
  employee: Employee | null
  currentDate: Date
  onDateSelect?: (date: Date) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onAllowCreateTaskChange?: (allow: boolean) => void
  showOnlyMyTasks?: boolean
  currentUserId?: string | number
  managerTeam?: any[]
  handleViewDetails?: (task: Task) => void
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  department,
  employee,
  currentDate,
  onDateSelect,
  onEditTask,
  onDeleteTask,
  onAllowCreateTaskChange,
  showOnlyMyTasks = false,
  currentUserId = null,
  managerTeam = [],
  handleViewDetails,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [Tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTaskToDelete, setSelectedTaskToDelete] = useState<Task | null>(null)
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  const authTasks = JSON.parse(localStorage.getItem('authData'))
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0)
  const [allowCreateTask, setAllowCreateTask] = useState(true)
  const [selectedDayForNewTask, setSelectedDayForNewTask] = useState<Date>(() => new Date())
  const [isViewingCurrentWeek, setIsViewingCurrentWeek] = useState(true)

  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const hourHeight = 120 // Increased row height (was 103)

  const hours = Array.from({ length: 9 }, (_, i) => i + 10) // 10 AM to 6 PM
  const handleNextWeek = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentWeekOffset((prev) => prev + 1)
    setIsViewingCurrentWeek(false)
    setAllowCreateTask(false)
    onAllowCreateTaskChange?.(false)
  }

  const handlePrevWeek = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setCurrentWeekOffset((prev) => prev - 1)
    setIsViewingCurrentWeek(false)
    setAllowCreateTask(false)
    onAllowCreateTaskChange?.(false)
  }
  const handleCurrentWeek = () => {
    setCurrentWeekOffset(0)
    setIsViewingCurrentWeek(true)
    const today = new Date()
    setSelectedDayForNewTask(today)
    setSelectedDate(today)
    setAllowCreateTask(true)
    onAllowCreateTaskChange?.(true)

    if (onDateSelect) {
      onDateSelect(today)
    }
  }

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleDayClick = (date: Date, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }

    setCurrentWeekOffset(0)
    setSelectedDayForNewTask(date)
    setSelectedDate(date)

    if (onDateSelect) {
      onDateSelect(date)
    }

    setAllowCreateTask(true)
    onAllowCreateTaskChange?.(true)
  }

  const handleEditClick = (task: Task) => {
    // Prevent default behavior that might close the accordion
    onEditTask(task)
  }

  const handleDeleteClick = (task: Task) => {
    // Prevent default behavior that might close the accordion
    onDeleteTask(task)
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      if (!authTasks?.token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(
        `${BASE_URL}/Tasks/GetAllTasks?` +
          new URLSearchParams({
            timestamp: Date.now().toString(),
          }),
        {
          headers: {
            Authorization: `Bearer ${authTasks.token}  `,
          },
        },
      )
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      console.error('❌ Task fetch error:', err.message)
      setError(err.message)

      if (err.message.includes('403')) {
        localStorage.removeItem('authData')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const isBefore10AM = (task: Task) => {
    const taskDate = new Date(task.date)
    const taskTime = new Date(task.createdAt || task.date)
    return taskTime.getHours() < 10
  }

  const getDateRange = () => {
    if (!department) return [currentDate]

    if (employee) {
      const weekStart = startOfWeek(addWeeks(currentDate, currentWeekOffset))
      const weekEnd = endOfWeek(addWeeks(currentDate, currentWeekOffset))
      return eachDayOfInterval({
        start: weekStart,
        end: weekEnd,
      })
    } else {
      return [currentDate]
    }
  }

  const dateRange = getDateRange()

  const getTasks = () => {
    if (!department) return []

    let tasks = []

    if (employee) {
      tasks = employee.tasks || []
    } else {
      tasks =
        department.employees?.flatMap((emp) =>
          (emp.tasks || [])
            .filter((task) => isSameDay(new Date(task.date), currentDate)) // Closing parenthesis was in wrong place
            .map((task) => ({
              ...task,
              employeeName: emp.name,
              employeeAvatar: emp.avatar,
            })),
        ) || []
    }

    // Apply filtering
    if (
      initialLoadComplete ||
      showOnlyMyTasks ||
      (employee && employee.id === currentUserId?.toString())
    ) {
      tasks = tasks.filter(
        (task) => task.assignedToEmployeeId?.toString() === currentUserId?.toString(),
      )
    }

    return tasks
  }

  const tasks = getTasks()

  useEffect(() => {
    if (tasks.length > 0 && !initialLoadComplete) {
      setInitialLoadComplete(true)
    }
  }, [tasks])
  const getEmployeesWithTasksToday = () => {
    if (!department || employee) return []
    return department.employees || []
  }

  const employeesWithTasksToday = getEmployeesWithTasksToday()

  const calculateTaskPosition = (task: Task) => {
    const timeParts = task.time.split(':')
    const hour = parseInt(timeParts[0])
    const minute = parseInt(timeParts[1]?.split(' ')[0] || '0')
    const isPM = task.time.toLowerCase().includes('pm')

    const hourIn24 = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour
    const topPosition = (hourIn24 - 9.5) * hourHeight + (minute * hourHeight) / 60

    let heightInMinutes = hourHeight // Default to 1 hour height
    if (task.endTime) {
      const endTimeParts = task.endTime.split(':')
      const endHour = parseInt(endTimeParts[0])
      const endMinute = parseInt(endTimeParts[1]?.split(' ')[0] || '0')
      const isEndPM = task.endTime.toLowerCase().includes('pm')

      const endHourIn24 =
        isEndPM && endHour !== 12 ? endHour + 12 : endHour === 12 && !isEndPM ? 0 : endHour
      const endPosition = (endHourIn24 - 10) * hourHeight + (endMinute * hourHeight) / 60
      heightInMinutes = endPosition - topPosition
    }

    return { top: topPosition, height: heightInMinutes }
  }

  const calculateStopwatchPosition = () => {
    const startHour = 10
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    const totalMinutes = currentHour * 60 + currentMinute - startHour * 60 + 60 // Add 60 minutes
    const pixelsPerMinute = hourHeight / 60

    return Math.max(0, totalMinutes * pixelsPerMinute)
  }

  const stopwatchPosition = calculateStopwatchPosition()

  // Add this useEffect to set today's date when an employee is selected
  useEffect(() => {
    if (employee) {
      const today = new Date()
      setSelectedDayForNewTask(today)
      setSelectedDate(today)

      if (onDateSelect) {
        onDateSelect(today)
      }
    }
  }, [employee])
  // In TaskTimeline component
  useEffect(() => {
    if (employee && employee.id === currentUserId?.toString()) {
      const today = new Date()
      setSelectedDayForNewTask(today)
      setSelectedDate(today)
      setIsViewingCurrentWeek(true)

      if (onDateSelect) {
        onDateSelect(today)
      }
    }
  }, [employee, currentUserId])
  return (
    <div className="relative w-full p-4">
      <div className="flex flex-wrap mb-4 justify-between items-start w-full px-4 sm:px-[20px]">
        <h2 className="text-xl font-semibold">
          {employee && employee.id === currentUserId?.toString()
            ? 'My Tasks '
            : showOnlyMyTasks
              ? 'My Tasks'
              : department
                ? employee
                  ? `${employee.name}'s Tasks - Week View`
                  : `${department.name} - Today's Tasks`
                : 'All Tasks'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {employee && dateRange.length > 1
            ? `${format(dateRange[0], 'MMM d')} - ${format(dateRange[6], 'MMM d, yyyy')}`
            : format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Always show week navigation for logged-in user */}
      {(employee || showOnlyMyTasks) && (
        <div className="flex flex-wrap gap-2 ml-4 my-4 justify-between btn-tasks-container">
          <div className="relative group mr-2">
            <Button
              onClick={handlePrevWeek}
              className="bg-gray-600 w-10 h-10 flex btn1 items-center justify-center text-[18px] transition-opacity rounded-full"
            >
              <ChevronLeft />
            </Button>
            <p className="absolute w-[120px] -top-8 left-[50px] text-center -translate-x-1/2 px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Previous week
            </p>
          </div>

          {currentWeekOffset !== 0 && (
            <Button
              onClick={handleCurrentWeek}
              className="bg-gray-600 px-4 py-2 rounded text-sm current"
            >
              Current Week
            </Button>
          )}

          <div className="relative group">
            <Button
              onClick={handleNextWeek}
              className="bg-gray-600 btn2 w-10 h-10 left-[50px] text-center flex items-center justify-center text-[18px] transition-opacity rounded-full"
            >
              <ChevronRight />
            </Button>
            <p className="absolute -top-8 right-[0px] w-[120px] text-center px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Next week
            </p>
          </div>
        </div>
      )}

      <div className="relative min-h-[calc(9*120px)]">
        <div className="flex">
          {/* Hour lines column */}
          <div className="w-16 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-[120px] flex items-end">
                <div className="text-xs text-gray-500 pr-2 text-right w-full">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              </div>
            ))}
          </div>

          {/* Employees and tasks columns */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className="overflow-x-auto overflow-y-hidden rotate-180 h-full"
              ref={(el) => {
                if (el) el.scrollTop = 50
              }}
            >
              <div className="rotate-180 w-full min-w-max">
                {/* Show weekly view if we have an employee (logged-in user) */}
                {(employee || showOnlyMyTasks) && (
                  <div className="flex relative">
                    {/* Hour markers */}
                    <div className="absolute left-0 right-0 h-full pointer-events-none">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-t border-gray-200"
                          style={{
                            top: `${(hour - 9.2) * hourHeight}px`,
                            position: 'absolute',
                            width: '100%',
                          }}
                        ></div>
                      ))}
                    </div>

                    {/* Time indicator line */}
                    <div
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                      style={{
                        top: `${stopwatchPosition}px`,
                        marginTop: '-1px',
                      }}
                    >
                      <div className="absolute -top-3">
                        <Stopwatch color="#ea384c" />
                      </div>
                    </div>

                    {dateRange.map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={`rounded-t flex-shrink-0 sm:min-w-[225px] min-w-[100px] max-w-[250px] border-r border-gray-200 ${
                          selectedDate && isSameDay(date, selectedDate) ? 'selected-day' : ''
                        }`}
                      >
                        {/* Date header */}
                        <div
                          className={`h-10 flex items-center justify-center border-b border-gray-200 cursor-pointer ${
                            isSameDay(date, selectedDayForNewTask)
                              ? 'selected-day-header rounded-t-sm bg-blue-50 text-blue-600'
                              : ''
                          }`}
                          onClick={(e) => handleDayClick(date, e)}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium">{format(date, 'EEE')}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(date, 'MMM d')}
                            </span>
                          </div>
                        </div>

                        {/* Tasks for this date */}
                        <div className="relative h-[calc(9*120px)]">
                          {tasks
                            .filter(
                              (task) => isSameDay(new Date(task.date), date) && !isBefore10AM(task),
                            )
                            .map((task, taskIndex) => {
                              const { top, height } = calculateTaskPosition(task)
                              return (
                                <div
                                  key={taskIndex}
                                  className="absolute mx-1 group TaskCard"
                                  style={{
                                    top: `${top}px`,
                                    height: `${height}px`,
                                    minHeight: '40px',
                                    maxHeight: '200px',
                                    width: 'calc(100% - 8px)',
                                    left: '0px',
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    employee={employee}
                                    handleViewDetails={handleViewDetails}
                                  />
                                  <Trash2
                                    size={19}
                                    className="absolute top-4 right-3 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() => handleDeleteClick(task)}
                                  />
                                  <Pencil
                                    size={19}
                                    className="absolute top-[5rem] right-3 cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() => handleEditClick(task)}
                                  />
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show department view only if not showing logged-in user's tasks */}
                {!employee && !showOnlyMyTasks && department && department.employees && (
                  <div className="flex">
                    {/* Hour markers for department view */}
                    <div className="absolute left-0 right-0 h-full pointer-events-none">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-t border-gray-200"
                          style={{
                            top: `${(hour - 10) * hourHeight}px`,
                            position: 'absolute',
                            width: '100%',
                          }}
                        ></div>
                      ))}
                    </div>

                    {department.employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex-shrink-0 min-w-[170px] sm:min-w-[200px] max-w-[250px] border-r border-gray-200"
                      >
                        {/* Employee header */}
                        <div className="h-10 flex items-center justify-center border-b border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {emp.name}
                            </span>
                          </div>
                        </div>
                        <div
                          className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                          style={{
                            top: `${stopwatchPosition}px`,
                            marginTop: '-1px',
                          }}
                        >
                          <div className="absolute -top-3">
                            <Stopwatch color="#ea384c" />
                          </div>
                        </div>
                        {/* Tasks for this employee */}
                        <div className="relative h-[calc(9*120px)]">
                          {(emp.tasks || [])
                            .filter(
                              (task) =>
                                isSameDay(new Date(task.date), currentDate) && !isBefore10AM(task),
                            )
                            .map((task, taskIndex) => {
                              const { top, height } = calculateTaskPosition(task)
                              return (
                                <div
                                  key={taskIndex}
                                  className="absolute mx-1 group TaskCard"
                                  style={{
                                    top: `${top * 1.04}px`,
                                    height: `${height}px`,
                                    minHeight: '40px',
                                    width: 'calc(100% - 8px)',
                                    left: '0px',
                                  }}
                                >
                                  <TaskCard
                                    task={task}
                                    employee={{
                                      name: emp.name,
                                      avatar: emp.avatar,
                                    }}
                                    handleViewDetails={handleViewDetails}
                                  />
                                  <Trash2
                                    size={19}
                                    className="absolute top-4 right-3 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() => handleDeleteClick(task)}
                                  />
                                  <Pencil
                                    size={19}
                                    className="absolute top-[5rem] right-3 cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={() => handleEditClick(task)}
                                  />
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state when no tasks */}
      {tasks.length === 0 && (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p className="text-start w-1/2">
            {employee && employee.id === currentUserId?.toString()
              ? "You don't have any tasks scheduled this week"
              : 'No tasks scheduled'}
          </p>
        </div>
      )}

      {/* {selectedTaskToDelete && (
        <ConfirmDeleteModal
          open={showDeleteModal}
          onConfirm={() => onDeleteTask(selectedTaskToDelete)}
          onCancel={() => setShowDeleteModal(false)}
          taskName={selectedTaskToDelete.title}
        />
      )} */}
    </div>
  )
}

export default TaskTimeline

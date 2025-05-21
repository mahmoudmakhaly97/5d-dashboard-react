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

interface TaskTimelineProps {
  department: Department | null
  employee: Employee | null
  currentDate: Date
  onDateSelect?: (date: Date) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onAllowCreateTaskChange?: (allow: boolean) => void
}
const TaskTimeline: React.FC<TaskTimelineProps> = ({
  department,
  employee,
  currentDate,
  onDateSelect,
  onEditTask,
  onDeleteTask,
  onAllowCreateTaskChange,
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
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0)

  const handleNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1)
    setAllowCreateTask(true)
    onAllowCreateTaskChange?.(true) // Notify parent
  }
  const handlePrevWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1)
    setAllowCreateTask(false)
    onAllowCreateTaskChange?.(false) // Notify parent
  }
  const handleCurrentWeek = () => {
    setCurrentWeekOffset(0)
    setAllowCreateTask(true)
    onAllowCreateTaskChange?.(true)
  }

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])
  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    if (onDateSelect) {
      onDateSelect(date)
    }
  }
  const handleDeleteClick = (task: Task) => {
    setSelectedTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const fetchData = async () => {
    try {
      const response = await fetch(
        'http://attendance-service.5d-dev.com/api/Tasks/GetAllTasks?' +
          new URLSearchParams({
            timestamp: Date.now().toString(),
          }),
        {
          headers: {
            Authorization: `Bearer   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjE2MCIsInN1YiI6IjE2MCIsImVtYWlsIjoiYUBzLmNvbSIsImp0aSI6IjUzMDMxYTgwLWU2NmEtNDU0OS04OTQ0LWI3ZjcxOWQzMjc5ZCIsImV4cCI6MTc0ODI0NDk1NywiaXNzIjoiQXR0ZW5kYW5jZUFwcCIsImF1ZCI6IkF0dGVuZGFuY2VBcGlVc2VyIn0.YXYOmxubjBXvwgpolZ1soPS3FvEAggAZm-ics2o1lFk`,
          },
        },
      )
      const data = await response.json()
      setTasks(data)
    } catch (err) {
      console.error('Error fetching tasks:', err)
    }
  }
  useEffect(() => {
    fetchData()
  }, []) // Empty array means this runs only once when the component mounts
  const isBefore10AM = (task: Task) => {
    const taskDate = new Date(task.date)
    const taskTime = new Date(task.createdAt || task.date) // Use createdAt if available, otherwise fall back to task.date
    return taskTime.getHours() < 10
  }
  // Get the date range - today only or full week based on selection
  const getDateRange = () => {
    if (!department) return [currentDate]

    if (employee) {
      // For an employee, show the full week with offset
      const weekStart = startOfWeek(addWeeks(currentDate, currentWeekOffset))
      const weekEnd = endOfWeek(addWeeks(currentDate, currentWeekOffset))
      return eachDayOfInterval({
        start: weekStart,
        end: weekEnd,
      })
    } else {
      // For all employees in department, just show today
      return [currentDate]
    }
  }
  const dateRange = getDateRange()

  // Filter tasks based on selected employee/department and date range
  const getTasks = () => {
    if (!department) return []

    if (employee) {
      // Show tasks for selected employee within date range
      return employee.tasks.filter((task) =>
        dateRange.some((date) => isSameDay(new Date(task.date), date)),
      )
    } else {
      // Show tasks for all employees in the department for today only
      return department.employees.flatMap((emp) =>
        emp.tasks
          .filter((task) => isSameDay(new Date(task.date), currentDate))
          .map((task) => ({ ...task, employeeName: emp.name, employeeAvatar: emp.avatar })),
      )
    }
  }

  const tasks = getTasks()

  // Get employees with tasks today for department view
  const getEmployeesWithTasksToday = () => {
    if (!department || employee) return []
    return department.employees.filter((emp) =>
      emp.tasks.some((task) => isSameDay(new Date(task.date), currentDate)),
    )
  }
  const employeesWithTasksToday = getEmployeesWithTasksToday()

  // Calculate hours for the timeline (6:00 AM - 6:00 PM)
  const hours = Array.from({ length: 9 }, (_, i) => i + 10)
  const calculateTaskPosition = (task: Task) => {
    const timeParts = task.time.split(':')
    const hour = parseInt(timeParts[0])
    const minute = parseInt(timeParts[1]?.split(' ')[0] || '0')
    const isPM = task.time.toLowerCase().includes('pm')

    const hourIn24 = isPM && hour !== 12 ? hour + 12 : hour === 12 && !isPM ? 0 : hour
    const topPosition = (hourIn24 - 10) * 96 + (minute * 96) / 60

    let heightInMinutes = 60
    if (task.endTime) {
      const endTimeParts = task.endTime.split(':')
      const endHour = parseInt(endTimeParts[0])
      const endMinute = parseInt(endTimeParts[1]?.split(' ')[0] || '0')
      const isEndPM = task.endTime.toLowerCase().includes('pm')

      const endHourIn24 =
        isEndPM && endHour !== 12 ? endHour + 12 : endHour === 12 && !isEndPM ? 0 : endHour
      const endPosition = (endHourIn24 - 10) * 96 + (endMinute * 96) / 60
      heightInMinutes = endPosition - topPosition
    }

    return { top: topPosition, height: heightInMinutes }
  }
  // Get title based on selection

  // Calculate stopwatch position
  const calculateStopwatchPosition = () => {
    const startHour = 10 // Calendar starts at 10 AM
    const hourHeight = 96 // Each hour is 96px tall
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    // Calculate total minutes from start of day (10 AM)
    const totalMinutes = currentHour * 60 + currentMinute - startHour * 60
    const pixelsPerMinute = hourHeight / 60

    return Math.max(0, totalMinutes * pixelsPerMinute)
  }

  const stopwatchPosition = calculateStopwatchPosition()

  return (
    <div className="relative w-full overflow-auto  p-4">
      <div className="flex mb-4 justify-between items-center w-full px-[20px]">
        <h2 className="text-xl font-semibold">
          {department ? `${department.name} - Today's Tasks` : 'All Tasks'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {employee && dateRange.length > 1
            ? `${format(dateRange[0], 'MMM d')} - ${format(dateRange[6], 'MMM d, yyyy')}`
            : format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
      {!employee && department && employeesWithTasksToday.length > 0 && (
        <div className="flex border-b mb-2">
          {employeesWithTasksToday.map((emp) => (
            <div
              key={emp.id}
              className="flex-1 p-2 text-center font-medium cursor-pointer   relative left-[50px] max-w-[231px]"
            >
              <div className="flex items-center justify-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={emp.avatar} alt={emp.name} />
                  <AvatarFallback>
                    <img src="https://placehold.co/30x30" alt={emp.name} />
                  </AvatarFallback>
                </Avatar>
                <span>{emp.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Only show buttons when in weekly view */}
      {employee && dateRange.length > 1 && (
        <div className="flex gap-2 ml-4 my-4 justify-between btn-tasks-container">
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
              className="bg-gray-600 px-4 py-2 rounded text-sm current "
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
            <p className="absolute -top-8 right-[0px] w-[120px] text-center  px-2 py-1 text-sm text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Next week
            </p>
          </div>
        </div>
      )}

      {tasks.length > 0 ? (
        <div className="relative min-h-[600px]">
          {/* Day headers for week view */}
          {employee && dateRange.length > 1 && (
            <div className="flex border-b mb-2">
              {dateRange.map((date, index) => (
                <div
                  key={index}
                  className={`flex-1 p-2  text-center font-medium cursor-pointer   relative left-[50px] max-w-[230px] ${
                    (selectedDate ? isSameDay(selectedDate, date) : isToday(date))
                      ? 'bg-primary/10 rounded-t-md'
                      : ''
                  }`}
                  onClick={() => handleDayClick(date)}
                >
                  {format(date, 'EEE, MMM d')}
                </div>
              ))}
            </div>
          )}

          {/* Hour lines with increased height */}
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="flex border-t border-gray-200 h-24">
                <div className="w-16 text-xs text-gray-500 py-1 pr-2 text-right">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-1"></div>
              </div>
            ))}

            {/* Current time indicator (red line) */}
            <div
              className="absolute left-0 right-0 border-t-2 border-red-500 z-10 flex items-center"
              style={{
                top: `${stopwatchPosition}px`,
                marginTop: '-1px',
              }}
            >
              <div className="absolute -left-4 -top-3">
                <Stopwatch color="#ea384c" />
              </div>
            </div>

            {/* Tasks */}
            <div className="absolute top-0 left-16 right-0 bottom-0">
              {employee && dateRange.length > 1 ? (
                // Week view layout
                <div className="flex h-full ">
                  {dateRange.map((date, dateIndex) => (
                    <div key={dateIndex} className="flex-1 relative h-full  days  ">
                      {tasks
                        .filter(
                          (task) => isSameDay(new Date(task.date), date) && !isBefore10AM(task),
                        )
                        .map((task, taskIndex) => {
                          // Calculate position based on time
                          const timeParts = task.time.split(':')
                          const hour = parseInt(timeParts[0])
                          const minute = parseInt(timeParts[1]?.split(' ')[0] || '0')
                          const isPM = task.time.toLowerCase().includes('pm')

                          const hourIn24 = isPM && hour !== 12 ? hour + 12 : hour
                          const topPosition = (hourIn24 - 10) * 96 + minute

                          // Calculate height based on duration
                          let heightInMinutes = 60 // Default 1 hour
                          if (task.endTime) {
                            const endTimeParts = task.endTime.split(':')
                            const endHour = parseInt(endTimeParts[0])
                            const endMinute = parseInt(endTimeParts[1]?.split(' ')[0] || '0')
                            const isEndPM = task.endTime.toLowerCase().includes('pm')

                            const endHourIn24 = isEndPM && endHour !== 12 ? endHour + 12 : endHour
                            const endPosition = (endHourIn24 - 10) * 96 + endMinute

                            heightInMinutes = endPosition - topPosition
                          }

                          return (
                            <div
                              key={taskIndex}
                              className="absolute mx-1 group TaskCard" // <-- Added `group` here
                              style={{
                                top: `${topPosition}px`,

                                height: `${heightInMinutes}px`,
                                minHeight: '40px',
                                maxHeight: '200px',
                                width: '215px',
                              }}
                            >
                              <TaskCard
                                task={task}
                                employee={
                                  employee || {
                                    name: task.employeeName,
                                    avatar: task.employeeAvatar,
                                  }
                                }
                              />
                              <Trash2
                                size={19}
                                className="absolute top-4 right-3 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => handleDeleteClick(task)}

                                // ...........No
                              />
                              <Pencil
                                size={19}
                                className="absolute  top-10 right-3  cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => onEditTask(task)}
                              />
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              ) : (
                // Day view layout - now used for both single employee day view and department view
                <div className="w-full h-full ">
                  <div className="relative h-full w-full ">
                    <div className="flex">
                      {employeesWithTasksToday.map((emp) => (
                        <div
                          key={emp.id}
                          className="flex-1 relative min-w-[200px] max-w-[250px]  last:border-r-0"
                        >
                          <div className="  h-[95vh]  today-border">
                            {emp.tasks
                              .filter(
                                (task) =>
                                  isSameDay(new Date(task.date), currentDate) &&
                                  !isBefore10AM(task),
                              )
                              .map((task, taskIndex) => {
                                const { top, height } = calculateTaskPosition(task)
                                return (
                                  <div
                                    key={taskIndex}
                                    className="absolute mx-1 group TaskCard "
                                    style={{
                                      top: `${top}px`,
                                      height: `${height}px`,
                                      minHeight: '40px',
                                      maxHeight: '200px',
                                      width: 'calc(100% - 8px)',

                                      maxWidth: '190px',
                                      left: '0px',
                                    }}
                                  >
                                    <TaskCard
                                      task={task}
                                      employee={{
                                        name: emp.name,
                                        avatar: emp.avatar,
                                      }}
                                    />
                                    <Trash2
                                      size={19}
                                      className="absolute top-4 right-3 cursor-pointer text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      onClick={() => handleDeleteClick(task)}
                                    />
                                    <Pencil
                                      size={19}
                                      className="absolute top-10 right-3 cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      onClick={() => onEditTask(task)}
                                    />
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground  ">
          <p className="text-start  w-1/2  ">
            {' '}
            No tasks scheduled for {employee && dateRange.length > 1 ? 'this week' : 'today'}
          </p>
        </div>
      )}
      {selectedTaskToDelete && (
        <ConfirmDeleteModal
          open={showDeleteModal}
          onConfirm={() => onDeleteTask(selectedTaskToDelete)}
          onCancel={() => setShowDeleteModal(false)}
          taskName={selectedTaskToDelete.title}
        />
      )}
    </div>
  )
}

export default TaskTimeline

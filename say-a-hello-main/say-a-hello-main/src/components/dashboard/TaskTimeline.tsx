import React, { useEffect, useState } from 'react'
import { Department, Employee, Task } from '@/pages/Dashboard'
import Stopwatch from '@/components/dashboard/Stopwatch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, isSameDay, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import TaskCard from './TaskCard'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'
import * as Dialog from '@radix-ui/react-dialog'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { Pencil, Trash2 } from 'lucide-react'

interface TaskTimelineProps {
  department: Department | null
  employee: Employee | null
  currentDate: Date
  onDateSelect?: (date: Date) => void
  onEditTask: (task: Task) => void
}

const TaskTimeline: React.FC<TaskTimelineProps> = ({
  department,
  employee,
  currentDate,
  onDateSelect,
  onEditTask,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date()) // Add this state
  const [Tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTaskToDelete, setSelectedTaskToDelete] = useState<Task | null>(null)
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

  const confirmDelete = async () => {
    if (!selectedTaskToDelete) return
    const taskId = selectedTaskToDelete.id

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://tasks-service.5d-dev.com/api/Tasks/DeleteTask/${taskId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify(taskId),
        },
      )

      if (!response.ok) throw new Error('Failed to delete task')

      // Optional: close the modal before refresh
      setShowDeleteModal(false)

      // Hard refresh the page
      window.location.reload()
    } catch (err) {
      setError((err as Error).message)
      console.error('Delete error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const response = await fetch(
        'http://tasks-service.5d-dev.com/api/Tasks/GetAllTasks?' +
          new URLSearchParams({
            timestamp: Date.now().toString(),
          }),
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

  // Get the date range - today only or full week based on selection
  const getDateRange = () => {
    if (!department) return [currentDate]

    if (employee) {
      // For an employee, show the full week
      return eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
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

  // Get title based on selection
  const getTitle = () => {
    if (!department) return 'All Tasks'
    if (employee) {
      return dateRange.length > 1 ? (
        <div className="flex items-center gap-3">
          {' '}
          <div className=" flex items-center bg-background rounded-full pl-1 pr-3 py-1 border border-border">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <img src="https://placehold.co/30x30" alt={employee.name} />
            </Avatar>
            <span className="text-xs font-medium">{employee.name}</span>
            <span className="ml-1 text-xs text-muted-foreground"></span>
          </div>
          <p className="ml-1 text-sm text-muted-foreground">{employee.name}'s Tasks</p>
        </div>
      ) : (
        `${employee.name}'s Tasks Today`
      )
    }
    return `${department.name} - Today's Tasks`
  }
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
    <div className="relative w-full  p-4 overflow-auto" style={{ minHeight: '100vh' }}>
      <div className="flex mb-4 justify-between items-center">
        <h2 className="text-xl font-semibold">{getTitle()}</h2>
        <div className="text-sm text-muted-foreground">
          {employee && dateRange.length > 1
            ? `Week of ${format(dateRange[0], 'MMM d')} - ${format(dateRange[dateRange.length - 1], 'MMM d, yyyy')}`
            : format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Show employees with tasks today when viewing a department */}
      {!employee && department && employeesWithTasksToday.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 p-2 bg-muted/10 rounded-lg">
          <div className="w-full text-sm font-medium mb-1 pl-2">Employees with tasks today:</div>
          <div className="flex gap-2   w-full">
            {employeesWithTasksToday.map((emp) => (
              <div
                key={emp.id}
                className=" flex items-center bg-background rounded-full pl-1 pr-3 py-1 border border-border"
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={emp.avatar} alt={emp.name} />
                  <AvatarFallback>
                    <img src="https://placehold.co/30x30" alt={emp.name} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{emp.name}</span>
                <span className="ml-1 text-xs text-muted-foreground"></span>
              </div>
            ))}
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
                  className={`flex-1 p-2 text-center font-medium cursor-pointer ${
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
                    <div key={dateIndex} className="flex-1 relative h-full ">
                      {tasks
                        .filter((task) => isSameDay(new Date(task.date), date))
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
                                left: '4px',
                                right: '4px',
                                height: `${heightInMinutes}px`,
                                minHeight: '40px',
                                maxHeight: '200px',
                                width: '180px',
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
                                onClick={() => onEditTask(task.id)}
                              />
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              ) : (
                // Day view layout - now used for both single employee day view and department view
                <div className="relative h-full w-full">
                  {(() => {
                    function getTimePosition(timeString: string): number {
                      if (!timeString) return 0
                      const hourHeight = 96 // height of 1 hour
                      const startHour = 10 // calendar starts at 10 AM

                      // Split into time and modifier (AM/PM)
                      const [time, modifier] = timeString.trim().split(' ')
                      const [hoursStr, minutesStr] = time.split(':')

                      let hours = parseInt(hoursStr)
                      const minutes = parseInt(minutesStr || '0')

                      // Convert to 24-hour format
                      if (modifier) {
                        if (modifier.toLowerCase() === 'pm' && hours !== 12) {
                          hours += 12
                        } else if (modifier.toLowerCase() === 'am' && hours === 12) {
                          hours = 0
                        }
                      }

                      // Calculate total minutes from start of day (10 AM)
                      const totalMinutes = hours * 60 + minutes - startHour * 60
                      const pixelsPerMinute = hourHeight / 60

                      return Math.max(0, totalMinutes * pixelsPerMinute)
                    }
                    function getMinutes(timeString: string): number {
                      if (!timeString) return 0

                      const [time, modifier] = timeString.trim().split(' ')
                      const [hoursStr, minutesStr] = time.split(':')

                      let hours = parseInt(hoursStr)
                      const minutes = parseInt(minutesStr || '0')

                      // Convert to 24-hour format
                      if (modifier) {
                        if (modifier.toLowerCase() === 'pm' && hours !== 12) {
                          hours += 12
                        } else if (modifier.toLowerCase() === 'am' && hours === 12) {
                          hours = 0
                        }
                      }

                      return hours * 60 + minutes
                    }

                    // Group tasks by employee first
                    const tasksByEmployee: Record<string, any[]> = {}
                    tasks.forEach((task) => {
                      const empName = task.employeeName || employee?.name || 'default'
                      if (!tasksByEmployee[empName]) {
                        tasksByEmployee[empName] = []
                      }
                      tasksByEmployee[empName].push(task)
                    })

                    // Process each employee's tasks separately
                    const allPositionedTasks: any[] = []
                    Object.values(tasksByEmployee).forEach((employeeTasks) => {
                      // Sort tasks by start time
                      const sortedTasks = [...employeeTasks].sort(
                        (a, b) => getMinutes(a.time) - getMinutes(b.time),
                      )

                      const columns: any[][] = [[]]

                      sortedTasks.forEach((task) => {
                        let placed = false

                        // Try to place in existing column
                        for (const column of columns) {
                          const lastTask = column[column.length - 1]
                          if (
                            !lastTask ||
                            getMinutes(lastTask.endTime || '12:00 AM') <= getMinutes(task.time)
                          ) {
                            column.push(task)
                            placed = true
                            break
                          }
                        }

                        // If couldn't place, create new column
                        if (!placed) {
                          columns.push([task])
                        }
                      })

                      // Add column metadata to each task
                      columns.forEach((column, columnIndex) => {
                        column.forEach((task) => {
                          allPositionedTasks.push({
                            ...task,
                            columnCount: columns.length,
                            columnIndex,
                            employeeColumnOffset: Object.keys(tasksByEmployee).indexOf(
                              task.employeeName || employee?.name || 'default',
                            ),
                          })
                        })
                      })
                    })

                    // Calculate maximum columns across all employees
                    const maxColumns = Math.max(
                      ...Object.values(tasksByEmployee).map((tasks) => {
                        const sorted = [...tasks].sort(
                          (a, b) => getMinutes(a.time) - getMinutes(b.time),
                        )
                        let columns: any[][] = [[]]
                        sorted.forEach((task) => {
                          let placed = false
                          for (const column of columns) {
                            const lastTask = column[column.length - 1]
                            if (
                              !lastTask ||
                              getMinutes(lastTask.endTime || '12:00 AM') <= getMinutes(task.time)
                            ) {
                              column.push(task)
                              placed = true
                              break
                            }
                          }
                          if (!placed) columns.push([task])
                        })
                        return columns.length
                      }),
                      1,
                    )

                    return allPositionedTasks.map((task: any, index: number) => {
                      // Calculate vertical position based on time
                      const top = getTimePosition(task.time)

                      // Calculate duration in minutes
                      const startMinutes = getMinutes(task.time)
                      const endMinutes = getMinutes(task.endTime || '12:00 AM')
                      const duration = Math.max(endMinutes - startMinutes, 30) // Minimum 30 minutes

                      // Calculate width and position with safe margins
                      const totalColumns = maxColumns
                      const columnWidth = 30 / totalColumns // Leave some margin
                      const left =
                        2 +
                        (task.employeeColumnOffset * maxColumns + task.columnIndex) *
                          (columnWidth + 1 / totalColumns)

                      return (
                        <div
                          key={index}
                          className="absolute mx-1 group TaskCard"
                          style={{
                            top: `${top}px`,
                            left: `${left}%`,
                            width: `${columnWidth}%`,
                            height: `${duration}px`,
                            maxWidth: '400px',
                            minHeight: '40px',
                            padding: '0 4px',
                            boxSizing: 'border-box',
                            zIndex: task.columnIndex + 1,
                            minWidth: '200px',
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
                            className="absolute top-10 right-3 cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => handleDeleteClick(task)}
                          />
                          <Pencil
                            size={19}
                            className="absolute   right-3   top-10 cursor-pointer text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => onEditTask(task.id)}
                          />
                        </div>
                      )
                    })
                  })()}
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
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          taskName={selectedTaskToDelete.title}
        />
      )}
    </div>
  )
}

export default TaskTimeline

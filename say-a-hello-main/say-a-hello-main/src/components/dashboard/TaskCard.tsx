import React, { useState } from 'react'
import { Employee, Task } from '@/pages/Dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquareX, User, X } from 'lucide-react'

const TaskCard: React.FC<{
  task: Task
  employee: any
  handleViewDetails?: (task: Task) => void
}> = ({ task, employee, handleViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false)

  const getBgColor = () => {
    switch (task.color) {
      case 'red':
        return 'bg-red-100'
      case 'green':
        return 'bg-green-100'
      case 'blue':
        return 'bg-blue-100'
      default:
        return 'bg-gray-100'
    }
  }
  const handleClick = () => {
    if (handleViewDetails) {
      handleViewDetails(task)
    }
  }
  return (
    <>
      <div>
        <div
          className={` rounded-md p-3 mb-3 cursor-pointer h-[7rem]  TaskCard ${getBgColor()}`}
          onClick={handleClick}
        >
          <div className="flex items-center gap-3">
            {' '}
            {employee ? (
              <div className="flex align-center ">
                {' '}
                <Avatar className="h-6 w-6 mr-2 mb-2">
                  <AvatarImage src={employee.avatar} alt={employee.name} />
                  <AvatarFallback>
                    <img src="https://placehold.co/30x30" alt={employee.name} />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{employee.name}</span>
              </div>
            ) : (
              <div className="flex align-center">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <User size={14} />
                </div>
                <span className="text-xs font-medium">{employee?.name} </span>
              </div>
            )}
          </div>{' '}
          <div className="text-sm font-medium">{task.title}</div>
          <div className="text-xs mt-1">{task.time}</div>
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex mt-2">
              {task.assignees.map((assignee, index) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center -ml-1 first:ml-0 border border-white text-xs font-medium"
                  style={{ zIndex: 10 - index }}
                >
                  {assignee.avatar ? (
                    <img
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    assignee.name.substring(0, 1)
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
export default TaskCard

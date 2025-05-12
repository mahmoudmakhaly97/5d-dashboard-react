import React, { useState } from 'react'
import { Employee, Task } from '@/pages/Dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'

const TaskCard: React.FC<{ task: Task; employee: any }> = ({ task, employee }) => {
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

  return (
    <>
      <div>
        <div
          style={{ marginLeft: '00px' }}
          className={` rounded-md p-3 mb-3 cursor-pointer ${getBgColor()}`}
          onClick={() => setIsOpen(true)}
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

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  {task.time} {task.endTime ? `- ${task.endTime}` : ''}
                </span>
                <span>{format(task.date, 'EEE, MMM d')}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {task.description && <p className="text-sm mb-4">{task.description}</p>}

              {task.assignees && task.assignees.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Assignees:</div>
                  <div className="flex">
                    {task.assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center -ml-1 first:ml-0 border border-white text-sm font-medium"
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
                </div>
              )}

              <button
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md w-full"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
export default TaskCard

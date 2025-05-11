
import React from "react";
import { Employee } from "@/pages/Dashboard";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  selectedEmployee: Employee | null;
  onSelectEmployee: (employee: Employee | null) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  selectedEmployee,
  onSelectEmployee 
}) => {
  return (
    <div className="space-y-2">
      <div 
        className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${!selectedEmployee ? 'bg-accent text-accent-foreground' : ''}`}
        onClick={() => onSelectEmployee(null)}
      >
        <User size={16} className="mr-2" />
        <span className="font-medium">All Employees</span>
      </div>

      {employees.map(employee => (
        <div
          key={employee.id}
          className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${selectedEmployee?.id === employee.id ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => onSelectEmployee(employee)}
        >
          {employee.avatar ? (
            <img src={employee.avatar} alt={employee.name} className="w-6 h-6 rounded-full mr-2" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <User size={14} />
            </div>
          )}
          <div className="truncate">
            <div className="font-medium">{employee.name}</div>
            <div className="text-xs text-muted-foreground">{employee.position}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;

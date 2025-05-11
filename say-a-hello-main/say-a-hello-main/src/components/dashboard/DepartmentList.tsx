
import React from "react";
import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { Users } from "lucide-react";
import { Department } from "@/pages/Dashboard";

interface DepartmentListProps {
  departments: Department[];
  selectedDepartment: Department | null;
  onSelectDepartment: (department: Department) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({ 
  departments, 
  selectedDepartment, 
  onSelectDepartment 
}) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>All Departments</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {departments.map((department) => (
            <SidebarMenuItem key={department.id}>
              <SidebarMenuButton 
                isActive={selectedDepartment?.id === department.id}
                onClick={() => onSelectDepartment(department)}
              >
                <Users />
                <span>{department.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default DepartmentList;

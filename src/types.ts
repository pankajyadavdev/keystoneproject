export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low'
export type WorkStatus = 'New' | 'Assigned' | 'In progress' | 'On hold' | 'Completed'

export type WorkOrder = {
  id: string
  reference: string
  title: string
  category: string
  priority: Priority
  status: WorkStatus
  building: string
  unit: string
  requester: string
  assignedTo: string
  createdAt: string
  dueAt: string
  description: string
}

export type Technician = {
  name: string
  role: string
  initials: string
  color: string
  status: 'Available' | 'On job' | 'Off duty'
  jobs: number
}

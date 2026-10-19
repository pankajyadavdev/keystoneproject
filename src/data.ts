import type { Technician, WorkOrder } from './types'

const today = new Date()
const isoAt = (daysFromToday: number, hour: number) => {
  const date = new Date(today)
  date.setDate(today.getDate() + daysFromToday)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export const initialOrders: WorkOrder[] = [
  { id: 'wo-2481', reference: 'WO-2481', title: 'Water leak in kitchen ceiling', category: 'Plumbing', priority: 'Urgent', status: 'In progress', building: 'Tower A', unit: 'A-1204', requester: 'Meera Kapoor', assignedTo: 'Rohan Mehta', createdAt: isoAt(0, 8), dueAt: isoAt(0, 16), description: 'Water is dripping from the kitchen ceiling near the exhaust. Resident has shut off the sink supply.' },
  { id: 'wo-2480', reference: 'WO-2480', title: 'Lift B making unusual noise', category: 'Elevator', priority: 'High', status: 'Assigned', building: 'Tower B', unit: 'Common area', requester: 'Security desk', assignedTo: 'Sanjay Rao', createdAt: isoAt(0, 7), dueAt: isoAt(0, 18), description: 'A rattling sound is coming from Lift B between floors 8 and 10.' },
  { id: 'wo-2479', reference: 'WO-2479', title: 'Replace corridor light fixtures', category: 'Electrical', priority: 'Medium', status: 'New', building: 'Tower C', unit: 'Floor 6', requester: 'Anita Desai', assignedTo: 'Unassigned', createdAt: isoAt(-1, 14), dueAt: isoAt(1, 17), description: 'Two lights outside apartment C-604 are not working.' },
  { id: 'wo-2478', reference: 'WO-2478', title: 'Pool filtration system check', category: 'Facilities', priority: 'Low', status: 'On hold', building: 'Clubhouse', unit: 'Pool deck', requester: 'Facilities team', assignedTo: 'Amit Shah', createdAt: isoAt(-2, 11), dueAt: isoAt(2, 12), description: 'Monthly check. Waiting for the replacement filter cartridge to arrive.' },
  { id: 'wo-2477', reference: 'WO-2477', title: 'Pest treatment — pantry', category: 'Pest control', priority: 'High', status: 'Completed', building: 'Tower A', unit: 'A-0803', requester: 'Nikhil Sharma', assignedTo: 'Farah Khan', createdAt: isoAt(-2, 9), dueAt: isoAt(-1, 18), description: 'Ants reported near the kitchen pantry. Resident requested an evening visit.' },
  { id: 'wo-2476', reference: 'WO-2476', title: 'Generator room inspection', category: 'Electrical', priority: 'Medium', status: 'In progress', building: 'Utility block', unit: 'Basement', requester: 'Operations', assignedTo: 'Kiran Patel', createdAt: isoAt(-1, 8), dueAt: isoAt(0, 19), description: 'Quarterly generator room inspection and load test.' },
]

export const technicians: Technician[] = [
  { name: 'Rohan Mehta', role: 'Plumbing', initials: 'RM', color: 'sage', status: 'On job', jobs: 3 },
  { name: 'Sanjay Rao', role: 'Elevator & HVAC', initials: 'SR', color: 'blue', status: 'On job', jobs: 2 },
  { name: 'Farah Khan', role: 'Electrical', initials: 'FK', color: 'rose', status: 'Available', jobs: 1 },
  { name: 'Amit Shah', role: 'Facilities', initials: 'AS', color: 'amber', status: 'Available', jobs: 2 },
  { name: 'Kiran Patel', role: 'Electrical', initials: 'KP', color: 'blue', status: 'On job', jobs: 2 },
]

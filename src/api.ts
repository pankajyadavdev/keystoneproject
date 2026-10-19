import { initialOrders } from './data'
import type { WorkOrder, WorkStatus } from './types'

const STORAGE_KEY = 'keystone.work-orders.v1'
const API = '/api/work-orders'

function readLocal(): WorkOrder[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as WorkOrder[] : initialOrders
  } catch {
    return initialOrders
  }
}

function saveLocal(orders: WorkOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('keystone.token')
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  })
  if (!response.ok) throw new Error(`API ${response.status}`)
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    const orders = await fetchApi<WorkOrder[]>(API)
    saveLocal(orders)
    return orders
  } catch {
    return readLocal()
  }
}

export async function createWorkOrder(order: Omit<WorkOrder, 'id' | 'reference' | 'createdAt'>): Promise<WorkOrder> {
  const localOrders = readLocal()
  const nextNumber = Math.max(2481, ...localOrders.map((item) => Number(item.reference.replace('WO-', '')) || 0)) + 1
  const localOrder: WorkOrder = { ...order, id: `wo-${nextNumber}`, reference: `WO-${nextNumber}`, createdAt: new Date().toISOString() }
  try {
    const created = await fetchApi<WorkOrder>(API, { method: 'POST', body: JSON.stringify(order) })
    saveLocal([created, ...localOrders])
    return created
  } catch {
    saveLocal([localOrder, ...localOrders])
    return localOrder
  }
}

export async function changeWorkStatus(order: WorkOrder, status: WorkStatus): Promise<WorkOrder> {
  const updated = { ...order, status }
  try {
    const result = await fetchApi<WorkOrder>(`${API}/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    const orders = readLocal().map((item) => item.id === order.id ? result : item)
    saveLocal(orders)
    return result
  } catch {
    saveLocal(readLocal().map((item) => item.id === order.id ? updated : item))
    return updated
  }
}

export async function assignWorkOrder(order: WorkOrder, assignedTo: string): Promise<WorkOrder> {
  const updated = { ...order, assignedTo, status: order.status === 'New' ? 'Assigned' as const : order.status }
  try {
    const result = await fetchApi<WorkOrder>(`${API}/${order.id}/assignment`, { method: 'PATCH', body: JSON.stringify({ assignedTo }) })
    saveLocal(readLocal().map((item) => item.id === order.id ? result : item))
    return result
  } catch {
    saveLocal(readLocal().map((item) => item.id === order.id ? updated : item))
    return updated
  }
}

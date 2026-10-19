import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Clock3, Filter,
  LayoutDashboard, MapPin, Menu, MoreHorizontal, Plus, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Users, Wrench, X,
} from 'lucide-react'
import { assignWorkOrder, changeWorkStatus, createWorkOrder, getWorkOrders } from './api'
import { technicians } from './data'
import type { Priority, WorkOrder, WorkStatus } from './types'

type Section = 'Overview' | 'Work orders' | 'Service requests' | 'Residents' | 'Technicians' | 'Assets' | 'Reports'
type TextSize = 'standard' | 'large'

const navItems: { label: Section; icon: typeof LayoutDashboard; count?: string }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Work orders', icon: ClipboardList, count: '24' },
  { label: 'Service requests', icon: Activity, count: '8' },
  { label: 'Residents', icon: Users },
  { label: 'Technicians', icon: Wrench },
  { label: 'Assets', icon: Settings2 },
  { label: 'Reports', icon: CalendarDays },
]

const categories = [
  { name: 'Plumbing', count: 34, color: '#5e8a76' },
  { name: 'Electrical', count: 26, color: '#d8a34e' },
  { name: 'Elevator', count: 19, color: '#7c91a8' },
  { name: 'Facilities', count: 14, color: '#ba7861' },
]

function App() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [section, setSection] = useState<Section>('Overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [priorityFilter, setPriorityFilter] = useState('All priorities')
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [textSize, setTextSize] = useState<TextSize>(() => localStorage.getItem('keystone.textSize') === 'standard' ? 'standard' : 'large')
  const [isConnected, setIsConnected] = useState(() => Boolean(localStorage.getItem('keystone.token')))
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => { void getWorkOrders().then(setOrders) }, [])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2800)
    return () => window.clearTimeout(timer)
  }, [notice])

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = search.trim().toLowerCase()
    const matchesQuery = !query || [order.reference, order.title, order.category, order.building, order.unit, order.requester, order.assignedTo].some((value) => value.toLowerCase().includes(query))
    const matchesStatus = statusFilter === 'All statuses' || order.status === statusFilter
    const matchesPriority = priorityFilter === 'All priorities' || order.priority === priorityFilter
    return matchesQuery && matchesStatus && matchesPriority
  }), [orders, search, statusFilter, priorityFilter])

  const openOrders = orders.filter((item) => item.status !== 'Completed').length
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)
  const dueToday = orders.filter((item) => item.status !== 'Completed' && new Date(item.dueAt) >= dayStart && new Date(item.dueAt) < dayEnd).length
  const dueWithinHour = orders.filter((item) => item.status !== 'Completed' && new Date(item.dueAt) >= new Date() && new Date(item.dueAt) <= new Date(Date.now() + 60 * 60 * 1000)).length

  async function handleCreate(values: Omit<WorkOrder, 'id' | 'reference' | 'createdAt'>) {
    const order = await createWorkOrder(values)
    setOrders((current) => [order, ...current])
    setModalOpen(false)
    setNotice(`${order.reference} created and added to the dispatch queue`)
  }

  async function handleStatusChange(order: WorkOrder, status: WorkStatus) {
    const updated = await changeWorkStatus(order, status)
    setOrders((current) => current.map((item) => item.id === order.id ? updated : item))
    setSelectedOrder(updated)
    setNotice(`${order.reference} moved to ${status.toLowerCase()}`)
  }

  async function handleAssign(order: WorkOrder, assignedTo: string) {
    const updated = await assignWorkOrder(order, assignedTo)
    setOrders((current) => current.map((item) => item.id === order.id ? updated : item))
    setSelectedOrder(updated)
    setNotice(`${order.reference} assigned to ${assignedTo}`)
  }

  const currentDate = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="app-shell" data-text-size={textSize}>
      {mobileNav && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span /><span /><span /></div>
          <div><div className="brand-name">keystone<span>.</span></div><div className="brand-caption">SOCIETY OPERATIONS</div></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <button className="society-switcher">
          <div className="society-avatar">M</div>
          <div className="society-copy"><strong>Maple Grove</strong><span>Residential society</span></div>
          <ChevronDown size={15} className="muted-icon" />
        </button>
        <div className="nav-heading">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
              {navItems.map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-link ${section === label ? 'active' : ''}`} onClick={() => { setSection(label); setMobileNav(false) }}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-count">{label === 'Work orders' ? openOrders : count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-help-card">
          <div className="help-icon"><ShieldCheck size={17} /></div>
          <strong>Everything in order?</strong>
          <p>Your weekly operations report is ready.</p>
          <button onClick={() => setSection('Reports')}>View report <ArrowRight size={14} /></button>
          <div className="help-orbit orbit-one" /><div className="help-orbit orbit-two" />
        </div>
        <button className="nav-link settings-link" onClick={() => { setSettingsOpen(true); setMobileNav(false) }}><Settings2 size={18} strokeWidth={1.8} /><span>Settings</span></button>
        <button className="sidebar-user" onClick={() => setAuthOpen(true)} title="Connect to the KEYSTONE API">
          <div className="user-avatar">AK</div><div className="user-copy"><strong>Aarav Khanna</strong><span>{isConnected ? 'API connected' : 'Society manager · local'}</span></div><MoreHorizontal size={18} className="muted-icon" />
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Maple Grove</span><ChevronRight size={14} /><strong>{section}</strong></div>
          <div className="topbar-actions">
            <div className="global-search"><Search size={16} /><input aria-label="Search" placeholder="Search anything..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></div>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice('You are all caught up')}><Bell size={18} /><i /></button>
            <div className="topbar-divider" />
            <div className="topbar-date"><CalendarDays size={15} /><span>{currentDate}</span></div>
          </div>
        </header>

        <div className="page-content">
          {section === 'Overview' || section === 'Work orders' || section === 'Service requests' ? (
            <>
              <div className="page-heading-row">
                <div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR OPERATIONS AT A GLANCE</div><h1>{section === 'Overview' ? <>Good morning, Aarav <span className="wave">✳</span></> : section}</h1><p className="page-subtitle">Here’s what’s happening across Maple Grove today.</p></div>
                <button className="primary-button" onClick={() => setModalOpen(true)}><Plus size={17} strokeWidth={2.4} /> New work order</button>
              </div>
              <section className="metrics-grid" aria-label="Operations summary">
                <MetricCard label="Open work orders" value={String(openOrders).padStart(2, '0')} trend="12%" trendUp helper="vs. last month" icon={<ClipboardList size={18} />} accent="green" />
                <MetricCard label="SLA due today" value={String(dueToday).padStart(2, '0')} trend="Needs attention" helper={`${dueWithinHour} due in the next hour`} icon={<Clock3 size={18} />} accent="amber" alert />
                <MetricCard label="Technicians on duty" value="12 / 15" trend="80% capacity" helper="3 currently available" icon={<Users size={18} />} accent="blue" />
                <MetricCard label="Completed this month" value="186" trend="8.4%" trendUp helper="vs. last month" icon={<Check size={18} />} accent="violet" />
              </section>

              <section className="insight-banner">
                <div className="insight-symbol"><Sparkles size={18} /></div><div className="insight-copy"><strong>Looking good this week</strong><span>First response time is down <b>18%</b> across your community. Nice work keeping things moving.</span></div><div className="insight-metric"><span>AVG. RESPONSE TIME</span><strong>1h 24m <ArrowDownRight size={15} /></strong></div><button className="banner-close" onClick={(event) => event.currentTarget.parentElement?.remove()} aria-label="Dismiss insight"><X size={17} /></button>
              </section>

              <div className="content-grid">
                <section className="panel work-orders-panel">
                  <div className="panel-heading">
                    <div><div className="panel-title-row"><h2>{section === 'Service requests' ? 'Recent service requests' : 'Recent work orders'}</h2><span className="soft-count">{filteredOrders.length}</span></div><p>Track and manage your community’s maintenance work.</p></div>
                    <button className="text-button" onClick={() => setSection('Work orders')}>View all <ArrowRight size={15} /></button>
                  </div>
                  <div className="table-toolbar">
                    <div className="table-tabs"><button className="selected-tab">All work <span>{orders.length}</span></button><button onClick={() => setStatusFilter('New')}>Unassigned <span>{orders.filter((item) => item.status === 'New').length}</span></button><button onClick={() => setStatusFilter('In progress')}>In progress</button></div>
                    <div className="table-tools"><div className="inline-search"><Search size={15} /><input placeholder="Search orders" aria-label="Search orders" value={search} onChange={(event) => setSearch(event.target.value)} /></div><button className={`tool-button ${showFilters ? 'tool-active' : ''}`} aria-label="Filter orders" onClick={() => setShowFilters((current) => !current)}><SlidersHorizontal size={16} /> <span>Filter</span>{(statusFilter !== 'All statuses' || priorityFilter !== 'All priorities') && <i />}</button></div>
                  </div>
                  {showFilters && <div className="filter-row"><span><Filter size={14} /> Filters</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All statuses</option><option>New</option><option>Assigned</option><option>In progress</option><option>On hold</option><option>Completed</option></select><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>All priorities</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option></select><button onClick={() => { setStatusFilter('All statuses'); setPriorityFilter('All priorities') }}>Clear</button></div>}
                  <div className="table-scroll"><table className="orders-table"><thead><tr><th>WORK ORDER</th><th>LOCATION</th><th>PRIORITY</th><th>STATUS</th><th>ASSIGNED TO</th><th aria-label="Open" /></tr></thead><tbody>
                    {filteredOrders.slice(0, 6).map((order) => <WorkOrderRow key={order.id} order={order} onClick={() => setSelectedOrder(order)} />)}
                    {filteredOrders.length === 0 && <tr><td colSpan={6} className="empty-state"><Search size={19} /><strong>No matching work orders</strong><span>Try adjusting your search or filters.</span></td></tr>}
                  </tbody></table></div>
                  <div className="table-footer"><span>Showing <strong>{Math.min(filteredOrders.length, 6)}</strong> of <strong>{filteredOrders.length}</strong> work orders</span><div><button className="pagination-button" aria-label="Previous page" disabled><ChevronLeft size={16} /></button><button className="pagination-button current-page">1</button><button className="pagination-button" aria-label="Next page" disabled><ChevronRight size={16} /></button></div></div>
                </section>

                <div className="right-column">
                  <section className="panel team-panel">
                    <div className="panel-heading compact-heading"><div><h2>Team on the move</h2><p>Live technician availability</p></div><button className="icon-button subtle-icon" aria-label="Team options"><MoreHorizontal size={19} /></button></div>
                    <div className="team-summary"><div className="team-avatars">{technicians.slice(0, 3).map((person) => <span key={person.name} className={`mini-avatar ${person.color}`}>{person.initials}</span>)}<span className="more-avatars">+9</span></div><div><strong>12 of 15</strong><span> technicians active</span></div><div className="availability"><i /> Live</div></div>
                    <div className="technician-list">{technicians.map((person) => <div className="technician-row" key={person.name}><div className={`person-avatar ${person.color}`}>{person.initials}</div><div className="technician-details"><strong>{person.name}</strong><span>{person.role}</span></div><div className="technician-state"><i className={person.status === 'Available' ? 'available-dot' : 'busy-dot'} />{person.status}</div></div>)}</div>
                    <button className="full-width-link" onClick={() => setSection('Technicians')}>See all technicians <ArrowRight size={15} /></button>
                  </section>
                  <section className="panel category-panel">
                    <div className="panel-heading compact-heading"><div><h2>Requests by category</h2><p>Last 30 days</p></div><button className="period-select">30 days <ChevronDown size={13} /></button></div>
                    <div className="category-chart-row"><div className="donut-chart"><div className="donut-hole"><strong>93</strong><span>requests</span></div></div><div className="category-legend">{categories.map((category) => <div key={category.name}><i style={{ background: category.color }} /><span>{category.name}</span><strong>{category.count}</strong></div>)}</div></div>
                    <div className="category-footnote"><span className="footnote-dot" /> Plumbing requests are up <b>6%</b> this month</div>
                  </section>
                </div>
              </div>
              <div className="page-bottom-note"><MapPin size={14} /> <span>Maple Grove · 5 towers · 248 homes</span><span className="bottom-separator">·</span><span>Last synced just now</span></div>
            </>
          ) : <ComingSoon section={section} onCreate={() => setModalOpen(true)} />}
        </div>
      </main>

      {modalOpen && <NewWorkOrderModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
      {settingsOpen && <SettingsModal textSize={textSize} onTextSizeChange={(size) => { setTextSize(size); localStorage.setItem('keystone.textSize', size) }} onClose={() => setSettingsOpen(false)} />}
      {authOpen && <ConnectModal connected={isConnected} onClose={() => setAuthOpen(false)} onConnected={async (token) => { localStorage.setItem('keystone.token', token); setIsConnected(true); setOrders(await getWorkOrders()); setAuthOpen(false); setNotice('Connected to the KEYSTONE API') }} onDisconnected={() => { localStorage.removeItem('keystone.token'); setIsConnected(false); setAuthOpen(false); setNotice('API connection removed') }} />}
      {selectedOrder && <WorkOrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} onAssign={handleAssign} />}
      {notice && <div className="toast"><span className="toast-check"><Check size={14} /></span>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={14} /></button></div>}
    </div>
  )
}

function SettingsModal({ textSize, onTextSizeChange, onClose }: { textSize: TextSize; onTextSizeChange: (size: TextSize) => void; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="modal-heading"><div><div className="modal-kicker">PERSONALIZE WORKSPACE</div><h2 id="settings-title">Settings</h2><p>Adjust how KEYSTONE looks on this device.</p></div><button className="icon-button" onClick={onClose} aria-label="Close settings"><X size={19} /></button></div>
    <div className="settings-section"><div className="settings-section-copy"><strong>Display text</strong><span>Choose a comfortable reading size.</span></div><div className="settings-options" role="radiogroup" aria-label="Display text size">
      <button type="button" className={`settings-option ${textSize === 'standard' ? 'selected' : ''}`} role="radio" aria-checked={textSize === 'standard'} onClick={() => onTextSizeChange('standard')}><span className="settings-option-sample">Aa</span><span className="settings-option-copy"><strong>Standard</strong><small>Original size</small></span><span className="settings-option-check">{textSize === 'standard' && <Check size={14} />}</span></button>
      <button type="button" className={`settings-option ${textSize === 'large' ? 'selected' : ''}`} role="radio" aria-checked={textSize === 'large'} onClick={() => onTextSizeChange('large')}><span className="settings-option-sample larger">Aa</span><span className="settings-option-copy"><strong>Slightly larger</strong><small>More comfortable to read</small></span><span className="settings-option-check">{textSize === 'large' && <Check size={14} />}</span></button>
    </div></div>
    <div className="settings-footer"><span><ShieldCheck size={14} /> Saved in this browser</span><button className="primary-button" onClick={onClose}>Done</button></div>
  </section></div>
}

function MetricCard({ label, value, trend, trendUp, helper, icon, accent, alert = false }: { label: string; value: string; trend: string; trendUp?: boolean; helper: string; icon: ReactNode; accent: string; alert?: boolean }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><div className={`metric-icon ${accent}`}>{icon}</div></div><div className="metric-value-row"><strong>{value}</strong>{alert ? <span className="metric-warning"><i />{trend}</span> : <span className={`metric-trend ${trendUp ? 'up' : ''}`}>{trendUp ? <ArrowUpRight size={13} /> : null}{trend}</span>}</div><div className="metric-helper">{helper}</div></article>
}

function WorkOrderRow({ order, onClick }: { order: WorkOrder; onClick: () => void }) {
  const person = technicians.find((item) => item.name === order.assignedTo)
  return <tr className="order-row" onClick={onClick} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') onClick() }}>
    <td><div className="order-title-cell"><span className={`category-mark ${order.category.toLowerCase().replaceAll(' ', '-')}`}><Wrench size={14} /></span><div><strong>{order.title}</strong><span>{order.reference}<i />{order.category}</span></div></div></td>
    <td><div className="location-cell"><strong>{order.building}</strong><span>{order.unit}</span></div></td>
    <td><span className={`priority-badge ${order.priority.toLowerCase()}`}><i />{order.priority}</span></td>
    <td><span className={`status-badge ${order.status.toLowerCase().replaceAll(' ', '-')}`}><i />{order.status}</span></td>
    <td>{order.assignedTo === 'Unassigned' ? <span className="unassigned">— Unassigned</span> : <div className="assignee"><span className={`assignee-avatar ${person?.color ?? 'sage'}`}>{person?.initials ?? order.assignedTo.slice(0, 2).toUpperCase()}</span>{order.assignedTo.split(' ')[0]}</div>}</td>
    <td><button className="row-arrow" aria-label={`Open ${order.reference}`} onClick={(event) => { event.stopPropagation(); onClick() }}><ArrowRight size={15} /></button></td>
  </tr>
}

function NewWorkOrderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (values: Omit<WorkOrder, 'id' | 'reference' | 'createdAt'>) => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Plumbing')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [building, setBuilding] = useState('Tower A')
  const [unit, setUnit] = useState('')
  const [requester, setRequester] = useState('')
  const [assignedTo, setAssignedTo] = useState('Unassigned')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState(() => { const date = new Date(); date.setDate(date.getDate() + 1); date.setHours(18, 0, 0, 0); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim() || !requester.trim()) return
    onCreate({ title: title.trim(), category, priority, status: assignedTo === 'Unassigned' ? 'New' : 'Assigned', building, unit: unit.trim() || 'Common area', requester: requester.trim(), assignedTo, dueAt: new Date(dueAt).toISOString(), description: description.trim() || 'No additional details provided.' })
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="modal-kicker">MAPLE GROVE · MAINTENANCE</div><h2 id="modal-title">Create work order</h2><p>Log a request and get the right person on it.</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div>
    <form onSubmit={submit}><label className="form-field full-field"><span>What needs attention? <b>*</b></span><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Water leak in kitchen ceiling" /></label>
      <div className="form-grid"><label className="form-field"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{['Plumbing', 'Electrical', 'Elevator', 'Facilities', 'Pest control', 'Security', 'Cleaning', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Priority</span><select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{['Low', 'Medium', 'High', 'Urgent'].map((item) => <option key={item}>{item}</option>)}</select></label></div>
      <label className="form-field full-field"><span>SLA due</span><input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
      <div className="form-grid"><label className="form-field"><span>Building</span><select value={building} onChange={(event) => setBuilding(event.target.value)}>{['Tower A', 'Tower B', 'Tower C', 'Tower D', 'Clubhouse', 'Utility block', 'Grounds'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Unit / area</span><input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="e.g. A-1204 or Lobby" /></label></div>
      <div className="form-grid"><label className="form-field"><span>Requested by <b>*</b></span><input required value={requester} onChange={(event) => setRequester(event.target.value)} placeholder="Resident or staff name" /></label><label className="form-field"><span>Assign technician</span><select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}><option>Unassigned</option>{technicians.map((person) => <option key={person.name}>{person.name}</option>)}</select></label></div>
      <label className="form-field full-field"><span>Details</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add useful details for the technician..." rows={3} /></label>
      <div className="modal-footer"><span><ShieldCheck size={14} /> SLA will be set based on priority</span><div><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} /> Create work order</button></div></div>
    </form></section></div>
}

function ConnectModal({ connected, onClose, onConnected, onDisconnected }: { connected: boolean; onClose: () => void; onConnected: (token: string) => void | Promise<void>; onDisconnected: () => void }) {
  const [username, setUsername] = useState('manager@maplegrove.in')
  const [password, setPassword] = useState('maple-grove-2026')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
      if (!response.ok) throw new Error(response.status === 401 ? 'Email or password is incorrect.' : 'Could not reach the API. Start the backend and try again.')
      const result = await response.json() as { token: string }
      await onConnected(result.token)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not connect to the API.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal-card connect-card" role="dialog" aria-modal="true" aria-labelledby="connect-title"><div className="modal-heading"><div><div className="modal-kicker">SECURE API CONNECTION</div><h2 id="connect-title">{connected ? 'API connection' : 'Connect your workspace'}</h2><p>{connected ? 'Your work orders are syncing with PostgreSQL.' : 'Sign in to sync work orders with your KEYSTONE API.'}</p></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div>
    {connected ? <div className="connected-state"><span><ShieldCheck size={18} /></span><div><strong>Connected as society manager</strong><p>Your token is stored in this browser for API requests.</p></div><button className="secondary-button" onClick={onDisconnected}>Disconnect</button></div> : <form onSubmit={submit}><label className="form-field full-field"><span>Email</span><input type="email" required value={username} onChange={(event) => setUsername(event.target.value)} /></label><label className="form-field full-field"><span>Password</span><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <div className="auth-error"><AlertCircle size={14} />{error}</div>}<div className="modal-footer"><span><ShieldCheck size={14} /> Local demo credentials are prefilled</span><div><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={busy}>{busy ? 'Connecting…' : 'Connect API'}</button></div></div></form>}</section></div>
}

function WorkOrderDrawer({ order, onClose, onStatusChange, onAssign }: { order: WorkOrder; onClose: () => void; onStatusChange: (order: WorkOrder, status: WorkStatus) => void; onAssign: (order: WorkOrder, assignedTo: string) => void }) {
  return <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="order-drawer" role="dialog" aria-modal="true" aria-label={`Work order ${order.reference}`}><div className="drawer-top"><span className="drawer-reference">{order.reference}</span><button className="icon-button" onClick={onClose} aria-label="Close details"><X size={19} /></button></div><div className="drawer-title-row"><div><span className={`category-mark large ${order.category.toLowerCase().replaceAll(' ', '-')}`}><Wrench size={17} /></span><span className={`priority-badge ${order.priority.toLowerCase()}`}><i />{order.priority} priority</span></div><button className="icon-button subtle-icon"><MoreHorizontal size={19} /></button></div><h2 className="drawer-title">{order.title}</h2><p className="drawer-description">{order.description}</p>
    <div className="drawer-status-card"><div><span className="field-label">CURRENT STATUS</span><span className={`status-badge ${order.status.toLowerCase().replaceAll(' ', '-')}`}><i />{order.status}</span></div><select aria-label="Change status" value={order.status} onChange={(event) => onStatusChange(order, event.target.value as WorkStatus)}>{['New', 'Assigned', 'In progress', 'On hold', 'Completed'].map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="drawer-section"><div className="field-label">WORK ORDER DETAILS</div><div className="detail-row"><span>Location</span><strong>{order.building} <i>·</i> {order.unit}</strong></div><div className="detail-row"><span>Category</span><strong>{order.category}</strong></div><div className="detail-row"><span>Requested by</span><strong>{order.requester}</strong></div><div className="detail-row"><span>Created</span><strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></div><div className="detail-row"><span>SLA due</span><strong className="due-time">{new Date(order.dueAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</strong></div></div>
    <div className="drawer-section assigned-section"><div className="field-label">ASSIGNED TECHNICIAN</div>{order.assignedTo === 'Unassigned' ? <div className="drawer-unassigned"><span>No technician assigned yet</span><select aria-label="Assign technician" value="" onChange={(event) => { if (event.target.value) onAssign(order, event.target.value) }}><option value="" disabled>Assign technician</option>{technicians.map((person) => <option key={person.name}>{person.name}</option>)}</select></div> : <div className="assigned-card"><div className={`person-avatar ${(technicians.find((item) => item.name === order.assignedTo)?.color) ?? 'sage'}`}>{technicians.find((item) => item.name === order.assignedTo)?.initials ?? order.assignedTo.slice(0, 2).toUpperCase()}</div><div><strong>{order.assignedTo}</strong><span>{technicians.find((item) => item.name === order.assignedTo)?.role ?? 'Field technician'}</span></div><select aria-label="Change assigned technician" value={order.assignedTo} onChange={(event) => onAssign(order, event.target.value)}>{technicians.map((person) => <option key={person.name}>{person.name}</option>)}</select></div>}</div>
    <div className="drawer-timeline"><div className="field-label">ACTIVITY</div><div className="timeline-entry"><span className="timeline-icon"><Plus size={13} /></span><div><strong>Work order created</strong><span>{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · {order.requester}</span></div></div>{order.status !== 'New' && <div className="timeline-entry"><span className="timeline-icon green"><Activity size={13} /></span><div><strong>Status updated to {order.status}</strong><span>Operations team · just now</span></div></div>}</div>
  </aside></div>
}

function ComingSoon({ section, onCreate }: { section: Section; onCreate: () => void }) {
  const copy: Record<Exclude<Section, 'Overview' | 'Work orders' | 'Service requests'>, { icon: typeof Users; description: string }> = {
    Residents: { icon: Users, description: 'Resident profiles and their service history will live here.' },
    Technicians: { icon: Wrench, description: 'Manage technician skills, availability, and assignments.' },
    Assets: { icon: Settings2, description: 'Keep track of shared equipment and maintenance schedules.' },
    Reports: { icon: CalendarDays, description: 'See SLA performance, request trends, and team productivity.' },
  }
  const item = copy[section as keyof typeof copy]
  const Icon = item.icon
  return <div className="coming-soon"><div className="coming-icon"><Icon size={23} /></div><div className="eyebrow"><span className="eyebrow-dot" /> MAPLE GROVE WORKSPACE</div><h1>{section}</h1><p>{item.description}</p><div className="coming-note"><AlertCircle size={16} /> This area is being prepared for your society.</div><button className="primary-button" onClick={onCreate}><Plus size={17} /> Create work order</button></div>
}

export default App

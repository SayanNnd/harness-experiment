import { useState } from 'react'
import { Check, ChevronUp, CornerDownLeft, ListTodo, Plus, Trash2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

type Priority = 'high' | 'med' | 'low'
interface Task { id: string; text: string; done: boolean; priority: Priority }
const priorities: Priority[] = ['high', 'med', 'low']
const isTasks = (value: unknown): value is Task[] => Array.isArray(value) && value.every((task: unknown) => {
  if (typeof task !== 'object' || task === null) return false
  const item = task as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.text === 'string' && item.text.trim().length > 0 && typeof item.done === 'boolean' && priorities.includes(item.priority as Priority)
})
export function Tasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('still-tasks', [], isTasks)
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<Priority>('med')
  const completed = tasks.filter(task => task.done).length
  const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || priorities.indexOf(a.priority) - priorities.indexOf(b.priority))
  return <section className="panel tasks-panel" aria-label="Task queue"><div className="panel-heading"><div className="eyebrow"><span className="section-index">02 /</span> THE NEXT SMALL THING</div><span className="task-count">{tasks.length - completed} tasks in queue</span></div>
    <div className="task-title"><div><h2>One thing worth doing.</h2><p className="panel-description">Leave it here. Give your mind a little space.</p></div><span className="completion-count"><Check size={14} />{completed}/{tasks.length} complete</span></div>
    <form className="task-form" onSubmit={event => { event.preventDefault(); if (!text.trim()) return; setTasks(old => [...old, { id: crypto.randomUUID(), text: text.trim(), done: false, priority }]); setText('') }}><Plus size={18} /><input aria-label="New task" placeholder="What are you working on?" value={text} maxLength={200} onChange={event => setText(event.target.value)} /><button type="button" className={`priority priority-${priority}`} aria-label={`New task priority: ${priority}. Click to cycle.`} onClick={() => setPriority(priorities[(priorities.indexOf(priority) + 1) % 3])}><ChevronUp size={12} />{priority}</button><button className="add-task" type="submit" aria-label="Add task"><CornerDownLeft size={16} /></button></form>
    <div className="task-list">{sorted.length ? sorted.map(task => <div className={`task-row ${task.done ? 'task-done' : ''}`} key={task.id}><button className="task-checkbox" aria-label={`${task.done ? 'Mark incomplete' : 'Complete'}: ${task.text}`} aria-pressed={task.done} onClick={() => setTasks(old => old.map(item => item.id === task.id ? { ...item, done: !item.done } : item))}>{task.done && <Check size={12} />}</button><span className="task-text">{task.text}</span><button className={`priority priority-${task.priority}`} aria-label={`Priority ${task.priority}. Click to cycle.`} onClick={() => setTasks(old => old.map(item => item.id === task.id ? { ...item, priority: priorities[(priorities.indexOf(item.priority) + 1) % 3] } : item))}><span />{task.priority}</button><button className="icon-button delete-task" aria-label={`Delete ${task.text}`} onClick={() => setTasks(old => old.filter(item => item.id !== task.id))}><Trash2 size={14} /></button></div>) : <div className="empty-tasks"><div className="empty-icon"><ListTodo size={23} strokeWidth={1.4} /></div><div><h3>A clear slate. A fresh start.</h3><p>Add your first task and make space for what matters.</p></div></div>}</div>
    <div className="task-bottom"><span><kbd>↵</kbd> to add a task</span><span>Small steps. Meaningful progress.</span></div>
  </section>
}

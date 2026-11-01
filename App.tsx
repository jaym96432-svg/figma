import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bot,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Layers3,
  ListChecks,
  Moon,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react"

type Priority = "HIGH" | "MEDIUM" | "LOW"
type Appearance = "Midnight" | "Indigo" | "Ocean"
type Category = "Assignment" | "Quiz" | "Event" | "Personal" | "Project" | "Exam" | "Other"
type Screen = "home" | "tasks" | "planner" | "add" | "profile" | "chat"

type Task = {
  id: string
  title: string
  subject: string
  category: Category
  date: string
  displayDate: string
  time: string
  priority: Priority
  completed: boolean
  overdue?: boolean
  notes?: string
  typeLabel?: string
}

type StudySession = {
  id: string
  subject: string
  day: string
  date: string
  time: string
  duration: string
  color: "violet" | "cyan" | "blue"
}

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Research Paper",
    subject: "Tourism",
    category: "Assignment",
    date: "2026-09-11",
    displayDate: "Today",
    time: "11:59 PM",
    priority: "HIGH",
    completed: false,
    notes: "Finalize citations and submit through the student portal.",
  },
  {
    id: "2",
    title: "Calculus Quiz",
    subject: "Mathematics",
    category: "Quiz",
    date: "2026-09-11",
    displayDate: "Today",
    time: "2:00 PM",
    priority: "MEDIUM",
    completed: false,
    notes: "Review chapters 4–6 and practice derivatives.",
  },
  {
    id: "3",
    title: "Tourism Seminar",
    subject: "Tourism",
    category: "Event",
    date: "2026-09-12",
    displayDate: "Tomorrow",
    time: "9:00 AM",
    priority: "LOW",
    completed: false,
  },
  {
    id: "4",
    title: "Design Case Study",
    subject: "Marketing",
    category: "Project",
    date: "2026-09-14",
    displayDate: "Mon, Sep 14",
    time: "5:00 PM",
    priority: "HIGH",
    completed: false,
  },
  {
    id: "5",
    title: "Library Book Return",
    subject: "Personal",
    category: "Personal",
    date: "2026-09-10",
    displayDate: "Yesterday",
    time: "4:00 PM",
    priority: "LOW",
    completed: true,
  },
]

const INITIAL_SESSIONS: StudySession[] = [
  {
    id: "s1",
    subject: "Mathematics",
    day: "Mon",
    date: "Sep 14",
    time: "3:00 PM",
    duration: "60 min",
    color: "cyan",
  },
  {
    id: "s2",
    subject: "Tourism",
    day: "Wed",
    date: "Sep 16",
    time: "10:30 AM",
    duration: "90 min",
    color: "violet",
  },
  {
    id: "s3",
    subject: "Marketing",
    day: "Fri",
    date: "Sep 18",
    time: "1:00 PM",
    duration: "45 min",
    color: "blue",
  },
]

const categoryIcon: Record<Category, ReactNode> = {
  Assignment: <FileText size={15} />,
  Quiz: <Zap size={15} />,
  Event: <CalendarDays size={15} />,
  Personal: <CircleUserRound size={15} />,
  Project: <Layers3 size={15} />,
  Exam: <GraduationCap size={15} />,
  Other: <MoreHorizontal size={15} />,
}

function App() {
  const [screen, setScreen] = useState<Screen>("home")
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("campuscue_tasks_v3")
    return stored ? JSON.parse(stored) : INITIAL_TASKS
  })
  const [sessions, setSessions] = useState<StudySession[]>(INITIAL_SESSIONS)
  const [query, setQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | Priority>("ALL")
  const [subjectFilter, setSubjectFilter] = useState("All subjects")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [appearance, setAppearance] = useState<Appearance>(() => {
    const saved = localStorage.getItem("campuscue_appearance")
    return saved === "Indigo" || saved === "Ocean" ? saved : "Midnight"
  })

  useEffect(
    () => localStorage.setItem("campuscue_tasks_v3", JSON.stringify(tasks)),
    [tasks],
  )

  useEffect(() => {
    localStorage.setItem("campuscue_appearance", appearance)
  }, [appearance])

  const pending = tasks.filter((task) => !task.completed)
  const completed = tasks.filter((task) => task.completed)
  const highPriority = pending.filter((task) => task.priority === "HIGH")
  const progress = tasks.length
    ? Math.round((completed.length / tasks.length) * 100)
    : 0

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesQuery = `${task.title} ${task.subject} ${task.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
        const matchesPriority =
          priorityFilter === "ALL" || task.priority === priorityFilter
        const matchesSubject =
          subjectFilter === "All subjects" || task.subject === subjectFilter
        return matchesQuery && matchesPriority && matchesSubject
      }),
    [tasks, query, priorityFilter, subjectFilter],
  )

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2400)
  }

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
    showToast("Task status updated")
  }

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id))
    showToast("Task removed")
  }

  const addTask = (task: Omit<Task, "id" | "completed" | "displayDate">) => {
    setTasks((current) => [
      {
        ...task,
        id: Date.now().toString(),
        completed: false,
        displayDate: "Scheduled",
      },
      ...current,
    ])
    setScreen("tasks")
    showToast("New task added")
  }

  const addSession = (session: Omit<StudySession, "id" | "color">) => {
    setSessions((current) => [
      ...current,
      { ...session, id: Date.now().toString(), color: "violet" },
    ])
    setSessionFormOpen(false)
    showToast("Study session scheduled")
  }

  return (
    <main className="min-h-screen bg-[#070b1c] text-slate-100 md:grid md:place-items-center md:p-6">
      <div
        data-theme={appearance}
        className="phone-shell relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0b1024] md:h-[844px] md:w-[402px] md:rounded-[42px] md:border-[7px] md:border-[#1a2140] md:shadow-[0_32px_100px_rgba(0,0,0,.6)]"
      >
        <div className="hidden h-7 shrink-0 items-center justify-center bg-[#111735] md:flex">
          <div className="h-1.5 w-20 rounded-full bg-slate-600/50" />
        </div>

        <div className="relative flex-1 overflow-y-auto pb-24 scrollbar-none">
          {screen === "home" && (
            <HomeScreen
              tasks={tasks}
              pending={pending.length}
              completed={completed.length}
              high={highPriority.length}
              query={query}
              setQuery={setQuery}
              onNavigate={setScreen}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onNotifications={() => setNotificationsOpen(true)}
            />
          )}
          {screen === "tasks" && (
            <TasksScreen
              tasks={visibleTasks}
              priority={priorityFilter}
              setPriority={setPriorityFilter}
              query={query}
              setQuery={setQuery}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          )}
          {screen === "planner" && (
            <PlannerScreen
              tasks={tasks}
              sessions={sessions}
              progress={progress}
              subject={subjectFilter}
              setSubject={setSubjectFilter}
              formOpen={sessionFormOpen}
              setFormOpen={setSessionFormOpen}
              onAddSession={addSession}
              onToggle={toggleTask}
            />
          )}
          {screen === "add" && (
            <AddTaskScreen
              onBack={() => setScreen("home")}
              onSubmit={addTask}
            />
          )}
          {screen === "profile" && (
            <ProfileScreen
              taskCount={tasks.length}
              progress={progress}
              appearance={appearance}
              onAppearanceChange={setAppearance}
              onReset={() => {
                setTasks(INITIAL_TASKS)
                showToast("Demo tasks restored")
              }}
            />
          )}
          {screen === "chat" && (
            <ChatbotScreen tasks={tasks} onBack={() => setScreen("home")} />
          )}
        </div>

        {["home", "tasks", "planner", "profile"].includes(screen) && (
          <button
            aria-label="Add task"
            onClick={() => setScreen("add")}
            className="absolute bottom-[82px] right-5 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#6d66ff] to-[#9257e8] text-white shadow-[0_12px_30px_rgba(109,102,255,.45)] ring-4 ring-[#0b1024] transition active:scale-95"
          >
            <Plus size={25} strokeWidth={2.6} />
          </button>
        )}

        {screen !== "chat" && (
          <BottomNav active={screen} onNavigate={setScreen} />
        )}

        {notificationsOpen && (
          <Notifications onClose={() => setNotificationsOpen(false)} />
        )}
        {toast && (
          <div className="absolute left-1/2 top-8 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-violet-400/30 bg-[#171d3a]/95 px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-xl">
            <CheckCircle2 size={15} className="text-emerald-400" /> {toast}
          </div>
        )}
      </div>
    </main>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
        <BookOpen size={19} />
      </div>
      <div className="text-lg font-extrabold tracking-[-0.04em]">
        Campus<span className="text-cyan-200">Cue</span>
      </div>
    </div>
  )
}

function HomeScreen({
  tasks,
  pending,
  completed,
  high,
  query,
  setQuery,
  onNavigate,
  onToggle,
  onDelete,
  onNotifications,
}: {
  tasks: Task[]
  pending: number
  completed: number
  high: number
  query: string
  setQuery: (value: string) => void
  onNavigate: (screen: Screen) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onNotifications: () => void
}) {
  const current = tasks.filter(
    (task) =>
      !task.completed && task.title.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <div className="animate-fade">
      <header className="relative overflow-hidden rounded-b-[34px] bg-gradient-to-br from-[#4056d8] via-[#584bd1] to-[#7441b8] px-5 pb-7 pt-5 shadow-[0_16px_40px_rgba(55,48,160,.3)]">
        <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-fuchsia-300/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <Brand />
          <button
            aria-label="Open notifications"
            onClick={onNotifications}
            className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff7b91] ring-2 ring-[#554dcc]" />
          </button>
        </div>
        <div className="relative mt-6">
          <p className="text-xs font-medium text-indigo-100">
            Good morning, Jayve
          </p>
          <h1 className="mt-1 text-[25px] font-extrabold leading-tight tracking-[-0.04em]">
            Here’s what’s ahead.
          </h1>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <SummaryCard
            value={pending}
            label="Pending"
            icon={<Clock3 size={14} />}
          />
          <SummaryCard
            value={completed}
            label="Completed"
            icon={<CheckCircle2 size={14} />}
            accent="text-emerald-300"
          />
          <SummaryCard
            value={high}
            label="High priority"
            icon={<AlertTriangle size={14} />}
            accent="text-rose-300"
          />
        </div>
      </header>

      <div className="space-y-6 px-5 py-5">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search tasks or subjects"
        />
        <section>
          <SectionHeading
            icon={<CalendarDays size={16} />}
            title="Today’s tasks"
            action="See all"
            onAction={() => onNavigate("tasks")}
          />
          <div className="mt-3 space-y-3">
            {current.slice(0, 2).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading icon={<Sparkles size={16} />} title="Student tools" />
          <div className="mt-3">
            <button
              onClick={() => onNavigate("chat")}
              className="group w-full rounded-2xl border border-[#293054] bg-[#141a34] p-3.5 text-left shadow-lg transition hover:border-cyan-400/30"
            >
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/15">
                <Bot size={19} />
              </div>
              <p className="mt-3 text-xs font-bold">Campus Assistant</p>
              <p className="mt-1 text-[9px] leading-relaxed text-slate-500">
                Quick help with tasks and study plans
              </p>
            </button>
          </div>
        </section>

        <button
          onClick={() => onNavigate("planner")}
          className="group relative w-full overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-r from-[#171c40] to-[#211a47] p-4 text-left shadow-lg"
        >
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-violet-500/20 blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Smart Study Planner</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                3 sessions planned this week
              </p>
            </div>
            <ChevronRight
              size={18}
              className="text-slate-500 transition group-hover:translate-x-1"
            />
          </div>
        </button>

        <section>
          <SectionHeading icon={<Clock3 size={16} />} title="Upcoming" />
          <div className="mt-3 space-y-3">
            {current.slice(2, 4).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function SummaryCard({
  value,
  label,
  icon,
  accent = "text-white",
}: {
  value: number
  label: string
  icon: ReactNode
  accent?: string
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md">
      <div className={`flex items-center gap-1.5 ${accent}`}>
        {icon}
        <span className="text-lg font-extrabold">{value}</span>
      </div>
      <p className="mt-1 truncate text-[9px] font-medium text-indigo-100">
        {label}
      </p>
    </div>
  )
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Search
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#293054] bg-[#141a34] pl-11 pr-10 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
      />
      {value && (
        <button
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function SectionHeading({
  icon,
  title,
  action,
  onAction,
}: {
  icon: ReactNode
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-100">
        <span className="text-indigo-400">{icon}</span>
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-indigo-400"
        >
          {action}
          <ChevronRight size={13} />
        </button>
      )}
    </div>
  )
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  compact = false,
}: {
  task: Task
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  compact?: boolean
}) {
  const priorityStyles = {
    HIGH: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    MEDIUM: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    LOW: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/20",
  }
  return (
    <article
      className={`group rounded-2xl border bg-[#141a34] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,.16)] transition ${
        task.completed
          ? "border-emerald-400/15 opacity-65"
          : task.overdue
            ? "border-rose-400/30"
            : "border-[#293054] hover:border-indigo-400/35"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition ${
            task.completed
              ? "border-emerald-400 bg-emerald-400 text-[#0b1024]"
              : "border-slate-500 bg-[#0d1229] hover:border-indigo-400"
          }`}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`truncate text-[13px] font-bold ${
                task.completed
                  ? "text-slate-500 line-through"
                  : "text-slate-100"
              }`}
            >
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-indigo-300">
              {categoryIcon[task.category]}
              {task.typeLabel || task.category}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className={task.overdue ? "font-semibold text-rose-300" : ""}>
              {task.displayDate} · {task.time}
            </span>
          </div>
          {!compact && (
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-md bg-[#202746] px-2 py-1 text-[9px] font-semibold text-slate-300">
                {task.subject}
              </span>
              {onDelete && (
                <button
                  aria-label="Delete task"
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-slate-600 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    HIGH: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
    MEDIUM: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
    LOW: "bg-cyan-400/10 text-cyan-300 ring-cyan-400/20",
  }
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-extrabold tracking-[0.08em] ring-1 ${styles[priority]}`}
    >
      {priority}
    </span>
  )
}

function ScreenHeader({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle: string
  icon?: ReactNode
}) {
  return (
    <header className="relative overflow-hidden rounded-b-[30px] border-b border-indigo-400/10 bg-gradient-to-br from-[#171d45] to-[#241943] px-5 pb-5 pt-6">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />
      <div className="relative flex items-center gap-2">
        <h1 className="text-xl font-extrabold tracking-[-0.035em]">{title}</h1>
        <span className="text-violet-300">{icon}</span>
      </div>
      <p className="relative mt-1 text-[11px] text-slate-400">{subtitle}</p>
    </header>
  )
}

function TasksScreen({
  tasks,
  priority,
  setPriority,
  query,
  setQuery,
  onToggle,
  onDelete,
}: {
  tasks: Task[]
  priority: "ALL" | Priority
  setPriority: (priority: "ALL" | Priority) => void
  query: string
  setQuery: (query: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}) {
  const active = tasks.filter((task) => !task.completed)
  const done = tasks.filter((task) => task.completed)
  return (
    <div className="animate-fade">
      <ScreenHeader
        title="My Tasks"
        subtitle="Everything on your academic radar."
        icon={<ListChecks size={19} />}
      />
      <div className="space-y-5 px-5 py-5">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search all tasks"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setPriority(item)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-bold transition ${
                priority === item
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : "border border-[#293054] bg-[#141a34] text-slate-400"
              }`}
            >
              {item === "ALL" ? "All tasks" : `${item.toLowerCase()} priority`}
            </button>
          ))}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Active · {active.length}
            </p>
            <button className="text-slate-500">
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {active.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
            {active.length === 0 && <EmptyState />}
          </div>
        </div>
        {done.length > 0 && (
          <div className="border-t border-[#222947] pt-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Completed · {done.length}
            </p>
            <div className="space-y-3">
              {done.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#30385f] bg-[#11162e] py-10 text-center">
      <CheckCircle2 className="mx-auto text-emerald-400" size={28} />
      <p className="mt-3 text-sm font-bold">You’re all caught up</p>
      <p className="mt-1 text-[11px] text-slate-500">
        No tasks match this filter.
      </p>
    </div>
  )
}

function PlannerScreen({
  tasks,
  sessions,
  progress,
  subject,
  setSubject,
  formOpen,
  setFormOpen,
  onAddSession,
  onToggle,
}: {
  tasks: Task[]
  sessions: StudySession[]
  progress: number
  subject: string
  setSubject: (subject: string) => void
  formOpen: boolean
  setFormOpen: (open: boolean) => void
  onAddSession: (session: Omit<StudySession, "id" | "color">) => void
  onToggle: (id: string) => void
}) {
  const subjects = [
    "All subjects",
    ...Array.from(new Set(tasks.map((task) => task.subject))).filter(
      (item) => item !== "Personal",
    ),
  ]
  const filtered = tasks.filter(
    (task) =>
      !task.completed &&
      (subject === "All subjects" || task.subject === subject),
  )
  return (
    <div className="animate-fade">
      <ScreenHeader
        title="Smart Study Planner"
        subtitle="Plan the week. Stay ahead without the stress."
        icon={<Sparkles size={18} />}
      />
      <div className="space-y-5 px-5 py-5">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-[#20275a] to-[#2b1e55] p-4 shadow-xl">
          <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-200">
                Study progress
              </p>
              <p className="mt-1 text-2xl font-extrabold">{progress}%</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/10">
              <Target size={23} />
            </div>
          </div>
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="relative mt-2 text-[10px] text-indigo-200">
            One task complete · Keep the momentum going
          </p>
        </section>

        <section>
          <SectionHeading
            icon={<AlertTriangle size={16} />}
            title="Next deadline"
          />
          <div className="mt-3">
            {filtered[0] && <TaskCard task={filtered[0]} onToggle={onToggle} />}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <SectionHeading
              icon={<CalendarDays size={16} />}
              title="Weekly schedule"
            />
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-indigo-500/15 px-2.5 py-1.5 text-[10px] font-bold text-indigo-300 ring-1 ring-indigo-400/20"
            >
              <Plus size={13} /> Add session
            </button>
          </div>
          <WeekStrip />
          <div className="mt-3 space-y-2">
            {sessions.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            icon={<BookOpen size={16} />}
            title="Upcoming coursework"
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {subjects.map((item) => (
              <button
                key={item}
                onClick={() => setSubject(item)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold ${
                  subject === item
                    ? "bg-violet-500 text-white"
                    : "bg-[#171d37] text-slate-400 ring-1 ring-[#293054]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.slice(0, 4).map((task) => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} compact />
            ))}
          </div>
        </section>
        <MiniCalendar tasks={tasks} />
      </div>
      {formOpen && (
        <SessionForm
          onClose={() => setFormOpen(false)}
          onSubmit={onAddSession}
        />
      )}
    </div>
  )
}

function WeekStrip() {
  const days = [
    { d: "M", n: 14 },
    { d: "T", n: 15 },
    { d: "W", n: 16 },
    { d: "T", n: 17 },
    { d: "F", n: 18 },
    { d: "S", n: 19 },
    { d: "S", n: 20 },
  ]
  return (
    <div className="mt-3 grid grid-cols-7 gap-1.5">
      {days.map((day, index) => (
        <div
          key={`${day.d}${index}`}
          className={`flex flex-col items-center gap-1 rounded-xl py-2 ${
            index === 2
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              : "bg-[#141a34] text-slate-400"
          }`}
        >
          <span className="text-[8px] font-bold">{day.d}</span>
          <span className="text-[11px] font-extrabold">{day.n}</span>
          {[0, 2, 4].includes(index) && (
            <span
              className={`h-1 w-1 rounded-full ${
                index === 2 ? "bg-cyan-200" : "bg-violet-400"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function SessionRow({ session }: { session: StudySession }) {
  const colors = {
    violet: "bg-violet-400",
    cyan: "bg-cyan-400",
    blue: "bg-blue-400",
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#293054] bg-[#141a34] p-3">
      <span className={`h-9 w-1 rounded-full ${colors[session.color]}`} />
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#202746] text-indigo-300">
        <BookOpen size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold">{session.subject}</p>
        <p className="mt-0.5 text-[9px] text-slate-500">
          {session.day}, {session.date} · {session.time}
        </p>
      </div>
      <span className="rounded-lg bg-[#202746] px-2 py-1 text-[9px] font-semibold text-slate-300">
        {session.duration}
      </span>
    </div>
  )
}

function MiniCalendar({ tasks }: { tasks: Task[] }) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1)
  return (
    <section className="rounded-3xl border border-[#293054] bg-[#12172f] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">September 2026</p>
          <p className="mt-0.5 text-[9px] text-slate-500">Academic deadlines</p>
        </div>
        <CalendarDays size={18} className="text-violet-300" />
      </div>
      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center text-[9px] text-slate-500">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <span key={`${day}${i}`} className="font-bold">
            {day}
          </span>
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={`relative mx-auto grid h-7 w-7 place-items-center rounded-lg ${
              day === 11
                ? "bg-indigo-500 font-bold text-white"
                : "text-slate-300"
            }`}
          >
            {day}
            {[11, 12, 14].includes(day) && (
              <span
                className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                  day === 11 ? "bg-cyan-200" : "bg-violet-400"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[9px] text-slate-500">
        {tasks.filter((task) => !task.completed).length} upcoming deadlines this
        month
      </p>
    </section>
  )
}

function SessionForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (session: Omit<StudySession, "id" | "color">) => void
}) {
  const [subject, setSubject] = useState("Mathematics")
  const [date, setDate] = useState("2026-09-21")
  const [time, setTime] = useState("15:00")
  const [duration, setDuration] = useState("60 min")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ subject, date: "Sep 21", day: "Mon", time, duration })
  }
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-[#060918]/80 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="w-full rounded-t-[30px] border-t border-[#30385e] bg-[#11162d] p-5 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold">Add study session</h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Reserve focused time in your week.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#1c2342] text-slate-400"
          >
            <X size={17} />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Subject">
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="form-control"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="form-control"
              />
            </Field>
            <Field label="Start time">
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="form-control"
              />
            </Field>
          </div>
          <Field label="Duration">
            <select
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              className="form-control"
            >
              <option>30 min</option>
              <option>45 min</option>
              <option>60 min</option>
              <option>90 min</option>
            </select>
          </Field>
          <PrimaryButton>Schedule session</PrimaryButton>
        </div>
      </form>
    </div>
  )
}

function AddTaskScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void
  onSubmit: (task: Omit<Task, "id" | "completed" | "displayDate">) => void
}) {
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState<Category>("Assignment")
  const [customType, setCustomType] = useState("")
  const [date, setDate] = useState("2026-09-18")
  const [time, setTime] = useState("17:00")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [notes, setNotes] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || (category === "Other" && !customType.trim())) return
    onSubmit({
      title,
      subject: subject || "General",
      category,
      typeLabel: category === "Other" ? customType.trim() : undefined,
      date,
      time,
      priority,
      notes,
    })
  }
  return (
    <div className="animate-fade">
      <header className="bg-gradient-to-br from-[#4056d8] to-[#7441b8] px-5 pb-6 pt-5">
        <button
          onClick={onBack}
          className="mb-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">
          Add a new task
        </h1>
        <p className="mt-1 text-[11px] text-indigo-100">
          Capture it now, focus on it later.
        </p>
      </header>
      <form onSubmit={submit} className="space-y-4 px-5 py-5">
        <Field label="Task title">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Submit research paper"
            className="form-control"
          />
        </Field>
        <Field label="Subject">
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Tourism"
            className="form-control"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Task type">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
              className="form-control"
            >
              {Object.keys(categoryIcon).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
              className="form-control"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </Field>
        </div>
        {category === "Other" && (
          <Field label="Custom task type">
            <input
              required
              autoFocus
              value={customType}
              onChange={(event) => setCustomType(event.target.value)}
              placeholder="e.g. Laboratory, Reading"
              className="form-control"
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Due date">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="form-control"
            />
          </Field>
          <Field label="Due time">
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="form-control"
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add details, links, or instructions"
            className="form-control resize-none"
          />
        </Field>
        <PrimaryButton>
          <Plus size={16} /> Add task
        </PrimaryButton>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold text-slate-400">
        {label}
      </span>
      {children}
    </label>
  )
}
function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition active:scale-[.98]"
    >
      {children}
    </button>
  )
}

type ChatMessage = {
  id: number
  sender: "assistant" | "student"
  text: string
  time: string
}

function ChatbotScreen({
  tasks,
  onBack,
}: {
  tasks: Task[]
  onBack: () => void
}) {
  const pendingTasks = tasks.filter((task) => !task.completed)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "assistant",
      text: `Hi Jayve, I’m Cue. I can help you review your ${pendingTasks.length} active tasks, plan a study session, or find your next deadline.`,
      time: "Now",
    },
  ])
  const suggestions = [
    "What should I focus on?",
    "Plan my study day",
    "Show my next deadline",
  ]

  const getReply = (input: string) => {
    const normalized = input.toLowerCase()
    const nextTask = pendingTasks[0]
    if (normalized.includes("deadline") && nextTask) {
      return `Your next deadline is ${nextTask.title} for ${nextTask.subject}, due ${nextTask.displayDate} at ${nextTask.time}.`
    }
    if (
      normalized.includes("plan") ||
      normalized.includes("study") ||
      normalized.includes("focus")
    ) {
      return "Start with a 45-minute Research Paper focus block, take a 10-minute break, then review Calculus for 30 minutes. I’d leave the seminar prep for tomorrow."
    }
    return "I can help with your workload, deadlines, and study schedule. Try asking what to focus on or when your next deadline is."
  }

  const sendMessage = (text: string) => {
    const cleanText = text.trim()
    if (!cleanText) return
    const time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "student",
        text: cleanText,
        time,
      },
      {
        id: Date.now() + 1,
        sender: "assistant",
        text: getReply(cleanText),
        time,
      },
    ])
    setMessage("")
  }

  return (
    <div className="flex min-h-full flex-col animate-fade">
      <ToolHeader
        title="Campus Assistant"
        subtitle="Your academic support companion"
        icon={<Bot size={19} />}
        onBack={onBack}
      />
      <div className="flex-1 space-y-4 px-5 py-5">
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" />
          <p className="text-[10px] font-semibold text-emerald-300">
            Cue is ready to help
          </p>
          <span className="ml-auto rounded-full bg-[#202746] px-2 py-1 text-[8px] text-slate-400">
            Prototype mode
          </span>
        </div>

        <div className="space-y-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex gap-2.5 ${
                item.sender === "student" ? "justify-end" : "justify-start"
              }`}
            >
              {item.sender === "assistant" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                  <Bot size={15} />
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-3 ${
                  item.sender === "student"
                    ? "rounded-br-md bg-indigo-500 text-white"
                    : "rounded-bl-md border border-[#293054] bg-[#141a34] text-slate-200"
                }`}
              >
                <p className="text-[11px] leading-relaxed">{item.text}</p>
                <p
                  className={`mt-1.5 text-[8px] ${
                    item.sender === "student"
                      ? "text-indigo-200"
                      : "text-slate-600"
                  }`}
                >
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {messages.length < 3 && (
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-indigo-400/20 bg-indigo-400/5 px-3 py-2 text-[9px] font-semibold text-indigo-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sendMessage(message)
        }}
        className="sticky bottom-0 border-t border-[#252c4d] bg-[#0b1024]/95 p-4 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-[#30385f] bg-[#141a34] p-1.5 pl-4 focus-within:border-indigo-400/50">
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask Cue about your studies..."
            className="min-w-0 flex-1 bg-transparent text-[11px] text-white outline-none placeholder:text-slate-600"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 text-center text-[8px] text-slate-600">
          Cue uses local demo responses and does not send your data anywhere.
        </p>
      </form>
    </div>
  )
}

function ToolHeader({
  title,
  subtitle,
  icon,
  onBack,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  onBack: () => void
}) {
  return (
    <header className="relative overflow-hidden rounded-b-[30px] border-b border-indigo-400/10 bg-gradient-to-br from-[#26356e] via-[#35306d] to-[#4f276d] px-5 pb-5 pt-5">
      <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
      <div className="relative flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-cyan-200 ring-1 ring-white/15">
          {icon}
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-0.5 text-[9px] text-indigo-100">{subtitle}</p>
        </div>
      </div>
    </header>
  )
}

function ProfileScreen({
  taskCount,
  progress,
  appearance,
  onAppearanceChange,
  onReset,
}: {
  taskCount: number
  progress: number
  appearance: Appearance
  onAppearanceChange: (appearance: Appearance) => void
  onReset: () => void
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("campuscue_notifications") !== "off",
  )
  const [openSetting, setOpenSetting] =
    useState<"appearance" | "privacy" | "help" | null>(null)
  const [activitySharing, setActivitySharing] = useState(false)
  const [helpMessage, setHelpMessage] = useState("")

  useEffect(() => {
    localStorage.setItem(
      "campuscue_notifications",
      notificationsEnabled ? "on" : "off",
    )
  }, [notificationsEnabled])

  return (
    <div className="animate-fade">
      <ScreenHeader
        title="Profile & Settings"
        subtitle="Your CampusCue space."
        icon={<Settings2 size={18} />}
      />
      <div className="space-y-4 px-5 py-5">
        <section className="rounded-3xl border border-[#2a3155] bg-gradient-to-br from-[#171e3c] to-[#181532] p-5 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/20 ring-4 ring-[#252c50]">
            <UserRound size={34} />
          </div>
          <h2 className="mt-3 text-base font-extrabold">Jayve Melecia</h2>
          <p className="mt-1 text-[11px] font-medium text-indigo-300">
            Information Systems · Year 3
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <ProfileStat label="Tasks created" value={taskCount.toString()} />
            <ProfileStat label="Completion rate" value={`${progress}%`} />
          </div>
        </section>
        <section className="overflow-hidden rounded-3xl border border-[#293054] bg-[#141a34]">
          <div className="flex w-full items-center gap-3 border-b border-[#252c4d] p-4">
            <span className="text-indigo-300">
              <Bell size={17} />
            </span>
            <span className="flex-1 text-xs font-semibold">Notifications</span>
            <button
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => setNotificationsEnabled((enabled) => !enabled)}
              className={`relative h-6 w-11 rounded-full transition ${
                notificationsEnabled ? "bg-indigo-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  notificationsEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
          <SettingsRow
            icon={<Moon size={17} />}
            label="Appearance"
            value={appearance}
            expanded={openSetting === "appearance"}
            onClick={() =>
              setOpenSetting((current) =>
                current === "appearance" ? null : "appearance",
              )
            }
          />
          {openSetting === "appearance" && (
            <div className="grid grid-cols-3 gap-2 border-b border-[#252c4d] bg-[#0e132a] p-3">
              {[
                {
                  label: "Midnight" as Appearance,
                  color: "bg-[#111735]",
                },
                { label: "Indigo" as Appearance, color: "bg-indigo-700" },
                { label: "Ocean" as Appearance, color: "bg-cyan-800" },
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => onAppearanceChange(option.label)}
                  className={`rounded-xl p-2 text-center ring-1 transition ${
                    appearance === option.label
                      ? "bg-indigo-500/15 text-indigo-200 ring-indigo-400/50"
                      : "bg-[#171d37] text-slate-500 ring-[#293054]"
                  }`}
                >
                  <span
                    className={`mx-auto block h-7 w-full rounded-lg ${option.color}`}
                  />
                  <span className="mt-1.5 block text-[8px] font-bold">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}
          <SettingsRow
            icon={<ShieldCheck size={17} />}
            label="Privacy & security"
            expanded={openSetting === "privacy"}
            onClick={() =>
              setOpenSetting((current) =>
                current === "privacy" ? null : "privacy",
              )
            }
          />
          {openSetting === "privacy" && (
            <div className="space-y-3 border-b border-[#252c4d] bg-[#0e132a] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold">App lock</p>
                  <p className="mt-0.5 text-[8px] text-slate-500">
                    Require device authentication
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-bold text-emerald-300">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold">Share activity data</p>
                  <p className="mt-0.5 text-[8px] text-slate-500">
                    Help improve CampusCue
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={activitySharing}
                  onClick={() => setActivitySharing((enabled) => !enabled)}
                  className={`relative h-6 w-11 rounded-full transition ${
                    activitySharing ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      activitySharing ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
          <SettingsRow
            icon={<HelpCircle size={17} />}
            label="Help & feedback"
            expanded={openSetting === "help"}
            onClick={() =>
              setOpenSetting((current) => (current === "help" ? null : "help"))
            }
          />
          {openSetting === "help" && (
            <div className="grid grid-cols-2 gap-2 bg-[#0e132a] p-3">
              <button
                onClick={() =>
                  setHelpMessage("Help articles are ready to browse.")
                }
                className="rounded-xl border border-[#293054] bg-[#171d37] px-3 py-2.5 text-[9px] font-bold text-indigo-300"
              >
                View help center
              </button>
              <button
                onClick={() =>
                  setHelpMessage("Feedback form opened in prototype mode.")
                }
                className="rounded-xl border border-[#293054] bg-[#171d37] px-3 py-2.5 text-[9px] font-bold text-indigo-300"
              >
                Send feedback
              </button>
              {helpMessage && (
                <p className="col-span-2 rounded-xl bg-indigo-400/10 px-3 py-2 text-center text-[8px] text-indigo-200">
                  {helpMessage}
                </p>
              )}
            </div>
          )}
        </section>
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/15 bg-rose-400/5 py-3 text-[11px] font-bold text-rose-300"
        >
          <RotateCcw size={14} /> Reset demo data
        </button>
      </div>
    </div>
  )
}

function SettingsRow({
  icon,
  label,
  value,
  expanded,
  onClick,
}: {
  icon: ReactNode
  label: string
  value?: string
  expanded: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-expanded={expanded}
      className="flex w-full items-center gap-3 border-b border-[#252c4d] p-4 text-left last:border-0"
    >
      <span className="text-indigo-300">{icon}</span>
      <span className="flex-1 text-xs font-semibold">{label}</span>
      {value && <span className="text-[10px] text-slate-500">{value}</span>}
      <ChevronRight
        size={15}
        className={`text-slate-600 transition ${expanded ? "rotate-90" : ""}`}
      />
    </button>
  )
}

function ProfileStat({ label, value }: { label: string value: string }) {
  return (
    <div className="rounded-2xl bg-[#0d1228]/70 p-3 ring-1 ring-white/5">
      <p className="text-lg font-extrabold text-white">{value}</p>
      <p className="mt-0.5 text-[9px] text-slate-500">{label}</p>
    </div>
  )
}

function BottomNav({
  active,
  onNavigate,
}: {
  active: Screen
  onNavigate: (screen: Screen) => void
}) {
  const items: { id: Screen label: string icon: ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={19} /> },
    { id: "tasks", label: "My Tasks", icon: <ListChecks size={19} /> },
    { id: "planner", label: "Smart Tool", icon: <Sparkles size={19} /> },
    { id: "profile", label: "Profile", icon: <UserRound size={19} /> },
  ]
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-10 flex h-[76px] items-center justify-around border-t border-[#252c4d] bg-[#0e142a]/95 px-2 pb-1 backdrop-blur-xl">
      {items.map((item) => {
        const selected =
          active === item.id ||
          (active === "add" && item.id === "tasks") ||
          (active === "chat" && item.id === "home")
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`relative flex min-w-[70px] flex-col items-center gap-1.5 rounded-xl py-2 text-[9px] font-semibold transition ${
              selected
                ? "text-indigo-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span
              className={`grid h-7 w-10 place-items-center rounded-xl transition ${
                selected ? "bg-indigo-500/15" : ""
              }`}
            >
              {item.icon}
            </span>
            {item.label}
            {selected && (
              <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-indigo-400" />
            )}
          </button>
        )
      })}
    </nav>
  )
}

function Notifications({ onClose }: { onClose: () => void }) {
  const items = [
    {
      icon: <AlertTriangle size={16} />,
      color: "text-rose-300",
      title: "Research Paper due tonight",
      copy: "Submit before 11:59 PM",
      time: "10m",
    },
    {
      icon: <Clock3 size={16} />,
      color: "text-amber-300",
      title: "Calculus Quiz",
      copy: "Starts today at 2:00 PM",
      time: "1h",
    },
    {
      icon: <Sparkles size={16} />,
      color: "text-violet-300",
      title: "Study plan ready",
      copy: "3 focused sessions this week",
      time: "3h",
    },
  ]
  return (
    <div
      className="absolute inset-0 z-40 flex items-end bg-[#060918]/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-[30px] border-t border-[#30385e] bg-[#11162d] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold">Notifications</h2>
            <p className="mt-0.5 text-[10px] text-slate-500">
              3 updates for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#1c2342] text-slate-400"
          >
            <X size={17} />
          </button>
        </div>
        <div className="divide-y divide-[#252c4d]">
          {items.map((item) => (
            <div key={item.title} className="flex gap-3 py-4">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1d2343] ${item.color}`}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">{item.title}</p>
                <p className="mt-1 text-[10px] text-slate-500">{item.copy}</p>
              </div>
              <span className="text-[9px] text-slate-600">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

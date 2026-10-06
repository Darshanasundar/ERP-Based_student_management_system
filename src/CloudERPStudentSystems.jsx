import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Telescope,
  Cog,
  Users,
  Code2,
  BookOpen,
  Route,
  Wallet,
  Cloud,
  CalendarClock,
  BookMarked,
  Radar,
  UserPlus,
  History,
  BellRing,
  CreditCard,
  Server,
  KeyRound,
  Search,
  ChevronDown,
  Menu,
  X,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Content data — transcribed verbatim from the brief                  */
/* ------------------------------------------------------------------ */

const MODULES = [
  {
    id: 'core-academics',
    number: '01',
    title: 'Core Academics',
    icon: BookOpen,
    blurb:
      "The academic engine — calendars, curriculum, and timetables, all working in lockstep so nothing double-books itself.",
    features: [
      {
        id: 'academic-calendar-management',
        title: 'Academic Calendar Management',
        icon: CalendarClock,
        bigPicture:
          "Think of this as the digital master clock for the entire school year, scheduling terms, holidays, and exam weeks in advance.",
        howItWorks:
          "Admins set term dates, the system automatically marks holidays across all departments, and it blocks out exam dates to prevent double-booking.",
        example:
          "The school updates the winter break dates, and instantly every teacher's planner and student's calendar updates automatically.",
        stack: ['Relational Databases (MySQL/PostgreSQL)', 'Cron Jobs for automated updates'],
      },
      {
        id: 'course-curriculum-management',
        title: 'Course & Curriculum Management',
        icon: BookMarked,
        bigPicture:
          "A digital blueprint tracker for what subjects are taught, what credits they are worth, and what topics must be covered.",
        howItWorks:
          "Subjects are registered with credit values, topics are mapped to specific weeks, and prerequisites are locked in so students can't skip foundational classes.",
        example:
          "A student tries to register for Advanced Physics, but the system blocks them because they haven't finished Basic Physics yet.",
        stack: ['Node.js', 'REST APIs', 'MongoDB for flexible curriculum structures'],
      },
      {
        id: 'timetable-conflict-resolution',
        title: 'Timetable Conflict Resolution',
        icon: Radar,
        bigPicture:
          "A smart referee that stops two classes from trying to use the exact same classroom or the same teacher at the same time.",
        howItWorks:
          "The system cross-references teacher schedules, room capacities, and student batches, running an algorithm to highlight overlapping classes.",
        example:
          "An admin tries to book Mr. Smith for Math and Science at 9:00 AM; the system flashes a red warning and suggests an open slot instead.",
        stack: ['Python constraint-satisfaction algorithms', 'Redis for fast scheduling checks'],
      },
    ],
  },
  {
    id: 'student-lifecycle',
    number: '02',
    title: 'Student Lifecycle',
    icon: Route,
    blurb: "One continuous record that follows a student from a first inquiry email to the graduation photo.",
    features: [
      {
        id: 'admissions-lead-crm',
        title: 'Admissions & Lead CRM',
        icon: UserPlus,
        bigPicture:
          "A digital pipeline that tracks a student from the very first day they ask about the school until they officially enroll.",
        howItWorks:
          "Captures online application forms, scores how interested the applicant is, and sends automated follow-up emails to parents.",
        example:
          "A parent fills out a contact form, and the system automatically sends them an application brochure and schedules a campus tour.",
        stack: ['HubSpot API integration', 'AWS Simple Email Service (SES)'],
      },
      {
        id: 'student-lifecycle-tracking',
        title: 'Student Lifecycle Tracking',
        icon: History,
        bigPicture:
          "A permanent digital timeline tracking a student's journey from their first day of enrollment to the day they graduate.",
        howItWorks:
          "Consolidates biographical data, annual grade progression, historical attendance, and disciplinary logs into a single profile.",
        example:
          "A principal clicks on a senior student's profile and instantly sees their 6th-grade report cards, sports certificates, and fee history.",
        stack: ['AWS S3 for document storage', 'Express.js backend'],
      },
    ],
  },
  {
    id: 'finance-operations',
    number: '03',
    title: 'Finance & Operations',
    icon: Wallet,
    blurb: "Where tuition gets tracked, chased politely, and finally, paid.",
    features: [
      {
        id: 'fee-defaulter-tracking-alerts',
        title: 'Fee Defaulter Tracking & Alerts',
        icon: BellRing,
        bigPicture:
          "An automated accountant that monitors who has paid tuition and sends friendly reminders to those who forgot.",
        howItWorks:
          "Scans the student database daily, compares paid invoices against due dates, and flags overdue balances.",
        example:
          "The tuition deadline passes, and the system automatically sends a secure SMS payment link to all parents who missed the date.",
        stack: ['Twilio SMS API', 'Scheduled Database Triggers'],
      },
      {
        id: 'payment-gateway-integration',
        title: 'Payment Gateway Integration',
        icon: CreditCard,
        bigPicture:
          "The secure pipeline connecting the school's bank account to the parent's credit card, net banking, or digital wallet.",
        howItWorks:
          'Encrypts credit card data, passes the request to a payment processor, and instantly marks the school invoice as "Paid" once approved.',
        example:
          "A parent pays fees via their phone using a QR code; the money lands in the school's account, and an instant receipt is emailed.",
        stack: ['Stripe API', 'PayPal SDK', 'Razorpay', 'Tokenization security'],
      },
    ],
  },
  {
    id: 'cloud-security',
    number: '04',
    title: 'Cloud & Security',
    icon: Cloud,
    blurb: "The invisible layer — where the software actually lives, and who's allowed to touch what.",
    features: [
      {
        id: 'system-architecture-saas',
        title: 'System Architecture (SaaS)',
        icon: Server,
        bigPicture:
          "Running the school software entirely over the internet so the school doesn't have to buy expensive physical server computers.",
        howItWorks:
          "The software is hosted on remote cloud data centers, allowing users to log in through a web browser while paying a monthly subscription.",
        example:
          "Instead of installing software on a school computer, the principal logs into a website from home to see school data.",
        stack: ['AWS (Amazon Web Services)', 'Microsoft Azure', 'Docker Containers'],
      },
      {
        id: 'role-based-access-control-rbac',
        title: 'Role-Based Access Control (RBAC)',
        icon: KeyRound,
        bigPicture:
          "A digital security guard making sure users only see the data they absolutely need for their specific job.",
        howItWorks:
          "Users are assigned clear roles (like Student, Teacher, or Accountant) which unlock specific dashboard permissions while hiding everything else.",
        example:
          "A student can log in to view their own report card, but they are strictly blocked from editing the grades or seeing anyone else's marks.",
        stack: ['JSON Web Tokens (JWT)', 'OAuth 2.0 security frameworks'],
      },
    ],
  },
];

const ALL_FEATURE_IDS = MODULES.flatMap((m) => m.features.map((f) => f.id));
const TOTAL_FEATURES = ALL_FEATURE_IDS.length;

function featureMatches(feature, moduleTitle, query) {
  const q = query.toLowerCase();
  return (
    feature.title.toLowerCase().includes(q) ||
    moduleTitle.toLowerCase().includes(q) ||
    feature.bigPicture.toLowerCase().includes(q) ||
    feature.howItWorks.toLowerCase().includes(q) ||
    feature.example.toLowerCase().includes(q) ||
    feature.stack.some((s) => s.toLowerCase().includes(q))
  );
}

/* ------------------------------------------------------------------ */
/* Trace item — one rung of the concept -> mechanism -> example -> stack ladder */
/* ------------------------------------------------------------------ */

function TraceItem({ icon: Icon, label, text, tags, isLast }) {
  return (
    <div className={`relative pl-8 ${isLast ? '' : 'pb-6'}`}>
      <span className="absolute left-0 top-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-purple-500/50 bg-zinc-900">
        <Icon className="h-3.5 w-3.5 text-purple-400" strokeWidth={2} />
      </span>
      <p className="font-mono mb-1.5 pt-0.5 text-xs font-semibold tracking-widest text-purple-400/80 uppercase">
        {label}
      </p>
      {text ? <p className="text-sm leading-relaxed text-zinc-300">{text}</p> : null}
      {tags ? (
        <div className="mt-1 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs leading-tight text-purple-300"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feature card                                                       */
/* ------------------------------------------------------------------ */

function FeatureCard({ feature, expanded, onToggle, registerRef }) {
  const Icon = feature.icon;
  return (
    <div
      id={feature.id}
      ref={(el) => registerRef(feature.id, el)}
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/10">
          <Icon className="h-5 w-5 text-purple-400" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-zinc-100">{feature.title}</h3>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-6 pt-1">
            <div className="relative">
              <div className="absolute bottom-3 left-3 top-3 w-px bg-gradient-to-b from-purple-500/50 via-purple-500/20 to-transparent" />
              <TraceItem icon={Telescope} label="Big Picture" text={feature.bigPicture} />
              <TraceItem icon={Cog} label="How It Works" text={feature.howItWorks} />
              <TraceItem icon={Users} label="Real-World Example" text={feature.example} />
              <TraceItem icon={Code2} label="Tech Stack" tags={feature.stack} isLast />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero diagram — core node fanning out to the four modules            */
/* ------------------------------------------------------------------ */

function HeroDiagram({ modules, onNavigate, reducedMotion }) {
  const coreX = 24;
  const coreY = 50;
  const spineX = 110;
  const nodeX = 216;
  const nodeY = [14, 38, 62, 86];

  return (
    <div className="relative w-full" style={{ aspectRatio: '12 / 5' }}>
      <svg viewBox="0 0 240 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <path d={`M ${coreX} ${coreY} H ${spineX}`} fill="none" stroke="#a855f7" strokeOpacity="0.3" strokeWidth="1" />
        <path
          d={`M ${spineX} ${nodeY[0]} V ${nodeY[3]}`}
          fill="none"
          stroke="#a855f7"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        {nodeY.map((y) => (
          <path key={`branch-${y}`} d={`M ${spineX} ${y} H ${nodeX}`} fill="none" stroke="#a855f7" strokeOpacity="0.3" strokeWidth="1" />
        ))}
        <circle cx={spineX} cy={coreY} r="1.6" fill="#a855f7" fillOpacity="0.5" />
        {nodeY.map((y) => (
          <circle key={`joint-${y}`} cx={spineX} cy={y} r="1.6" fill="#a855f7" fillOpacity="0.5" />
        ))}
        {!reducedMotion &&
          nodeY.map((y, i) => {
            const d = `M ${coreX} ${coreY} H ${spineX} V ${y} H ${nodeX}`;
            return (
              <circle key={`pulse-${i}`} r="2" fill="#e9d5ff">
                <animateMotion dur="3.2s" begin={`${i * 0.5}s`} repeatCount="indefinite" path={d} />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.12;0.85;1"
                  dur="3.2s"
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
      </svg>

      <div
        className="node-glow absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-purple-500/50 bg-zinc-900"
        style={{ left: '10%', top: '50%' }}
      >
        <Server className="h-5 w-5 text-purple-400" />
      </div>

      {modules.map((m, i) => {
        const ModIcon = m.icon;
        return (
          <button
            type="button"
            key={m.id}
            onClick={() => onNavigate(m.id)}
            style={{ left: '90%', top: `${nodeY[i]}%` }}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 py-2 pl-2.5 pr-3.5 transition-colors hover:border-purple-500/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 transition-colors group-hover:bg-purple-600/20">
              <ModIcon className="h-3.5 w-3.5 text-purple-400" />
            </span>
            <span className="font-mono text-xs text-zinc-300">{m.title}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared nav content — used by both desktop sidebar and mobile drawer  */
/* ------------------------------------------------------------------ */

function NavContent({
  modules,
  activeId,
  viewedIds,
  onNavigate,
  query,
  setQuery,
  progressPct,
  viewedCount,
  totalCount,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/40 bg-purple-600/20">
            <GraduationCap className="h-4 w-4 text-purple-400" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-purple-400" />
          </span>
          <div>
            <p className="font-display text-sm font-bold leading-none text-zinc-100">Cloud ERP</p>
            <p className="font-mono mt-1 text-xs tracking-widest text-zinc-500">STUDENT SYSTEMS</p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-zinc-500">PROGRESS</span>
          <span className="font-mono text-xs text-purple-400">
            {viewedCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search features or tech..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-purple-500/60 focus:outline-none focus:ring-1 focus:ring-purple-500/60"
          />
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {modules.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-zinc-600">No matches. Try a different search.</p>
        ) : null}
        {modules.map((m) => {
          const ModIcon = m.icon;
          return (
            <div key={m.id}>
              <button
                type="button"
                onClick={() => onNavigate(m.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
              >
                <ModIcon className="h-4 w-4 shrink-0 text-purple-400" />
                <span className="font-display truncate text-sm font-semibold text-zinc-200">{m.title}</span>
              </button>
              <div className="ml-5 mt-1 space-y-0.5 border-l border-zinc-800 pl-3">
                {m.features.map((f) => {
                  const isActive = activeId === f.id;
                  const isViewed = viewedIds.has(f.id);
                  return (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => onNavigate(f.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 ${
                        isActive ? 'bg-purple-600/10 text-purple-300' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                      }`}
                    >
                      {isViewed ? (
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-purple-500/70" />
                      ) : (
                        <span className="h-3 w-3 shrink-0 rounded-full border border-zinc-700" />
                      )}
                      <span className="truncate">{f.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function CloudERPStudentSystems() {
  const [activeId, setActiveId] = useState(MODULES[0].features[0].id);
  const [viewedIds, setViewedIds] = useState(() => new Set());
  const [expandedMap, setExpandedMap] = useState(() => {
    const initial = {};
    ALL_FEATURE_IDS.forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const sectionRefs = useRef({});

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    document.documentElement.style.scrollBehavior = mq.matches ? 'auto' : 'smooth';
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);
            setViewedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
          }
        });
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const progressPct = Math.round((viewedIds.size / TOTAL_FEATURES) * 100);

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MODULES;
    return MODULES.map((m) => {
      const moduleTitleMatches = m.title.toLowerCase().includes(q);
      const features = moduleTitleMatches ? m.features : m.features.filter((f) => featureMatches(f, m.title, q));
      return { ...m, features };
    }).filter((m) => m.features.length > 0);
  }, [query]);

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    setSidebarOpen(false);
  }

  function toggleCard(id) {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function registerRef(id, el) {
    sectionRefs.current[id] = el;
  }

  const allExpanded = ALL_FEATURE_IDS.every((id) => expandedMap[id]);
  function toggleAll() {
    const next = !allExpanded;
    const updated = {};
    ALL_FEATURE_IDS.forEach((id) => {
      updated[id] = next;
    });
    setExpandedMap(updated);
  }

  const navProps = {
    modules: filteredModules,
    activeId,
    viewedIds,
    onNavigate: scrollToId,
    query,
    setQuery,
    progressPct,
    viewedCount: viewedIds.size,
    totalCount: TOTAL_FEATURES,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <style>{`
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .node-glow { box-shadow: 0 0 20px rgba(168, 85, 247, 0.25); }
        ::selection { background: rgba(168, 85, 247, 0.35); color: #f4f4f5; }
        .sidebar-scroll::-webkit-scrollbar { width: 6px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 9999px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-purple-400" />
          <span className="font-display text-sm font-bold">Cloud ERP</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-zinc-950 md:hidden">
          <div className="flex items-center justify-end border-b border-zinc-800 px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <NavContent {...navProps} />
          </div>
        </div>
      ) : null}

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-zinc-800 md:flex md:flex-col">
          <NavContent {...navProps} />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl px-6 pb-28 pt-10 md:px-12 md:pt-16">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
              <span className="font-mono text-xs tracking-widest text-purple-400/80">LEARNING HUB</span>
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-zinc-50 md:text-5xl">
              Cloud ERP <span className="text-purple-400">Student Systems</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
              Four modules. Nine features. One cloud platform quietly running an entire school — from the first
              admissions email to the last login. Scroll through to see how it actually works, piece by piece.
            </p>

            <div className="mt-10 max-w-xl">
              <HeroDiagram modules={MODULES} onNavigate={scrollToId} reducedMotion={reducedMotion} />
            </div>

            <div className="mt-8 flex items-center justify-between border-y border-zinc-800 py-3">
              <p className="text-xs text-zinc-500">
                Tap a module to jump in, or use the sidebar — every card expands into the full breakdown.
              </p>
              <button
                type="button"
                onClick={toggleAll}
                className="font-mono ml-4 shrink-0 whitespace-nowrap text-xs text-purple-400 hover:text-purple-300"
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            <div className="mt-4">
              {MODULES.map((module) => {
                const ModIcon = module.icon;
                return (
                  <section key={module.id} id={module.id} className="scroll-mt-20 pt-14 first:pt-10">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="font-mono text-xs text-purple-400/70">MODULE {module.number}</span>
                      <div className="h-px flex-1 bg-zinc-800" />
                    </div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/10">
                        <ModIcon className="h-5 w-5 text-purple-400" />
                      </span>
                      <h2 className="font-display text-2xl font-bold text-zinc-50 md:text-3xl">{module.title}</h2>
                    </div>
                    <p className="mb-7 max-w-lg text-sm text-zinc-500">{module.blurb}</p>

                    <div className="space-y-4">
                      {module.features.map((feature) => (
                        <FeatureCard
                          key={feature.id}
                          feature={feature}
                          expanded={!!expandedMap[feature.id]}
                          onToggle={() => toggleCard(feature.id)}
                          registerRef={registerRef}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="mt-16 border-t border-zinc-800 pt-8 text-center">
              <p className="font-mono text-xs text-zinc-600">
                That's the full stack — from the morning bell to the last secure login.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

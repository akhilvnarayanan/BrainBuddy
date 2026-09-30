import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Blocks,
  BookOpen,
  BookText,
  Brain,
  BrainCircuit,
  Calculator,
  Check,
  CheckCircle2,
  ChevronLeft,
  Circle,
  Clock3,
  Compass,
  Construction,
  Diamond,
  Eye,
  FlaskConical,
  Focus,
  Gamepad2,
  Grid3X3,
  Hash,
  Info,
  Languages,
  Lightbulb,
  ListChecks,
  Map,
  MousePointer2,
  Music2,
  NotebookPen,
  Palette,
  PenLine,
  Play,
  Puzzle,
  Radar,
  RotateCcw,
  Route as RouteIcon,
  ScanEye,
  Search,
  Shapes,
  ShieldQuestion,
  Sparkles,
  Sprout,
  Square,
  Star,
  Target,
  Timer,
  Triangle,
  Trophy,
  Volume2,
  VolumeX,
  WandSparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

type ActivityId =
  | 'memory'
  | 'sequence-recall'
  | 'number'
  | 'fraction-forge'
  | 'mental-math'
  | 'logic-lab'
  | 'code-breaker'
  | 'pattern'
  | 'matrix-mapper'
  | 'focus'
  | 'reaction'
  | 'doodle'
  | 'story-builder'
  | 'word-detective'
  | 'reading-room'
  | 'mission-builder'
  | 'spatial-navigator'
  | 'eco-scientist'
  | 'blueprint-builder'
  | 'rhythm-rally'
  | 'case-file'
  | 'asteroid-arithmetic'
  | 'brain-blitz';
type Skill = 'Thinking' | 'Mathematics' | 'Language' | 'Creativity' | 'Focus' | 'Memory';
type Domain =
  | 'Brain'
  | 'Mathematics'
  | 'Logic'
  | 'Focus'
  | 'Memory'
  | 'Creativity'
  | 'Language'
  | 'Reading'
  | 'Problem solving'
  | 'Patterns'
  | 'Observation'
  | 'Reaction'
  | 'Spatial'
  | 'Science'
  | 'Building'
  | 'Music'
  | 'Detective'
  | 'Arcade'
  | 'Challenges';
type GameKind = 'memory' | 'quiz' | 'pattern' | 'focus' | 'reaction' | 'creative' | 'story' | 'reading' | 'spatial' | 'build' | 'detective' | 'rhythm' | 'arcade';
type Activity = {
  id: ActivityId;
  title: string;
  kicker: string;
  subtitle: string;
  domain: Domain;
  skill: Skill;
  duration: number;
  level: 1 | 2 | 3 | 4;
  color: string;
  icon: LucideIcon;
  kind: GameKind;
  featured?: boolean;
  completed: boolean;
  bestScore: number;
};
type ProgressState = {
  completedActivities: ActivityId[];
  totalStars: number;
  streak: number;
  weeklyMinutes: number;
  sessions: number;
  skillBreakdown: Record<Skill, number>;
  bestScores: Partial<Record<ActivityId, number>>;
  recentActivityIds: ActivityId[];
};
type Settings = { soundEnabled: boolean };
type DomainFilter = 'All' | Domain;

const STORAGE_PROGRESS = 'brightsprout-progress-v2';
const STORAGE_SETTINGS = 'brightsprout-settings-v1';
const SKILLS: Skill[] = ['Thinking', 'Mathematics', 'Language', 'Creativity', 'Focus', 'Memory'];
const DOMAINS: DomainFilter[] = [
  'All', 'Brain', 'Mathematics', 'Logic', 'Focus', 'Memory', 'Creativity', 'Language',
  'Reading', 'Problem solving', 'Patterns', 'Observation', 'Reaction', 'Spatial',
  'Science', 'Building', 'Music', 'Detective', 'Arcade', 'Challenges',
];
const DEFAULT_PROGRESS: ProgressState = {
  completedActivities: [],
  totalStars: 0,
  streak: 0,
  weeklyMinutes: 0,
  sessions: 0,
  skillBreakdown: { Thinking: 0, Mathematics: 0, Language: 0, Creativity: 0, Focus: 0, Memory: 0 },
  bestScores: {},
  recentActivityIds: [],
};
const ACTIVITY_LIBRARY: Omit<Activity, 'completed' | 'bestScore'>[] = [
  { id: 'memory', title: 'Memory Match', kicker: 'Memory', subtitle: 'Find two pictures that match.', domain: 'Memory', skill: 'Memory', duration: 3, level: 1, color: 'teal', icon: Brain, kind: 'memory', featured: true },
  { id: 'sequence-recall', title: 'Copy the Pattern', kicker: 'Memory', subtitle: 'Watch the lights, then tap them in the same order.', domain: 'Memory', skill: 'Memory', duration: 2, level: 1, color: 'ink', icon: ListChecks, kind: 'rhythm' },
  { id: 'number', title: 'Number Fun', kicker: 'Numbers', subtitle: 'Count, add, and choose the right number.', domain: 'Mathematics', skill: 'Mathematics', duration: 3, level: 1, color: 'coral', icon: Hash, kind: 'quiz', featured: true },
  { id: 'fraction-forge', title: 'Share the Cake', kicker: 'Parts and whole', subtitle: 'Learn about halves and quarters with easy examples.', domain: 'Mathematics', skill: 'Mathematics', duration: 3, level: 1, color: 'ochre', icon: Calculator, kind: 'quiz' },
  { id: 'mental-math', title: 'Quick Numbers', kicker: 'Easy maths', subtitle: 'Try small sums in your head.', domain: 'Mathematics', skill: 'Mathematics', duration: 2, level: 1, color: 'coral', icon: Timer, kind: 'quiz' },
  { id: 'logic-lab', title: 'Logic Friends', kicker: 'Thinking', subtitle: 'Use simple clues to find the answer.', domain: 'Logic', skill: 'Thinking', duration: 3, level: 1, color: 'ink', icon: BrainCircuit, kind: 'quiz', featured: true },
  { id: 'code-breaker', title: 'Secret Shape', kicker: 'Thinking', subtitle: 'Find the shape that belongs in the empty spot.', domain: 'Logic', skill: 'Thinking', duration: 2, level: 1, color: 'teal', icon: Puzzle, kind: 'detective' },
  { id: 'pattern', title: 'Pattern Train', kicker: 'Patterns', subtitle: 'Look at the pattern and pick what comes next.', domain: 'Patterns', skill: 'Thinking', duration: 3, level: 1, color: 'ochre', icon: RouteIcon, kind: 'pattern', featured: true },
  { id: 'matrix-mapper', title: 'Shape Grid', kicker: 'Shapes', subtitle: 'Find the missing shape in a simple grid.', domain: 'Patterns', skill: 'Thinking', duration: 3, level: 1, color: 'ink', icon: Grid3X3, kind: 'pattern' },
  { id: 'focus', title: 'Spot the Different One', kicker: 'Focus', subtitle: 'Find the one picture that is different.', domain: 'Focus', skill: 'Focus', duration: 2, level: 1, color: 'ink', icon: Focus, kind: 'focus', featured: true },
  { id: 'reaction', title: 'Wait & Tap', kicker: 'Focus', subtitle: 'Wait for the signal, then tap.', domain: 'Reaction', skill: 'Focus', duration: 2, level: 1, color: 'coral', icon: Zap, kind: 'reaction' },
  { id: 'doodle', title: 'Draw & Create', kicker: 'Creativity', subtitle: 'Draw something fun from a simple idea.', domain: 'Creativity', skill: 'Creativity', duration: 4, level: 1, color: 'ochre', icon: Palette, kind: 'creative' },
  { id: 'story-builder', title: 'Story Choices', kicker: 'Imagination', subtitle: 'Choose what happens next in a tiny story.', domain: 'Creativity', skill: 'Creativity', duration: 3, level: 1, color: 'coral', icon: WandSparkles, kind: 'story' },
  { id: 'word-detective', title: 'Word Match', kicker: 'Words', subtitle: 'Match easy words with their meaning.', domain: 'Language', skill: 'Language', duration: 3, level: 1, color: 'teal', icon: Languages, kind: 'quiz' },
  { id: 'reading-room', title: 'Little Reader', kicker: 'Reading', subtitle: 'Read a short story and answer easy questions.', domain: 'Reading', skill: 'Language', duration: 3, level: 1, color: 'ink', icon: BookOpen, kind: 'reading' },
  { id: 'mission-builder', title: 'Help the Robot', kicker: 'Problem solving', subtitle: 'Choose the best simple way to help the robot.', domain: 'Problem solving', skill: 'Thinking', duration: 3, level: 1, color: 'teal', icon: Construction, kind: 'build' },
  { id: 'spatial-navigator', title: 'Direction Fun', kicker: 'Directions', subtitle: 'Follow simple left, right, up, and down clues.', domain: 'Spatial', skill: 'Thinking', duration: 2, level: 1, color: 'coral', icon: Map, kind: 'spatial' },
  { id: 'eco-scientist', title: 'Nature Fun', kicker: 'Science', subtitle: 'Learn simple facts about plants, animals, and nature.', domain: 'Science', skill: 'Thinking', duration: 3, level: 1, color: 'teal', icon: FlaskConical, kind: 'quiz' },
  { id: 'blueprint-builder', title: 'Build a Bridge', kicker: 'Building', subtitle: 'Pick simple choices that help a bridge stay strong.', domain: 'Building', skill: 'Creativity', duration: 3, level: 1, color: 'ochre', icon: Blocks, kind: 'build' },
  { id: 'rhythm-rally', title: 'Copy the Beat', kicker: 'Music', subtitle: 'Watch a short beat and copy it.', domain: 'Music', skill: 'Focus', duration: 2, level: 1, color: 'coral', icon: Music2, kind: 'rhythm' },
  { id: 'case-file', title: 'Find the Clue', kicker: 'Observation', subtitle: 'Look at three simple clues and choose what they tell you.', domain: 'Detective', skill: 'Thinking', duration: 3, level: 1, color: 'ink', icon: ShieldQuestion, kind: 'detective' },
  { id: 'asteroid-arithmetic', title: 'Number Hunt', kicker: 'Numbers', subtitle: 'Find the target numbers hiding in the space board.', domain: 'Arcade', skill: 'Mathematics', duration: 2, level: 1, color: 'ink', icon: Gamepad2, kind: 'arcade' },
  { id: 'brain-blitz', title: 'Brain Party', kicker: 'Mixed fun', subtitle: 'A few easy questions about numbers, words, shapes, and nature.', domain: 'Challenges', skill: 'Thinking', duration: 3, level: 1, color: 'coral', icon: Trophy, kind: 'quiz', featured: true },
];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Partial<T>;
    const merged = { ...fallback, ...parsed } as T;
    if (key === STORAGE_PROGRESS) {
      const progress = merged as ProgressState;
      return {
        ...DEFAULT_PROGRESS,
        ...progress,
        skillBreakdown: { ...DEFAULT_PROGRESS.skillBreakdown, ...(progress.skillBreakdown ?? {}) },
        bestScores: progress.bestScores ?? {},
        recentActivityIds: progress.recentActivityIds ?? [],
      } as T;
    }
    return merged;
  } catch {
    return fallback;
  }
}

function App() {
  const [progress, setProgress] = useState<ProgressState>(() => readStorage(STORAGE_PROGRESS, DEFAULT_PROGRESS));
  const [settings, setSettings] = useState<Settings>(() => readStorage(STORAGE_SETTINGS, { soundEnabled: true }));
  const activities = useMemo(
    () => ACTIVITY_LIBRARY.map((activity) => ({
      ...activity,
      completed: progress.completedActivities.includes(activity.id),
      bestScore: progress.bestScores[activity.id] ?? 0,
    })),
    [progress],
  );

  useEffect(() => { window.localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress)); }, [progress]);
  useEffect(() => { window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); }, [settings]);

  const completeActivity = (id: ActivityId, score: number) => {
    setProgress((current) => {
      const activity = ACTIVITY_LIBRARY.find((item) => item.id === id);
      if (!activity) return current;
      const isNew = !current.completedActivities.includes(id);
      const stars = score >= 90 ? 3 : score >= 65 ? 2 : 1;
      return {
        ...current,
        completedActivities: isNew ? [...current.completedActivities, id] : current.completedActivities,
        totalStars: isNew ? current.totalStars + stars : current.totalStars,
        streak: isNew ? current.streak + 1 : current.streak,
        sessions: current.sessions + 1,
        weeklyMinutes: isNew ? current.weeklyMinutes + activity.duration : current.weeklyMinutes,
        bestScores: { ...current.bestScores, [id]: Math.max(current.bestScores[id] ?? 0, score) },
        recentActivityIds: [id, ...current.recentActivityIds.filter((item) => item !== id)].slice(0, 5),
        skillBreakdown: {
          ...current.skillBreakdown,
          [activity.skill]: Math.max(current.skillBreakdown[activity.skill], score),
        },
      };
    });
  };

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Shell settings={settings} onToggleSound={() => setSettings((current) => ({ soundEnabled: !current.soundEnabled }))}>
        <Switch>
          <Route path="/"><HomePage activities={activities} progress={progress} /></Route>
          <Route path="/play/:id"><PlayPage activities={activities} onComplete={completeActivity} /></Route>
          <Route path="/progress"><ProgressPage activities={activities} progress={progress} /></Route>
          <Route path="/about"><AboutPage soundEnabled={settings.soundEnabled} onToggleSound={() => setSettings((current) => ({ soundEnabled: !current.soundEnabled }))} onReset={() => setProgress(DEFAULT_PROGRESS)} /></Route>
          <Route><NotFound /></Route>
        </Switch>
      </Shell>
    </WouterRouter>
  );
}

function Shell({ children, settings, onToggleSound }: { children: ReactNode; settings: Settings; onToggleSound: () => void }) {
  const [location] = useLocation();
  const navItems = [
    { href: '/', label: 'Academy', icon: Compass },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/about', label: 'Guide', icon: Info },
  ];
  const isActive = (href: string) => href === '/' ? location === '/' : location.startsWith(href);
  return (
    <div className="app-shell">
      <div className="app-layout">
        <aside className="sidebar">
          <Link href="/" className="brand-mark" data-testid="link-brand">
            <span className="brand-seed"><Sprout size={22} strokeWidth={2.4} /></span>
            <span className="brand-copy">BrightSprout</span>
          </Link>
          <p className="brand-caption">the learning playground</p>
          <p className="nav-label">Your academy</p>
          <nav className="nav-list" aria-label="Main navigation">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-link ${isActive(href) ? 'active' : ''}`} data-testid={`link-${label.toLowerCase()}`}>
                <Icon size={18} /><span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-mini-card">
            <Sparkles size={17} />
            <strong>Designed for discovery</strong>
            <span>Short sessions. Serious thinking. Always kind.</span>
          </div>
          <div className="sidebar-foot"><strong>Offline by nature.</strong><br />Your discoveries stay on this device.</div>
        </aside>
        <main className="main">
          <header className="topbar">
            <div><p className="topbar-kicker">BrightSprout / learning academy</p><p className="topbar-title">Make a little progress.</p></div>
            <button className="sound-button" onClick={onToggleSound} aria-label={settings.soundEnabled ? 'Turn sound off' : 'Turn sound on'} data-testid="button-toggle-sound">
              {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </header>
          {children}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={isActive(href) ? 'active' : ''}><Icon size={18} /><span>{label}</span></Link>)}
      </nav>
    </div>
  );
}

function HomePage({ activities, progress }: { activities: Activity[]; progress: ProgressState }) {
  const [domain, setDomain] = useState<DomainFilter>('All');
  const [query, setQuery] = useState('');
  const nextActivity = activities.find((activity) => !activity.completed) ?? activities[0];
  const completedCount = progress.completedActivities.length;
  const filtered = activities.filter((activity) => {
    const matchesDomain = domain === 'All' || activity.domain === domain;
    const text = `${activity.title} ${activity.subtitle} ${activity.domain} ${activity.kicker}`.toLowerCase();
    return matchesDomain && text.includes(query.toLowerCase());
  });
  const featured = activities.filter((activity) => activity.featured);
  return (
    <div className="content">
      <section className="academy-hero">
        <div className="hero-copy">
          <span className="eyebrow">A bigger playground for curious minds</span>
          <h1 className="display-title">Think boldly.<br /><em>Grow brightly.</em></h1>
          <p className="subtle">A playful learning studio made for ages 6–7. Choose a short mission, practise a real skill, and build your own trail of “I can do it” moments.</p>
          <div className="hero-actions"><Link href={`/play/${nextActivity.id}`} className="button-primary" data-testid="link-start-adventure">{completedCount === activities.length ? 'Take another lap' : 'Start an activity'} <ArrowRight size={18} /></Link><span className="hero-note"><CheckCircle2 size={15} /> No pressure. No ads. Progress stays local.</span></div>
          <div className="hero-stat-row">
            <div className="hero-stat"><strong>{activities.length}</strong><span>activities</span></div>
            <div className="hero-stat"><strong>{completedCount}</strong><span>explored</span></div>
            <div className="hero-stat"><strong>{progress.totalStars}</strong><span>stars earned</span></div>
          </div>
        </div>
        <div className="hero-art academy-art" aria-label="Learning constellation illustration">
          <div className="constellation constellation-one"><span /><span /><span /></div>
          <div className="constellation constellation-two"><span /><span /><span /><span /></div>
          <div className="hero-orbit"><BrainCircuit size={45} /><span>YOUR<br />CURIOSITY<br />IS A SKILL</span></div>
          <div className="trail-bubble"><strong>Today’s nudge</strong>Pick something fun and give it a try. Small steps help you learn.</div>
        </div>
      </section>

      <section className="featured-section" aria-labelledby="featured-heading">
        <div className="section-heading"><div><span className="eyebrow">Curated for today</span><h2 id="featured-heading">Featured activities</h2></div><span className="section-note"><Trophy size={14} /> Build your own path</span></div>
        <div className="featured-row">{featured.map((activity) => <FeaturedCard key={activity.id} activity={activity} />)}</div>
      </section>

      <section id="catalogue" className="catalogue-section" aria-labelledby="catalogue-heading">
        <div className="section-heading catalogue-head"><div><span className="eyebrow">The activity library</span><h2 id="catalogue-heading">Pick a fun activity</h2><p className="subtle">Maths, language, making, mystery, movement, and everything in between.</p></div><div className="catalogue-count">{filtered.length} of {activities.length}<span>activities shown</span></div></div>
         <div className="catalogue-tools">
           <div className="filter-chips" aria-label="Filter by learning domain">{DOMAINS.map((item) => <button key={item} className={`filter-chip ${domain === item ? 'active' : ''}`} aria-pressed={domain === item} onClick={() => setDomain(item)}>{item}</button>)}</div>
           <label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activities" aria-label="Search activities" /></label>
        </div>
         <div className="activity-grid">{filtered.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
         {filtered.length === 0 && <div className="empty-state"><Search size={25} /><strong>No activity matches that search.</strong><span>Try a different word or choose all domains.</span><button className="button-secondary button-small" onClick={() => { setQuery(''); setDomain('All'); }}>Clear search</button></div>}
      </section>

      <div className="challenge-banner"><div className="challenge-icon"><Timer size={25} /></div><div><span className="eyebrow">Daily challenge</span><h3>Ready for a little brain fun?</h3><p>A few easy questions about things you already know.</p></div><Link href="/play/brain-blitz" className="button-secondary button-small">Play Brain Party <ArrowRight size={15} /></Link></div>

      <div className="dashboard-row">
        <section className="panel" aria-labelledby="week-heading"><div className="panel-head"><div><span className="eyebrow">Your rhythm</span><h3 id="week-heading">Small sessions add up</h3></div><Clock3 size={21} color="hsl(161 43% 33%)" /></div><div className="stat-big" data-testid="text-weekly-minutes">{progress.weeklyMinutes}<span className="unit-label"> min</span></div><p className="stat-caption">of your 20 minute trail goal</p><div className="progress-track" style={{ marginTop: 16 }}><div className="progress-fill" style={{ width: `${Math.min(100, progress.weeklyMinutes / 20 * 100)}%` }} /></div><div className="streak-strip"><Star size={22} fill="currentColor" /><div><strong>{progress.streak || 0} discovery sessions in a row</strong><span>Every small step counts.</span></div></div></section>
        <section className="panel" aria-labelledby="trail-heading"><div className="panel-head"><div><span className="eyebrow">Recent activity</span><h3 id="trail-heading">Your learning trail</h3></div><RouteIcon size={21} color="hsl(9 77% 67%)" /></div>{progress.recentActivityIds.length > 0 ? <div className="recent-list">{progress.recentActivityIds.slice(0, 3).map((id) => { const activity = activities.find((item) => item.id === id); return activity ? <div className="recent-item" key={id}><span className={`recent-dot ${activity.color}`}><activity.icon size={15} /></span><div><strong>{activity.title}</strong><span>{activity.domain} · score {activity.bestScore}</span></div><Check size={16} color="hsl(161 43% 33%)" /></div> : null; })}</div> : <div className="empty-mini"><Sprout size={20} /><span>Finish an activity and it will appear here.</span></div>}</section>
      </div>
    </div>
  );
}

function FeaturedCard({ activity }: { activity: Activity }) {
  const Icon = activity.icon;
  return <Link href={`/play/${activity.id}`} className={`featured-card ${activity.color}`}><div className="featured-top"><span className="activity-icon"><Icon size={22} /></span><span className="featured-arrow"><ArrowRight size={17} /></span></div><span className="eyebrow">{activity.kicker}</span><h3>{activity.title}</h3><p>{activity.subtitle}</p><div className="featured-bottom"><span>{activity.duration} min</span><span>{activity.level === 2 ? 'A little harder' : 'Easy start'}</span></div></Link>;
}

function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = activity.icon;
  return <Link href={`/play/${activity.id}`} className={`activity-card ${activity.color} ${activity.completed ? 'completed' : ''}`} data-testid={`card-activity-${activity.id}`}><div className="activity-card-top"><span className="activity-icon"><Icon size={22} /></span>{activity.completed ? <span className="card-check" aria-label="Completed"><Check size={14} strokeWidth={3} /></span> : <span className="domain-ribbon">{activity.domain}</span>}</div><span className="activity-kicker">{activity.kicker}</span><h3>{activity.title}</h3><p>{activity.subtitle}</p><div className="activity-meta"><span>{activity.duration} min</span><span className="level-dots" aria-label={`Level ${activity.level}`}>{[1, 2, 3, 4].map((level) => <i key={level} className={level <= activity.level ? 'filled' : ''} />)}</span>{activity.bestScore > 0 && <span className="activity-score"><Star size={12} fill="currentColor" /> {activity.bestScore}</span>}</div></Link>;
}

function ProgressPage({ activities, progress }: { activities: Activity[]; progress: ProgressState }) {
  const completed = progress.completedActivities.length;
  const recent = progress.recentActivityIds.map((id) => activities.find((activity) => activity.id === id)).filter(Boolean) as Activity[];
  return <div className="content"><div className="page-heading"><span className="eyebrow">Your field notes</span><h1>Progress, not pressure.</h1><p className="subtle">Every session leaves a small mark. Look back at the skills you have explored and choose the next stretch.</p></div><div className="progress-hero"><section className="progress-card" aria-label="Missions explored"><h3>Missions explored</h3><div className="stat-big" data-testid="text-activities-completed">{completed}<span className="unit-label"> / {activities.length}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${completed / activities.length * 100}%` }} /></div><p className="progress-card-foot">{Math.round(completed / activities.length * 100)}% of the academy is open</p></section><section className="progress-card warm" aria-label="Stars collected"><h3>Stars collected</h3><div className="stat-big" data-testid="text-total-stars">{progress.totalStars}<span className="unit-label"> stars</span></div><p className="progress-card-foot">Best score: {Math.max(0, ...Object.values(progress.bestScores).filter((score): score is number => typeof score === 'number')) || 'not yet recorded'}</p></section><section className="progress-card ink-card" aria-label="Sessions completed"><h3>Learning sessions</h3><div className="stat-big">{progress.sessions}<span className="unit-label"> runs</span></div><p className="progress-card-foot">Practice makes pathways.</p></section></div><section className="panel" aria-labelledby="skills-heading"><div className="panel-head"><div><span className="eyebrow">Skill garden</span><h3 id="skills-heading">What is growing?</h3></div><Sprout size={22} color="hsl(161 43% 33%)" /></div><div className="skill-list">{SKILLS.map((skill) => <div className="skill-line" key={skill}><span>{skill}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${progress.skillBreakdown[skill]}%` }} /></div><span className="skill-value" data-testid={`text-skill-${skill.toLowerCase().replace(' ', '-')}`}>{progress.skillBreakdown[skill]}%</span></div>)}</div></section><div className="dashboard-row"><section className="panel"><div className="panel-head"><div><span className="eyebrow">Trail log</span><h3>Recent discoveries</h3></div><Radar size={20} /></div>{recent.length > 0 ? <div className="recent-list">{recent.map((activity) => <div className="recent-item" key={activity.id}><span className={`recent-dot ${activity.color}`}><activity.icon size={15} /></span><div><strong>{activity.title}</strong><span>{activity.kicker} · best score {activity.bestScore}</span></div><Check size={16} color="hsl(161 43% 33%)" /></div>)}</div> : <div className="empty-mini"><NotebookPen size={20} /><span>Your first completed mission will start the log.</span></div>}</section><section className="panel"><div className="panel-head"><div><span className="eyebrow">A gentle nudge</span><h3>Choose useful difficulty</h3></div><Lightbulb size={20} color="hsl(39 91% 55%)" /></div><p className="subtle">If a mission feels easy, try a level-up activity. If it feels tricky, switch domains and return later. A hard round is information, not a verdict.</p><Link href="/" className="button-secondary button-small">Explore the library <ArrowRight size={15} /></Link></section></div></div>;
}

function AboutPage({ soundEnabled, onToggleSound, onReset }: { soundEnabled: boolean; onToggleSound: () => void; onReset: () => void }) {
  return <div className="content"><div className="page-heading"><span className="eyebrow">Field guide</span><h1>For curious minds.</h1><p className="subtle">BrightSprout is a learning studio for children aged 6–7. It brings together the habits beneath confident learning: noticing, explaining, imagining, and trying again.</p></div><div className="about-grid"><section className="about-card"><span className="eyebrow" style={{ color: 'hsl(39 91% 62%)' }}>A wider playground</span><h2>Less worksheet.<br />More wonder.</h2><p>Across the academy, children can practise mathematics, language, reading, memory, attention, science, design, music, reasoning, and creative expression in short sessions.</p></section><section className="about-card about-note"><span className="eyebrow" style={{ color: 'hsl(161 43% 33%)' }}>A note for grown-ups</span><h2>Small steps are real steps.</h2><p>No accounts, no ads, no leaderboard. Progress stays in this browser so a child can explore at their own pace, with challenge that feels encouraging rather than stressful.</p></section></div><div className="principles"><section className="principle"><span className="principle-icon"><Compass size={19} /></span><div><h3>Build a broad brain</h3><p>Different missions exercise different kinds of thinking, so “being good at learning” never means just one thing.</p></div></section><section className="principle"><span className="principle-icon"><Eye size={19} /></span><div><h3>Feedback that feels useful</h3><p>Correct answers are celebrated, while misses point to a new route through the same idea.</p></div></section><section className="principle"><span className="principle-icon"><Volume2 size={19} /></span><div><h3>Made for quiet corners</h3><p>Sound is optional, touch targets are generous, and every discovery works offline on this device.</p></div></section></div><section className="panel settings-panel"><div className="panel-head"><div><span className="eyebrow">Settings</span><h3>Make the academy yours</h3></div><Info size={20} /></div><div className="setting-row"><div><strong>Sound feedback</strong><p className="stat-caption">{soundEnabled ? 'On for little moments of feedback.' : 'Off for a quieter trail.'}</p></div><button className="button-secondary button-small" onClick={onToggleSound} data-testid="button-about-sound">{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}{soundEnabled ? 'Turn off' : 'Turn on'}</button></div><div className="setting-row"><div><strong>Start fresh</strong><p className="stat-caption">Clear local learning notes on this device.</p></div><button className="button-secondary button-small" onClick={onReset} data-testid="button-reset-progress"><RotateCcw size={15} /> Reset progress</button></div></section><p className="about-credit">BrightSprout is an original learning experience built from open-source product research. No repository code, artwork, sound, or copy is bundled into the app.</p></div>;
}

function PlayPage({ activities, onComplete }: { activities: Activity[]; onComplete: (id: ActivityId, score: number) => void }) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const activity = activities.find((item) => item.id === id);
  const [result, setResult] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  if (!activity) return <NotFound />;
  const handleComplete = (score: number) => { onComplete(activity.id, score); setResult(score); };
  return <div className="content"><div className="play-header"><button className="back-link" onClick={() => setLocation('/')} data-testid="button-back-home"><ChevronLeft size={17} /> Academy</button><div className="play-title"><span className="eyebrow">{activity.kicker}</span><h1>{activity.title}</h1><p>{activity.duration} min · {activity.domain} · level {activity.level}</p></div><div className="play-score"><strong>{(result ?? activity.bestScore) || '—'}</strong>{result ? 'new score' : 'best score'}</div></div><div className="game-panel">{result === null ? <GameView key={`${activity.id}-${run}`} activity={activity} onComplete={handleComplete} /> : <CompletionView activity={activity} score={result} onReplay={() => { setResult(null); setRun((value) => value + 1); }} onHome={() => setLocation('/')} />}</div></div>;
}

function GameIntro({ activity, children }: { activity: Activity; children?: ReactNode }) {
  const Icon = activity.icon;
  return <div className="game-intro"><span className="activity-icon"><Icon size={23} /></span><span className="eyebrow">{activity.kicker}</span><h2>{activity.title}</h2><p>{activity.subtitle}</p>{children}</div>;
}

function GameView({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  if (activity.kind === 'memory') return <MemoryGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'quiz') return <QuizGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'pattern') return <PatternGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'focus') return <FocusGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'reaction') return <ReactionGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'creative') return <CreativeGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'story') return <StoryGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'reading') return <ReadingGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'spatial') return <SpatialGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'build') return <BuildGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'detective') return <DetectiveGame activity={activity} onComplete={onComplete} />;
  if (activity.kind === 'rhythm') return <RhythmGame activity={activity} onComplete={onComplete} />;
  return <ArcadeGame activity={activity} onComplete={onComplete} />;
}

type MemoryCardData = { key: string; pair: string; icon: LucideIcon; flipped: boolean; matched: boolean };
const memoryPairs: [string, LucideIcon][] = [['circle', Circle], ['triangle', Triangle], ['square', Square], ['star', Star]];
function MemoryGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [cards, setCards] = useState<MemoryCardData[]>(() => [...memoryPairs, ...memoryPairs].map(([pair, icon], index) => ({ key: `${pair}-${index}`, pair, icon, flipped: false, matched: false })).sort(() => Math.random() - .5));
  const [first, setFirst] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [turns, setTurns] = useState(0);
  const [feedback, setFeedback] = useState('Find two that belong together.');
  const pickCard = (index: number) => {
    if (locked || cards[index].flipped || cards[index].matched) return;
    const nextCards = cards.map((card, cardIndex) => cardIndex === index ? { ...card, flipped: true } : card);
    setCards(nextCards);
    if (first === null) { setFirst(index); setFeedback('Now find its partner.'); return; }
    setLocked(true); setFirst(null); setTurns((value) => value + 1);
    const isMatch = cards[first].pair === cards[index].pair;
    if (isMatch) {
      setFeedback('A match. Nice noticing.');
      window.setTimeout(() => {
        setCards((current) => current.map((card, cardIndex) => cardIndex === first || cardIndex === index ? { ...card, matched: true } : card));
        setLocked(false);
        if (nextCards.filter((card) => card.matched).length + 2 === nextCards.length) onComplete(Math.max(45, 100 - (turns + 1) * 3));
      }, 420);
    } else {
      setFeedback('Not quite. Your memory is still mapping it.');
      window.setTimeout(() => { setCards((current) => current.map((card, cardIndex) => cardIndex === first || cardIndex === index ? { ...card, flipped: false } : card)); setLocked(false); }, 740);
    }
  };
  return <><GameIntro activity={activity}><div className="game-rule"><Brain size={15} /> Find the two cards that match.</div></GameIntro><div className={`feedback ${feedback.startsWith('Not') ? 'wrong' : ''}`} aria-live="polite">{feedback}</div><div className="memory-grid">{cards.map((card, index) => { const Icon = card.icon; return <button className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`} key={card.key} onClick={() => pickCard(index)} disabled={locked || card.matched} aria-label={card.flipped || card.matched ? `Card showing ${card.pair}` : 'Hidden memory card'} data-testid={`button-memory-card-${index}`}>{card.flipped || card.matched ? <Icon size={25} /> : <Sprout size={20} />}</button>; })}</div><div className="game-footer-note"><span>Challenge: use as few turns as possible.</span><span>Turns {turns}</span></div></>;
}

type QuizQuestion = { prompt: string; answer: string; choices: string[]; explanation: string };
const quizBank: Record<string, QuizQuestion[]> = {
  number: [
    { prompt: 'What number comes after 7?', answer: '8', choices: ['6', '8', '9', '10'], explanation: '8 comes after 7.' },
    { prompt: 'What is 3 + 4?', answer: '7', choices: ['5', '6', '7', '8'], explanation: 'Three plus four is seven.' },
    { prompt: 'Which number is bigger?', answer: '9', choices: ['6', '7', '9', '5'], explanation: '9 is the biggest number here.' },
    { prompt: 'How many sides does a triangle have?', answer: '3', choices: ['2', '3', '4', '5'], explanation: 'A triangle has three sides.' },
  ],
  'fraction-forge': [
    { prompt: 'Which picture would show one half?', answer: '2 equal parts', choices: ['2 equal parts', '3 equal parts', '5 equal parts', 'No parts'], explanation: 'A half means two equal parts.' },
    { prompt: 'Which is one quarter?', answer: '1 of 4 equal parts', choices: ['1 of 2 equal parts', '1 of 3 equal parts', '1 of 4 equal parts', '4 of 4 equal parts'], explanation: 'A quarter is one of four equal parts.' },
    { prompt: 'A pizza has 4 equal pieces. You eat 1. How many are left?', answer: '3', choices: ['1', '2', '3', '4'], explanation: 'Four pieces minus one leaves three.' },
  ],
  'mental-math': [
    { prompt: 'What is 2 + 3?', answer: '5', choices: ['4', '5', '6', '7'], explanation: 'Two plus three is five.' },
    { prompt: 'What is 10 - 4?', answer: '6', choices: ['5', '6', '7', '8'], explanation: 'Ten take away four is six.' },
    { prompt: 'What is 5 + 5?', answer: '10', choices: ['8', '9', '10', '11'], explanation: 'Five plus five is ten.' },
  ],
  'logic-lab': [
    { prompt: 'Mia is taller than Ben. Who is shorter?', answer: 'Ben', choices: ['Mia', 'Ben', 'Both', 'We do not know'], explanation: 'If Mia is taller, Ben is shorter.' },
    { prompt: 'Which one is not a fruit?', answer: 'Carrot', choices: ['Apple', 'Banana', 'Carrot', 'Orange'], explanation: 'A carrot is a vegetable.' },
    { prompt: 'What comes next: red, blue, red, blue, ?', answer: 'Red', choices: ['Red', 'Green', 'Yellow', 'Black'], explanation: 'The colours take turns.' },
  ],
  'word-detective': [
    { prompt: 'Which word means the same as big?', answer: 'Large', choices: ['Small', 'Large', 'Quiet', 'Fast'], explanation: 'Big and large mean the same thing.' },
    { prompt: 'What is the opposite of hot?', answer: 'Cold', choices: ['Warm', 'Cold', 'Dry', 'Bright'], explanation: 'Cold is the opposite of hot.' },
    { prompt: 'Which word names an animal?', answer: 'Tiger', choices: ['Tiger', 'Table', 'Yellow', 'Jump'], explanation: 'A tiger is an animal.' },
  ],
  'eco-scientist': [
    { prompt: 'Which part of a plant is usually green and makes food?', answer: 'Leaf', choices: ['Leaf', 'Root', 'Rock', 'Shoe'], explanation: 'Leaves use sunlight to help the plant make food.' },
    { prompt: 'Which animal can fly?', answer: 'Bird', choices: ['Fish', 'Bird', 'Dog', 'Frog'], explanation: 'Birds have wings and can fly.' },
    { prompt: 'What do plants need to grow?', answer: 'Water and light', choices: ['Water and light', 'Only toys', 'Only sand', 'Nothing'], explanation: 'Plants need water and light to grow.' },
  ],
  'brain-blitz': [
    { prompt: 'What is 4 + 2?', answer: '6', choices: ['5', '6', '7', '8'], explanation: 'Four plus two is six.' },
    { prompt: 'Which shape is round?', answer: 'Circle', choices: ['Triangle', 'Circle', 'Square', 'Star'], explanation: 'A circle is round.' },
    { prompt: 'What is the opposite of up?', answer: 'Down', choices: ['Left', 'Down', 'Right', 'Over'], explanation: 'Down is the opposite of up.' },
    { prompt: 'Which animal lives in water?', answer: 'Fish', choices: ['Fish', 'Cat', 'Horse', 'Rabbit'], explanation: 'Fish live in water.' },
  ],
};

function QuizGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const questions = quizBank[activity.id] ?? quizBank['brain-blitz'];
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState('Trust your first thought, then check it.');
  const question = questions[index];
  const answer = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === question.answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setAnswered(choice); setCorrect(nextCorrect);
    setFeedback(isCorrect ? 'Yes. That one clicked.' : `${question.explanation}`);
    window.setTimeout(() => {
      if (index === questions.length - 1) onComplete(Math.round(nextCorrect / questions.length * 100));
      else { setIndex((value) => value + 1); setAnswered(null); setFeedback('Next one is waiting.'); }
    }, 700);
  };
  return <><GameIntro activity={activity}><div className="game-rule"><Calculator size={15} /> Read the question and pick an answer.</div></GameIntro><div className="question-progress"><span>QUESTION {index + 1} / {questions.length}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${(index + 1) / questions.length * 100}%` }} /></div></div><div className={`feedback ${answered && answered !== question.answer ? 'wrong' : ''}`} aria-live="polite">{feedback}</div><div className="quiz-prompt">{question.prompt}</div><div className="choice-grid">{question.choices.map((choice) => <button key={choice} className={`choice-button ${answered && choice === question.answer ? 'correct' : ''} ${answered === choice && choice !== question.answer ? 'wrong' : ''}`} onClick={() => answer(choice)} disabled={Boolean(answered)} data-testid={`button-quiz-choice-${choice}`}>{choice}</button>)}</div></>;
}

const patternsById: Record<string, { sequence: string[]; choices: string[]; answer: string }[]> = {
  pattern: [
    { sequence: ['red', 'blue', 'red', 'blue', '?'], choices: ['red', 'blue', 'green', 'yellow'], answer: 'red' },
    { sequence: ['1', '2', '1', '2', '?'], choices: ['1', '2', '3', '4'], answer: '1' },
    { sequence: ['★', '○', '★', '○', '?'], choices: ['★', '○', '□', '△'], answer: '★' },
  ],
  'matrix-mapper': [
    { sequence: ['▲', '●', '▲', '●', '?'], choices: ['▲', '●', '■', '◆'], answer: '▲' },
    { sequence: ['■', '○', '■', '○', '?'], choices: ['■', '○', '▲', '★'], answer: '■' },
    { sequence: ['1', '2', '1', '2', '?'], choices: ['1', '2', '3', '4'], answer: '1' },
  ],
};
function PatternGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const patterns = patternsById[activity.id] ?? patternsById.pattern;
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState('Look carefully at the pattern.');
  const pattern = patterns[index];
  const choose = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === pattern.answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setAnswered(choice); setCorrect(nextCorrect); setFeedback(isCorrect ? 'Pattern spotted.' : `The path continues with ${pattern.answer}.`);
    window.setTimeout(() => {
      if (index === patterns.length - 1) onComplete(Math.round(nextCorrect / patterns.length * 100));
      else { setIndex((value) => value + 1); setAnswered(null); setFeedback('Try the next pattern.'); }
    }, 700);
  };
  return <><GameIntro activity={activity}><div className="game-rule"><Shapes size={15} /> Look at the shapes and find what is missing.</div></GameIntro><div className="question-count">PATH {index + 1} OF {patterns.length}</div><div className="feedback" aria-live="polite">{feedback}</div><div className={`pattern-sequence ${activity.id === 'matrix-mapper' ? 'matrix-sequence' : ''}`}>{pattern.sequence.map((value, itemIndex) => <span className={`pattern-chip ${value === '?' ? 'missing' : ''}`} key={`${value}-${itemIndex}`}>{value}</span>)}</div><div className="choice-grid">{pattern.choices.map((choice) => <button key={choice} className={`choice-button ${answered && choice === pattern.answer ? 'correct' : ''} ${answered === choice && choice !== pattern.answer ? 'wrong' : ''}`} onClick={() => choose(choice)} disabled={Boolean(answered)}>{choice}</button>)}</div></>;
}

type SafariRound = { target: number; targetKind: number; kinds: number[] };
const safariIcons: LucideIcon[] = [Circle, Triangle, Square, Diamond];
function makeSafariRound(): SafariRound { const target = Math.floor(Math.random() * 12); const targetKind = Math.floor(Math.random() * safariIcons.length); const kinds = Array.from({ length: 12 }, (_, index) => index === target ? targetKind : Math.floor(Math.random() * safariIcons.length)); return { target, targetKind, kinds }; }
function FocusGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [board, setBoard] = useState<SafariRound>(() => makeSafariRound());
  const [found, setFound] = useState(false);
  const [feedback, setFeedback] = useState('Find the one shape that is different.');
  const TargetIcon = safariIcons[board.targetKind];
  const choose = (index: number) => {
    if (found) return;
    if (index !== board.target) { setFeedback('Keep looking. Let your eyes settle.'); return; }
    setFound(true); setFeedback('There it is. Focus found.');
    window.setTimeout(() => { if (round === 1) onComplete(100); else { setRound((value) => value + 1); setBoard(makeSafariRound()); setFound(false); setFeedback('New round. Find the quiet signal.'); } }, 650);
  };
  return <><GameIntro activity={activity}><div className="game-rule"><ScanEye size={15} /> Find the one that is different.</div></GameIntro><div className="question-count">ROUND {round + 1} OF 2</div><div className="feedback" aria-live="polite">{feedback}</div><div className="safari-target"><span className="target-swatch" /><span>Find the <strong><TargetIcon size={15} style={{ verticalAlign: 'middle' }} /> different one</strong></span></div><div className="safari-board">{board.kinds.map((kind, index) => { const Icon = safariIcons[kind]; return <button key={`${round}-${index}`} className={`safari-tile ${found && index === board.target ? 'found' : ''}`} onClick={() => choose(index)} disabled={found} aria-label={`Shape tile ${index + 1}`}><Icon size={24} /></button>; })}</div></>;
}

function ReactionGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'readying' | 'go' | 'result'>('readying');
  const [readyAt, setReadyAt] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('Wait for the signal. Do not tap early.');
  useEffect(() => {
    if (phase !== 'readying') return undefined;
    const timer = window.setTimeout(() => { setReadyAt(Date.now()); setPhase('go'); setFeedback('NOW. Tap the signal.'); }, 900 + Math.random() * 1700);
    return () => window.clearTimeout(timer);
  }, [phase, round]);
  const tap = () => {
    if (phase === 'readying') { setFeedback('Too soon. Reset your attention, then wait.'); setPhase('result'); window.setTimeout(() => { if (round === 2) onComplete(Math.round(times.reduce((sum, time) => sum + time, 0) / Math.max(1, times.length) > 650 ? 55 : 75)); else { setRound((value) => value + 1); setPhase('readying'); setFeedback('New round. Wait for the signal.'); } }, 650); return; }
    if (phase !== 'go') return;
    const elapsed = Date.now() - readyAt;
    const nextTimes = [...times, elapsed];
    setTimes(nextTimes); setPhase('result'); setFeedback(`${elapsed} ms. Calm and quick.`);
    window.setTimeout(() => { if (round === 2) onComplete(Math.max(55, Math.min(100, 125 - Math.round(nextTimes.reduce((sum, time) => sum + time, 0) / nextTimes.length / 8)))); else { setRound((value) => value + 1); setPhase('readying'); setFeedback('Next round. Wait for the signal.'); } }, 650);
  };
  return <><GameIntro activity={activity}><div className="game-rule"><Zap size={15} /> Wait for the signal, then tap.</div></GameIntro><div className="question-count">ROUND {round + 1} OF 3</div><div className={`feedback ${phase === 'go' ? 'signal' : ''}`} aria-live="polite">{feedback}</div><button className={`reaction-pad ${phase === 'go' ? 'go' : ''}`} onClick={tap} disabled={phase === 'result'}><span>{phase === 'go' ? 'Tap now' : phase === 'readying' ? 'Wait for green' : 'Resetting'}</span><MousePointer2 size={31} /></button><div className="reaction-times">{times.map((time, index) => <span key={index}>{time} ms</span>)}</div></>;
}

function CreativeGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState('#125d4b');
  const [strokeCount, setStrokeCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext('2d'); if (!context) return; context.fillStyle = '#fffdf7'; context.fillRect(0, 0, canvas.width, canvas.height); context.strokeStyle = '#d7ddcf'; context.lineWidth = 1; for (let x = 0; x < canvas.width; x += 32) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); } for (let y = 0; y < canvas.height; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(canvas.width, y); context.stroke(); } }, []);
  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => { const canvas = canvasRef.current; if (!canvas) return null; const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height }; };
  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => { const context = canvasRef.current?.getContext('2d'); const position = point(event); if (!context || !position || submitted) return; drawingRef.current = true; context.beginPath(); context.moveTo(position.x, position.y); context.strokeStyle = color; context.lineWidth = 5; context.lineCap = 'round'; setStrokeCount((value) => value + 1); };
  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!drawingRef.current) return; const context = canvasRef.current?.getContext('2d'); const position = point(event); if (!context || !position) return; context.lineTo(position.x, position.y); context.stroke(); };
  const clear = () => { const canvas = canvasRef.current; const context = canvas?.getContext('2d'); if (!canvas || !context) return; context.clearRect(0, 0, canvas.width, canvas.height); context.fillStyle = '#fffdf7'; context.fillRect(0, 0, canvas.width, canvas.height); setStrokeCount(0); };
  return <><GameIntro activity={activity}><div className="creative-prompt"><PenLine size={15} /><span>Prompt: Draw your favourite animal.</span></div></GameIntro><div className="canvas-wrap"><canvas ref={canvasRef} width={640} height={360} onPointerDown={start} onPointerMove={move} onPointerUp={() => { drawingRef.current = false; }} onPointerLeave={() => { drawingRef.current = false; }} aria-label="Drawing canvas" /></div><div className="creative-tools"><div className="palette">{['#125d4b', '#e87564', '#e6ae36', '#24364a', '#a56ce3'].map((item) => <button key={item} className={`color-swatch ${color === item ? 'selected' : ''}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Choose ${item}`} />)}</div><button className="button-secondary button-small" onClick={clear}><RotateCcw size={15} /> Clear</button><button className="button-primary button-small" disabled={submitted || strokeCount === 0} onClick={() => { setSubmitted(true); onComplete(strokeCount >= 3 ? 100 : 82); }}><Check size={15} /> Save drawing</button></div><p className="canvas-note">{submitted ? 'Your idea is collected. There is no wrong way to invent.' : 'Use your finger or mouse. Draw anything you like.'}</p></>;
}

function StoryGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const scenes = [
    { text: 'You find a little puppy near the park. What do you do?', choices: ['Help it find its owner', 'Run away and hide it', 'Ignore it'] },
    { text: 'You see a sign with a phone number. What helps most?', choices: ['Read the number', 'Tear the sign', 'Hide the sign'] },
    { text: 'The owner arrives. What should you do?', choices: ['Give the puppy back', 'Take the puppy home', 'Walk away'] },
  ];
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const choose = (choice: string) => { const next = [...choices, choice]; setChoices(next); if (index === scenes.length - 1) onComplete(Math.max(70, 100 - next.filter((item) => item.includes('Run') || item.includes('Tear') || item.includes('Take')).length * 10)); else setIndex((value) => value + 1); };
  return <><GameIntro activity={activity}><div className="game-rule"><WandSparkles size={15} /> There is no wrong way to make up a story.</div></GameIntro><div className="story-progress">SCENE {index + 1} OF {scenes.length}</div><div className="story-card"><Sparkles size={21} /><p>{scenes[index].text}</p></div><div className="story-options">{scenes[index].choices.map((choice) => <button className="choice-button story-choice" key={choice} onClick={() => choose(choice)}>{choice}<ArrowRight size={17} /></button>)}</div></>;
}

function ReadingGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const questions: QuizQuestion[] = [
    { prompt: 'What did Sam find?', answer: 'A red ball', choices: ['A red ball', 'A blue shoe', 'A green hat', 'A book'], explanation: 'Sam found a red ball under the bench.' },
    { prompt: 'Where was the ball?', answer: 'Under the bench', choices: ['Under the bench', 'In a tree', 'On the road', 'In a bag'], explanation: 'The ball was under the bench.' },
    { prompt: 'What did Sam do?', answer: 'He gave it to Mia', choices: ['He kicked it away', 'He gave it to Mia', 'He hid it', 'He threw it'], explanation: 'Sam knew the ball belonged to Mia.' },
  ];
  const passage = 'Sam was playing in the park. He saw a red ball under a bench. Sam picked it up and saw Mia looking for it. He gave the ball to Mia, and they played together.';
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const question = questions[index];
  const choose = (choice: string) => { if (answered) return; const next = correct + (choice === question.answer ? 1 : 0); setCorrect(next); setAnswered(choice); window.setTimeout(() => { if (index === questions.length - 1) onComplete(Math.round(next / questions.length * 100)); else { setIndex((value) => value + 1); setAnswered(null); } }, 700); };
  return <><GameIntro activity={activity}><div className="game-rule"><BookText size={15} /> Read the story, then choose.</div></GameIntro><article className="reading-passage"><span className="eyebrow">A park day</span><p>{passage}</p></article><div className="question-count">QUESTION {index + 1} OF {questions.length}</div><div className="quiz-prompt reading-question">{question.prompt}</div><div className="choice-grid">{question.choices.map((choice) => <button key={choice} className={`choice-button reading-choice ${answered && choice === question.answer ? 'correct' : ''} ${answered === choice && choice !== question.answer ? 'wrong' : ''}`} onClick={() => choose(choice)} disabled={Boolean(answered)}>{choice}</button>)}</div></>;
}

const spatialRounds = [
  { prompt: 'The arrow points up. Which way is it?', answer: 'Up', choices: ['Up', 'Down', 'Left', 'Right'] },
  { prompt: 'The ball is on the left. Where is the star?', answer: 'Right', choices: ['Up', 'Down', 'Left', 'Right'] },
  { prompt: 'Move one step right. Which way did you go?', answer: 'Right', choices: ['Up', 'Down', 'Left', 'Right'] },
];
function SpatialGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [index, setIndex] = useState(0); const [answered, setAnswered] = useState<string | null>(null); const [correct, setCorrect] = useState(0); const round = spatialRounds[index];
  const icons: Record<string, LucideIcon> = { Up: ArrowUp, Down: ArrowDown, Left: ArrowLeft, Right: ArrowRight };
  const choose = (choice: string) => { if (answered) return; const next = correct + (choice === round.answer ? 1 : 0); setCorrect(next); setAnswered(choice); window.setTimeout(() => { if (index === spatialRounds.length - 1) onComplete(Math.round(next / spatialRounds.length * 100)); else { setIndex((value) => value + 1); setAnswered(null); } }, 650); };
  return <><GameIntro activity={activity}><div className="game-rule"><Map size={15} /> Look at the arrows and choose a direction.</div></GameIntro><div className="question-count">MAP STEP {index + 1} OF {spatialRounds.length}</div><div className="spatial-prompt"><Grid3X3 size={27} /><p>{round.prompt}</p></div><div className="direction-grid">{round.choices.map((choice) => { const Icon = icons[choice]; return <button className={`direction-button ${answered && choice === round.answer ? 'correct' : ''} ${answered === choice && choice !== round.answer ? 'wrong' : ''}`} key={choice} onClick={() => choose(choice)} disabled={Boolean(answered)}><Icon size={24} /><span>{choice}</span></button>; })}</div></>;
}

const buildRounds = [
  { prompt: 'Which base is better for a toy bridge?', answer: 'A wide base', choices: ['A wide base', 'One tiny stick', 'A wobbly base'] },
  { prompt: 'What should you use to join two blocks?', answer: 'A strong piece', choices: ['A strong piece', 'A wet leaf', 'Nothing'] },
  { prompt: 'What should you check before a friend walks across?', answer: 'Is it safe?', choices: ['Is it safe?', 'Is it shiny?', 'Is it loud?'] },
];
function BuildGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [index, setIndex] = useState(0); const [answered, setAnswered] = useState<string | null>(null); const [correct, setCorrect] = useState(0); const round = buildRounds[index];
  const choose = (choice: string) => { if (answered) return; const next = correct + (choice === round.answer ? 1 : 0); setCorrect(next); setAnswered(choice); window.setTimeout(() => { if (index === buildRounds.length - 1) onComplete(Math.round(next / buildRounds.length * 100)); else { setIndex((value) => value + 1); setAnswered(null); } }, 680); };
  return <><GameIntro activity={activity}><div className="game-rule"><Construction size={15} /> Choose the safe and strong idea.</div></GameIntro><div className="mission-badge"><Blocks size={17} /><span>TOY BRIDGE</span><strong>{activity.id === 'blueprint-builder' ? 'Make it strong' : 'Help the robot'}</strong></div><div className="question-count">QUESTION {index + 1} OF {buildRounds.length}</div><div className="quiz-prompt">{round.prompt}</div><div className="choice-stack">{round.choices.map((choice) => <button className={`choice-button build-choice ${answered && choice === round.answer ? 'correct' : ''} ${answered === choice && choice !== round.answer ? 'wrong' : ''}`} key={choice} onClick={() => choose(choice)} disabled={Boolean(answered)}>{choice}<ArrowRight size={17} /></button>)}</div></>;
}

const detectiveCases: Record<string, { title: string; clues: string[]; questions: QuizQuestion[] }> = {
  'code-breaker': { title: 'Shape clues', clues: ['The circle is first.', 'The star is last.', 'The triangle is in the middle.'], questions: [
    { prompt: 'Which shape is first?', answer: 'Circle', choices: ['Circle', 'Star', 'Triangle', 'Square'], explanation: 'The first clue says the circle is first.' },
    { prompt: 'Which shape is last?', answer: 'Star', choices: ['Circle', 'Star', 'Triangle', 'Square'], explanation: 'The second clue says the star is last.' },
  ] },
  'case-file': { title: 'Lost lunchbox', clues: ['The lunchbox is blue.', 'A blue box is under the table.', 'The table is in the classroom.'], questions: [
    { prompt: 'What colour is the lunchbox?', answer: 'Blue', choices: ['Red', 'Blue', 'Green', 'Yellow'], explanation: 'The first clue says it is blue.' },
    { prompt: 'Where should you look first?', answer: 'Under the table', choices: ['In the garden', 'Under the table', 'On the roof', 'In the car'], explanation: 'The second clue gives the location.' },
    { prompt: 'Where is the table?', answer: 'In the classroom', choices: ['In the classroom', 'In the park', 'At the beach', 'In the kitchen'], explanation: 'The last clue tells us where the table is.' },
  ] },
};
function DetectiveGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const data = detectiveCases[activity.id] ?? detectiveCases['case-file']; const [index, setIndex] = useState(0); const [answered, setAnswered] = useState<string | null>(null); const [correct, setCorrect] = useState(0); const question = data.questions[index];
  const choose = (choice: string) => { if (answered) return; const next = correct + (choice === question.answer ? 1 : 0); setCorrect(next); setAnswered(choice); window.setTimeout(() => { if (index === data.questions.length - 1) onComplete(Math.round(next / data.questions.length * 100)); else { setIndex((value) => value + 1); setAnswered(null); } }, 700); };
  return <><GameIntro activity={activity}><div className="game-rule"><ShieldQuestion size={15} /> Look at the clues before you choose.</div></GameIntro><div className="case-board"><span className="eyebrow">CLUES / {data.title}</span><div className="clue-grid">{data.clues.map((clue, clueIndex) => <div className="clue-card" key={clue}><span>{String(clueIndex + 1).padStart(2, '0')}</span>{clue}</div>)}</div></div><div className="question-count">QUESTION {index + 1} OF {data.questions.length}</div><div className="quiz-prompt">{question.prompt}</div><div className="choice-stack">{question.choices.map((choice) => <button className={`choice-button build-choice ${answered && choice === question.answer ? 'correct' : ''} ${answered === choice && choice !== question.answer ? 'wrong' : ''}`} key={choice} onClick={() => choose(choice)} disabled={Boolean(answered)}>{choice}<ArrowRight size={17} /></button>)}</div></>;
}

function RhythmGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const sequence = activity.id === 'sequence-recall' ? [0, 2, 1] : [0, 1, 0];
  const [started, setStarted] = useState(false); const [input, setInput] = useState<number[]>([]); const [mistakes, setMistakes] = useState(0); const [feedback, setFeedback] = useState('Watch the phrase, then tap it back.');
  const start = () => { setStarted(true); setFeedback('Tap the pads in the same order.'); };
  const tap = (pad: number) => { if (!started) return; const position = input.length; if (pad !== sequence[position]) { setMistakes((value) => value + 1); setFeedback('Not that pad. Listen for the next beat.'); return; } const next = [...input, pad]; setInput(next); if (next.length === sequence.length) { setFeedback('Phrase complete. You kept the pattern alive.'); onComplete(Math.max(55, 100 - mistakes * 10)); } };
  return <><GameIntro activity={activity}><div className="game-rule"><Music2 size={15} /> Watch the beat and copy it.</div></GameIntro><div className="rhythm-display"><span className="eyebrow">{started ? 'YOUR TURN' : 'WATCH'}</span><strong>{started ? `${input.length} / ${sequence.length}` : 'Ready?'}</strong><div className="rhythm-dots">{sequence.map((_, index) => <i key={index} className={index < input.length ? 'done' : ''} />)}</div></div><div className="feedback" aria-live="polite">{feedback}</div><div className="rhythm-pads">{[0, 1, 2, 3].map((pad) => <button className={`rhythm-pad pad-${pad}`} key={pad} onClick={() => tap(pad)} disabled={!started}><span>{pad + 1}</span><Music2 size={22} /></button>)}</div>{!started && <button className="button-primary centered-button" onClick={start}><Play size={16} /> Start the phrase</button>}</>;
}

function ArcadeGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0); const [cleared, setCleared] = useState<number[]>([]); const [feedback, setFeedback] = useState('Find the even numbers.');
  const values = useMemo(() => Array.from({ length: 8 }, (_, index) => index + 1 + round * 8), [round]);
  const target = (value: number) => value % 2 === 0;
  const choose = (index: number) => {
    if (cleared.includes(index)) return;
    if (!target(values[index])) { setFeedback('Not this one. Find an even number.'); return; }
    const next = [...cleared, index]; setCleared(next); setFeedback('Good find!');
    const remaining = values.filter((value, valueIndex) => target(value) && !next.includes(valueIndex));
    if (remaining.length === 0) {
      if (round === 1) onComplete(100);
      else window.setTimeout(() => { setRound(1); setCleared([]); setFeedback('One more round. Find the even numbers.'); }, 450);
    }
  };
  return <><GameIntro activity={activity}><div className="game-rule"><Gamepad2 size={15} /> Find all the even numbers.</div></GameIntro><div className="question-count">ROUND {round + 1} OF 2</div><div className="feedback" aria-live="polite">{feedback}</div><div className="arcade-board">{values.map((value, index) => <button key={value} className={`arcade-tile ${cleared.includes(index) ? 'cleared' : ''}`} onClick={() => choose(index)}><span>{value}</span><span className="asteroid-ring" /></button>)}</div></>;
}

function CompletionView({ activity, score, onReplay, onHome }: { activity: Activity; score: number; onReplay: () => void; onHome: () => void }) {
  const stars = score >= 90 ? 3 : score >= 65 ? 2 : 1;
  return <div className="complete-card"><div className="complete-stamp"><Check size={35} strokeWidth={3} /></div><span className="eyebrow">Activity complete</span><h2>Nice work, explorer.</h2><div className="stars" aria-label={`${stars} stars earned`}>{[1, 2, 3].map((star) => <Star key={star} size={25} fill={star <= stars ? 'currentColor' : 'none'} opacity={star <= stars ? 1 : .25} />)}</div><p>You finished {activity.title}. Great job trying!</p><div className="complete-actions"><button className="button-primary" onClick={onReplay} data-testid="button-replay-activity"><RotateCcw size={17} /> Play again</button><button className="button-secondary" onClick={onHome} data-testid="button-completion-home">Back to academy</button></div></div>;
}

function NotFound() { return <div className="content"><div className="page-heading"><span className="eyebrow">Trail marker missing</span><h1>That path wandered off.</h1><p className="subtle">Let’s head back to the academy and choose another mission.</p><Link href="/" className="button-primary" data-testid="link-not-found-home">Back to academy <ArrowRight size={17} /></Link></div></div>; }

export default App;
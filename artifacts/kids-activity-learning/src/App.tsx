import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronLeft,
  Circle,
  Clock3,
  Compass,
  Diamond,
  Eye,
  Focus,
  Hash,
  Info,
  Lightbulb,
  Play,
  RotateCcw,
  Route as RouteIcon,
  Search,
  Sprout,
  Square,
  Star,
  Target,
  Triangle,
  Volume2,
  VolumeX,
  type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';

type ActivityId = 'memory' | 'number' | 'pattern' | 'focus';
type Skill = 'Memory' | 'Math' | 'Patterns' | 'Focus';
type Activity = {
  id: ActivityId;
  title: string;
  subtitle: string;
  skill: Skill;
  duration: number;
  color: string;
  icon: LucideIcon;
  completed: boolean;
  bestScore: number;
};
type ProgressState = {
  completedActivities: ActivityId[];
  totalStars: number;
  streak: number;
  weeklyMinutes: number;
  skillBreakdown: Record<Skill, number>;
  bestScores: Partial<Record<ActivityId, number>>;
};
type Settings = { soundEnabled: boolean };

const STORAGE_PROGRESS = 'brightsprout-progress-v1';
const STORAGE_SETTINGS = 'brightsprout-settings-v1';
const SKILLS: Skill[] = ['Memory', 'Math', 'Patterns', 'Focus'];
const DEFAULT_PROGRESS: ProgressState = {
  completedActivities: [],
  totalStars: 0,
  streak: 0,
  weeklyMinutes: 0,
  skillBreakdown: { Memory: 0, Math: 0, Patterns: 0, Focus: 0 },
  bestScores: {},
};
const BASE_ACTIVITIES: Omit<Activity, 'completed' | 'bestScore'>[] = [
  { id: 'memory', title: 'Memory Match', subtitle: 'Pair up the hidden discoveries.', skill: 'Memory', duration: 4, color: 'teal', icon: Brain },
  { id: 'number', title: 'Number Quest', subtitle: 'Make friends with quick numbers.', skill: 'Math', duration: 5, color: 'coral', icon: Hash },
  { id: 'pattern', title: 'Pattern Path', subtitle: 'Spot what comes next on the trail.', skill: 'Patterns', duration: 4, color: 'ochre', icon: RouteIcon },
  { id: 'focus', title: 'Focus Safari', subtitle: 'Find the one signal in the noise.', skill: 'Focus', duration: 3, color: 'ink', icon: Focus },
];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [progress, setProgress] = useState<ProgressState>(() => readStorage(STORAGE_PROGRESS, DEFAULT_PROGRESS));
  const [settings, setSettings] = useState<Settings>(() => readStorage(STORAGE_SETTINGS, { soundEnabled: true }));
  const activities = useMemo(
    () => BASE_ACTIVITIES.map((activity) => ({
      ...activity,
      completed: progress.completedActivities.includes(activity.id),
      bestScore: progress.bestScores[activity.id] ?? 0,
    })),
    [progress],
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const completeActivity = (id: ActivityId, score: number) => {
    setProgress((current) => {
      const activity = BASE_ACTIVITIES.find((item) => item.id === id);
      if (!activity) return current;
      const isNew = !current.completedActivities.includes(id);
      const stars = score >= 90 ? 3 : score >= 65 ? 2 : 1;
      return {
        ...current,
        completedActivities: isNew ? [...current.completedActivities, id] : current.completedActivities,
        totalStars: isNew ? current.totalStars + stars : current.totalStars,
        streak: isNew ? current.streak + 1 : current.streak,
        weeklyMinutes: isNew ? current.weeklyMinutes + activity.duration : current.weeklyMinutes,
        bestScores: { ...current.bestScores, [id]: Math.max(current.bestScores[id] ?? 0, score) },
        skillBreakdown: {
          ...current.skillBreakdown,
          [activity.skill]: Math.max(current.skillBreakdown[activity.skill], score),
        },
      };
    });
  };

  const resetProgress = () => setProgress(DEFAULT_PROGRESS);

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Shell settings={settings} onToggleSound={() => setSettings((current) => ({ soundEnabled: !current.soundEnabled }))}>
        <Switch>
          <Route path="/">
            <HomePage activities={activities} progress={progress} />
          </Route>
          <Route path="/play/:id">
            <PlayPage activities={activities} onComplete={completeActivity} />
          </Route>
          <Route path="/progress">
            <ProgressPage activities={activities} progress={progress} />
          </Route>
          <Route path="/about">
            <AboutPage soundEnabled={settings.soundEnabled} onToggleSound={() => setSettings((current) => ({ soundEnabled: !current.soundEnabled }))} onReset={resetProgress} />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Shell>
    </WouterRouter>
  );
}

function Shell({ children, settings, onToggleSound }: { children: ReactNode; settings: Settings; onToggleSound: () => void }) {
  const [location] = useLocation();
  const navItems = [
    { href: '/', label: 'Trail home', icon: Compass },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/about', label: 'About', icon: Info },
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
          <p className="brand-caption">small daily adventures</p>
          <p className="nav-label">Your trail</p>
          <nav className="nav-list" aria-label="Main navigation">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-link ${isActive(href) ? 'active' : ''}`} data-testid={`link-${label.toLowerCase().replace(' ', '-')}`}>
                <Icon size={18} /><span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="sidebar-foot">
            <strong>Offline by nature.</strong><br />
            Your discoveries stay on this device.
          </div>
        </aside>
        <main className="main">
          <header className="topbar">
            <div>
              <p className="topbar-kicker">BrightSprout / today</p>
              <p className="topbar-title">A little further</p>
            </div>
            <button className="sound-button" onClick={onToggleSound} aria-label={settings.soundEnabled ? 'Turn sound off' : 'Turn sound on'} data-testid="button-toggle-sound">
              {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </header>
          {children}
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? 'active' : ''} data-testid={`mobile-link-${label.toLowerCase().replace(' ', '-')}`}>
            <Icon size={18} /><span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function HomePage({ activities, progress }: { activities: Activity[]; progress: ProgressState }) {
  const nextActivity = activities.find((activity) => !activity.completed) ?? activities[0];
  const completedCount = progress.completedActivities.length;
  return (
    <div className="content">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Ready when you are</span>
          <h1 className="display-title">Collect a discovery.</h1>
          <p className="subtle">Five quiet minutes can turn into a bright new connection. Pick a trail stop and see what your brain notices today.</p>
          <Link href={`/play/${nextActivity.id}`} className="button-primary" data-testid="link-start-adventure">
            {completedCount === activities.length ? 'Take another lap' : 'Start today’s adventure'} <ArrowRight size={18} />
          </Link>
        </div>
        <div className="hero-art" aria-label="Illustrated trail note">
          <div className="trail-bubble"><strong>Trail note 01</strong>There is more than one way to be good at something. Try, notice, try again.</div>
        </div>
      </section>

      <section aria-labelledby="activity-heading">
        <div className="section-heading">
          <div><span className="eyebrow">Choose a trail stop</span><h2 id="activity-heading">What feels curious?</h2></div>
          <Link href="/progress" data-testid="link-see-progress">See progress <ArrowRight size={14} /></Link>
        </div>
        <div className="activity-grid">
          {activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
        </div>
      </section>

      <div className="dashboard-row">
        <section className="panel" aria-labelledby="week-heading">
          <div className="panel-head">
            <div><span className="eyebrow">This week</span><h3 id="week-heading">Your little rhythm</h3></div>
            <Clock3 size={21} color="hsl(161 43% 33%)" />
          </div>
          <div className="stat-big" data-testid="text-weekly-minutes">{progress.weeklyMinutes}<span style={{ fontSize: '1rem', letterSpacing: '-.02em' }}> min</span></div>
          <p className="stat-caption">of your 20 minute trail goal</p>
          <div className="progress-track" style={{ marginTop: 16 }}><div className="progress-fill" style={{ width: `${Math.min(100, progress.weeklyMinutes / 20 * 100)}%` }} /></div>
          <div className="streak-strip"><Star size={22} fill="currentColor" /><div><strong>{progress.streak || 0} day discovery streak</strong><span>Every small step counts.</span></div></div>
        </section>
        <section className="panel" aria-labelledby="trail-heading">
          <div className="panel-head"><div><span className="eyebrow">Map marker</span><h3 id="trail-heading">The learning trail</h3></div><RouteIcon size={21} color="hsl(9 77% 67%)" /></div>
          <div className="trail-line">
            {activities.slice(0, 3).map((activity, index) => (
              <div className={`trail-stop ${activity.completed ? '' : index === completedCount ? '' : 'muted'}`} key={activity.id}>
                <div className="trail-stop-text"><strong>{activity.completed ? `${activity.title} found` : activity.title}</strong><span>{activity.completed ? 'Discovery collected' : `${activity.duration} min · ${activity.skill}`}</span></div>
                {activity.completed && <Check size={17} color="hsl(161 43% 33%)" />}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = activity.icon;
  return (
    <Link href={`/play/${activity.id}`} className={`activity-card ${activity.color}`} data-testid={`card-activity-${activity.id}`}>
      {activity.completed && <span className="card-check" aria-label="Completed"><Check size={14} strokeWidth={3} /></span>}
      <span className="activity-icon"><Icon size={23} /></span>
      <h3>{activity.title}</h3>
      <p>{activity.subtitle}</p>
      <div className="activity-meta"><span>{activity.duration} min</span><span>{activity.skill}</span>{activity.bestScore > 0 && <span className="activity-score"><Star size={12} fill="currentColor" /> {activity.bestScore}</span>}</div>
    </Link>
  );
}

function ProgressPage({ activities, progress }: { activities: Activity[]; progress: ProgressState }) {
  const completed = progress.completedActivities.length;
  return (
    <div className="content">
      <div className="page-heading"><span className="eyebrow">Your field notes</span><h1>Progress, not pressure.</h1><p className="subtle">Every session leaves a small mark. Look back at what you have explored and choose the next pebble on the path.</p></div>
      <div className="progress-hero">
        <section className="progress-card" aria-label="Activities completed">
          <h3>Trail stops found</h3><div className="stat-big" data-testid="text-activities-completed">{completed}<span style={{ fontSize: '1.1rem', letterSpacing: '-.02em' }}> / {activities.length}</span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${completed / activities.length * 100}%` }} /></div>
        </section>
        <section className="progress-card warm" aria-label="Stars collected">
          <h3>Stars collected</h3><div className="stat-big" data-testid="text-total-stars">{progress.totalStars}<span style={{ fontSize: '1.1rem', letterSpacing: '-.02em' }}> stars</span></div><p style={{ margin: '18px 0 0', fontSize: '.8rem', opacity: .7 }}>Best score: {Math.max(0, ...Object.values(progress.bestScores).filter((score): score is number => typeof score === 'number')) || 'not yet recorded'}</p>
        </section>
      </div>
      <section className="panel" aria-labelledby="skills-heading">
        <div className="panel-head"><div><span className="eyebrow">Skill garden</span><h3 id="skills-heading">What is growing?</h3></div><Sprout size={22} color="hsl(161 43% 33%)" /></div>
        <div className="skill-list">
          {SKILLS.map((skill) => <div className="skill-line" key={skill}><span>{skill}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${progress.skillBreakdown[skill]}%` }} /></div><span className="skill-value" data-testid={`text-skill-${skill.toLowerCase()}`}>{progress.skillBreakdown[skill]}%</span></div>)}
        </div>
      </section>
      <div className="dashboard-row">
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">Trail log</span><h3>Recent discoveries</h3></div><Search size={20} /></div><div className="trail-line">{activities.map((activity) => <div className={`trail-stop ${activity.completed ? '' : 'muted'}`} key={activity.id}><div className="trail-stop-text"><strong>{activity.title}</strong><span>{activity.completed ? `Best score ${activity.bestScore}` : 'Waiting to be explored'}</span></div></div>)}</div></section>
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">A gentle nudge</span><h3>Keep it playful</h3></div><Lightbulb size={20} color="hsl(39 91% 55%)" /></div><p className="subtle">A tricky round is useful information, not a verdict. Switch activities, take a breath, and come back with a fresh angle.</p><Link href="/" className="button-secondary button-small" data-testid="link-back-to-trail">Back to trail <ArrowRight size={15} /></Link></section>
      </div>
    </div>
  );
}

function AboutPage({ soundEnabled, onToggleSound, onReset }: { soundEnabled: boolean; onToggleSound: () => void; onReset: () => void }) {
  return (
    <div className="content">
      <div className="page-heading"><span className="eyebrow">Field guide</span><h1>For curious minds.</h1><p className="subtle">BrightSprout is a small daily adventure for children aged six and up. It turns practice into a collection of “oh, I see it now” moments.</p></div>
      <div className="about-grid">
        <section className="about-card"><span className="eyebrow" style={{ color: 'hsl(39 91% 62%)' }}>Why it exists</span><h2>Less worksheet.<br />More wonder.</h2><p>Four short activities build the habits underneath confident learning: holding a thought, spotting a relationship, trusting a number, and returning attention to what matters.</p></section>
        <section className="about-card about-note"><span className="eyebrow" style={{ color: 'hsl(161 43% 33%)' }}>A note for grown-ups</span><h2>Small steps are real steps.</h2><p>No accounts, no ads, no leaderboard. Progress stays in this browser so a child can explore at their own pace.</p></section>
      </div>
      <div className="principles">
        <section className="principle"><span className="principle-icon"><Compass size={19} /></span><div><h3>Follow the child’s curiosity</h3><p>Each trail stop is short enough to start without a pep talk and open-ended enough to invite another try.</p></div></section>
        <section className="principle"><span className="principle-icon"><Eye size={19} /></span><div><h3>Feedback that feels useful</h3><p>Correct answers are celebrated, while misses simply point to a new route through the same idea.</p></div></section>
        <section className="principle"><span className="principle-icon"><Volume2 size={19} /></span><div><h3>Made for quiet corners</h3><p>Sound is optional, touch targets are generous, and all discoveries work offline on this device.</p></div></section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel-head"><div><span className="eyebrow">Settings</span><h3>Make the trail yours</h3></div><Info size={20} /></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div><strong>Sound feedback</strong><p className="stat-caption" style={{ margin: '5px 0 0' }}>{soundEnabled ? 'On for little moments of feedback.' : 'Off for a quieter trail.'}</p></div>
          <button className="button-secondary button-small" onClick={onToggleSound} data-testid="button-about-sound">{soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}{soundEnabled ? 'Turn off' : 'Turn on'}</button>
        </div>
        <div style={{ borderTop: '1px solid hsl(var(--border))', marginTop: 21, paddingTop: 18, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div><strong>Start fresh</strong><p className="stat-caption" style={{ margin: '5px 0 0' }}>Clear local trail notes on this device.</p></div>
          <button className="button-secondary button-small" onClick={onReset} data-testid="button-reset-progress"><RotateCcw size={15} /> Reset progress</button>
        </div>
      </section>
    </div>
  );
}

function PlayPage({ activities, onComplete }: { activities: Activity[]; onComplete: (id: ActivityId, score: number) => void }) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const activity = activities.find((item) => item.id === id);
  const [result, setResult] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  if (!activity) return <NotFound />;
  const Icon = activity.icon;
  const handleComplete = (score: number) => { onComplete(activity.id, score); setResult(score); };
  return (
    <div className="content">
      <div className="play-header">
        <button className="back-link" onClick={() => setLocation('/')} data-testid="button-back-home"><ChevronLeft size={17} /> Trail home</button>
        <div className="play-title"><h1>{activity.title}</h1><p>{activity.duration} min · {activity.skill}</p></div>
        <div className="play-score"><strong>{(result ?? activity.bestScore) || '—'}</strong>{result ? 'new score' : 'best score'}</div>
      </div>
      <div className="game-panel">
        {result === null ? <GameView key={`${activity.id}-${run}`} activity={activity} onComplete={handleComplete} /> : <CompletionView activity={activity} score={result} onReplay={() => { setResult(null); setRun((value) => value + 1); }} onHome={() => setLocation('/')} />}
      </div>
    </div>
  );
}

function GameIntro({ activity, children }: { activity: Activity; children?: ReactNode }) {
  const Icon = activity.icon;
  return <div className="game-intro"><span className="activity-icon"><Icon size={23} /></span><h2>{activity.title}</h2><p>{activity.subtitle}</p>{children}</div>;
}

function GameView({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  if (activity.id === 'memory') return <MemoryGame activity={activity} onComplete={onComplete} />;
  if (activity.id === 'number') return <NumberGame activity={activity} onComplete={onComplete} />;
  if (activity.id === 'pattern') return <PatternGame activity={activity} onComplete={onComplete} />;
  return <FocusGame activity={activity} onComplete={onComplete} />;
}

type MemoryCardData = { key: string; pair: string; icon: LucideIcon; flipped: boolean; matched: boolean };
const memoryPairs: [string, LucideIcon][] = [['circle', Circle], ['triangle', Triangle], ['square', Square], ['diamond', Diamond], ['target', Target], ['sprout', Sprout], ['star', Star], ['compass', Compass]];

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
    setLocked(true);
    setFirst(null);
    setTurns((value) => value + 1);
    const isMatch = cards[first].pair === cards[index].pair;
    if (isMatch) {
      setFeedback('A match. Nice noticing.');
      window.setTimeout(() => {
        setCards((current) => current.map((card, cardIndex) => cardIndex === first || cardIndex === index ? { ...card, matched: true } : card));
        setLocked(false);
        if (nextCards.filter((card) => card.matched).length + 2 === nextCards.length) onComplete(Math.max(70, 100 - (turns + 1) * 2));
      }, 420);
    } else {
      setFeedback('Not quite. Your memory is still mapping it.');
      window.setTimeout(() => {
        setCards((current) => current.map((card, cardIndex) => cardIndex === first || cardIndex === index ? { ...card, flipped: false } : card));
        setLocked(false);
      }, 740);
    }
  };
  return <><GameIntro activity={activity} /><div className={`feedback ${feedback.startsWith('Not') ? 'wrong' : ''}`} aria-live="polite" data-testid="status-memory-feedback">{feedback}</div><div className="memory-grid">{cards.map((card, index) => { const Icon = card.icon; return <button className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`} key={card.key} onClick={() => pickCard(index)} disabled={locked || card.matched} aria-label={card.flipped || card.matched ? `Card showing ${card.pair}` : 'Hidden memory card'} data-testid={`button-memory-card-${index}`}>{card.flipped || card.matched ? <Icon size={27} /> : <Sprout size={22} />}</button>; })}</div></>;
}

const numberQuestions = [
  { prompt: 'What is 7 + 5?', answer: '12', choices: ['10', '11', '12', '13'] },
  { prompt: 'Which number is even?', answer: '18', choices: ['13', '17', '18', '21'] },
  { prompt: 'What is 20 − 6?', answer: '14', choices: ['12', '14', '16', '26'] },
  { prompt: 'Which is the greatest?', answer: '42', choices: ['24', '34', '42', '40'] },
  { prompt: 'What comes after 29?', answer: '30', choices: ['28', '29', '30', '31'] },
];

function NumberGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState('Trust your first thought, then check it.');
  const question = numberQuestions[questionIndex];
  const answerQuestion = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === question.answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setAnswered(choice);
    setCorrect(nextCorrect);
    setFeedback(isCorrect ? 'Yes. That one clicked.' : `Good try. The answer is ${question.answer}.`);
    window.setTimeout(() => {
      if (questionIndex === numberQuestions.length - 1) onComplete(Math.round(nextCorrect / numberQuestions.length * 100));
      else { setQuestionIndex((value) => value + 1); setAnswered(null); setFeedback('Next one is waiting.'); }
    }, 680);
  };
  return <><GameIntro activity={activity} /><div className="question-count">QUESTION {questionIndex + 1} OF {numberQuestions.length}</div><div className="feedback" aria-live="polite" data-testid="status-number-feedback">{feedback}</div><div style={{ textAlign: 'center', fontFamily: 'var(--app-font-display)', fontSize: 'clamp(1.45rem, 4vw, 2.2rem)', letterSpacing: '-.05em', margin: '11px 0 25px' }}>{question.prompt}</div><div className="choice-grid">{question.choices.map((choice) => <button key={choice} className={`choice-button ${answered && choice === question.answer ? 'correct' : ''} ${answered === choice && choice !== question.answer ? 'wrong' : ''}`} onClick={() => answerQuestion(choice)} disabled={Boolean(answered)} data-testid={`button-number-choice-${choice}`}>{choice}</button>)}</div></>;
}

const patterns = [
  { sequence: ['2', '4', '6', '?'], choices: ['7', '8', '9'], answer: '8' },
  { sequence: ['A', 'B', 'A', '?'], choices: ['A', 'B', 'C'], answer: 'B' },
  { sequence: ['red', 'blue', 'red', '?'], choices: ['blue', 'green', 'red'], answer: 'blue' },
];

function PatternGame({ activity, onComplete }: { activity: Activity; onComplete: (score: number) => void }) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState('Look for the relationship, not just the next tile.');
  const pattern = patterns[patternIndex];
  const choose = (choice: string) => {
    if (answered) return;
    const isCorrect = choice === pattern.answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setAnswered(choice); setCorrect(nextCorrect); setFeedback(isCorrect ? 'Pattern spotted.' : `The path continues with ${pattern.answer}.`);
    window.setTimeout(() => {
      if (patternIndex === patterns.length - 1) onComplete(Math.round(nextCorrect / patterns.length * 100));
      else { setPatternIndex((value) => value + 1); setAnswered(null); setFeedback('A new path to trace.'); }
    }, 680);
  };
  return <><GameIntro activity={activity} /><div className="question-count">PATH {patternIndex + 1} OF {patterns.length}</div><div className="feedback" aria-live="polite" data-testid="status-pattern-feedback">{feedback}</div><div className="pattern-sequence">{pattern.sequence.map((value, index) => <span className={`pattern-chip ${value === '?' ? 'missing' : ''}`} key={`${value}-${index}`}>{value}</span>)}</div><div className="choice-grid">{pattern.choices.map((choice) => <button key={choice} className={`choice-button ${answered && choice === pattern.answer ? 'correct' : ''} ${answered === choice && choice !== pattern.answer ? 'wrong' : ''}`} onClick={() => choose(choice)} disabled={Boolean(answered)} data-testid={`button-pattern-choice-${choice}`}>{choice}</button>)}</div></>;
}

type SafariRound = { target: number; targetKind: number; kinds: number[] };
const safariIcons: LucideIcon[] = [Circle, Triangle, Square, Diamond];
function makeSafariRound(): SafariRound {
  const target = Math.floor(Math.random() * 12);
  const targetKind = Math.floor(Math.random() * safariIcons.length);
  const kinds = Array.from({ length: 12 }, (_, index) => index === target ? targetKind : Math.floor(Math.random() * safariIcons.length));
  return { target, targetKind, kinds };
}

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
    window.setTimeout(() => {
      if (round === 2) onComplete(100);
      else { setRound((value) => value + 1); setBoard(makeSafariRound()); setFound(false); setFeedback('New round. Find the quiet signal.'); }
    }, 650);
  };
  return <><GameIntro activity={activity} /><div className="question-count">ROUND {round + 1} OF 3</div><div className="feedback" aria-live="polite" data-testid="status-focus-feedback">{feedback}</div><div className="safari-target"><span className="target-swatch" /><span>Find the <strong><TargetIcon size={15} style={{ verticalAlign: 'middle' }} /> different one</strong></span></div><div className="safari-board">{board.kinds.map((kind, index) => { const Icon = safariIcons[kind]; return <button key={`${round}-${index}`} className={`safari-tile ${found && index === board.target ? 'found' : ''}`} onClick={() => choose(index)} disabled={found} aria-label={`Shape tile ${index + 1}`} data-testid={`button-focus-tile-${index}`}><Icon size={24} /></button>; })}</div></>;
}

function CompletionView({ activity, score, onReplay, onHome }: { activity: Activity; score: number; onReplay: () => void; onHome: () => void }) {
  const stars = score >= 90 ? 3 : score >= 65 ? 2 : 1;
  return <div className="complete-card"><div className="complete-stamp"><Check size={35} strokeWidth={3} /></div><span className="eyebrow">Discovery collected</span><h2>Nice work, explorer.</h2><div className="stars" aria-label={`${stars} stars earned`}>{[1, 2, 3].map((star) => <Star key={star} size={25} fill={star <= stars ? 'currentColor' : 'none'} opacity={star <= stars ? 1 : .25} />)}</div><p>You finished {activity.title} with a score of <strong>{score}</strong>. The next good move is whichever one feels interesting.</p><div className="complete-actions"><button className="button-primary" onClick={onReplay} data-testid="button-replay-activity"><RotateCcw size={17} /> Play again</button><button className="button-secondary" onClick={onHome} data-testid="button-completion-home">Back to trail</button></div></div>;
}

function NotFound() {
  return <div className="content"><div className="page-heading"><span className="eyebrow">Trail marker missing</span><h1>That path wandered off.</h1><p className="subtle">Let’s head back to the main trail and choose another discovery.</p><Link href="/" className="button-primary" data-testid="link-not-found-home">Back to trail <ArrowRight size={17} /></Link></div></div>;
}

export default App;
import { Link } from 'react-router-dom';
import {
  ArrowRight, Play, MousePointerClick, CheckCircle2, SkipForward, Code2, PencilRuler,
  BookOpen, Gauge, ListChecks, MessageCircle, Lightbulb, Undo2, ExternalLink,
} from 'lucide-react';
import spitLogo from '../assets/spit_logo.png';
import { HeroDemo } from '../components/landing/HeroDemo';
import { ALGORITHMS } from '../data/algorithms';
import { REPO_URL, TEAM } from '../data/site';
import '../styles/landing.css';

const ALGORITHM_COUNT = Object.keys(ALGORITHMS).length;
const algoLink = (key, practice = false) => `/algorithm?algo=${key}${practice ? '&mode=practice' : ''}`;
const shortName = (key) => ALGORITHMS[key].name.replace(' (Graph)', '');

const STEPS = [
  {
    icon: Play,
    title: 'Watch',
    text: 'Press play, or step forward and back one move at a time. Colours show what is being compared or moved, and a log lists every step in words.',
    image: '/landing/step-watch.png',
    alt: 'Quick Sort in watch mode: coloured bars, playback controls and the step log',
  },
  {
    icon: MousePointerClick,
    title: 'Practice',
    text: 'Switch to "practice it yourself" and make the decisions: which bars to swap, which cell A* explores next, which edge Kruskal adds.',
    image: '/landing/step-practice.png',
    alt: 'Bubble Sort practice: the learner rearranges bars to match the end of a pass',
  },
  {
    icon: CheckCircle2,
    title: 'Check',
    text: 'Every move is checked straight away. Wrong moves come with a reason, hints are there when you are stuck, and a summary shows how you did.',
    image: '/landing/step-check.png',
    alt: 'Practice summary showing moves, mistakes and hints used',
  },
];

const TOPICS = [
  {
    id: 'sorting',
    title: 'Sorting',
    text: 'Put a list of numbers in order, and see why some methods need far fewer steps than others.',
    image: '/landing/topic-sorting.png',
    algos: ['bubbleSort', 'selectionSort', 'insertionSort', 'shellSort', 'mergeSort', 'quickSort', 'heapSort', 'radixSort'],
  },
  {
    id: 'pathfinding',
    title: 'Pathfinding',
    text: 'Find a route across a grid. Draw walls and slow "mud" cells, then compare how each search explores.',
    image: '/landing/topic-pathfinding.png',
    algos: ['bfs', 'dfs', 'dijkstra', 'astar', 'greedyBFS'],
  },
  {
    id: 'graph',
    title: 'Graphs',
    text: 'Points (nodes) joined by lines (edges). Explore them, find shortest distances, cheapest connections and tightly linked groups, on graphs you build yourself.',
    image: '/landing/topic-graph.png',
    algos: ['bfsGraph', 'dfsGraph', 'dijkstraGraph', 'bellmanFord', 'kruskals', 'prims', 'tarjans'],
  },
  {
    id: 'backtracking',
    title: 'Backtracking',
    text: 'Solve puzzles by trying a choice, and undoing it when it leads to a dead end.',
    image: '/landing/topic-backtracking.png',
    algos: ['nQueens', 'sudoku', 'graphColoring'],
  },
];

const SPOTLIGHT = [
  {
    eyebrow: 'You decide',
    title: 'Make the moves the algorithm would make',
    text: 'Click the cell A* explores next. Each cell shows the numbers A* uses: g (steps taken so far), h (estimated steps left) and f = g + h. You choose with the same information the algorithm has. When two choices are equally good, both count as correct.',
    image: '/landing/practice-astar.png',
    alt: 'A* practice on a grid, cells labelled with g and h values',
    link: algoLink('astar', true),
    linkText: 'Try A* practice',
  },
  {
    eyebrow: 'Help when stuck',
    title: 'Hints in three steps, never the answer straight away',
    text: 'Hint gives a nudge in words, Show where highlights the right area, and Show me makes the move for you. You can also undo any move, or skip ahead through repetitive parts.',
    image: '/landing/practice-dijkstra.png',
    alt: "Dijkstra practice on a graph with the distance table and a highlighted hint",
    link: algoLink('dijkstraGraph', true),
    linkText: "Try Dijkstra's practice",
    points: [
      { icon: Lightbulb, text: 'Hint → Show where → Show me' },
      { icon: Undo2, text: 'Undo and restart at any time' },
      { icon: SkipForward, text: 'Skip 5 moves through repetitive parts' },
    ],
  },
  {
    eyebrow: 'Learn from mistakes',
    title: 'Mistakes are explained, not just marked wrong',
    text: 'Place a queen on an attacked square and you are told which queen attacks it and how. Every colour, number and term on screen is explained in a "How to read this" guide.',
    image: '/landing/practice-queens.png',
    alt: 'N-Queens practice showing an explanation of why a square is attacked',
    link: algoLink('nQueens', true),
    linkText: 'Try N-Queens practice',
  },
];

const FEATURES = [
  { icon: Gauge, title: 'Step controls', text: 'Play, pause, step back and forward, change the speed. Keyboard: Space and ← / →.' },
  { icon: Code2, title: 'Code tracer', text: 'Pseudocode next to the animation, with the line being run highlighted.' },
  { icon: PencilRuler, title: 'Your own inputs', text: 'Type an array, draw walls on the grid, or build a graph by clicking or as text.' },
  { icon: BookOpen, title: '"How to read this" guides', text: 'Plain-language explanations of every colour, number and term on screen.' },
  { icon: ListChecks, title: 'Complexity and quiz', text: 'Best, average and worst case for every algorithm, with an explanation, and a quiz to test yourself.' },
  { icon: MessageCircle, title: 'AI tutor', text: 'Ask questions about the algorithm and the step you are on. Answers are AI-generated, so double-check anything important.' },
];

const PATH = [
  { title: 'Simple sorts', text: 'See comparisons and swaps.', algos: ['bubbleSort', 'selectionSort'] },
  { title: 'Faster sorts', text: 'Divide the work up.', algos: ['insertionSort', 'mergeSort', 'quickSort'] },
  { title: 'Searching a grid', text: 'Queue vs stack.', algos: ['bfs', 'dfs'] },
  { title: 'Shortest paths', text: 'Costs and estimates.', algos: ['dijkstra', 'astar'] },
  { title: 'Graphs', text: 'Trees, distances, groups.', algos: ['kruskals', 'prims', 'bellmanFord'] },
  { title: 'Backtracking', text: 'Try, fail, undo.', algos: ['nQueens', 'sudoku'] },
];

function Shot({ src, alt, className = '' }) {
  return (
    <div className={`shot ${className}`}>
      <div className="shot__bar" aria-hidden="true"><span /><span /><span /></div>
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </div>
  );
}

function SectionHead({ eyebrow, title, text }) {
  return (
    <div className="lp-section__head">
      <span className="lp-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="landing">
      <header className="lp-header">
        <div className="lp-container lp-header__inner">
          <a href="#top" className="lp-brand">
            <img src={spitLogo} alt="" />
            <span>SPIT Algo Visualizer</span>
          </a>
          <nav className="lp-nav" aria-label="Page sections">
            <a href="#how">How it works</a>
            <a href="#topics">Topics</a>
            <a href="#practice">Practice mode</a>
            <a href="#team">Team</a>
          </nav>
          <Link to="/algorithm" className="btn btn--dark btn--sm">Open visualizer <ArrowRight size={14} /></Link>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-container lp-hero__inner">
            <div className="lp-hero__text">
              <span className="lp-eyebrow">For students learning data structures &amp; algorithms</span>
              <h1>Watch an algorithm run.<br /><span className="lp-accent">Then run it yourself.</span></h1>
              <p className="lp-lead">
                Step through {ALGORITHM_COUNT} classic algorithms one move at a time: sorting, shortest paths, graphs and backtracking.
                Then switch to practice mode, where you make each decision and the app checks it and explains why.
              </p>
              <div className="lp-cta">
                <Link to={algoLink('bubbleSort')} className="btn btn--primary btn--lg">Start with Bubble Sort <ArrowRight size={16} /></Link>
                <a href="#topics" className="btn btn--lg">Browse all topics</a>
              </div>
              <ul className="lp-facts">
                <li><strong>{ALGORITHM_COUNT}</strong> algorithms</li>
                <li><strong>4</strong> topics</li>
                <li>Practice mode for <strong>every</strong> algorithm</li>
                <li>Free, no sign-up</li>
              </ul>
            </div>
            <HeroDemo />
          </div>
        </section>

        {/* How it works */}
        <section className="lp-section" id="how">
          <div className="lp-container">
            <SectionHead
              eyebrow="How it works"
              title="Watch, practice, check"
              text="Reading about an algorithm is not the same as doing it. Each algorithm has two modes, and you can switch between them at any time."
            />
            <ol className="lp-steps">
              {STEPS.map(({ icon: Icon, title, text, image, alt }, i) => (
                <li key={title} className="lp-step">
                  <Shot src={image} alt={alt} />
                  <div className="lp-step__label"><span className="lp-step__num">{i + 1}</span><Icon size={16} /> {title}</div>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Topics */}
        <section className="lp-section lp-section--muted" id="topics">
          <div className="lp-container">
            <SectionHead
              eyebrow="Topics"
              title={`${ALGORITHM_COUNT} algorithms in 4 topics`}
              text="Pick any algorithm to open it. Every one has a watch mode and a practice mode."
            />
            <div className="lp-topics">
              {TOPICS.map(topic => (
                <article key={topic.id} className="lp-topic">
                  <Link to={`/algorithm?category=${topic.id}`} className="lp-topic__image" tabIndex={-1} aria-hidden="true">
                    <img src={topic.image} alt="" loading="lazy" decoding="async" />
                  </Link>
                  <div className="lp-topic__body">
                    <h3>{topic.title} <span className="lp-count">{topic.algos.length}</span></h3>
                    <p>{topic.text}</p>
                    <ul className="lp-chips">
                      {topic.algos.map(key => (
                        <li key={key}><Link to={algoLink(key)} className="lp-chip">{shortName(key)}</Link></li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Practice spotlight */}
        <section className="lp-section" id="practice">
          <div className="lp-container">
            <SectionHead
              eyebrow="Practice mode"
              title="Learn it by doing it"
              text="Practice mode turns each algorithm into a set of small decisions. It works by clicking, so it works on phones and tablets too."
            />
            <div className="lp-spotlight">
              {SPOTLIGHT.map((item, i) => (
                <div key={item.title} className={`lp-feature-row ${i % 2 ? 'is-flipped' : ''}`}>
                  <Shot src={item.image} alt={item.alt} className="shot--large" />
                  <div className="lp-feature-row__text">
                    <span className="lp-eyebrow">{item.eyebrow}</span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    {item.points && (
                      <ul className="lp-points">
                        {item.points.map(({ icon: Icon, text }) => <li key={text}><Icon size={16} /> {text}</li>)}
                      </ul>
                    )}
                    <Link to={item.link} className="text-link">{item.linkText} <ArrowRight size={14} /></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="lp-section lp-section--muted" id="features">
          <div className="lp-container">
            <SectionHead eyebrow="Also included" title="Everything else you need to study" />
            <div className="lp-features">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="lp-card">
                  <span className="lp-card__icon"><Icon size={18} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning path */}
        <section className="lp-section" id="path">
          <div className="lp-container">
            <SectionHead
              eyebrow="Not sure where to start?"
              title="A suggested order"
              text="Each stage builds on the one before. Watch an algorithm first, then practice it until you finish without hints."
            />
            <ol className="lp-path">
              {PATH.map((stage, i) => (
                <li key={stage.title} className="lp-path__stage">
                  <span className="lp-path__num">{i + 1}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.text}</p>
                  <div className="lp-path__links">
                    {stage.algos.map(key => <Link key={key} to={algoLink(key)} className="lp-chip lp-chip--sm">{shortName(key)}</Link>)}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Team */}
        <section className="lp-section lp-section--muted" id="team">
          <div className="lp-container">
            <SectionHead eyebrow="Team" title="Built by" text="A mini-project by students of SPIT." />
            <ul className="lp-team">
              {TEAM.map(member => (
                <li key={member.name} className="lp-member">
                  <img src={member.photo} alt={member.name} loading="lazy" width="96" height="96" />
                  <span>{member.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="lp-section lp-final">
          <div className="lp-container lp-final__inner">
            <h2>Ready to try one?</h2>
            <p>Bubble Sort is the simplest place to start: watch one run, then sort the bars yourself.</p>
            <div className="lp-cta lp-cta--center">
              <Link to={algoLink('bubbleSort')} className="btn btn--primary btn--lg">Start with Bubble Sort <ArrowRight size={16} /></Link>
              <Link to={algoLink('bubbleSort', true)} className="btn btn--lg">Go straight to practice</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer__inner">
          <div className="lp-brand lp-brand--static">
            <img src={spitLogo} alt="" />
            <span>SPIT Algo Visualizer</span>
          </div>
          <nav className="lp-footer__links" aria-label="Footer">
            <Link to="/algorithm">Open visualizer</Link>
            <a href="#topics">Topics</a>
            <a href="#team">Team</a>
            {REPO_URL && <a href={REPO_URL} target="_blank" rel="noreferrer">Source code <ExternalLink size={12} /></a>}
          </nav>
          <p className="lp-footer__note">© {new Date().getFullYear()} {TEAM.map(m => m.name).join(', ')}</p>
        </div>
      </footer>
    </div>
  );
}

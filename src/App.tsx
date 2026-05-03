import type { JSX } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";

type SectionId = "overview" | "why" | "blocks" | "spec" | "flow";
type PageId = "home" | "specification" | "reference";
type BlockCategory = "content" | "input" | "reference" | "change" | "signal";
type VisualKind =
  | "text"
  | "choice"
  | "toggle"
  | "ranking"
  | "diff"
  | "timeline"
  | "progress"
  | "image"
  | "file"
  | "warning"
  | "section"
  | "freeform";

type BlockCard = {
  name: string;
  label?: string;
  category: BlockCategory;
  alias?: string;
  description: string;
  visual: VisualKind;
};

const navItems: { id: SectionId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "why", label: "Why Moves" },
  { id: "blocks", label: "Move blocks" },
  { id: "flow", label: "Flow" },
];

const blocks: BlockCard[] = [
  {
    name: "text",
    alias: "context",
    category: "content",
    description: "The short explanation: what happened, why it matters, and what is being asked.",
    visual: "text",
  },
  {
    name: "image",
    alias: "visual evidence",
    category: "content",
    description: "A screenshot, design preview, chart, receipt, or other visible proof.",
    visual: "image",
  },
  {
    name: "file",
    alias: "artifact",
    category: "content",
    description: "A document, report, dataset, recording, or other artifact attached to the Move.",
    visual: "file",
  },
  {
    name: "code",
    alias: "source",
    category: "content",
    description: "A focused code sample or command output when the evidence lives in text.",
    visual: "text",
  },
  {
    name: "copyable",
    alias: "clipboard",
    category: "content",
    description: "A prompt, command, message, token, or template the human may need exactly as written.",
    visual: "freeform",
  },
  {
    name: "choice",
    alias: "single decision",
    category: "input",
    description: "A compact decision point. The agent gives options, the human chooses one.",
    visual: "choice",
  },
  {
    name: "multi_choice",
    label: "multi choice",
    alias: "multiple selection",
    category: "input",
    description: "A checklist-style answer when more than one option can be true.",
    visual: "choice",
  },
  {
    name: "toggle",
    alias: "setting",
    category: "input",
    description: "A yes/no control for simple preferences, setup steps, and approvals.",
    visual: "toggle",
  },
  {
    name: "ranking",
    alias: "priority order",
    category: "input",
    description: "A way to sort options when the answer is preference, not a binary call.",
    visual: "ranking",
  },
  {
    name: "freeform",
    alias: "human note",
    category: "input",
    description: "A short written response when the agent needs words, not just a click.",
    visual: "freeform",
  },
  {
    name: "numeric",
    alias: "threshold",
    category: "input",
    description: "A bounded number, slider value, score, quantity, or budget.",
    visual: "progress",
  },
  {
    name: "confirmation",
    alias: "approve or cancel",
    category: "input",
    description: "A deliberate acknowledgement with explicit action labels.",
    visual: "toggle",
  },
  {
    name: "date",
    alias: "time pick",
    category: "input",
    description: "A date or date-time response for scheduling, deadlines, and reminders.",
    visual: "timeline",
  },
  {
    name: "rating",
    alias: "score",
    category: "input",
    description: "A bounded discrete score for quality, confidence, preference, or satisfaction.",
    visual: "ranking",
  },
  {
    name: "url",
    alias: "link",
    category: "reference",
    description: "A web reference with enough label and context to support the decision.",
    visual: "file",
  },
  {
    name: "snippet",
    alias: "file excerpt",
    category: "reference",
    description: "A source excerpt with path, line metadata, language, and highlights.",
    visual: "text",
  },
  {
    name: "excerpt",
    alias: "quoted source",
    category: "reference",
    description: "A sourced text excerpt from a document, article, thread, or transcript.",
    visual: "freeform",
  },
  {
    name: "diff",
    alias: "before and after",
    category: "change",
    description: "A focused comparison for code, copy, configuration, plans, or visual direction.",
    visual: "diff",
  },
  {
    name: "timeline",
    alias: "sequence",
    category: "change",
    description: "A small event trail that explains what changed and in what order.",
    visual: "timeline",
  },
  {
    name: "progress",
    alias: "work state",
    category: "signal",
    description: "A live or captured completion state for tests, uploads, migrations, or runs.",
    visual: "progress",
  },
  {
    name: "warning",
    alias: "risk",
    category: "signal",
    description: "A caution that changes how much attention the Move deserves.",
    visual: "warning",
  },
  {
    name: "section",
    alias: "group",
    category: "signal",
    description: "A nested group that keeps supporting details available without overwhelming the ask.",
    visual: "section",
  },
  {
    name: "executable",
    alias: "action plan",
    category: "signal",
    description: "A command-oriented block for proposed work, child steps, and approval strategy.",
    visual: "text",
  },
];

const categoryNames: Record<BlockCategory, string> = {
  content: "Content",
  input: "Input",
  reference: "Reference",
  change: "Change",
  signal: "Signal",
};

const protocolReasons = [
  {
    title: "One object per ask",
    body: "A Move isolates the agent's request from the conversation around it: the ask, the evidence, the available controls, and the human's response.",
  },
  {
    title: "Human authority stays explicit",
    body: "The human does not have to answer in prose and hope the agent interprets it. The Move gives them a control surface for the decision in front of them.",
  },
  {
    title: "The UI comes from the blocks",
    body: "The interface is derived from the Move itself: choices become buttons, rankings become ordered lists, toggles become switches, and diffs become comparisons.",
  },
  {
    title: "Agents can resume from it",
    body: "A response is structured enough for another process to continue without scraping a chat transcript or guessing what the human meant.",
  },
  {
    title: "Systems can interoperate",
    body: "Because the ask is portable, a Move can travel between agents, products, inboxes, approval queues, audit logs, and automation runners.",
  },
];

function isPlainLeftClick(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

function readSectionId(): SectionId {
  if (typeof window === "undefined") {
    return "overview";
  }

  const id = window.location.hash.replace(/^#/, "");
  return navItems.some((item) => item.id === id) ? (id as SectionId) : "overview";
}

function readPageId(): PageId {
  if (typeof window === "undefined") {
    return "home";
  }

  if (window.location.pathname === "/specification") {
    return "specification";
  }

  if (window.location.pathname === "/reference") {
    return "reference";
  }

  return "home";
}

function Illustration({ kind }: { kind: VisualKind }) {
  return (
    <div className={`illustration ${kind}`} aria-hidden="true">
      {kind === "choice" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
      {kind === "toggle" ? <span /> : null}
      {kind === "ranking" ? (
        <>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </>
      ) : null}
      {kind === "freeform" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
      {kind === "text" ? (
        <>
          <span />
          <span />
          <span />
          <span />
        </>
      ) : null}
      {kind === "image" ? (
        <>
          <span className="sun" />
          <span className="mountain a" />
          <span className="mountain b" />
        </>
      ) : null}
      {kind === "file" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
      {kind === "diff" ? (
        <>
          <span />
          <span />
        </>
      ) : null}
      {kind === "timeline" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
      {kind === "progress" ? <span /> : null}
      {kind === "warning" ? <span>!</span> : null}
      {kind === "section" ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : null}
    </div>
  );
}

type NavHandlers = {
  navigatePage: (event: JSX.TargetedMouseEvent<HTMLAnchorElement>, nextPageId: PageId) => void;
  navigate: (event: JSX.TargetedMouseEvent<HTMLAnchorElement>, nextId: SectionId) => void;
};

function SiteHeader({ activePage, navigatePage, navigate }: NavHandlers & { activePage: PageId }) {
  return (
    <header className="topbar">
      <a className="brand" href="/" onClick={(event) => navigatePage(event, "home")}>
        MOVES.md
      </a>
      <nav aria-label="Primary">
        <a className={activePage === "home" ? "active" : ""} href="/" onClick={(event) => navigate(event, "overview")}>
          Overview
        </a>
        <a href="/#why" onClick={(event) => navigate(event, "why")}>
          Why Moves
        </a>
        <a href="/#blocks" onClick={(event) => navigate(event, "blocks")}>
          Move blocks
        </a>
        <a className={activePage === "specification" ? "active" : ""} href="/specification" onClick={(event) => navigatePage(event, "specification")}>
          Specification
        </a>
        <a className={activePage === "reference" ? "active" : ""} href="/reference" onClick={(event) => navigatePage(event, "reference")}>
          Reference
        </a>
      </nav>
    </header>
  );
}

const moveExample = `{
  "id": "move_123",
  "source": "source_abc",
  "status": "proposed",
  "title": "Choose the invoice follow-up",
  "lede": "Acme is 14 days overdue and has not replied to the first reminder. The next message should either preserve the relationship or apply firmer pressure.",
  "context": "Acme usually pays within a week. The account is worth $48k annually, and their champion is on parental leave until June. Finance wants the invoice cleared this month.",
  "created_at": "2026-05-02T18:00:00Z",
  "blocks": [
    {
      "id": "recommendation",
      "type": "text",
      "content": "Recommended path: send a relationship-preserving reminder to the finance alias, CC the interim sponsor, and set a Friday follow-up."
    },
    {
      "id": "decision",
      "type": "choice",
      "question": "What should happen next?",
      "options": ["Send the softer reminder", "Send the firmer reminder", "Hold until Monday"]
    }
  ]
}`;

const eventExample = `{
  "type": "move.made",
  "move_id": "move_123",
  "source": "source_abc",
  "created_at": "2026-05-02T18:04:00Z"
}`;

const envelopeFields = [
  ["id", "Unique Move id supplied by the agent."],
  ["source", "Opaque return address supplied by the Move creator."],
  ["status", "Current Move state. The draft does not define status values."],
  ["title", "Short human-readable headline."],
  ["lede", "One or two sentences that state the ask."],
  ["context", "Background needed to make the decision."],
  ["blocks", "Ordered array of typed blocks."],
  ["created_at", "ISO 8601 creation timestamp."],
  ["made_by", "Actor that acted on the Move."],
  ["made_at", "ISO 8601 timestamp for the human action."],
  ["response", "Structured human input keyed by block id."],
];

const referenceBlocks = [
  ["text", "content", "Plain explanatory text."],
  ["url", "href", "A web reference. Add label and context when useful."],
  ["choice", "question, options", "One selected option."],
  ["multi_choice", "question, options", "Multiple selected options."],
  ["ranking", "question, items", "A human-ordered list."],
  ["toggle", "question", "A boolean decision."],
  ["freeform", "question", "A short text response."],
  ["file", "ref, filename", "An attached artifact."],
  ["snippet", "path, content", "A focused source excerpt."],
  ["diff", "before, after", "A focused code or text comparison."],
];

const schemaLinks = [
  ["Move schema", "/schemas/move.schema.json"],
  ["Block schema", "/schemas/block.schema.json"],
  ["Event schema", "/schemas/event.schema.json"],
  ["Discovery schema", "/schemas/discovery.schema.json"],
];

function SpecificationPage({ navigatePage, navigate }: NavHandlers) {
  return (
    <main>
      <SiteHeader activePage="specification" navigatePage={navigatePage} navigate={navigate} />
      <article className="doc-page">
        <p className="caption">Specification</p>
        <h1>Specification</h1>
        <p className="doc-lede">
          MOVES.md defines the object an agent uses to ask a human for a decision. The event and
          listener pieces close the loop after the human acts.
        </p>

        <section>
          <h2>Move</h2>
          <p>
            A Move is a durable artifact asking for human judgment. It packages the ask, the
            relevant context, the evidence, and the controls into a shape a product can render.
          </p>
          <ul>
            <li><strong>Envelope:</strong> identity, title, lede, context, status, blocks, and response.</li>
            <li><strong>Blocks:</strong> typed pieces of evidence, controls, references, changes, and signals.</li>
            <li><strong>Responses:</strong> structured human input keyed by block id.</li>
          </ul>
        </section>

        <section>
          <h2>Event and listener</h2>
          <p>
            When a human makes a Move, the system can emit `move.made`. A Listener receives the
            Event, recognizes what it cares about, and decides how to continue. The Event is a wake
            signal, not the full state of the Move.
          </p>
        </section>

        <section>
          <h2>Rendering</h2>
          <p>
            A renderer should derive the UI from the blocks. Choices become buttons, rankings become
            ordered lists, toggles become switches, diffs become comparisons, and evidence remains
            attached to the decision.
          </p>
        </section>
      </article>
    </main>
  );
}

function ReferencePage({ navigatePage, navigate }: NavHandlers) {
  return (
    <main>
      <SiteHeader activePage="reference" navigatePage={navigatePage} navigate={navigate} />
      <article className="doc-page">
        <p className="caption">Reference</p>
        <h1>Reference</h1>
        <p className="doc-lede">
          Start from the object shape, then use the schemas for the exact field contract.
        </p>

        <section>
          <h2>Move object</h2>
          <pre><code>{moveExample}</code></pre>
        </section>

        <section>
          <h2>Event object</h2>
          <pre><code>{eventExample}</code></pre>
        </section>

        <section>
          <h2>Schemas</h2>
          <div className="reference-table compact">
            {schemaLinks.map(([label, href]) => (
              <div key={href}>
                <code>{label}</code>
                <span>
                  <a href={href}>{href}</a>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Envelope fields</h2>
          <div className="reference-table compact">
            {envelopeFields.map(([field, description]) => (
              <div key={field}>
                <code>{field}</code>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Block fields</h2>
          <div className="reference-table block-fields">
            {referenceBlocks.map(([type, required, description]) => (
              <div key={type}>
                <code>{type}</code>
                <span><strong>{required}</strong></span>
                <span>{description}</span>
              </div>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}

export default function App() {
  const [pageId, setPageId] = useState(readPageId);
  const [sectionId, setSectionId] = useState(readSectionId);
  const [category, setCategory] = useState<BlockCategory | "all">("all");
  const visibleBlocks = useMemo(
    () => (category === "all" ? blocks : blocks.filter((block) => block.category === category)),
    [category],
  );

  useEffect(() => {
    const handleHashChange = () => {
      setPageId(readPageId());
      setSectionId(readSectionId());
    };
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (sectionId === "overview" || !window.location.hash) {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView();
  }, [sectionId]);

  useEffect(() => {
    const pageTitle =
      pageId === "specification" ? "Specification" : pageId === "reference" ? "Reference" : navItems.find((item) => item.id === sectionId)?.label;
    document.title = pageTitle === "Overview" ? "MOVES.md" : `${pageTitle} - MOVES.md`;
  }, [pageId, sectionId]);

  const navigatePage = (event: JSX.TargetedMouseEvent<HTMLAnchorElement>, nextPageId: PageId) => {
    if (!isPlainLeftClick(event)) {
      return;
    }

    event.preventDefault();
    const path = nextPageId === "home" ? "/" : `/${nextPageId}`;
    window.history.pushState({}, "", path);
    setPageId(nextPageId);
    setSectionId("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = (event: JSX.TargetedMouseEvent<HTMLAnchorElement>, nextId: SectionId) => {
    if (!isPlainLeftClick(event)) {
      return;
    }

    event.preventDefault();
    if (pageId !== "home") {
      const hash = nextId === "overview" ? "" : `#${nextId}`;
      window.history.pushState({}, "", `/${hash}`);
      setPageId("home");
      setSectionId(nextId);
      setTimeout(() => {
        if (nextId === "overview") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          document.getElementById(nextId)?.scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
      return;
    }

    setSectionId(nextId);
    if (nextId === "overview") {
      window.history.pushState({}, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.history.pushState({}, "", `#${nextId}`);
    document.getElementById(nextId)?.scrollIntoView({ behavior: "smooth" });
  };

  if (pageId === "specification") {
    return <SpecificationPage navigatePage={navigatePage} navigate={navigate} />;
  }

  if (pageId === "reference") {
    return <ReferencePage navigatePage={navigatePage} navigate={navigate} />;
  }

  return (
    <main>
      <SiteHeader activePage="home" navigatePage={navigatePage} navigate={navigate} />

      <section className="hero" id="overview">
        <p className="caption">Open format for agent proposals</p>
        <h1>Moves are how agents ask humans to make decisions.</h1>
        <p className="intro">
          A Move packages the situation, the evidence, and the control surface. It is the moment
          where background agent work turns into a clear human call.
        </p>
      </section>

      <section className="article" id="why">
        <h2>Why Moves</h2>
        <div className="why-layout">
          <div>
            <p>
              Agents are getting good at doing work between messages. The missing primitive is not
              more chat. It is a portable decision object: one bounded proposal that a human can
              inspect and answer.
            </p>
            <p>
              MOVES.md defines that object. It gives agents a common way to present evidence and
              gives products a common way to render the ask, record the answer, and notify the
              right system when the human has acted.
            </p>
            <div className="markdown-note">
              <h3>Why .md?</h3>
              <p>
                Agent systems already treat markdown files as operating manuals, memory, and
                project state. MOVES.md follows that convention, but for delegation: it defines the
                level of control a human wants to keep.
              </p>
            </div>
          </div>
          <aside className="move-equation" aria-label="Move structure">
            <span>Move</span>
            <strong>ask + evidence + controls + result</strong>
            <p>The smallest complete unit of delegated work.</p>
          </aside>
        </div>
        <div className="control-scale" aria-label="Control scale">
          <span>granular control</span>
          <strong />
          <span>delegated outcome</span>
        </div>
        <div className="fact-list">
          {protocolReasons.map((reason) => (
            <article key={reason.title}>
              <h3>{reason.title}</h3>
              <p>{reason.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery" id="blocks">
        <div className="gallery-head">
          <div>
            <p className="caption">Move blocks</p>
            <h2>Selected primitives for decisions, evidence, and action.</h2>
          </div>
          <div className="filters" aria-label="Block category filters">
            <button className={category === "all" ? "selected" : ""} onClick={() => setCategory("all")} type="button">
              All
            </button>
            {(Object.keys(categoryNames) as BlockCategory[]).map((key) => (
              <button className={category === key ? "selected" : ""} key={key} onClick={() => setCategory(key)} type="button">
                {categoryNames[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="block-grid">
          {visibleBlocks.map((block) => (
            <article className="block-card" key={block.name}>
              <Illustration kind={block.visual} />
              <h3>{block.label ?? block.name}</h3>
              {block.alias ? <p className="alias">{block.alias}</p> : null}
              <p>{block.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="article spec" id="spec">
        <div className="spec-head">
          <div>
            <p className="caption">Specification</p>
            <h2>The full specification defines the contract.</h2>
            <p>
              The overview is deliberately selective. The specification is the source of truth for
              the Move object, block schema, response shape, Event object, and listener semantics.
            </p>
            <div className="spec-actions">
              <a href="/specification" onClick={(event) => navigatePage(event, "specification")}>
                Read specification
              </a>
              <a href="/reference" onClick={(event) => navigatePage(event, "reference")}>
                Open reference
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="article flow" id="flow">
        <h2>The flow</h2>
        <div className="flow-steps">
          <div>
            <span>1</span>
            <h3>Agent proposes</h3>
            <p>The agent brings the smallest complete unit of context and evidence.</p>
          </div>
          <div>
            <span>2</span>
            <h3>Human makes</h3>
            <p>The Move records the human's response without turning the whole exchange into chat.</p>
          </div>
          <div>
            <span>3</span>
            <h3>Listener wakes</h3>
            <p>A `move.made` Event gives interested systems a small signal to continue.</p>
          </div>
        </div>
      </section>

      <footer>
        <span>MOVES.md</span>
        <span>Raw markdown remains available with Accept: text/markdown.</span>
      </footer>
    </main>
  );
}

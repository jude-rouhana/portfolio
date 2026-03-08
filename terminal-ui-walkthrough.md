# Terminal UI Walkthrough for Your Portfolio

## Goal
Add a **terminal-like UI overlay** to your portfolio that opens when the user clicks a button, instead of replacing your whole site. This approach adapts the tutorial pattern from the ITNEXT article into a modern portfolio-friendly implementation.

## What the source tutorial is doing
The tutorial pattern uses **jQuery Terminal** to render a fake terminal in the browser. The core setup is:

- load **jQuery**
- load **jQuery Terminal CSS + JS**
- initialize a terminal with `$(selector).terminal(...)`
- define commands like `hello`, `about`, `projects`, and `contact`

A CodePen linked to that tutorial shows the minimal pattern:

```js
$('body').terminal({
  hello: function(what) {
    this.echo('Hello, ' + what + '. Welcome to this terminal.');
  }
}, {
  greetings: 'My First Web Terminal'
});
```

That is the foundation we will adapt so the terminal appears **inside a modal / overlay** when a portfolio button is clicked.

---

## Recommended integration pattern for your portfolio
Since your portfolio is already a modern web project, the cleanest implementation is:

1. Keep your existing homepage/UI intact.
2. Add a button like **Open Terminal**.
3. When clicked, show a full-screen or centered overlay.
4. Mount the jQuery Terminal instance inside that overlay.
5. Add commands that map to portfolio sections such as:
   - `help`
   - `about`
   - `projects`
   - `resume`
   - `contact`
   - `clear`
   - `exit`

This gives you the terminal aesthetic without forcing the whole site to become terminal-only.

---

## Implementation options

### Option A — Fastest
Use jQuery + jQuery Terminal directly from a CDN in a standalone HTML/JS block.

Best if:
- you want the quickest proof of concept
- your portfolio has some plain JS areas already

### Option B — Better for a React/Vite portfolio
Install `jquery` and `jquery.terminal` with npm, then initialize the terminal inside a dedicated component once the modal opens.

Best if:
- your portfolio is React-based
- you want the terminal to behave like a real component
- you want cleaner project structure

This walkthrough focuses on **Option B** because it fits your portfolio setup better.

---

## Step 1: Install dependencies
Run:

```bash
npm install jquery jquery.terminal
```

If needed, also ensure your project can import CSS from npm packages.

---

## Step 2: Create a terminal modal component
Create a file such as:

```text
src/components/TerminalModal.jsx
```

Use this starter component:

```jsx
import { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'jquery.terminal/css/jquery.terminal.min.css';
import 'jquery.terminal/js/jquery.terminal.min.js';

export default function TerminalModal({ isOpen, onClose }) {
  const terminalRef = useRef(null);
  const terminalInstanceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.destroy();
      terminalInstanceRef.current = null;
    }

    const $terminal = $(terminalRef.current);

    terminalInstanceRef.current = $terminal.terminal(
      {
        help() {
          this.echo(`Available commands:\n- help\n- about\n- projects\n- resume\n- contact\n- clear\n- exit`);
        },
        about() {
          this.echo('Jude Rouhana — creative technologist, designer, and software builder.');
        },
        projects() {
          this.echo(`Projects:\n1. \n2. \n3. \n4. `);
        },
        resume() {
          this.echo('Open resume: /resume.pdf');
          window.open('/resume.pdf', '_blank');
        },
        contact() {
          this.echo('Email: your-email@example.com');
        },
        clear() {
          this.clear();
        },
        exit() {
          onClose();
        }
      },
      {
        greetings: 'Welcome to the portfolio terminal. Type `help` to begin.',
        name: 'portfolio_terminal',
        height: '100%',
        prompt: 'jude@portfolio:~$ '
      }
    );

    return () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.destroy();
        terminalInstanceRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div className="terminal-shell" onClick={(e) => e.stopPropagation()}>
        <div className="terminal-header">
          <span>Portfolio Terminal</span>
          <button onClick={onClose}>Close</button>
        </div>
        <div ref={terminalRef} className="terminal-body" />
      </div>
    </div>
  );
}
```

---

## Step 3: Add modal styling
Add this to your CSS file, for example:

```css
.terminal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(6px);
}

.terminal-shell {
  width: min(960px, 92vw);
  height: min(640px, 82vh);
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.45);
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #111;
  color: #eaeaea;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: Inter, sans-serif;
}

.terminal-header button {
  background: transparent;
  color: #eaeaea;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.terminal-body {
  width: 100%;
  height: calc(100% - 56px);
}
```

---

## Step 4: Add the open button to your portfolio page
In the page or hero component where you want the interaction to begin:

```jsx
import { useState } from 'react';
import TerminalModal from './components/TerminalModal';

export default function HomePage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <>
      <section>
        <h1>Jude Rouhana</h1>
        <p>Creative technologist, developer, designer.</p>
        <button onClick={() => setIsTerminalOpen(true)}>
          Open Terminal
        </button>
      </section>

      <TerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </>
  );
}
```

---

## Step 5: Make the terminal actually useful
The terminal should not just be decorative. It should act as a second navigation layer.

Recommended command design:

### Basic navigation commands
- `help` → lists all commands
- `about` → short bio
- `projects` → list project names
- `project faculty-review` → detailed project view
- `project scheduling` → another detailed project view
- `resume` → opens PDF
- `contact` → email + links
- `theme` → toggle a custom palette
- `clear` → clears output
- `exit` → closes the modal

### Better command parser version
If you want commands with arguments, switch from the object form to an interpreter function:

```jsx
terminalInstanceRef.current = $terminal.terminal(function(command) {
  const [cmd, ...args] = command.trim().split(/\s+/);
  const value = args.join(' ');

  switch (cmd) {
    case 'help':
      this.echo('Commands: help, about, projects, project <slug>, resume, contact, clear, exit');
      break;
    case 'about':
      this.echo('Jude Rouhana — creative technologist and builder of data, design, and music-adjacent tools.');
      break;
    case 'projects':
      this.echo('Try: project faculty-review');
      this.echo('Try: project ed-schedule');
      this.echo('Try: project reimbursement');
      break;
    case 'project':
      if (value === 'faculty-review') {
        this.echo('Annual Faculty Review System: FastAPI, React, PostgreSQL, workflow automation.');
      } else if (value === 'ed-schedule') {
        this.echo('ED Daily Combined Schedule: merges QGenda, Sheets, Excel, and PDFs into one view.');
      } else if (value === 'reimbursement') {
        this.echo('Reimbursement Smart Form: automated form filling, uploads, and routing.');
      } else {
        this.echo('Unknown project slug.');
      }
      break;
    case 'resume':
      window.open('/resume.pdf', '_blank');
      this.echo('Opening resume...');
      break;
    case 'contact':
      this.echo('Email: your-email@example.com');
      break;
    case 'clear':
      this.clear();
      break;
    case 'exit':
      onClose();
      break;
    default:
      if (cmd) this.echo(`Command not found: ${cmd}`);
  }
}, {
  greetings: 'Welcome to the portfolio terminal. Type help.',
  prompt: 'jude@portfolio:~$ '
});
```

---

## Step 6: Improve the visual integration
To make it feel like part of your brand instead of a pasted-in widget:

### Good visual ideas
- open terminal from a **Hero CTA** button
- animate the overlay fade-in
- animate the shell with slight scale/opacity entrance
- use your existing portfolio typography in the modal header
- keep the terminal body black, but let the frame match your site aesthetic
- optionally add red/yellow/green “window controls” in the header

### Portfolio-specific touches
- command prompt could be:
  - `jude@studio:~$`
  - `jude@portfolio:~$`
  - `jr@lab:~$`
- greetings text could be:
  - `Welcome to the Rouhana interface.`
  - `Type help to explore selected work.`
- hidden command ideas:
  - `music`
  - `play`
  - `jazz`
  - `ascii`

---

## Step 7: Prevent common React issues
Because this library is jQuery-based, watch for these issues:

### Problem: terminal duplicates itself
Cause: the effect runs more than once.
Fix: destroy the terminal before creating a new one.

Already handled here:

```js
if (terminalInstanceRef.current) {
  terminalInstanceRef.current.destroy();
  terminalInstanceRef.current = null;
}
```

### Problem: terminal initializes before modal is visible
Cause: the DOM node is not available yet.
Fix: only initialize when `isOpen` is true and the ref exists.

### Problem: SSR / build issues
If you ever move this into a framework with server rendering, you may need to lazy-load the component so jQuery only runs in the browser.

---

## Step 8: Suggested file structure

```text
src/
  components/
    TerminalModal.jsx
  styles/
    terminal.css
  pages/
    HomePage.jsx
```

If your project is already organized differently, adapt accordingly.

---

## Step 9: Suggested v2 enhancements
Once v1 works, add:

### Interactive navigation
Make commands scroll to sections or open modals:

```js
about() {
  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  this.echo('Scrolling to About section...');
}
```

### Open external links
```js
github() {
  window.open('https://github.com/yourusername', '_blank');
  this.echo('Opening GitHub...');
}
```

### Typed boot sequence
Echo startup lines after load to mimic a boot screen.

### Command aliases
Let `ls`, `whoami`, and `cat about.txt` map to the same portfolio content.

Example:

```js
switch (cmd) {
  case 'whoami':
    this.echo('Jude Rouhana');
    break;
  case 'ls':
    this.echo('about  projects  resume  contact');
    break;
  case 'cat':
    if (value === 'about.txt') {
      this.echo('Creative technologist building tools across design, automation, and software.');
    }
    break;
}
```

---

## Step 10: Best-fit recommendation for your portfolio
For your site, I recommend:

- launch the terminal from a **hero button**
- show it as a **large centered modal overlay**
- keep the command list tightly curated
- use it as an **alternate navigation experience**, not as the only way to browse
- connect commands to your real projects and resume

That gives you the novelty of the terminal interaction while keeping the main portfolio polished and accessible.

---

## Suggested rollout plan

### Phase 1
- add button
- add modal
- initialize terminal
- implement `help`, `about`, `projects`, `contact`, `exit`

### Phase 2
- add `resume`
- add project detail commands
- add animation
- tune branding / prompt styling

### Phase 3
- add hidden commands
- add keyboard shortcut to open terminal
- add mobile fallback behavior

---

## Copy-ready prompt for your IDE
Use this in Cursor or your IDE assistant:

```text
Please add a terminal-style modal overlay to my portfolio project.

Requirements:
- Add an "Open Terminal" button to the hero section.
- When clicked, open a modal overlay centered on the screen.
- Inside the modal, initialize jQuery Terminal.
- Use a React component named TerminalModal.
- Install and use jquery and jquery.terminal from npm.
- Import jquery.terminal CSS properly.
- The terminal must support these commands:
  - help
  - about
  - projects
  - resume
  - contact
  - clear
  - exit
- The exit command and close button should close the modal.
- The terminal should be destroyed cleanly when the modal closes.
- Add clean modal styling with a dark glassy overlay and a black terminal panel.
- Use the prompt: jude@portfolio:~$ 
- Use the greeting: Welcome to the portfolio terminal. Type help to begin.
- Keep the existing portfolio intact; this is an overlay, not a full-page replacement.

Please implement the component, required CSS, and the integration in the hero/home page.
```

---

## Source notes
This walkthrough is adapted from the ITNEXT tutorial approach and the jQuery Terminal documentation/examples, but restructured for a button-triggered portfolio overlay rather than a full-page terminal demo.

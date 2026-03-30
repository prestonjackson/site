# prestonjackson.com Project Context

## Quick Overview
Personal website & learning project exploring local-first development, collaboration, and 3D modeling. Philosophy: Keep It Simple, Stupid (KISS).

**Tech Stack**: Apache + Python (backend) | Vanilla HTML/CSS/JS (frontend) | File system storage | GCP Debian hosting

---

## Project Structure

### `/api/` - Backend Services (Python CGI)
- **gateway.py** — HTTP request/response handler, parses Apache environment
- **signal.py** — WebRTC signaling service (stores metadata in `/data/`)
- **echo.py** — Debug endpoint for testing
- **debug.py** — Displays request headers/body

### `/bin/` - Utility Scripts (Python)
- **convert-markdown.py** — Converts markdown to HTML via cmark-gfm (supports tables, footnotes, strikethrough)
- **get-recents.py** — Lists recent markdown files sorted by date

### `/doc/` - Frontend Assets
- **index.html** — Home page
- **app.html** — WebRTC peer connection demo
- **blog/blog.html, research/research.html** — Content pages (pull from markdown files)
- **template/** — SSI includes: head.html, header.html, footer.html
- **modeler.html** — 3D WebGPU modeler (loads from `/doc/modeler/modeler.html`)
- **modeler/script/** — Vanilla JS modules:
  - **app.js** — Main application controller
  - **connection.js** — RTCPeerConnection manager for signaling
  - **signaler.js** — WebRTC signaling client
  - **canvas.js** — Canvas class (WebGPU initialization, pipeline setup, render loop)
  - **triangle.wgsl** — WebGPU shader code (WGSL format)
- **style/main.css** — Custom styling with 40+ CSS variables, responsive design system, Material Design button specs
- **modeler/modeler.html** — 3D modeler interface with canvas and floating controls
- **modeler/script/** — Modeler-specific scripts (canvas.js, triangle.wgsl, plus shared modules)

### `/config/` - Server Configuration
- Apache vhost config, shell setup scripts, debugging commands

---

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Server | Apache 2 | Web server (built-in on macOS, installed on Debian) |
| Backend | Python 3 | CGI scripts for APIs and utilities |
| Storage | Filesystem | JSON metadata files under `/data/` |
| Frontend | HTML/CSS/JS | No frameworks; standard web APIs (WebRTC, WebGPU, Web Crypto) |
| Content | Markdown | Blog/research posts converted to HTML server-side |

---

## Core Features

✅ **Blog & Research Journal** — Markdown files auto-discovered, dated naming convention (YYYY-MM-DD_title.md), titled "Commonplace" (inspired by historical commonplace books for recording knowledge)  
✅ **WebRTC Demo** — Peer-to-peer connection test with data channel messaging  
✅ **3D WebGPU Modeler** — Full-screen canvas rendering with WebGPU, modular shader architecture  
✅ **Responsive Design** — Flexbox layout, 40+ CSS variables for consistent theming, Material Design 3 button specs  
✅ **HTTPS Ready** — Let's Encrypt integration, automated renewal  
✅ **Self-Hosted** — Runs on personal macOS for dev, GCP e2-micro Debian for production  

---

## Development Workflow

**Local** (macOS):
- Edit files in VS Code
- Apache serves from document root
- Access: `http://localhost/`
- Logs: `/tmp/api.log`

**Production** (GCP Debian):
- Same Apache + Python setup
- Static IP + DNS configured
- HTTPS via Let's Encrypt
- SSH access for Vim editing

---

## API Endpoints

```
POST /api/v1/signal          — WebRTC signaling (offer/answer/ICE candidates)
GET /api/v1/signal           — Retrieve pending signals
GET /api/echo                — Echo request (debug)
POST /api/echo               — Echo request (debug)
GET /bin/convert-markdown.py — Render markdown to HTML (query: ?dir=blog|research)
GET /bin/get-recents.py      — List recent files (query: ?dir=blog|research)
```

---

## Design Decisions

- **No frameworks** — Learning vanilla JS/CSS/WebGPU deeply
- **No build pipeline** — Server-side markdown processing, client-side only
- **No third-party CSS** — Custom CSS with variables
- **Stock tools** — Leverage OS-provided Apache, system Python
- **File-based storage** — No separate database service
- **Simple hosting** — e2-micro VM is sufficient for current scale
- **Modular architecture** — Separate shader files (.wgsl), Canvas class encapsulation, clean import order
- **WebGPU for 3D** — Modern GPU rendering, escape from WebGL complexity; shaders in WGSL language

---

## CSS Design System

**40+ custom properties** defined in `:root` for consistent theming:
- **Colors**: Background (#f8f9fa), text (#2c3e50), links (#1e40af), borders (#e9ecef)
- **Typography**: Helvetica Neue with weights (thin-200 to bold-700), 9 font sizes (xs–5xl), 3 line-heights
- **Spacing**: 7-tier scale (xs 0.5rem to 3xl 3rem)
- **Shadows**: Standard and small variants
- **Transitions**: Fast (200ms) and normal (300ms)
- **Buttons**: Material Design 3 XS spec (20px height, 4px padding, lighter blue #5B9FE0)

All CSS values use variables—enables rapid theming with zero CSS duplication.

---

## WebGPU & Shader Architecture

**Canvas Class** (`canvas.js`):
- Wraps HTMLCanvasElement as `native` property
- Handles WebGPU adapter/device initialization
- Creates render pipeline, manages render loop
- Uses `requestAnimationFrame` for continuous rendering

**Shader Files** (`.wgsl`):
- Separate from JavaScript for clarity and editability
- Current: `triangle.wgsl` — Renders a green triangle
- Loaded dynamically via `fetch()` in Canvas initialization
- Token-by-token breakdown:
  - **Vertex shader**: Computes 3 triangle positions from vertex_index
  - **Fragment shader**: Colors all pixels green (#32CC66)

**Modeler Layout**:
- Full-viewport canvas (#surface) with no scrolling
- Controls positioned absolutely at bottom-left with semi-transparent background
- Seamless integration with responsive CSS system

---

- [x] Blog rebranding — Changed from "Doggedly" to **"Commonplace"** (reflects historical knowledge-keeping practice)
- [x] 3D WebGPU modeler — Canvas class with basic triangle rendering
- [ ] Modeler features — Camera controls, mesh loading, scene graph
- [ ] Shader library — Extend with lighting, materials, post-processing shaders
- [ ] Document API endpoints — document.py, storage.py still placeholders
- [ ] Full peer-to-peer collaboration features
- [ ] WebGPU rendering

---

## Useful Commands

```bash
# Local debugging
curl -v http://localhost/api/echo
curl -v -H "Content-Type: application/json" -d '{"test":"data"}' http://localhost/api/echo

# View logs
tail -f /tmp/api.log

# Apache control
sudo apachectl start
sudo apachectl stop
sudo apachectl restart
```

---

## File Roles Reference

| File | Role | Tech |
|------|------|------|
| api/gateway.py | HTTP request/response handler | Python 3 |
| api/signal.py | WebRTC signaling server | Python 3 |
| doc/script/app.js | Application controller | JavaScript |
| doc/script/connection.js | RTCPeerConnection manager | JavaScript |
| doc/script/signaler.js | Signaling client | JavaScript |
| doc/style/main.css | Site styling | CSS 3 |
| bin/convert-markdown.py | Server markdown processor | Python 3 |
| bin/get-recents.py | Recent files lister | Python 3 |

---

## WebRTC Peer Connection Flow

1. Initiator clicks "Offer" button
   - Creates RTCPeerConnection
   - Creates data channel
   - Generates offer and sends via signaler
2. Responder receives offer via signaling service
3. Responder clicks "Answer" button
   - Creates RTCPeerConnection with answer
   - Sends answer via signaler
4. Both peers exchange ICE candidates via signaler
5. Click "Connect" to establish peer connection
6. Exchange messages via data channel

---

**Author**: Preston Jackson  
**License**: MIT (2026)  
**Status**: Active development

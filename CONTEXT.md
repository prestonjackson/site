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
- **app.html** — WebRTC peer connection demo
- **index.html** — Home page
- **blog/blog.html, research/research.html** — Content pages (pull from markdown files)
- **script/** — Vanilla JS: app.js (controller), connection.js (RTCPeerConnection manager), signaler.js (signaling client)
- **style/main.css** — Custom styling with CSS variables, sticky footer layout
- **template/** — SSI includes: head.html, header.html, footer.html

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

✅ **Blog & Research Journal** — Markdown files auto-discovered, dated naming convention (YYYY-MM-DD_title.md)  
✅ **WebRTC Demo** — Peer-to-peer connection test with data channel messaging  
✅ **Responsive Design** — Flexbox layout, CSS variables for theming  
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

- **No frameworks** — Learning vanilla JS/CSS deeply
- **No build pipeline** — Server-side markdown processing, client-side only
- **No third-party CSS** — Custom CSS with variables
- **Stock tools** — Leverage OS-provided Apache, system Python
- **File-based storage** — No separate database service
- **Simple hosting** — e2-micro VM is sufficient for current scale

---

## Next Steps / Known Gaps

- [ ] Document API endpoints (document.py, storage.py placeholders)
- [ ] 3D modeling integration (planned)
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

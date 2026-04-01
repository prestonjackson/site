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
- **modeler/modeler.html** — 3D WebGPU modeler interface with canvas and floating controls
- **style/main.css** — Custom styling with 40+ CSS variables, responsive design system, Material Design button specs
- **modeler/script/** — Modeler JavaScript architecture:
  - **Core Graphics**:
    - **canvas.js** — WebGPU renderer (adapter/device init, pipeline setup, dirty-flag render loop)
    - **model.js** — Geometry manager (vertices/edges/faces, GPU buffers, dirty flag system)
    - **camera.js** — Camera control (position/target/up, truck/dolly/orbit, view/projection matrices, raycasting)
    - **triangle.wgsl** — WebGPU shader code (vertex/fragment shaders in WGSL)
  - **Math Library** (`math/` subdirectory):
    - **vec3.js** — 3D vector class (add, subtract, scale, dot, cross, normalize, length)
    - **mat4.js** — 4×4 matrix class (multiply, transpose, transformPoint, lookAt, perspective, invert)
  - **Tool System** (`tool/` subdirectory):
    - **tool.js** — Base tool class (mouse event handling framework)
    - **select.js, orbit.js, dolly.js, truck.js** — Camera/interaction tools
    - **pencil.js, rectangle.js, oval.js** — Drawing tools (pencil fully implemented with raycasting)
  - **WebRTC**:
    - **app.js** — Main application controller
    - **connection.js** — RTCPeerConnection manager
    - **signaler.js** — WebRTC signaling client

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
✅ **Camera System** — Interactive 3D camera with truck (pan), dolly (zoom), and orbit controls; view/projection matrix management  
✅ **Interactive Drawing** — Pencil tool with raycasting to ground plane (z=0) for accurate 3D point placement  
✅ **Geometry System** — Model class manages vertices, edges, faces; GPU buffer management with dynamic upload  
✅ **Render Optimization** — Dirty flag pattern prevents unnecessary renders when scene unchanged (render-on-demand)  
✅ **3D Math Library** — Vec3 and Mat4 classes with Float32Array backing for WebGPU compatibility  
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

## WebGPU & 3D Modeler Architecture

### Rendering Pipeline
**Canvas Class** (`canvas.js`):
- Initializes WebGPU adapter, device, and render context
- Creates render pipeline with shader module loaded from `triangle.wgsl`
- Implements dirty-flag render optimization: only schedules frames when `model.dirty = true`
- Manages uniform buffer for camera view/projection matrices
- Implements `render()` callback with proper bind group setup and draw calls

**Shader Files** (`.wgsl`):
- `triangle.wgsl` — Vertex and fragment shaders for 3D geometry rendering
- Vertex shader: Transforms vertices via view/projection matrices
- Fragment shader: Colors fragments based on layer (faces, edges, vertices)

### 3D Math System
**Vec3 Class** (`script/math/vec3.js`):
- 3D vector with Float32Array backing for WebGPU efficiency
- Operations: add, subtract, scale, dot product, cross product, normalize, length
- Static factories: zero(), unitX(), unitY(), unitZ()

**Mat4 Class** (`script/math/mat4.js`):
- Column-major 4×4 matrix (WebGPU compatible)
- Operations: multiply, transpose, transformPoint, inverse
- Factory methods: identity(), translate(), rotateX/Y/Z(), rotateAxis(), perspective(), lookAt()
- Recent addition: `invert()` instance method for raycasting coordinate transforms

### Camera System
**Camera Class** (`camera.js`):
- Properties: position, target, up (Vec3s); fov, aspect, near, far
- Methods: `truck()`, `dolly()`, `orbit()` for interactive camera movement
- Matrix generation: `getViewMatrix()`, `getProjectionMatrix()`
- Raycasting: `screenToWorldOnPlane(screenX, screenY, viewportWidth, viewportHeight, planeZ=0)`
  - Converts 2D screen coordinates → NDC → world space via matrix inversion
  - Used by pencil tool for accurate 3D point placement

### Model & Geometry
**Model Class** (`model.js`):
- Manages arrays: vertices (Vec3), edges, faces
- GPU resources: vertex buffer, edge index buffer, face index buffer
- `uploadToGPU()` — Creates/updates all GPU buffers
- `dirty` flag — Marks scene as needing re-render
- `camera` member — Camera instance for raycasting

### Tool System
**Base Tool Class** (`script/tool/tool.js`):
- Framework for mouse-based interactions
- Methods: `onMouseDown()`, `onMouseMove()`, `onMouseUp()`
- Passed to event listeners; overridden by subclasses

**Camera Tools**:
- `orbit.js` — Pan camera around target (rotates via Rodrigues formula)
- `dolly.js` — Move camera closer/farther from target
- `truck.js` — Pan camera left/right and up/down (translate along view plane)

**Drawing Tools**:
- `pencil.js` — Place small triangles on ground plane via raycasting
  - Uses `model.canvas.screenToWorldOnPlane()` to convert click to 3D position
  - Calls `model.uploadToGPU()` and sets `model.dirty = true` to schedule render
- `rectangle.js`, `oval.js` — Framework in place, implementation pending

### Rendering Flow
1. User interacts (camera move, draw, etc.)
2. Tool updates model or camera
3. Tool sets `model.dirty = true` and calls `model.canvas.requestRender()`
4. `requestRender()` schedules `requestAnimationFrame()` callback (if not already pending)
5. `render()` callback fires:
   - Updates uniform buffer with camera matrices
   - Binds geometry buffers
   - Executes draw calls for faces, edges, vertices
   - Clears `frameRequested` flag
6. Only next interaction triggers next render (no wasteful continuous rendering)

### Code Organization
```
script/
├── canvas.js              (WebGPU rendering)
├── model.js               (Geometry management)
├── camera.js              (Camera control + raycasting)
├── signaler.js            (WebRTC signaling)
├── connection.js          (RTCPeerConnection)
├── app.js                 (Main controller)
├── triangle.wgsl          (Shader code)
├── math/
│   ├── vec3.js            (3D vectors)
│   └── mat4.js            (4×4 matrices)
└── tool/
    ├── tool.js            (Base class)
    ├── orbit.js           (Camera orbit)
    ├── dolly.js           (Camera zoom)
    ├── truck.js           (Camera pan)
    ├── pencil.js          (Point placement)
    ├── rectangle.js       (Rectangle drawing)
    ├── oval.js            (Oval drawing)
    └── select.js          (Selection tool)
```

---

- [x] Blog rebranding — Changed from "Doggedly" to **"Commonplace"** (reflects historical knowledge-keeping practice)
- [x] 3D WebGPU modeler — Canvas class with basic triangle rendering
- [x] Camera system — Full 3D camera with truck, dolly, orbit controls
- [x] Geometry system — Model class managing vertices, edges, faces with GPU buffers
- [x] Math library — Vec3 and Mat4 classes with Float32Array backing
- [x] Render optimization — Dirty flag pattern for render-on-demand
- [x] Raycasting — screenToWorldOnPlane() for converting 2D screen coords to 3D world space
- [x] Pencil tool — Interactive drawing with triangle placement on ground plane
- [x] Code organization — Math library in script/math/, tools in script/tool/
- [ ] Rectangle & oval tools — Drawing tool framework in place, need implementation
- [ ] Select tool — Picking/selection functionality
- [ ] Ground plane visualization — Visual grid indicator
- [ ] Edge/face rendering — Color differentiation and style variants
- [ ] Undo/redo system
- [ ] Model save/load
- [ ] Document API endpoints — document.py, storage.py still placeholders
- [ ] Full peer-to-peer collaboration features

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
| doc/modeler/script/canvas.js | WebGPU renderer and render loop | JavaScript |
| doc/modeler/script/model.js | Geometry management and GPU buffers | JavaScript |
| doc/modeler/script/camera.js | Camera control and raycasting | JavaScript |
| doc/modeler/script/math/vec3.js | 3D vector operations | JavaScript |
| doc/modeler/script/math/mat4.js | 4×4 matrix operations | JavaScript |
| doc/modeler/script/tool/tool.js | Base tool class framework | JavaScript |
| doc/modeler/script/tool/orbit.js | Camera orbit tool | JavaScript |
| doc/modeler/script/tool/dolly.js | Camera zoom tool | JavaScript |
| doc/modeler/script/tool/truck.js | Camera pan tool | JavaScript |
| doc/modeler/script/tool/pencil.js | Point placement drawing tool | JavaScript |
| doc/modeler/script/tool/rectangle.js | Rectangle drawing tool | JavaScript |
| doc/modeler/script/tool/oval.js | Oval drawing tool | JavaScript |
| doc/modeler/script/tool/select.js | Selection tool (framework) | JavaScript |
| doc/modeler/script/app.js | Application controller | JavaScript |
| doc/modeler/script/connection.js | RTCPeerConnection manager | JavaScript |
| doc/modeler/script/signaler.js | WebRTC signaling client | JavaScript |
| doc/modeler/script/triangle.wgsl | Vertex and fragment shaders | WGSL |
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

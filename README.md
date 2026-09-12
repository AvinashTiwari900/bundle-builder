# Recruitment-Automation-Software (RAS) — Candidate Portal

> **AI-Powered Recruitment Automation Software (RAS) — Full-Lifecycle Candidate & Career Portal**

The **Recruitment Automation Software (RAS)** transforms recruitment into an intelligent, transparent, and scalable platform. Candidates can create and manage their professional identity, discover curated job opportunities with company hiring ratings, 1-click auto-apply with triggered Email and WhatsApp notifications, showcase verified case studies with recruiter privacy masking, attend live meetings with recorded talk archives and transcripts, track 11 application lifecycle stages under 24h recruiter response SLAs, and complete OTP-authorized KYC document verification.

---

## 🌟 Key Modules & Capabilities

### 1. 📰 Community Posts & Recruitment Feed (`/posts`)
- **Dual-Audience Feed**: Community updates from Verified Companies (hiring sprints, culture, engineering blogs) and Candidates (project demos, STAR interview breakdowns, career advice).
- **"+ Add Post" System**:
  - Multi-category publisher (*Company Hiring*, *Candidate Showcase*, *Interview Experience*, *Career Tips*, *Tech Insight*).
  - Multi-line rich descriptions and media attachments.
  - Verified Links integration (GitHub repository, live web demo, public portfolio, tech blog, 1-click job application).
  - Autocomplete tags (`#hiring`, `#sql`, `#powerbi`, `#interview-experience`) with clickable instant tag filtering.
  - Author mode switch (Post as Candidate vs Post as Company).
- **Interactive Feed**: Like counters with heart animations, comments thread with reply input, bookmarks, and search.

### 2. 🎥 In-Platform Meetings & Viewable Recorded Talks (`/meetings` & `/interview/room/:id`)
- **Direct Live Meeting Platform**: Attend scheduled recruiter and AI interview sessions directly on RAS without third-party software (Zoom/Teams).
- **Cloud Recording Active Overlay**: Real-time `🔴 REC · Cloud Recording Active` indicator with AI face and gaze tracking proctoring.
- **Searchable Verbatim Transcripts**: Dialogue turns indexed turn-by-turn with speaker diarization badges (*AI Technical Evaluator*, *Candidate*, *Hiring Panel*).
- **Recorded Talks Archive**: Interactive video replay player, audio scrubber, competency scorecards (Technical Depth, Problem Solving, Communication), proctoring compliance logs, and `.txt` transcript download.

### 3. 🔒 Candidate Contact Privacy Shield & Panel Preview (`/portfolio`)
- **Direct Contact Masking**: Direct personal email (`a*****i@gmail.com`) and phone (`+91 98****4321`) are masked from company panels to prevent unsolicited phone calls and poaching.
- **In-Platform Communication**: Panel members communicate, send messages, and schedule live video interviews directly through the RAS candidate portal.
- **"👁️ View as Recruiter/Panel" Preview**: Toggle between candidate edit view and employer panel preview with simulated action buttons (*Schedule Interview Round*, *Shortlist Candidate*, *Request KYC Verification*).
- **AI Portfolio Quality Analyzer**: Real-time suggestions on missing skills, project presentation, and profile completeness.

### 4. ⭐ Company Hiring Ratings & ⏱️ Hiring Periods (`/jobs`)
- **Company Hiring Rating**: Automatically computed rating (e.g. `4.9 ★`) with response velocity tags (*"99% Response Rate"*, *"Fast Responder <12h"*, *"Same-Day Reply"*).
- **Hiring Period Badges**: Clear joiner expectations (*"Immediate (0-15 Days)"*, *"Urgent Joining (7 Days)"*, *"30 Days Notice Accepted"*, *"Cohort Joining (Q3)"*).
- **Advanced Filtering**: Filter by Hiring Period and sort by Company Hiring Rating.

### 5. ⚡ Triggered Email & WhatsApp Messages on Auto-Apply (`/auto-apply`)
- **Automated Dispatches**: Automatically submits applications when compatibility exceeds threshold (e.g. 80%) under 24h recruiter response SLAs.
- **Triggered HTML Email Notification**: Real-time email confirmation containing company name, job role, applied date, 24h recruiter response SLA, and ATS match score.
- **Triggered WhatsApp Notification**: Mobile alert with company name, match score, resume version, and direct link.
- **Audit Feed & Lightbox**: Interactive `Triggered Email & WhatsApp Dispatches` tab with modal previewing the formatted HTML email and WhatsApp green chat bubbles.

### 6. 📊 11-Stage Application Lifecycle Pipeline (`/applications`)
- **Full 11-Stage Tracking**:
  1. *Application Submitted*
  2. *Resume Screening*
  3. *AI Screening*
  4. *Shortlisted*
  5. *Interview Scheduled*
  6. *Interview in Progress*
  7. *Interview Completed*
  8. *Under Review*
  9. *Selected / Offer*
  10. *Rejected*
  11. *On Hold*
- **24-Hour Recruiter Response SLA**: Automated timers ensuring prompt recruiter feedback with escalation protocols.
- **Stage-Specific Actions**: *Join Live Meeting*, *Watch Recording*, *AI Voice Call*, *Upload KYC Docs*, *View Dossier*.

### 7. 🛡️ Multi-Document KYC Hub with OTP Authorization (`/documents`)
- **Supported Records**: Aadhaar Card, PAN Card, Degree Certificates, Previous Relieving Letters, Recent Salary Slips (Last 3 Months), Previous Offer Letters, and Photographs.
- **6-Digit OTP Identity Authorization**: Mandatory OTP authorization (`123456`) before document verification begins.
- **Discrepancy Resolution Panel**: Flagged discrepancy notes with candidate re-submission & clarification channel.
- **Cloud Storage**: Synced to Cloudinary CDN with metadata indexed in PostgreSQL.

### 8. 🎙️ AI Voice Screening Call Simulator (`/voice-screening`)
- Interactive phone call simulation with real-time audio waveform visualization.
- Standard HR screening dialog (intro, notice period, CTC, relocation preferences, and intelligent follow-ups) with Sarah (RAS AI Talent Partner).

### 9. 🤖 AI Career Copilot (`/ai-agent`)
- Natural language intent handling for platform navigation, application status breakdowns, resume ATS improvement, and interview preparation.
- Guided Step-by-Step Workflow Wizards for Portfolio Creation, Job Applications, and Interview Preparation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide React
- **Speech Engine**: Web SpeechSynthesis (TTS) & Web SpeechRecognition (STT), Sarvam AI for adaptive voice practice
- **Cloud Storage**: Cloudinary CDN (Image, PDF, Document & Resume Uploads)
- **Backend & Database**: Node.js / Express + PostgreSQL (via Prisma) — see `server/` — for auth, candidate profile, jobs, applications, resumes, documents, projects, notifications, and portfolio
- **Routing & State**: React Router v6, Context API, LocalStorage Hybrid Fallback

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/AvinashTiwari900/Recuritment-Automation-PlatForm.git
cd Recuritment-Automation-PlatForm
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up the backend
See `server/README.md` for full setup (PostgreSQL + Prisma migrations). Quick version:
```bash
cd server
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run prisma:migrate
npm run prisma:seed    # seeds 50 sample jobs
```

### 4. Configure the frontend
Create a `.env` file from `.env.example`:
```env
VITE_API_URL=http://localhost:4000/api

# Cloudinary (unsigned upload preset - see .env.example for setup steps)
VITE_CLOUDINARY_CLOUD_NAME=je6whpaq
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name_here
```

### 5. Run Development Servers
```bash
npm install
npm run dev:all   # runs both the frontend (Vite) and the backend API together
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production
```bash
npm run build
```

---

## 🔐 Account Access
Registration creates a real account (Postgres-backed, bcrypt-hashed password). There's no demo login shortcut — create an account via `/register`, or use whichever credentials you've already registered in your local database.

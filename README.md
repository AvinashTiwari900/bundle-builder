# Recuritment-Automation-PlatForm

> **AI-Powered Recruitment Automation Software (RAS) — Candidate Experience & Career Portal**

The **Recruitment Automation Software (RAS)** transforms traditional hiring into an intelligent, automated, and scalable ecosystem. It covers the full candidate lifecycle from resume intake, automated ATS scoring, and AI-conducted preliminary HR voice screening to live proctored video interviews, multi-document KYC verification, and real-time application pipeline tracking.

---

## 🌟 Key Features

### 1. 🤖 AI Video Interview Room with Real-Time Proctoring
- Real-time video/audio streaming with dynamic question generation.
- **AI Proctoring Engine**: Head/gaze tracking, multi-person detection alerts, camera obstruction warnings.
- **3-Strike Policy**: On-screen warning modal with violation logging and automatic session termination on the 3rd flag.
- **Post-Interview Evaluation Report**: Technical depth, problem-solving, communication scores, and comprehensive Q&A transcript.

### 2. 📞 AI Voice HR Screening Call
- Interactive phone call simulation with real-time audio waveform visualization.
- Standard HR screening dialog (intro, notice period, current & expected CTC, relocation preferences, and intelligent follow-ups).
- Generates recruiter screening summary reports with candidate communication ratings.

### 3. 🔍 Job Description vs Profile Gap Analyzer
- Side-by-side comparison between candidate skills and job descriptions.
- Highlights exact matches, missing keywords, and tailored resume optimization recommendations.

### 4. 📄 Resume ATS Optimizer & Document KYC Hub
- Detailed ATS breakdown with missing keywords and role suitability scores.
- **Cloudinary Storage**: Resumes and KYC records (Aadhaar, PAN, degrees, relieving letters) stored on Cloudinary CDN.
- **Firebase Firestore**: Metadata and CDN URLs indexed in Cloud Firestore.
- **OTP Verification**: 6-digit OTP verification code (`123456`) before document authentication.

### 5. 💼 Application Kanban & Recruiter SLA Tracker
- Full 11-stage recruitment pipeline (*Application Submitted*, *Resume Screening*, *AI Screening*, *Shortlisted*, *Interview Scheduled*, *Interview in Progress*, *Interview Completed*, *Under Review*, *Selected*, *Rejected*, *On Hold*).
- **24-Hour Recruiter SLA Timer** with auto-escalation policy.

### 6. 🚀 Projects & Case Study Showcase with AI Review
- Project showcase with quantifiable business metrics, GitHub links, and tech stack tags.
- **AI Review Engine**: Real-time quality evaluation and impact metric suggestions.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Storage**: Cloudinary CDN (Image, PDF, Document Uploads)
- **Database & Auth**: Firebase Firestore & Firebase Auth
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

### 3. Configure Environment Variables
Create a `.env` file from `.env.example`:
```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=recruitment-cebef.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=recruitment-cebef
VITE_FIREBASE_STORAGE_BUCKET=recruitment-cebef.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=398833030288
VITE_FIREBASE_APP_ID=your_app_id_here

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=je6whpaq
VITE_CLOUDINARY_API_KEY=819734381438919
VITE_CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚡ Quick Demo Login
- **Email**: `avinashtiwari@gmail.com`
- **Password**: `Candidate@123`
- Or click the **⚡ Quick Demo Login (Avinash Tiwari)** button on the login screen.

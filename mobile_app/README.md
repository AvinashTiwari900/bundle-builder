# RAS Candidate Mobile Application (Flutter + Dart)

A production-grade, feature-complete Candidate Mobile Application for **RAS (Recruitment Automation Software)** built using **Flutter + Dart**, adhering to scalable feature-based clean architecture, **Riverpod** state management, **Dio** HTTP client with automated Bearer token injection, and **GoRouter** navigation with nested shell tabs.

---

## 🏛️ System Architecture

```
mobile_app/
│
├── lib/
│   ├── main.dart                      # Root entry point with ProviderScope
│   ├── app/
│   │   ├── app.dart                   # MaterialApp.router configuration
│   │   ├── router.dart                # GoRouter with 5 Shell Tabs & Feature subroutes
│   │   ├── theme.dart                 # Dark & Light ThemeData (RAS design tokens)
│   │   └── main_navigation_shell.dart # Bottom Navigation Shell (Home, Jobs, Apps, Posts, Profile)
│   │
│   ├── core/
│   │   ├── api/                       # Dio ApiClient, Endpoints, AuthInterceptor
│   │   ├── storage/                   # FlutterSecureStorage Token Storage wrapper
│   │   ├── constants/                 # AppColors, DirectoryData (Colleges, Roles)
│   │   ├── errors/                    # AppException, NetworkException, AuthException
│   │   └── widgets/                   # CustomButton, CustomTextField, StatusBadge, MatchScoreChip, OtpInputView
│   │
│   └── features/
│       ├── authentication/            # Splash, Login, Register (searchable college), Dual OTP, ForgotPassword, First-time Portfolio Onboarding
│       ├── dashboard/                 # Home KPIs, Profile strength, Quick modules, Recommended jobs
│       ├── profile/                   # Candidate summary, Experience, Skills, Masked Contact privacy
│       ├── portfolio/                 # Full portfolio showcase, Projects & Case Studies
│       ├── projects/                  # Projects CRUD, AI Project Review Diagnostics
│       ├── case_studies/              # Technical architecture case study publisher & viewer
│       ├── jobs/                      # Job discovery, Filters modal, Job details, AI Match score breakdown, Apply
│       ├── applications/              # My Applications, 11-Stage visual recruitment pipeline timeline
│       ├── auto_apply/                # Autonomous job application engine, Quotas, Dispatch audit log
│       ├── posts/                     # Community feed, Post creation (with links & media), Likes & comments
│       ├── connections/               # Candidate networking (Connected, Pending, Discover)
│       ├── ai_copilot/                # AI Career Copilot assistant with contextual screen navigation
│       ├── interview_studio/          # AI Interview Simulation (Sarah vs Alex), Live Session, "Show Questions" drawer, Integrity monitoring
│       ├── meetings/                  # Upcoming recruiter calls, Instant room launcher, Transcripts & summaries
│       ├── documents/                 # Encrypted KYC vault (Aadhaar, PAN, Resume) with OTP unlock
│       ├── notifications/             # Real-time alert feed & mark read actions
│       └── settings/                  # Privacy controls, notification preferences, sign out
│
├── android/                           # Android Gradle setup & Manifest permissions (Camera, Mic, Storage)
├── ios/                               # iOS Runner setup & Info.plist privacy permissions
├── test/                              # Widget & unit tests
└── pubspec.yaml                       # Project dependencies & assets
```

---

## ⚡ Setup & Running

### 1. Prerequisites
Ensure the Flutter SDK (3.19+) is installed on your computer.
Check with:
```bash
flutter --version
```

### 2. Install Dependencies
Navigate into `mobile_app` and retrieve all Flutter packages:
```bash
cd mobile_app
flutter pub get
```

### 3. Configure Backend Connection
The backend server runs at port 4000 (`http://localhost:4000/api`).
- **Web / Desktop**: Defaults to `http://localhost:4000/api`
- **Android Emulator**: Uses `http://10.0.2.2:4000/api`
- **Physical Device (Phone over Wi-Fi)**: Uses `http://192.168.1.29:4000/api` (configured in `lib/core/api/api_endpoints.dart`).

### 4. Run the Application
```bash
# Run on connected phone or emulator
flutter run

# Or preview on Chrome / Web
flutter run -d chrome
```

---

## 🔑 Test Credentials

* **Email**: `avinashtiwari@gmail.com`
* **Password**: `Candidate@123`
* **One-Tap Demo**: Tap the **"One-Tap Login"** button on the sign-in screen to authenticate immediately.
* **Sandbox Verification OTP**: `123456` (Used for dual registration OTP & KYC vault unlock).

---

## 🛡️ Zero Breaking Changes
The mobile application is completely self-contained within `/mobile_app`. The existing web application (`src/`) and Express/Prisma backend (`server/`) remain completely intact.

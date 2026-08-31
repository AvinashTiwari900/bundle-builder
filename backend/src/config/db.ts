import {
  User,
  CandidateProfile,
  Job,
  Application,
  Meeting,
  Post,
  KYCDocument,
  Connection,
  InterviewSessionRecord
} from '../models/types'
import bcrypt from 'bcryptjs'

// In-Memory Database Store for Instant Local Out-of-the-Box Execution
class Database {
  users: User[] = []
  profiles: CandidateProfile[] = []
  connections: Connection[] = []
  interviews: InterviewSessionRecord[] = []
  jobs: Job[] = []
  applications: Application[] = []
  meetings: Meeting[] = []
  posts: Post[] = []
  documents: KYCDocument[] = []

  constructor() {
    this.seed()
  }

  private seed() {
    const passwordHash = bcrypt.hashSync('Candidate@123', 10)
    const userId = 'usr-candidate-default-01'

    // =========================================================================
    // 1. Users Seed
    // =========================================================================
    const userList: User[] = [
      {
        id: userId,
        email: 'avinash.tiwari@example.com',
        name: 'Avinash Tiwari',
        passwordHash,
        role: 'candidate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-network-01',
        email: 'priya.sharma@razorpay.com',
        name: 'Priya Sharma',
        passwordHash,
        role: 'candidate',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-network-02',
        email: 'rahul.verma@swiggy.in',
        name: 'Rahul Verma',
        passwordHash,
        role: 'candidate',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-network-03',
        email: 'ananya.iyer@cred.club',
        name: 'Ananya Iyer',
        passwordHash,
        role: 'candidate',
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-network-04',
        email: 'vikram.patel@zomato.com',
        name: 'Vikram Patel',
        passwordHash,
        role: 'candidate',
        createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'usr-network-05',
        email: 'sneha.kulkarni@flipkart.com',
        name: 'Sneha Kulkarni',
        passwordHash,
        role: 'candidate',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    this.users.push(...userList)

    // =========================================================================
    // 2. Candidate & Network Profiles Seed (with Education, Experience, Projects)
    // =========================================================================
    const defaultProfile: CandidateProfile = {
      id: 'prof-default-01',
      userId,
      name: 'Avinash Tiwari',
      email: 'avinash.tiwari@example.com',
      phone: '+91 98765 43210',
      headline: 'Lead Business Analyst & Analytics Engineer',
      bio: 'Lead Business Analyst with 6+ years driving enterprise digital transformation, automated pipeline architectures, and analytics engines across Fintech, SaaS, and Supply Chain ecosystems.',
      location: 'Bengaluru, India',
      currentRole: 'Lead Business Analyst @ FinScale Technologies',
      totalExperienceYears: 6.5,
      currentSalaryLPA: 22,
      expectedSalaryLPA: 28,
      noticePeriodDays: 15,
      skills: ['Business Analysis', 'SQL', 'Power BI', 'Python', 'ETL Pipelines', 'Data Warehousing', 'Requirements Engineering', 'Agile / Scrum'],
      tools: ['Snowflake', 'Jira', 'Figma', 'Tableau', 'dbt', 'Git'],
      languages: ['English (Fluent)', 'Hindi (Native)'],
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      atsScore: 92,
      contactPrivacyMask: true,
      privacySettings: {
        profileVisibility: 'public',
        showEmailToConnections: false,
        showPhoneToConnections: false,
        allowConnectionRequests: true,
        contactPrivacyMask: true
      },
      education: [
        {
          id: 'edu-01',
          institution: 'Birla Institute of Technology and Science (BITS), Pilani',
          degree: 'Master of Technology (M.Tech)',
          fieldOfStudy: 'Data Analytics & Software Engineering',
          startYear: 2018,
          endYear: 2020,
          grade: '9.2 CGPA'
        },
        {
          id: 'edu-02',
          institution: 'Gujarat Technological University (GTU)',
          degree: 'Bachelor of Engineering (B.E.)',
          fieldOfStudy: 'Computer Science and Information Technology',
          startYear: 2014,
          endYear: 2018,
          grade: '8.8 CGPA'
        }
      ],
      experience: [
        {
          id: 'exp-01',
          company: 'FinScale Technologies',
          position: 'Lead Business Analyst',
          location: 'Bengaluru, India',
          workType: 'Hybrid',
          startDate: '2022-04-01',
          isCurrent: true,
          description: 'Spearheaded automated reconciliation pipelines across ₹800 Cr monthly GMV, cutting end-of-day discrepancy resolution from 4 hours to 6 minutes.',
          skillsUsed: ['Snowflake', 'SQL', 'dbt', 'Power BI', 'Agile']
        },
        {
          id: 'exp-02',
          company: 'Cognizant Technology Solutions',
          position: 'Senior Systems Analyst',
          location: 'Pune, India',
          workType: 'On-site',
          startDate: '2019-06-01',
          endDate: '2022-03-31',
          isCurrent: false,
          description: 'Authored technical specification documents and oversaw 14 sprints for cloud payment gateway integration.',
          skillsUsed: ['Business Analysis', 'Jira', 'SQL', 'UML Modeling']
        }
      ],
      projects: [
        {
          id: 'proj-01',
          title: 'Automated Payment Reconciliation Engine',
          description: 'A cloud-native telemetry pipeline delivering real-time anomaly detection and ledger settlement on Snowflake and dbt.',
          role: 'Lead Architect & Business Analyst',
          technologies: ['Snowflake', 'dbt', 'SQL', 'Python', 'Power BI'],
          liveUrl: 'https://avinash-tiwari.dev/projects/payment-recon',
          githubUrl: 'https://github.com/AvinashTiwari900/payment-recon-engine',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'proj-02',
          title: 'Omnichannel B2B Fulfillment Dashboard',
          description: 'Interactive executive analytics suite tracking multi-warehouse inventory turnover and freight SLA adherence.',
          role: 'Product Analytics Lead',
          technologies: ['Tableau', 'PostgreSQL', 'Python'],
          liveUrl: 'https://avinash-tiwari.dev/projects/fulfillment-dashboard',
          githubUrl: 'https://github.com/AvinashTiwari900/b2b-fulfillment-analytics',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
        }
      ],
      githubUrl: 'https://github.com/AvinashTiwari900',
      linkedinUrl: 'https://linkedin.com/in/avinash-tiwari-ba',
      portfolioUrl: 'https://avinash-tiwari.dev',
      applicationsCount: 4,
      connectionsCount: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const networkProfiles: CandidateProfile[] = [
      {
        id: 'prof-01',
        userId: 'usr-network-01',
        name: 'Priya Sharma',
        email: 'priya.sharma@razorpay.com',
        phone: '+91 98220 11223',
        headline: 'Senior Product Manager — Payments & Merchant Scale',
        bio: 'Product leader passionate about fintech rails, developer experience, and 10x scale. Scaled payment onboarding at Razorpay.',
        location: 'Bengaluru, India',
        currentRole: 'Senior Product Manager @ Razorpay',
        totalExperienceYears: 7,
        currentSalaryLPA: 34,
        expectedSalaryLPA: 42,
        noticePeriodDays: 30,
        skills: ['Product Strategy', 'Fintech', 'A/B Testing', 'Payment Rails', 'API Design', 'Roadmapping'],
        tools: ['Jira', 'Mixpanel', 'Figma', 'Postman'],
        languages: ['English', 'Hindi'],
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        atsScore: 94,
        contactPrivacyMask: true,
        privacySettings: {
          profileVisibility: 'public',
          showEmailToConnections: true,
          showPhoneToConnections: false,
          allowConnectionRequests: true,
          contactPrivacyMask: true
        },
        education: [
          {
            id: 'edu-p1',
            institution: 'Indian Institute of Management (IIM), Bangalore',
            degree: 'MBA',
            fieldOfStudy: 'Product Management & Strategic Leadership',
            startYear: 2017,
            endYear: 2019
          }
        ],
        experience: [
          {
            id: 'exp-p1',
            company: 'Razorpay',
            position: 'Senior Product Manager',
            location: 'Bengaluru, India',
            workType: 'Hybrid',
            startDate: '2021-02-01',
            isCurrent: true,
            description: 'Owned the instant settlements product suite processing over $4B in annualized transaction volume.',
            skillsUsed: ['Fintech', 'Product Strategy', 'API Design']
          }
        ],
        projects: [
          {
            id: 'proj-p1',
            title: 'Sub-Second Merchant Checkout Engine',
            description: 'Redesigned the headless checkout flow resulting in +8.4% conversion uplift across 50,000+ online merchants.',
            technologies: ['React', 'Node.js', 'Redis', 'Kafka'],
            liveUrl: 'https://priyasharma.pm/checkout-case-study'
          }
        ],
        githubUrl: 'https://github.com/priyasharma-pm',
        linkedinUrl: 'https://linkedin.com/in/priyasharma-pm',
        portfolioUrl: 'https://priyasharma.pm',
        applicationsCount: 2,
        connectionsCount: 420,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prof-02',
        userId: 'usr-network-02',
        name: 'Rahul Verma',
        email: 'rahul.verma@swiggy.in',
        phone: '+91 97110 44556',
        headline: 'Staff Full Stack Architect — Distributed Systems & Microservices',
        bio: 'Hands-on architect building resilient low-latency backend engines with Go, Node.js, and TypeScript. Tech speaker and open-source enthusiast.',
        location: 'Ahmedabad, Gujarat',
        currentRole: 'Staff Full Stack Architect @ Swiggy',
        totalExperienceYears: 8,
        currentSalaryLPA: 40,
        expectedSalaryLPA: 50,
        noticePeriodDays: 15,
        skills: ['Go', 'TypeScript', 'Node.js', 'React', 'Kubernetes', 'Distributed Systems', 'Kafka', 'PostgreSQL'],
        tools: ['Docker', 'AWS', 'Grafana', 'Git'],
        languages: ['English', 'Gujarati', 'Hindi'],
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        atsScore: 96,
        contactPrivacyMask: true,
        privacySettings: {
          profileVisibility: 'public',
          showEmailToConnections: true,
          showPhoneToConnections: false,
          allowConnectionRequests: true,
          contactPrivacyMask: true
        },
        education: [
          {
            id: 'edu-r1',
            institution: 'IIT Roorkee',
            degree: 'B.Tech',
            fieldOfStudy: 'Computer Science and Engineering',
            startYear: 2014,
            endYear: 2018
          }
        ],
        experience: [
          {
            id: 'exp-r1',
            company: 'Swiggy Consumer Tech',
            position: 'Staff Architect',
            location: 'Ahmedabad (Remote / Hybrid)',
            workType: 'Hybrid',
            startDate: '2020-08-01',
            isCurrent: true,
            description: 'Designed the routing and order dispatch microservices mesh serving 2M+ daily active orders.',
            skillsUsed: ['Go', 'Kafka', 'Kubernetes', 'Redis']
          }
        ],
        projects: [
          {
            id: 'proj-r1',
            title: 'High-Throughput WebSockets Signaling Gateway',
            description: 'Ultra low-latency event broker handling 500k concurrent connections with sub-10ms pub-sub latency.',
            technologies: ['Go', 'WebSockets', 'Redis', 'Docker'],
            githubUrl: 'https://github.com/rahulverma-arch/fast-ws-gateway'
          }
        ],
        githubUrl: 'https://github.com/rahulverma-arch',
        linkedinUrl: 'https://linkedin.com/in/rahulverma-arch',
        portfolioUrl: 'https://rahulverma.dev',
        applicationsCount: 1,
        connectionsCount: 310,
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prof-03',
        userId: 'usr-network-03',
        name: 'Ananya Iyer',
        email: 'ananya.iyer@cred.club',
        phone: '+91 99330 77889',
        headline: 'Lead AI Data Scientist — Fraud Telemetry & Predictive Models',
        bio: 'Ph.D. in Machine Learning. Specializing in graph neural networks, anomaly detection, and credit fraud telemetry.',
        location: 'Mumbai, Maharashtra',
        currentRole: 'Lead AI Data Scientist @ CRED',
        totalExperienceYears: 6,
        currentSalaryLPA: 36,
        expectedSalaryLPA: 45,
        noticePeriodDays: 30,
        skills: ['Machine Learning', 'Python', 'PyTorch', 'Graph Neural Networks', 'SQL', 'MLOps', 'Feature Stores'],
        tools: ['Feast', 'MLflow', 'Databricks', 'AWS SageMaker'],
        languages: ['English', 'Tamil', 'Hindi'],
        profilePhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
        atsScore: 95,
        contactPrivacyMask: true,
        education: [
          {
            id: 'edu-a1',
            institution: 'IIT Bombay',
            degree: 'Ph.D. & M.Tech',
            fieldOfStudy: 'Computer Science & Machine Intelligence',
            startYear: 2015,
            endYear: 2020
          }
        ],
        experience: [
          {
            id: 'exp-a1',
            company: 'CRED Scaled Architecture',
            position: 'Lead AI Scientist',
            location: 'Mumbai, India',
            workType: 'Hybrid',
            startDate: '2021-06-01',
            isCurrent: true,
            description: 'Engineered real-time graph embeddings for fraud anomaly detection on credit card payments.',
            skillsUsed: ['PyTorch', 'Python', 'Databricks', 'SQL']
          }
        ],
        projects: [
          {
            id: 'proj-a1',
            title: 'Graph Anomaly Detection Benchmark',
            description: 'Open benchmark comparing GCN and GraphSAGE accuracy on financial fraud datasets.',
            technologies: ['PyTorch Geometric', 'Python', 'DGL'],
            githubUrl: 'https://github.com/ananya-iyer-ai/graph-fraud-benchmark'
          }
        ],
        githubUrl: 'https://github.com/ananya-iyer-ai',
        linkedinUrl: 'https://linkedin.com/in/ananya-iyer-ai',
        portfolioUrl: 'https://ananya-iyer.ai',
        applicationsCount: 0,
        connectionsCount: 540,
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prof-04',
        userId: 'usr-network-04',
        name: 'Vikram Patel',
        email: 'vikram.patel@zomato.com',
        phone: '+91 98450 33221',
        headline: 'Staff DevOps & Cloud Infrastructure Lead',
        bio: 'DevOps evangelist. Managing multi-region Kubernetes clusters, GitOps pipelines, and zero-downtime database migrations.',
        location: 'Pune, Maharashtra',
        currentRole: 'Staff DevOps Lead @ Zomato',
        totalExperienceYears: 8.5,
        currentSalaryLPA: 38,
        expectedSalaryLPA: 48,
        noticePeriodDays: 15,
        skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD Pipelines', 'Prometheus', 'ArgoCD', 'Linux Kernel', 'Golang'],
        tools: ['Docker', 'Helm', 'ArgoCD', 'Datadog'],
        languages: ['English', 'Marathi', 'Hindi'],
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        atsScore: 93,
        contactPrivacyMask: true,
        education: [
          {
            id: 'edu-v1',
            institution: 'COEP Technological University, Pune',
            degree: 'B.E.',
            fieldOfStudy: 'Computer Engineering',
            startYear: 2012,
            endYear: 2016
          }
        ],
        experience: [
          {
            id: 'exp-v1',
            company: 'Zomato Hyper-Scale',
            position: 'Staff DevOps Lead',
            location: 'Pune, India',
            workType: 'Remote',
            startDate: '2019-11-01',
            isCurrent: true,
            description: 'Architected automated zero-downtime deployment pipelines across 400+ microservices on AWS EKS.',
            skillsUsed: ['Kubernetes', 'Terraform', 'ArgoCD', 'AWS']
          }
        ],
        projects: [
          {
            id: 'proj-v1',
            title: 'GitOps Auto-Scaler Operator',
            description: 'Custom Kubernetes CRD operator scaling workloads based on live queue depth metrics.',
            technologies: ['Golang', 'Kubernetes Operator SDK', 'Prometheus'],
            githubUrl: 'https://github.com/vikram-patel-devops/k8s-autoscale-operator'
          }
        ],
        githubUrl: 'https://github.com/vikram-patel-devops',
        linkedinUrl: 'https://linkedin.com/in/vikram-patel-devops',
        portfolioUrl: 'https://vikrampatel.infra',
        applicationsCount: 1,
        connectionsCount: 280,
        createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prof-05',
        userId: 'usr-network-05',
        name: 'Sneha Kulkarni',
        email: 'sneha.kulkarni@flipkart.com',
        phone: '+91 99880 55443',
        headline: 'Frontend Engineering Lead — Design Systems & Performance',
        bio: 'Leading UI architecture at scale. Obsessed with micro-interactions, Web Performance, and accessibility.',
        location: 'Hyderabad, India',
        currentRole: 'Frontend Engineering Lead @ Flipkart',
        totalExperienceYears: 6.5,
        currentSalaryLPA: 30,
        expectedSalaryLPA: 38,
        noticePeriodDays: 30,
        skills: ['React', 'TypeScript', 'Next.js', 'Design Systems', 'Web Performance', 'TailwindCSS', 'GraphQL', 'Jest'],
        tools: ['Storybook', 'Figma', 'Webpack', 'Vite'],
        languages: ['English', 'Telugu', 'Hindi'],
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        atsScore: 96,
        contactPrivacyMask: true,
        education: [
          {
            id: 'edu-s1',
            institution: 'IIIT Hyderabad',
            degree: 'B.Tech',
            fieldOfStudy: 'Computer Science',
            startYear: 2014,
            endYear: 2018
          }
        ],
        experience: [
          {
            id: 'exp-s1',
            company: 'Flipkart',
            position: 'Lead Frontend Engineer',
            location: 'Hyderabad, India',
            workType: 'Hybrid',
            startDate: '2021-03-01',
            isCurrent: true,
            description: 'Designed the unified cross-platform design system component library powering 100M+ monthly shoppers.',
            skillsUsed: ['React', 'TypeScript', 'Storybook', 'TailwindCSS']
          }
        ],
        projects: [
          {
            id: 'proj-s1',
            title: 'Accessible Glassmorphic UI Kit',
            description: 'Zero-dependency accessible component library with dark-mode contrast presets and fluid typography.',
            technologies: ['TypeScript', 'TailwindCSS', 'Storybook'],
            githubUrl: 'https://github.com/sneha-kulkarni-ui/glass-ui-kit'
          }
        ],
        githubUrl: 'https://github.com/sneha-kulkarni-ui',
        linkedinUrl: 'https://linkedin.com/in/sneha-kulkarni-ui',
        portfolioUrl: 'https://snehakulkarni.design',
        applicationsCount: 3,
        connectionsCount: 490,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    this.profiles.push(defaultProfile, ...networkProfiles)

    // =========================================================================
    // 3. Connections Seed (Connected, Incoming, Sent)
    // =========================================================================
    const connectionList: Connection[] = [
      {
        id: 'conn-01',
        requesterId: 'usr-network-01',
        recipientId: userId,
        status: 'accepted', // Connected with Priya Sharma
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 13).toISOString()
      },
      {
        id: 'conn-02',
        requesterId: 'usr-network-02',
        recipientId: userId,
        status: 'pending', // Incoming Request from Rahul Verma
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
      },
      {
        id: 'conn-03',
        requesterId: userId,
        recipientId: 'usr-network-05',
        status: 'pending', // Sent Request to Sneha Kulkarni
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ]
    this.connections.push(...connectionList)

    // =========================================================================
    // 4. Verified Jobs Seed (Diverse Locations & Work Modes)
    // =========================================================================
    const jobList: Job[] = [
      {
        id: 'job-101',
        title: 'Lead Business Analyst — Core Banking & Reconciliation',
        company: 'Razorpay Financial Technologies',
        companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
        location: 'Bengaluru, India',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salaryMin: 2400000,
        salaryMax: 3200000,
        experienceMin: 5,
        experienceMax: 9,
        hiringRating: 4.9,
        hiringPeriod: 'Immediate',
        description: 'Lead business requirements, partner with payment gateway squads, and design reconciliation telemetry.',
        responsibilities: ['Author FRDs and BRDs for cross-border payment settlements', 'Conduct gap analysis on payment gateway latency', 'Coordinate with engineering and risk panels'],
        requirements: ['5+ years in Fintech / Banking domain', 'Advanced SQL & Data Analytics', 'Strong stakeholder leadership'],
        skillsRequired: ['Business Analysis', 'SQL', 'Fintech', 'Payment Gateways', 'Jira'],
        applicantsCount: 42,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'job-102',
        title: 'Senior Product Analyst — Growth Monoliths & Funnel Optimization',
        company: 'Swiggy Consumer Tech',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
        location: 'Ahmedabad, Gujarat',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salaryMin: 2200000,
        salaryMax: 2800000,
        experienceMin: 4,
        experienceMax: 7,
        hiringRating: 4.8,
        hiringPeriod: '15 Days',
        description: 'Build predictive customer lifetime value models and design experiments for rapid merchant conversions in West Region hubs.',
        responsibilities: ['A/B testing execution on checkout funnel', 'Build self-serve Tableau & Power BI metrics', 'Partner with growth product managers'],
        requirements: ['4+ years in Product Analytics / B2C', 'Expertise in SQL, Python, and Tableau', 'Demonstrated user conversion gains'],
        skillsRequired: ['Product Analytics', 'SQL', 'Python', 'A/B Testing', 'Power BI'],
        applicantsCount: 68,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
      },
      {
        id: 'job-103',
        title: 'Enterprise Analytics Specialist — Snowflake & dbt',
        company: 'CRED Scaled Architecture',
        companyLogo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=150&q=80',
        location: 'Mumbai, Maharashtra',
        workType: 'On-site',
        jobType: 'Full-time',
        salaryMin: 2600000,
        salaryMax: 3500000,
        experienceMin: 6,
        experienceMax: 10,
        hiringRating: 4.95,
        hiringPeriod: 'Immediate',
        description: 'Drive data warehouse architecture, financial reporting automation, and fraud detection algorithms.',
        responsibilities: ['Design star-schema architectures on Snowflake', 'Automate board-level KPI reporting', 'Lead business logic verification across data engineering squads'],
        requirements: ['6+ years in Enterprise Analytics / High-Scale Systems', 'Snowflake, dbt, SQL, and Python proficiency', 'Strong understanding of credit ecosystems'],
        skillsRequired: ['Snowflake', 'SQL', 'Data Warehousing', 'dbt', 'Python'],
        applicantsCount: 51,
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
      },
      {
        id: 'job-104',
        title: 'Lead Frontend Systems Architect — Design Systems',
        company: 'Zomato Tech',
        companyLogo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=150&q=80',
        location: 'Remote (Pan India)',
        workType: 'Remote',
        jobType: 'Full-time',
        salaryMin: 2800000,
        salaryMax: 4000000,
        experienceMin: 5,
        experienceMax: 9,
        hiringRating: 4.9,
        hiringPeriod: 'Immediate',
        description: 'Own web and mobile web architecture for millions of live food delivery and quick-commerce transactions.',
        responsibilities: ['Architect micro-frontend modules with sub-50ms render times', 'Lead design system governance', 'Mentor 15+ frontend engineers'],
        requirements: ['Expertise in React, TypeScript, and Web Vitals', 'Demonstrated high-scale production track record'],
        skillsRequired: ['React', 'TypeScript', 'Web Performance', 'Next.js', 'GraphQL'],
        applicantsCount: 79,
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'job-105',
        title: 'Senior DevOps & Cloud Platform Engineer',
        company: 'Paytm Payments Bank',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
        location: 'Delhi NCR, India',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salaryMin: 2500000,
        salaryMax: 3400000,
        experienceMin: 5,
        experienceMax: 8,
        hiringRating: 4.75,
        hiringPeriod: '30 Days',
        description: 'Scale multi-region Kubernetes clusters with zero-downtime deployment pipelines for payment processing.',
        responsibilities: ['Automate AWS cloud infrastructure with Terraform', 'Manage Grafana/Prometheus telemetry stacks', 'Ensure strict RBI banking compliance'],
        requirements: ['5+ years in Cloud / DevOps engineering', 'Hands-on Kubernetes, Terraform, and Linux internals'],
        skillsRequired: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD'],
        applicantsCount: 34,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'job-106',
        title: 'Principal Data Engineer — Real-Time Streaming',
        company: 'Flipkart Internet Technologies',
        companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&q=80',
        location: 'Hyderabad, India',
        workType: 'On-site',
        jobType: 'Full-time',
        salaryMin: 3200000,
        salaryMax: 4500000,
        experienceMin: 7,
        experienceMax: 12,
        hiringRating: 4.92,
        hiringPeriod: '15 Days',
        description: 'Architect low-latency Kafka and Flink streaming data pipelines for e-commerce search and dynamic pricing.',
        responsibilities: ['Design distributed data pipelines processing 100k+ events/sec', 'Partner with data science teams for real-time model inference'],
        requirements: ['7+ years in Big Data / Streaming architectures', 'Expertise in Apache Kafka, Spark, Flink, and Scala/Java'],
        skillsRequired: ['Kafka', 'Spark', 'Flink', 'Python', 'Data Engineering'],
        applicantsCount: 28,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'job-107',
        title: 'Full Stack Engineer — Fintech Products',
        company: 'Finzo Technologies',
        companyLogo: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=150&q=80',
        location: 'Pune, Maharashtra',
        workType: 'Hybrid',
        jobType: 'Full-time',
        salaryMin: 1800000,
        salaryMax: 2600000,
        experienceMin: 3,
        experienceMax: 6,
        hiringRating: 4.8,
        hiringPeriod: 'Immediate',
        description: 'Build merchant-facing portals, payment checkout integrations, and automated invoice discounting engines.',
        responsibilities: ['Develop responsive React applications and robust Node.js backend services', 'Write unit and integration tests'],
        requirements: ['3+ years in Full Stack development with React, Node.js, and PostgreSQL'],
        skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs'],
        applicantsCount: 62,
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'job-108',
        title: 'AI Prompt Engineer & Agentic Systems Developer',
        company: 'DeepLogic AI Labs',
        companyLogo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=150&q=80',
        location: 'Remote (Worldwide / India)',
        workType: 'Remote',
        jobType: 'Full-time',
        salaryMin: 3000000,
        salaryMax: 4800000,
        experienceMin: 3,
        experienceMax: 7,
        hiringRating: 4.95,
        hiringPeriod: 'Immediate',
        description: 'Design agentic workflows, autonomous tool execution engines, and RAG pipelines on Gemini and Claude.',
        responsibilities: ['Author and fine-tune system prompts for autonomous agent loops', 'Implement evaluation benchmarks for AI output quality'],
        requirements: ['Demonstrated experience building production LLM agents, LangChain, or direct API integration'],
        skillsRequired: ['Python', 'LLM Agents', 'LangChain', 'Prompt Engineering', 'Vector Databases'],
        applicantsCount: 94,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
    this.jobs.push(...jobList)

    // =========================================================================
    // 5. Applications (11-Stage Pipeline)
    // =========================================================================
    const appList: Application[] = [
      {
        id: 'app-01',
        jobId: 'job-101',
        candidateId: userId,
        jobTitle: 'Lead Business Analyst — Core Banking & Reconciliation',
        company: 'Razorpay Financial Technologies',
        currentStage: 'Interview Scheduled',
        appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        slaExpiresAt: new Date(Date.now() + 86400000 * 1).toISOString(),
        interviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        recruiterNotes: 'Candidate passed AI Voice Screening with 94% score. Technical panel scheduled.',
        stageHistory: [
          { stage: 'Application Submitted', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { stage: 'Resume Screening', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: 'ATS match verified: 92/100' },
          { stage: 'AI Screening', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), note: 'AI screening passed' },
          { stage: 'Shortlisted', timestamp: new Date(Date.now() - 43200000).toISOString(), note: 'Hiring manager approved' },
          { stage: 'Interview Scheduled', timestamp: new Date().toISOString(), note: 'Meeting invite sent' }
        ]
      },
      {
        id: 'app-02',
        jobId: 'job-102',
        candidateId: userId,
        jobTitle: 'Senior Product Analyst — Growth Monoliths & Funnel Optimization',
        company: 'Swiggy Consumer Tech',
        currentStage: 'Under Review',
        appliedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
        slaExpiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        recruiterNotes: 'Technical case study review completed by lead data scientist.',
        stageHistory: [
          { stage: 'Application Submitted', timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
          { stage: 'Resume Screening', timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
          { stage: 'AI Screening', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
          { stage: 'Shortlisted', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { stage: 'Interview Scheduled', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
          { stage: 'Interview Completed', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
          { stage: 'Under Review', timestamp: new Date().toISOString() }
        ]
      }
    ]
    this.applications.push(...appList)

    // =========================================================================
    // 6. Meetings & Recordings
    // =========================================================================
    const meetingList: Meeting[] = [
      {
        id: 'meet-01',
        code: 'RZP774',
        title: 'Lead BA Round 1 Technical Architecture Sync',
        meetingType: 'interview',
        hostId: 'recruiter-rzp-01',
        hostName: 'Neha Sharma (Razorpay Panel)',
        scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        durationSeconds: 2700,
        isLive: false,
        transcripts: [
          { speaker: 'Neha Sharma', text: 'Hello Avinash, thank you for joining. Today we want to examine how you design reconciliation telemetry.', timestamp: '00:15' },
          { speaker: 'Avinash Tiwari', text: 'Thank you Neha. In my previous role, we engineered a star-schema warehouse with automated delta verification.', timestamp: '00:45' }
        ],
        notes: [
          { timestamp: '01:10', note: 'Strong explanation of star-schema and ETL latency reduction.' }
        ],
        summary: 'Candidate demonstrated deep understanding of payment gateway architectures and reconciliation telemetry.',
        createdAt: new Date().toISOString()
      }
    ]
    this.meetings.push(...meetingList)

    // =========================================================================
    // 7. Community Posts (with Bookmarked & Author Posts)
    // =========================================================================
    const postList: Post[] = [
      {
        id: 'post-01',
        authorId: userId,
        authorName: 'Avinash Tiwari',
        authorRole: 'Lead Business Analyst',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        authorType: 'candidate',
        category: 'Case Study',
        title: 'Architecting a Real-Time Reconciliation Engine for Payment Gateways',
        description: 'Here is how we reduced end-of-day payment reconciliation time from 4 hours to under 6 minutes across ₹800 Cr monthly GMV using star-schema architectures on Snowflake and dbt.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        links: [
          { title: 'GitHub Repository', url: 'https://github.com/AvinashTiwari900/payment-recon-engine', iconType: 'github' },
          { title: 'Live Architecture Diagram', url: 'https://avinash-tiwari.dev/projects/payment-recon', iconType: 'portfolio' }
        ],
        tags: ['#SQL', '#Snowflake', '#Fintech', '#DataEngineering', '#BusinessAnalysis'],
        likes: 42,
        likedByUserIds: [userId, 'usr-network-01', 'usr-network-02'],
        savedByUserIds: [userId, 'usr-network-01'], // Bookmarked
        comments: [
          {
            id: 'c-01',
            authorId: 'usr-network-02',
            authorName: 'Rahul Verma',
            authorRole: 'Staff Full Stack Architect @ Swiggy',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
            content: 'Impressive breakdown! How did you handle idempotency during payment gateway retry storms?',
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 'c-02',
            authorId: userId,
            authorName: 'Avinash Tiwari',
            authorRole: 'Lead Business Analyst',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            content: 'Great question Rahul! We implemented unique idempotency keys with distributed Redis locks before staging to Snowflake delta tables.',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: 'post-02',
        authorId: 'usr-network-01',
        authorName: 'Priya Sharma',
        authorRole: 'Senior Product Manager @ Razorpay',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        authorType: 'candidate',
        category: 'Interview Experience',
        title: 'Mastering Product Metrics & Root-Cause Trade-offs in Senior PM Rounds',
        description: 'Here are the exact frameworks I use to break down ambiguous business metrics, prioritize roadmap trade-offs, and ace technical system design rounds.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        links: [
          { title: 'Product Frameworks Doc', url: 'https://priyasharma.pm/frameworks', iconType: 'link' }
        ],
        tags: ['#ProductManagement', '#InterviewPrep', '#Fintech', '#CareerGrowth'],
        likes: 96,
        likedByUserIds: [userId],
        savedByUserIds: [userId], // Bookmarked
        comments: [],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'post-03',
        authorId: 'usr-network-02',
        authorName: 'Rahul Verma',
        authorRole: 'Staff Full Stack Architect @ Swiggy',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        authorType: 'candidate',
        category: 'Technical Article',
        title: 'Scaling Go WebSockets Gateway to 500,000 Concurrent Connections',
        description: 'Deep dive into epoll, zero-copy buffers, and memory tuning to handle peak flash-sale loads in Ahmedabad and Bengaluru delivery grids.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        links: [
          { title: 'Open Source Repo', url: 'https://github.com/rahulverma-arch/fast-ws-gateway', iconType: 'github' }
        ],
        tags: ['#Golang', '#DistributedSystems', '#WebSockets', '#HighScale'],
        likes: 128,
        likedByUserIds: [userId, 'usr-network-03'],
        savedByUserIds: [userId], // Bookmarked
        comments: [],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'post-04',
        authorId: 'comp-rzp-01',
        authorName: 'Razorpay Talent Operations',
        authorRole: 'Verified Hiring Partner',
        authorType: 'company',
        companyRating: 4.9,
        category: 'Hiring Announcement',
        title: 'Hiring 5x Lead Business Analysts & Analytics Engineers (Immediate / 15-Day SLA)',
        description: 'Razorpay Core Banking squad is expanding! We are hiring Lead BAs with strong SQL, Fintech, and payment reconciliation experience across Bengaluru & Ahmedabad. Guaranteed 24-hour recruiter response SLA.',
        links: [
          { title: 'View Verified Opening', url: '/jobs/job-101', iconType: 'job' }
        ],
        tags: ['#Hiring', '#Fintech', '#Razorpay', '#BusinessAnalyst', '#Bengaluru', '#Ahmedabad'],
        likes: 84,
        likedByUserIds: [],
        savedByUserIds: [userId], // Bookmarked
        comments: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]
    this.posts.push(...postList)

    // =========================================================================
    // 8. Documents & KYC Seed
    // =========================================================================
    const docList: KYCDocument[] = [
      {
        id: 'doc-01',
        candidateId: userId,
        documentType: 'Aadhaar Card',
        documentNumberMasked: 'XXXX-XXXX-4829',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample_aadhaar.pdf',
        verifiedStatus: 'Verified',
        otpVerified: true,
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: 'doc-02',
        candidateId: userId,
        documentType: 'PAN Card',
        documentNumberMasked: 'ABCDE****F',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample_pan.pdf',
        verifiedStatus: 'Verified',
        otpVerified: true,
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString()
      }
    ]
    this.documents.push(...docList)
  }
}

export const db = new Database()

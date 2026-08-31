import { jobs } from './jobs'

export function seedData(force = false) {
  if (force || !localStorage.getItem('rap_jobs')) {
    localStorage.setItem('rap_jobs', JSON.stringify(jobs))
  }

  if (force || !localStorage.getItem('rap_profile')) {
    const profile = {
      id: 'candidate-1',
      name: 'Avinash Tiwari',
      email: 'avinashtiwari@gmail.com',
      phone: '+91 98765 43210',
      headline: 'Lead Business Analyst & Product Strategist',
      location: 'Bengaluru, India',
      preferredLocations: ['Bengaluru', 'Hyderabad', 'Pune', 'Remote'],
      preferredRoles: ['Lead Business Analyst', 'Senior Business Analyst', 'Product Data Analyst'],
      noticePeriod: '30 days (15-day buyout feasible)',
      experienceYears: 5,
      currentCtc: '₹20 LPA',
      targetSalary: '₹24 - 28 LPA',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Results-driven Business Analyst with 5+ years of experience transforming complex business problems into high-impact digital and data products. Skilled in SQL, Power BI, Python, Agile workflows, and executive stakeholder alignment.',
      skills: [
        'SQL',
        'Power BI',
        'Business Analysis',
        'Python',
        'Excel',
        'Agile / Scrum',
        'Tableau',
        'Stakeholder Management',
        'Snowflake',
        'Data Modeling',
        'Jira'
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Technology (B.Tech) in Computer Science & Engineering',
          institution: 'National Institute of Technology (NIT)',
          year: '2017 - 2021',
          score: '8.8 / 10 CGPA'
        }
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)',
          issuer: 'Microsoft',
          year: 2024
        },
        {
          id: 'cert-2',
          name: 'Certified Business Analysis Professional (CBAP)',
          issuer: 'IIBA',
          year: 2023
        }
      ],
      domain: 'mrig.tech',
      portfolioUrl: 'https://mrig.tech',
      socials: {
        github: 'https://github.com/AvinashTiwari900',
        linkedin: 'https://www.linkedin.com/in/avinashtiwari626/',
        portfolioUrl: 'https://mrig.tech',
        domain: 'mrig.tech',
        email: 'avinashtiwari@gmail.com'
      },
      privacy: {
        maskContactInfo: true, // Hide contact info from company & panel members to prevent direct unsolicited contact
        allowInPlatformMessaging: true,
        sharePortfolioWithPanels: true
      },
      resumes: [
        {
          id: 'res-1',
          name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
          size: 245000,
          uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          isPrimary: true,
          atsScore: 94,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Tiwari_Lead_BA_2026.pdf'
        },
        {
          id: 'res-2',
          name: 'Avinash_Product_Analyst_Resume.pdf',
          size: 210000,
          uploadedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
          isPrimary: false,
          atsScore: 88,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_resumes/Avinash_Product_Analyst_Resume.pdf'
        }
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Enterprise Revenue Analytics Engine',
          role: 'Lead Business Analyst',
          duration: '6 months',
          description: 'Designed unified BI reporting dashboards automating revenue forecasting across 12 product lines, cutting manual report generation time by 75%.',
          responsibilities: 'Authored functional requirements (FRD), architected dimensional star-schema data models, and built executive KPI dashboards.',
          outcomes: 'Reduced reporting latency from 4 days to 2 hours; prevented ~₹18 Lakhs in inventory allocation errors.',
          technologies: ['Power BI', 'SQL', 'Snowflake', 'Python', 'DAX'],
          link: 'https://avinash-tiwari.dev/demo-bi',
          githubUrl: 'https://github.com/AvinashTiwari900/revenue-analytics',
          createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'proj-2',
          name: 'Customer Churn Predictor & Retention Portal',
          role: 'Product Data Analyst',
          duration: '4 months',
          description: 'Built machine learning model integration predicting customer churn with 89% precision, triggering proactive automated retention campaigns.',
          responsibilities: 'Conducted exploratory cohort data analysis, engineered behavioral features in Python, and integrated predictions into CRM.',
          outcomes: 'Decreased quarterly user churn rate by 4.2%; generated estimated ₹32 Lakhs retained ARR.',
          technologies: ['Python', 'SQL', 'Scikit-Learn', 'Tableau', 'FastAPI'],
          link: 'https://avinash-tiwari.dev/churn-portal',
          githubUrl: 'https://github.com/AvinashTiwari900/customer-churn-predictor',
          createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
        }
      ],
      applications: [
        {
          id: 'app-1',
          jobId: 'job-1',
          jobTitle: 'Senior Business Analyst',
          company: 'Northstar Analytics',
          companyRating: 4.9,
          hiringPeriod: 'Immediate (0-15 Days)',
          location: 'Hyderabad',
          workMode: 'Hybrid',
          salary: '₹20-26 LPA',
          appliedDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          status: 'Interview Scheduled',
          matchScore: 94,
          interviewDate: 'Thursday, 3:00 PM IST (45 mins)'
        },
        {
          id: 'app-2',
          jobId: 'job-3',
          jobTitle: 'Product Data Analyst',
          company: 'Lattice Labs',
          companyRating: 4.7,
          hiringPeriod: 'Active · Next 15 Days',
          location: 'Bengaluru',
          workMode: 'Remote',
          salary: '₹22-28 LPA',
          appliedDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
          status: 'AI Screening',
          matchScore: 91
        },
        {
          id: 'app-3',
          jobId: 'job-2',
          jobTitle: 'Lead Business Analyst',
          company: 'Astra Digital',
          companyRating: 4.8,
          hiringPeriod: '30 Days Notice Accepted',
          location: 'Pune',
          workMode: 'Onsite',
          salary: '₹24-30 LPA',
          appliedDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
          status: 'Shortlisted',
          matchScore: 92
        },
        {
          id: 'app-4',
          jobId: 'job-5',
          jobTitle: 'BI & Analytics Specialist',
          company: 'Zenith Solutions',
          companyRating: 4.8,
          hiringPeriod: 'Urgent Joining (7 Days)',
          location: 'Mumbai',
          workMode: 'Hybrid',
          salary: '₹22-26 LPA',
          appliedDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
          status: 'Application Submitted',
          matchScore: 89,
          autoApplied: true
        },
        {
          id: 'app-5',
          jobId: 'job-7',
          jobTitle: 'Analytics Project Manager',
          company: 'DataVista Systems',
          companyRating: 4.9,
          hiringPeriod: 'Immediate (0-15 Days)',
          location: 'Bengaluru',
          workMode: 'Hybrid',
          salary: '₹26-32 LPA',
          appliedDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          status: 'Interview Completed',
          matchScore: 95
        },
        {
          id: 'app-6',
          jobId: 'job-9',
          jobTitle: 'Senior Data Analyst',
          company: 'AlgoEdge AI',
          companyRating: 4.9,
          hiringPeriod: 'Active · Next 15 Days',
          location: 'Gurugram',
          workMode: 'Remote',
          salary: '₹20-25 LPA',
          appliedDate: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
          status: 'Under Review',
          matchScore: 87
        },
        {
          id: 'app-7',
          jobId: 'job-4',
          jobTitle: 'Full Stack Software Engineer',
          company: 'ByteCraft Technologies',
          companyRating: 4.6,
          hiringPeriod: 'Cohort Joining (Q3)',
          location: 'Noida',
          workMode: 'Hybrid',
          salary: '₹18-24 LPA',
          appliedDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
          status: 'Resume Screening',
          matchScore: 78
        },
        {
          id: 'app-8',
          jobId: 'job-8',
          jobTitle: 'Principal Data Strategist',
          company: 'InnoWorks Global',
          companyRating: 4.6,
          hiringPeriod: '30 Days Notice Accepted',
          location: 'Chennai',
          workMode: 'Onsite',
          salary: '₹28-35 LPA',
          appliedDate: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
          status: 'Selected',
          matchScore: 96
        }
      ],
      savedJobs: ['job-5', 'job-7', 'job-9'],
      settings: {
        autoApply: true,
        minMatchScore: 80,
        emailAlerts: true,
        whatsappAlerts: true,
        maskContactInfo: true,
        interviewReminders: true,
        theme: 'light'
      },
      documents: [
        {
          id: 'doc-1',
          name: 'Govt_ID_Aadhaar_Card.pdf',
          type: 'Aadhaar Card (Govt ID)',
          uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          status: 'Verified',
          aiConfidence: 99,
          otpVerified: true,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_kyc_docs/Aadhaar_Card_Verified.pdf'
        },
        {
          id: 'doc-2',
          name: 'PAN_Card_Identity_Proof.pdf',
          type: 'PAN Card (Tax ID)',
          uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          status: 'Verified',
          aiConfidence: 98,
          otpVerified: true,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_kyc_docs/PAN_Card_Verified.pdf'
        },
        {
          id: 'doc-3',
          name: 'BTech_NIT_Degree_Certificate.pdf',
          type: 'Degree Certificate (Education)',
          uploadedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
          status: 'Verified',
          aiConfidence: 96,
          otpVerified: true,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_kyc_docs/Degree_Certificate.pdf'
        },
        {
          id: 'doc-4',
          name: 'Previous_Company_Relieving_Letter.pdf',
          type: 'Previous Relieving Letter (Experience)',
          uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          status: 'Pending OTP',
          aiConfidence: 92,
          otpVerified: false,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_kyc_docs/Relieving_Letter_Draft.pdf'
        },
        {
          id: 'doc-5',
          name: 'Recent_Salary_Slips_3_Months.pdf',
          type: 'Recent Salary Slips (Last 3 Months)',
          uploadedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          status: 'Under Review',
          aiConfidence: 95,
          otpVerified: true,
          cloudinaryUrl: 'https://res.cloudinary.com/je6whpaq/image/upload/v1724600000/rap_kyc_docs/Salary_Slips_Q2.pdf'
        }
      ],
      notifications: [
        {
          id: 'n-1',
          title: 'Technical Round Scheduled! 🎉',
          message: 'Northstar Analytics has scheduled your Technical Interview for Senior Business Analyst on Thursday, 3:00 PM.',
          read: false,
          type: 'interview',
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
        },
        {
          id: 'n-2',
          title: 'AI Screening Completed',
          message: 'Your AI preliminary assessment with Lattice Labs was scored 92%. Moving to next round!',
          read: false,
          type: 'success',
          createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
        },
        {
          id: 'n-3',
          title: '⚡ Auto-Apply Trigger Notification',
          message: 'Auto-applied to Zenith Solutions for BI & Analytics Specialist (89% match). Email & WhatsApp confirmation dispatched.',
          read: false,
          type: 'application',
          createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
        },
        {
          id: 'n-4',
          title: 'New High-Match Job (95%)',
          message: 'DataVista Systems posted "Analytics Project Manager" with 4.9 ★ Hiring Rating.',
          read: true,
          type: 'job',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        }
      ]
    }
    localStorage.setItem('rap_profile', JSON.stringify(profile))
    localStorage.setItem('rap_notifications', JSON.stringify(profile.notifications))
  }

  if (force || !localStorage.getItem('rap_portfolio')) {
    const portfolio = {
      name: 'Avinash Tiwari',
      headline: 'Lead Business Analyst & Product Strategist',
      location: 'Bengaluru, India',
      experienceYears: 5,
      intro: 'Passionate Business Analyst bridging data engineering and strategic decision-making.',
      about: 'With 5+ years of experience across fintech, analytics consulting, and e-commerce platforms, I specialize in crafting automated data pipelines, interactive dashboards, and executive insights.',
      skills: ['SQL', 'Power BI', 'Python', 'Excel', 'Agile / Scrum', 'Stakeholder Management', 'Snowflake', 'Tableau', 'Data Governance'],
      featuredProjects: [
        {
          id: 'proj-1',
          name: 'Enterprise Revenue Analytics Engine',
          description: 'Designed unified BI reporting dashboards automating revenue forecasting across 12 product lines, cutting report generation time by 75%.',
          technologies: ['Power BI', 'SQL', 'Snowflake', 'Python']
        },
        {
          id: 'proj-2',
          name: 'Customer Churn Predictor & Retention Portal',
          description: 'Built machine learning model integration predicting customer churn with 89% precision, triggering proactive retention campaigns.',
          technologies: ['Python', 'SQL', 'Scikit-Learn', 'Tableau']
        }
      ],
      socials: {
        linkedin: 'https://www.linkedin.com/in/avinashtiwari626/',
        github: 'https://github.com/AvinashTiwari900',
        portfolioUrl: 'https://avinash-tiwari.dev',
        email: 'avinashtiwari@gmail.com'
      }
    }
    localStorage.setItem('rap_portfolio', JSON.stringify(portfolio))
  }
}

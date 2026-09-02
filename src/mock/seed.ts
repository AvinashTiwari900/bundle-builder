import { jobs } from './jobs'

export function seedData(force = false) {
  if (force || !localStorage.getItem('ras_jobs')) {
    localStorage.setItem('ras_jobs', JSON.stringify(jobs))
  }

  if (force || !localStorage.getItem('ras_profile')) {
    const profile = {
      id: 'candidate-1',
      name: 'Avinash Tiwari',
      email: 'avinashtiwari@gmail.com',
      phone: '+91 98765 43210',
      headline: 'Lead Business Analyst & Product Strategist',
      location: 'Bengaluru, India',
      experienceYears: 5,
      targetSalary: '₹22 - 28 LPA',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Results-driven Business Analyst with 5+ years of experience transforming complex business problems into high-impact digital and data products. Skilled in SQL, Power BI, Python, Agile workflows, and stakeholder alignment.',
      skills: ['SQL', 'Power BI', 'Business Analysis', 'Python', 'Excel', 'Agile / Scrum', 'Tableau', 'Stakeholder Management', 'Data Modeling'],
      socials: {
        github: 'https://github.com/AvinashTiwari900',
        linkedin: 'https://www.linkedin.com/in/avinashtiwari626/',
        portfolioUrl: 'https://avinash-tiwari.dev'
      },
      resumes: [
        {
          id: 'res-1',
          name: 'Avinash_Tiwari_Lead_BA_2026.pdf',
          size: 245000,
          uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          isPrimary: true,
          atsScore: 94
        },
        {
          id: 'res-2',
          name: 'Avinash_Product_Analyst_Resume.pdf',
          size: 210000,
          uploadedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
          isPrimary: false,
          atsScore: 88
        }
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'Enterprise Revenue Analytics Engine',
          description: 'Designed unified BI reporting dashboards automating revenue forecasting across 12 product lines, cutting report generation time by 75%.',
          technologies: ['Power BI', 'SQL', 'Snowflake', 'Python'],
          link: 'https://github.com/AvinashTiwari900',
          createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'proj-2',
          name: 'Customer Churn Predictor & Retention Portal',
          description: 'Built machine learning model integration predicting customer churn with 89% precision, triggering proactive retention campaigns.',
          technologies: ['Python', 'SQL', 'Scikit-Learn', 'Tableau'],
          link: 'https://github.com/AvinashTiwari900',
          createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
        }
      ],
      applications: [
        {
          id: 'app-1',
          jobId: 'job-1',
          jobTitle: 'Senior Business Analyst',
          company: 'Northstar Analytics',
          location: 'Hyderabad',
          workMode: 'Hybrid',
          salary: '₹20-26 LPA',
          appliedDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          status: 'Interview Scheduled',
          matchScore: 94,
          interviewDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'app-2',
          jobId: 'job-3',
          jobTitle: 'Product Analyst',
          company: 'Lattice Labs',
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
          jobTitle: 'Data Analyst & BI Lead',
          company: 'Astra Digital',
          location: 'Pune',
          workMode: 'Onsite',
          salary: '₹18-24 LPA',
          appliedDate: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
          status: 'Shortlisted',
          matchScore: 88
        },
        {
          id: 'app-4',
          jobId: 'job-4',
          jobTitle: 'Senior Data Strategist',
          company: 'Zenith Solutions',
          location: 'Mumbai',
          workMode: 'Hybrid',
          salary: '₹24-30 LPA',
          appliedDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          status: 'Applied',
          matchScore: 85
        }
      ],
      savedJobs: ['job-5', 'job-7'],
      settings: {
        autoApply: true,
        minMatchScore: 80,
        emailAlerts: true,
        interviewReminders: true,
        theme: 'light'
      },
      documents: [
        {
          id: 'doc-1',
          name: 'Govt_ID_Aadhaar_Card.pdf',
          type: 'Government ID',
          uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          status: 'Verified'
        },
        {
          id: 'doc-2',
          name: 'BTech_Degree_Certificate.pdf',
          type: 'Education Certificate',
          uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          status: 'Verified'
        },
        {
          id: 'doc-3',
          name: 'Previous_Employment_Relieving_Letter.pdf',
          type: 'Experience Proof',
          uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
          status: 'Pending'
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
          title: 'New High-Match Job (95%)',
          message: 'ByteCraft posted "Lead Business Analyst" matching 9 of your primary skills.',
          read: true,
          type: 'job',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        }
      ]
    }
    localStorage.setItem('ras_profile', JSON.stringify(profile))
    localStorage.setItem('ras_notifications', JSON.stringify(profile.notifications))
  }

  if (force || !localStorage.getItem('ras_portfolio')) {
    const portfolio = {
      intro: 'Passionate Business Analyst bridging data engineering and strategic decision-making.',
      about: 'With 5+ years of experience across fintech, analytics consulting, and e-commerce platforms, I specialize in crafting automated data pipelines, interactive dashboards, and executive insights.',
      skills: ['SQL', 'Power BI', 'Python', 'Excel', 'Agile', 'Stakeholder Management', 'ETL', 'Tableau'],
      featuredProjects: ['proj-1', 'proj-2'],
      socials: {
        linkedin: 'https://www.linkedin.com/in/avinashtiwari626/',
        github: 'https://github.com/AvinashTiwari900',
        portfolioUrl: 'https://avinash-tiwari.dev'
      }
    }
    localStorage.setItem('ras_portfolio', JSON.stringify(portfolio))
  }
}

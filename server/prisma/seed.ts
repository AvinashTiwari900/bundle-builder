// One-time seed: creates a placeholder recruiter account and 50 mock job
// postings owned by it, so `jobs.ownerId` is a real, dereferenceable
// recruiter uid consistent with the schema/rules - not a magic string.
// Safe to re-run: fixed job ids mean this upserts rather than duplicating.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SEED_RECRUITER_EMAIL = 'seed-recruiter@ras.internal'

const companies = [
  { name: 'Northstar Analytics', id: 'northstar' },
  { name: 'Astra Digital', id: 'astra' },
  { name: 'Lattice Labs', id: 'lattice' },
  { name: 'ByteCraft', id: 'bytecraft' },
  { name: 'Zenith Solutions', id: 'zenith' },
  { name: 'Navya Tech', id: 'navya' },
  { name: 'DataVista', id: 'datavista' },
  { name: 'InnoWorks', id: 'innoworks' },
  { name: 'AlgoEdge', id: 'algoedge' },
  { name: 'Prodigy Labs', id: 'prodigy' }
]
const locations = ['Ahmedabad', 'Bhopal', 'Indore', 'Pune', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Noida', 'Lucknow']
const roles = [
  'Business Analyst',
  'Junior Business Analyst',
  'Data Analyst',
  'ML Engineer',
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Product Analyst',
  'Project Coordinator',
  'AI Engineer'
]
const skillsPool = ['SQL', 'Python', 'Power BI', 'Excel', 'Communication', 'Stakeholder Management', 'Machine Learning', 'React', 'Node.js', 'Django', 'Tableau']

function random(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}
function pick<T>(arr: T[]): T {
  return arr[random(0, arr.length - 1)]
}

async function main() {
  let recruiter = await prisma.user.findUnique({ where: { email: SEED_RECRUITER_EMAIL } })
  if (!recruiter) {
    const passwordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10)
    recruiter = await prisma.user.create({
      data: { email: SEED_RECRUITER_EMAIL, passwordHash, role: 'recruiter' }
    })
    console.log(`Created seed recruiter: ${recruiter.id}`)
  }

  for (let i = 1; i <= 50; i++) {
    const id = `job-${i}`
    const company = pick(companies)
    const title = pick(roles)
    const exp = `${random(1, 8)} yrs`
    const loc = pick(locations)
    const salaryMin = random(3, 12) * 100000
    const salaryMax = salaryMin + random(2, 10) * 100000
    const skills = Array.from(new Set([pick(skillsPool), pick(skillsPool), pick(skillsPool)])).slice(0, 6)

    await prisma.job.upsert({
      where: { id },
      create: {
        id,
        title,
        company: company.name,
        location: loc,
        workMode: pick(['Remote', 'Hybrid', 'Onsite']),
        employmentType: pick(['Full-time', 'Contract', 'Internship']),
        experience: exp,
        salaryMin,
        salaryMax,
        skills,
        description: `${title} role at ${company.name} in ${loc}. Contribute to product and analytics.`,
        responsibilities: ['Analyze data', 'Work with stakeholders', 'Deliver reports'],
        requirements: ['Bachelor degree', '2+ years experience'],
        postedDate: new Date(Date.now() - random(0, 30) * 24 * 3600 * 1000),
        industry: 'Technology',
        ownerId: recruiter.id,
        status: 'open'
      },
      update: {}
    })
  }

  console.log('Seeded 50 jobs.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

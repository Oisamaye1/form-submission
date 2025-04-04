interface Submission {
  id: number
  name: string
  email: string
  phone: string
  documents: string[]
  images: string[]
  createdAt: Date
}

let submissions: Submission[] = []
let nextId = 1

export function addSubmission(data: Omit<Submission, 'id' | 'createdAt'>) {
  const submission = {
    id: nextId++,
    ...data,
    createdAt: new Date()
  }
  submissions.push(submission)
  return submission
}

export function getSubmissions() {
  return submissions.map(sub => ({
    ...sub,
    createdAt: sub.createdAt.toISOString()
  }))
}

import type { InterviewResponse } from '../../types/application'

interface InterviewListProps {
  interviews: InterviewResponse[]
}

export function InterviewList({ interviews }: InterviewListProps) {
  if (interviews.length === 0) return <p>No interviews scheduled yet.</p>

  return (
    <ul>
      {interviews.map((interview) => (
        <li key={interview.interviewDate}>
          {new Date(interview.interviewDate).toLocaleString()}
          {interview.roundType ? ` — ${interview.roundType}` : ''}
          {interview.notes ? ` (${interview.notes})` : ''}
        </li>
      ))}
    </ul>
  )
}

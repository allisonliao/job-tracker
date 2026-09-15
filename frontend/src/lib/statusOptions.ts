// Frontend-only convention layered on top of the backend's free-text `currentStatus`
// field — doesn't restrict what a user can type, just drives datalist suggestions and
// the "active vs terminal" split used for dashboard summaries.
export const TERMINAL_STATUSES = ['Rejected', 'Withdrawn', 'Offer Accepted', 'Offer Declined'] as const

export const COMMON_STATUSES = [
  'Applied',
  'Phone Screen',
  'Interviewing',
  'Onsite',
  'Offer',
  ...TERMINAL_STATUSES,
] as const

export function isTerminalStatus(status: string): boolean {
  return (TERMINAL_STATUSES as readonly string[]).includes(status)
}

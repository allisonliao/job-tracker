import { createContact } from '../../api/contacts'
import { createJobPosting } from '../../api/jobPostings'
import { useContacts } from '../../hooks/useContacts'
import { useJobPostings } from '../../hooks/useJobPostings'
import { ErrorMessage } from '../common/ErrorMessage'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { ContactForm } from './ContactForm'
import { JobPostingForm } from './JobPostingForm'

interface CompanyDetailSectionProps {
  companyId: string
}

export function CompanyDetailSection({ companyId }: CompanyDetailSectionProps) {
  const jobPostings = useJobPostings(companyId)
  const contacts = useContacts(companyId)

  return (
    <div className="company-detail">
      <section>
        <h3>Job postings</h3>
        {jobPostings.loading && <LoadingSpinner />}
        {jobPostings.error && <ErrorMessage message={jobPostings.error} />}
        {jobPostings.data && jobPostings.data.length === 0 && <p>No job postings yet.</p>}
        {jobPostings.data && jobPostings.data.length > 0 && (
          <ul>
            {jobPostings.data.map((job) => (
              <li key={job.jobId}>
                {job.title}
                {job.location ? ` — ${job.location}` : ''}
              </li>
            ))}
          </ul>
        )}
        <JobPostingForm
          onSubmit={async (request) => {
            await createJobPosting(companyId, request)
            jobPostings.refetch()
          }}
        />
      </section>

      <section>
        <h3>Contacts</h3>
        {contacts.loading && <LoadingSpinner />}
        {contacts.error && <ErrorMessage message={contacts.error} />}
        {contacts.data && contacts.data.length === 0 && <p>No contacts yet.</p>}
        {contacts.data && contacts.data.length > 0 && (
          <ul>
            {contacts.data.map((contact) => (
              <li key={contact.contactId}>
                {contact.name}
                {contact.role ? ` — ${contact.role}` : ''}
              </li>
            ))}
          </ul>
        )}
        <ContactForm
          onSubmit={async (request) => {
            await createContact(companyId, request)
            contacts.refetch()
          }}
        />
      </section>
    </div>
  )
}

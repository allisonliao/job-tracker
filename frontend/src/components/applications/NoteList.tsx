import type { NoteResponse } from '../../types/application'

interface NoteListProps {
  notes: NoteResponse[]
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) return <p>No notes yet.</p>

  return (
    <ul>
      {notes.map((note) => (
        <li key={note.createdAt}>
          {new Date(note.createdAt).toLocaleString()}: {note.text}
        </li>
      ))}
    </ul>
  )
}

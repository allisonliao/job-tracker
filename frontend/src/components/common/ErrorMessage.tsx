interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p role="alert" className="error-message">
      {message}
    </p>
  )
}

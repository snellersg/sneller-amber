'use client'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-4 text-foreground">Something Went Wrong</h1>
      <p className="mb-8 text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  )
}

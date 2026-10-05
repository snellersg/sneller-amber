import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-4 text-foreground">Page Not Found</h1>
      <p className="mb-8 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="inline-flex rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
      >
        Back to AMBER
      </Link>
    </div>
  )
}

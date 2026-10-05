import Image from 'next/image'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo192.png" alt="Sneller logo" width={32} height={32} priority />
          <span className="font-heading text-xl font-bold text-foreground">AMBER</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}

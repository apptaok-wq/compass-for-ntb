import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, Menu } from 'lucide-react'
import { NtbMark } from '@/components/NtbMark'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export function Header() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    navigate({ to: '/' })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 text-foreground">
          <NtbMark className="h-8 w-8" />
          <span className="font-display text-base font-semibold">NTB-PIS</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-4 sm:flex">
          {loading ? (
            <div className="h-10 w-24 rounded bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground">{user.email}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="sm:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-foreground" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-6 py-4 sm:hidden">
          {loading ? (
            <div className="h-10 w-full rounded bg-muted animate-pulse" />
          ) : user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-foreground">{user.email}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="w-full">
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
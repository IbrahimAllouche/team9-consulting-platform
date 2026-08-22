'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Menu, User, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Shared navigation for the protected game pages.
 *
 * The title uses the middle column of a three-column grid so it remains
 * properly centred even though the menu and sign-out buttons have different
 * widths.
 */
export default function LandingHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      await signOut()

      router.replace('/auth/signin')
      router.refresh()
    } finally {
      setIsSigningOut(false)
    }
  }

  const navigationItems = [
    {
      label: 'Landing Page',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
  ] as const

  return (
    <>
      {/*
       * The wooden header follows the same warm, outlined cartoon style as
       * the elevator and authentication pages.
       */}
      <header className="border-charcoal bg-honey-wood relative z-40 grid min-h-24 grid-cols-[1fr_auto_1fr] items-center border-[5px] px-4 shadow-[0_5px_0_var(--wood-shadow)] sm:px-7">
        {/* Hamburger button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => {
              setMenuIsOpen((currentValue) => !currentValue)
            }}
            className="border-charcoal bg-warm-cream text-charcoal hover:bg-cloud-white flex h-12 w-12 items-center justify-center rounded-xl border-[3px] shadow-[3px_3px_0_var(--charcoal)] transition"
            aria-label={menuIsOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuIsOpen}
            aria-controls="game-navigation"
          >
            {menuIsOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {/* True centred project title */}
        <Link
          href="/dashboard"
          className="text-charcoal text-center text-[clamp(1.1rem,3vw,2rem)] font-extrabold tracking-wide"
        >
          IBM CONSULTANCY 101
        </Link>

        {/* Sign-out button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="border-charcoal bg-plant-green hover:bg-dark-blue rounded-xl border-[3px] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0_var(--charcoal)] transition disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-base"
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </header>

      {/*
       * The menu slides out beneath the header. It contains only the two
       * destinations requested for this sprint: Landing Page and Profile.
       */}
      <aside
        id="game-navigation"
        className={`border-charcoal bg-warm-cream fixed top-24 bottom-0 left-0 z-30 w-72 border-r-[5px] p-5 shadow-[6px_0_0_rgba(44,44,42,0.18)] transition-transform duration-300 ${
          menuIsOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!menuIsOpen}
      >
        <p className="text-wood-shadow mb-4 text-xs font-bold tracking-[0.18em] uppercase">
          Navigation
        </p>

        <nav aria-label="Game navigation" className="space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isCurrentPage = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setMenuIsOpen(false)
                }}
                className={`border-charcoal flex items-center gap-3 rounded-xl border-[3px] px-4 py-3 font-bold shadow-[3px_3px_0_var(--charcoal)] transition ${
                  isCurrentPage
                    ? 'bg-dark-blue text-white'
                    : 'bg-cloud-white text-charcoal hover:bg-light-blue'
                }`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-charcoal bg-cloud-white absolute right-5 bottom-5 left-5 rounded-xl border-[3px] p-4">
          <p className="text-dark-blue text-sm font-bold">Consulting Academy</p>
          <p className="text-charcoal mt-1 text-xs">
            Complete all six stages of the consulting loop.
          </p>
        </div>
      </aside>

      {/*
       * Clicking the translucent area closes the menu without navigating.
       * It also prevents users from accidentally interacting with the page
       * underneath an open drawer.
       */}
      {menuIsOpen && (
        <button
          type="button"
          className="fixed inset-0 top-24 z-20 cursor-default bg-black/20"
          onClick={() => {
            setMenuIsOpen(false)
          }}
          aria-label="Close navigation menu"
        />
      )}
    </>
  )
}

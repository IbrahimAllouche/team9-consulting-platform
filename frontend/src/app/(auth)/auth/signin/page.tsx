'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import AuthCard from '@/components/auth/AuthCard'
import ElevatorIntro from '@/components/auth/ElevatorIntro'
import { FullPageSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

export default function SignInPage() {
  const router = useRouter()
  const { user, loading, signInWithEmail } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  /*
   * Already-authenticated users should not be able to remain on the login
   * page. This preserves the existing application behaviour.
   */
  useEffect(() => {
    if (!loading && user) {
      router.replace('/team')
    }
  }, [loading, user, router])

  /*
   * Account creation sends the user back here after Firebase sends the
   * verification message.
   */
  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search)

    if (parameters.get('verification') === 'sent') {
      toast.success('Verification email sent. Verify your email, then sign in.')
    }
  }, [])

  const onSubmit = async (data: LoginInput) => {
    try {
      /*
       * The existing Firebase implementation is intentionally preserved.
       * This function also creates the secure server-side session cookie.
       */
      await signInWithEmail(data.email, data.password)

      toast.success('Signed in successfully')
      router.replace('/team')
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('email-not-verified')) {
        toast.error('Please verify your email before signing in.')
        return
      }

      /*
       * A general message avoids revealing whether a particular email address
       * exists in Firebase Authentication.
       */
      setError(
        'password',
        {
          type: 'server',
          message: 'Invalid email or password',
        },
        {
          shouldFocus: true,
        }
      )
    }
  }

  return (
    <>
      {/*
       * ElevatorIntro always mounts immediately, even while Firebase is checking
       * the existing session. This prevents the skyline spinner from flashing
       * before the lift appears.
       */}
      <ElevatorIntro />

      {loading ? (
        <FullPageSpinner />
      ) : (
        <AuthCard
          title="Going up?"
          description="Sign in to continue your training on floor 12."
          footer={
            <p>
              New consultant?{' '}
              <Link
                href="/auth/signup"
                className="hover:text-light-blue font-medium text-white underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="text-charcoal mb-1.5 block text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="you@company.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="border-lift-silver-dark bg-charcoal focus:border-light-blue h-11 w-full rounded-md border px-3 text-sm text-white outline-none placeholder:text-white/45 focus:ring-3 focus:ring-[var(--focus-ring)] aria-invalid:border-red-600"
                {...register('email')}
              />

              {errors.email && (
                <p
                  id="email-error"
                  className="mt-1.5 text-xs font-medium text-red-700"
                  role="alert"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-charcoal mb-1.5 block text-sm font-medium">
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="border-lift-silver-dark bg-charcoal focus:border-light-blue h-11 w-full rounded-md border px-3 text-sm text-white outline-none placeholder:text-white/45 focus:ring-3 focus:ring-[var(--focus-ring)] aria-invalid:border-red-600"
                {...register('password')}
              />

              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1.5 text-xs font-medium text-red-700"
                  role="alert"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-charcoal hover:text-dark-blue inline-block text-sm underline underline-offset-2"
            >
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="border-dark-blue/20 bg-building-far text-dark-blue hover:bg-light-blue flex h-11 w-full items-center justify-center rounded-lg border px-4 text-sm font-medium shadow-[inset_0_-2px_0_rgba(31,78,121,0.18)] transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Calling the lift...' : 'Floor 12: Enter Academy'}
            </button>
          </form>
        </AuthCard>
      )}
    </>
  )
}

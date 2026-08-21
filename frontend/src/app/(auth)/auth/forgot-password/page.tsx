'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import AuthCard from '@/components/auth/AuthCard'
import { resetPassword } from '@/lib/firebase/auth'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      /*
       * This retains Firebase's existing reset-email implementation.
       * The email is not added to the URL because URLs can be stored in browser
       * history, logs and analytics.
       */
      await resetPassword(data.email)
      router.push('/auth/reset-sent')
    } catch {
      /*
       * A generic message prevents the interface from confirming whether an
       * account exists for a particular email address.
       */
      toast.error('Unable to send the reset email. Please try again.')
    }
  }

  return (
    <AuthCard
      title="Lost your access?"
      description="Enter your email and we will send you a password-reset link."
      footer={
        <Link
          href="/auth/signin"
          className="hover:text-light-blue font-medium text-white underline underline-offset-4"
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'reset-email-error' : undefined}
            className="border-lift-silver-dark text-charcoal placeholder:text-charcoal/45 focus:border-dark-blue h-11 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-3 focus:ring-[var(--focus-ring)] aria-invalid:border-red-600"
            {...register('email')}
          />

          {errors.email && (
            <p
              id="reset-email-error"
              className="mt-1 text-xs font-medium text-red-700"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-building-far text-dark-blue hover:bg-light-blue flex h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
        </button>
      </form>
    </AuthCard>
  )
}

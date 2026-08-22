import Link from 'next/link'
import AuthCard from '@/components/auth/AuthCard'
import { authPrimaryButtonClassName } from '@/components/auth/authStyles'

export default function ResetSentPage() {
  return (
    <AuthCard
      title="Check your email"
      description="If an account matches that address, a password-reset link will arrive shortly."
      centred
    >
      {/*
       * The icon is decorative because the heading already communicates the
       * successful result to screen-reader users.
       */}
      <div
        className="border-plant-green mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          className="text-plant-green h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      </div>

      <p className="text-charcoal/75 mt-5 text-sm leading-6">
        Check your spam or junk folder if the message does not appear after a few minutes.
      </p>

      <Link
        href="/auth/signin"
        className={`${authPrimaryButtonClassName} mt-6`}
      >
        Back to sign in
      </Link>
    </AuthCard>
  )
}

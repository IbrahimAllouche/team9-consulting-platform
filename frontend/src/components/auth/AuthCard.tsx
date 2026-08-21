import type { ReactNode } from 'react'

type AuthCardProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  centred?: boolean
}

export default function AuthCard({
  title,
  description,
  children,
  footer,
  centred = false,
}: AuthCardProps) {
  return (
    /*
     * Every authentication route uses this component. That keeps the width,
     * colours and spacing consistent across sign-in, sign-up and reset pages.
     */
    <section
      className={`bg-dark-blue text-cloud-white w-full max-w-[430px] rounded-2xl px-6 py-7 shadow-[0_24px_70px_rgba(31,78,121,0.30)] sm:px-7 sm:py-8 ${
        centred ? 'text-center' : ''
      }`}
    >
      <header className="mb-6">
        <p className="text-light-blue text-xs font-medium tracking-wide">IBM CONSULTANCY 101</p>

        <h1 className="mt-2 text-[32px] leading-tight font-medium text-white">{title}</h1>

        <p className="text-cloud-white/70 mt-2 text-sm leading-6">{description}</p>
      </header>

      {/*
       * The cream panel creates the same "card inside a card" treatment shown
       * in the sign-in wireframe.
       */}
      <div className="bg-warm-cream text-charcoal rounded-2xl p-5 sm:p-6">{children}</div>

      {footer && <div className="text-cloud-white/80 mt-5 text-center text-sm">{footer}</div>}
    </section>
  )
}

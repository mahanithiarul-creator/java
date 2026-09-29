import { Construction } from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  usePageTitle(title)
  return (
    <section className="page-enter grid min-h-[56vh] place-items-center">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-moss"><Construction size={25} /></div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </section>
  )
}

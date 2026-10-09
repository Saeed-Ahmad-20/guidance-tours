import { requirePortalSession } from '../../lib/portal-session'
import { buildCatalogue } from './catalogue'
import { loadAttachableDocuments } from './documents'
import PdfBuilder from './pdf-builder'

export const dynamic = 'force-dynamic'

export default async function PortalPdfPage() {
  const session = await requirePortalSession()
  const groups = buildCatalogue()
  const documents = await loadAttachableDocuments(session)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <section className="rounded-2xl bg-gradient-to-br from-[#2C1F0E] to-[#1a130a] p-6 sm:p-8">
        <p className="text-[#C4A348] text-xs font-bold uppercase tracking-widest">Read without signal</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">PDF</h1>
        <p className="text-sm text-stone-300 mt-2 leading-relaxed">
          Build your own PDF guide from the portal. Tick only what you want, give it a name, and save it to your phone
          to read in Madinah and Makkah, even with no internet.
        </p>
        <ol className="mt-5 grid gap-2 text-sm text-stone-200 sm:grid-cols-3">
          {['Choose what to include', 'Name your guide', 'Create and save the PDF'].map((step, i) => (
            <li key={step} className="flex items-center gap-2.5">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#C4A348] text-[#2C1F0E] text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8">
        <PdfBuilder groups={groups} documents={documents} />
      </div>

      <p className="text-xs text-stone-400 text-center mt-10">
        You can make as many guides as you like. Your choices are remembered on this device.
      </p>
    </div>
  )
}

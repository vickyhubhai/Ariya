import { IconChevron } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/ui";
import { faq, links } from "@/lib/site";

export function FaqSection({ compact = false }: { compact?: boolean }) {
  const items = compact ? faq.slice(0, 6) : faq;
  return (
    <section id="faq" className="section relative" aria-labelledby="faq-heading">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <Reveal>
              <SectionHeading
                align="left"
                id="faq-heading"
                kicker="Answers, no filler"
                title={
                  <>
                    Frequently asked <span className="text-gradient-violet">questions</span>
                  </>
                }
              >
                Factual answers about Ariya, install steps, builds and licences. Everything here is
                sourced from the official repository and release notes.
              </SectionHeading>
            </Reveal>
            <Reveal delay={110}>
              <div className="glass card-radius mt-6 p-5">
                <p className="text-sm font-medium text-white/85">Still stuck?</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                  Open an issue on GitHub with your device model, Android version and the exact APK
                  you installed.
                </p>
                <a
                  href={links.issues}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-glass btn-sm mt-4"
                >
                  Report an issue
                </a>
              </div>
            </Reveal>
          </div>

          <div className="space-y-2.5">
            {items.map((item, index) => (
              <Reveal key={item.question} delay={Math.min(index * 40, 240)}>
                <details className="group glass-soft card-radius overflow-hidden">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300 sm:p-5">
                    <span className="break-words text-sm font-medium leading-snug text-white/90 sm:text-[0.95rem]">
                      {item.question}
                    </span>
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/12 bg-white/5 text-white/60 transition group-open:rotate-180">
                      <IconChevron size={14} />
                    </span>
                  </summary>
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                    <p className="text-sm leading-relaxed text-white/55">{item.answer}</p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

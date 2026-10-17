import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { FaqSection } from "@/components/faq";
import { IconArrowRight, IconGithub } from "@/components/icons";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, faqSchema, graph, pageMetadata } from "@/lib/seo";
import { faq, links } from "@/lib/site";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "FAQ", path: "/faq" },
];

export const metadata: Metadata = pageMetadata({
  title: "Ariya FAQ — Download, Builds, Android Requirements",
  description:
    "Answers about Ariya Music Player: supported Android versions, GMS vs FOSS builds, install steps, lossless audio, lyrics providers, licensing and privacy.",
  path: "/faq",
  keywords: ["Ariya FAQ", "Ariya Android version", "Ariya GMS FOSS", "Ariya install"],
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={graph([breadcrumbSchema(crumbs), faqSchema()])} />
      <PageHeader
        eyebrow="FAQ"
        title="Ariya, answered plainly"
        intro="Short, factual answers about the app, its builds and this website. If something is not verified, it is not claimed here."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">{faq.length} answers</span>
            <a href={links.issues} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> Ask on GitHub
            </a>
          </>
        }
      />
      <FaqSection />
      <section className="section-tight">
        <div className="container-page">
          <div className="glass card-radius flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold text-white/90">Ready to install?</h2>
              <p className="mt-1 text-sm text-white/45">
                The download page lists every current APK with its real size and official link.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/download" className="btn btn-primary btn-sm">
                Download Ariya <IconArrowRight size={13} />
              </Link>
              <Link href="/releases" className="btn btn-glass btn-sm">
                Release history
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

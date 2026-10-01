import { repoUrls, siteConfig } from './config';

const origin = siteConfig.url;

/**
 * The `application/ld+json` graph from the static site, reproduced node for
 * node (Organization, WebSite, WebPage, SoftwareApplication, FAQPage) so
 * rich results keep working after the migration.
 */
export function buildJsonLdGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'Ariya',
        url: `${origin}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}${siteConfig.logo}`,
          width: 512,
          height: 512,
        },
        sameAs: [repoUrls.repo],
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: `${origin}/`,
        name: 'Ariya',
        description: 'Modern Android music player with lyrics, FLAC support, and powerful music features.',
        inLanguage: 'en',
        publisher: { '@id': `${origin}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${origin}/#webpage`,
        url: `${origin}/`,
        name: siteConfig.title,
        isPartOf: { '@id': `${origin}/#website` },
        about: { '@id': `${origin}/#software-application` },
        inLanguage: 'en',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${origin}/#software-application`,
        name: 'Ariya',
        alternateName: 'Ariya Music Player',
        applicationCategory: 'MusicApplication',
        operatingSystem: 'Android 8.0 (Oreo) and later',
        url: `${origin}/`,
        downloadUrl: repoUrls.latest,
        image: `${origin}${siteConfig.logo}`,
        description:
          'Ariya is a modern, free and open-source Android music player focused on a beautiful interface, powerful playback controls, high-quality audio, lyrics, discovery, and a smooth listening experience.',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList:
          'Glass/Haze UI, synced lyrics, FLAC lossless audio, playlists, queue management, crossfade, gapless playback, music discovery, Discord rich presence, customizable settings, in-app update checking',
        softwareHelp: { '@type': 'HelpPage', url: `${origin}/#support` },
        codeRepository: repoUrls.repo,
        publisher: { '@id': `${origin}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is Ariya?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ariya is a free, modern Android music player with a beautiful interface. It supports synced lyrics, FLAC lossless audio, playlists, queue controls, crossfade, gapless playback, and music discovery from multiple sources.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Ariya free to download?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. Ariya is free and open source. You can download the latest APK from the official GitHub releases page at ${repoUrls.releases}.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Which Android versions does Ariya support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ariya requires Android 8.0 (Oreo) or later and supports arm64, armv7, x86, and x86_64 architectures. It needs about 30 MB of free storage.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Ariya support FLAC and lyrics?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Ariya supports FLAC lossless audio and synced lyrics that follow along with playback. Audio quality can be selected from low to ultra-high depending on the source.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Ariya available on iOS?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Ariya is currently available for Android only. iOS support is not available at this time.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I report a bug or get support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Join the Ariya Discord support server at https://discord.gg/CxMV79wrMP, or use the Report a Bug form on the Support section of ${origin}. Reports go straight to the team.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Is Ariya open source?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. Ariya is open source and its code is publicly available on GitHub at ${repoUrls.repo} under the MIT license.`,
            },
          },
        ],
      },
    ],
  };
}

/**
 * The standalone `AboutPage` node from `about/index.html`. Kept separate from
 * the home graph because the home page already declares the WebPage and the
 * SoftwareApplication with `@id`s, and duplicating them would conflict.
 */
export function buildAboutJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${origin}/about#webpage`,
    url: `${origin}/about`,
    name: 'About Ariya',
    description:
      'Ariya is a modern, free and open-source Android music player focused on a beautiful interface, powerful playback controls, high-quality audio, lyrics, discovery, and a smooth listening experience.',
    inLanguage: 'en',
    about: {
      '@type': 'SoftwareApplication',
      name: 'Ariya',
      applicationCategory: 'MusicApplication',
      operatingSystem: 'Android 8.0 (Oreo) and later',
      url: `${origin}/`,
      downloadUrl: repoUrls.latest,
      image: `${origin}${siteConfig.logo}`,
      license: repoUrls.license,
      codeRepository: repoUrls.repo,
      publisher: { '@type': 'Organization', name: 'Ariya', url: `${origin}/` },
    },
  };
}

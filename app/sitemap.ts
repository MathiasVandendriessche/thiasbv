import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.thiasbv.com'
  const languages = ['nl', 'en', 'fr']
  const pages = [
    { path: '', priority: 1, changeFrequency: 'monthly' as const },
    { path: 'diensten', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'ervaring', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: 'contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: 'privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  languages.forEach((lang) => {
    pages.forEach((page) => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${page.path ? `/${page.path}` : ''}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            nl: `${baseUrl}/nl${page.path ? `/${page.path}` : ''}`,
            en: `${baseUrl}/en${page.path ? `/${page.path}` : ''}`,
            fr: `${baseUrl}/fr${page.path ? `/${page.path}` : ''}`,
          },
        },
      })
    })
  })

  return sitemapEntries
}

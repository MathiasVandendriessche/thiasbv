import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['nl', 'en', 'fr']
const defaultLocale = 'nl'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Redirect to default locale if no locale in pathname
  if (pathname === '/' || !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    const locale = defaultLocale
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

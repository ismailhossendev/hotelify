import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl.clone();

    const mainDomain = process.env.MAIN_DOMAIN || 'hotelify.com';

    const searchParams = request.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;

    // Hostname normalization
    let currentHost = hostname.replace(`:3000`, ''); // Remove port for locahost

    // Define main domain (localhost for dev, hotelify.com for prod)
    // You might want to use an env var here, e.g. process.env.NEXT_PUBLIC_ROOT_DOMAIN
    const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost';

    // 1. App / Main Domain Routing
    // If it's the main domain (e.g. hotelify.com or app.hotelify.com), let it pass to standard app routing
    if (currentHost === domain || currentHost === `app.${domain}` || currentHost === `www.${domain}`) {
        return NextResponse.next();
    }

    // 2. Subdomain & Custom Domain Routing
    // If it's a subdomain (e.g. grandhotel.hotelify.com) or custom domain (e.g. grandhotel.com)
    // rewrite to /_sites/[site]

    // Extract the "site" key. 
    // For subdomain: seaview.hotelify.com -> "seaview" (if using subdomains) OR "seaview.hotelify.com"
    // For custom domain: myhotel.com -> "myhotel.com"

    // Simple logic: If it ends with our root domain, it's a subdomain (unless it is the root domain itself, handled above)
    let siteKey = currentHost;
    if (currentHost.endsWith(`.${domain}`)) {
        siteKey = currentHost.replace(`.${domain}`, '');
    }

    // Prevent routing for special subdomains if missed above
    if (['www', 'api', 'admin', 'app'].includes(siteKey)) {
        return NextResponse.next();
    }

    // Rewrite to the sites dynamic route
    // This tells Next.js to render src/app/sites/[site]/page.tsx
    return NextResponse.rewrite(new URL(`/sites/${siteKey}${path}`, request.url));
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

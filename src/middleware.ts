import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhook/stripe(.*)']) // IF '/' IS ADDED HOME PAGE AN BE ACCESSED WITHOUT AUTH

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}   

/*

What happens here:
For every request, this runs before the page loads.

It checks:

❌ If the route is not /sign-in

✅ Then it runs auth.protect() which:

Checks if the user is signed in

If not, redirects them to the sign-in page

So in simple words:
All pages are private (protected), except /sign-in.

*/

import { NextResponse, type NextRequest } from "next/server";

// The product moved to the mobile app (broccoli/apps/mobile). This deployment
// exists for one reason now: keeping the marketing site alive at
// getbroccoli.app. Everything behind it — sign-in, /app, the tRPC/queue/push
// API routes — is retired code still wired to the decommissioned legacy
// database, so nothing may route there. See the PRD's "Cut" section.
//
// The code is left on disk rather than deleted; this is the front door, and
// it only opens onto the landing pages.
const LANDING_ROUTES = ["/home", "/about", "/blog", "/pricing"];

export default function landingOnlyMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/home", request.url));
  }

  if (LANDING_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Answer API callers honestly instead of handing a fetch() an HTML redirect.
  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        error: "Gone",
        message: "The Broccoli web app has moved to the mobile app.",
      },
      { status: 410 },
    );
  }

  return NextResponse.redirect(new URL("/home", request.url));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search
    // params. Unlike before, /api is *not* skipped — those routes have to be
    // closed too, and closing them is this middleware's job.
    "/((?!_next|manifest.json|sw.js|workbox-.*\\.js|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

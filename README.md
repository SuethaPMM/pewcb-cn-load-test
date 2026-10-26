# PewCB Chinese homepage — GitHub Pages loading test

Temporary comparison page: https://SuethaPMM.github.io/pewcb-cn-load-test/

This is a copy of the public Chinese homepage with **all forms removed**. It is a static network/loading test, with English timing information above the Chinese page. All media and initial assets are served from this GitHub Pages project.

Each opening/reload creates a cryptographically random `run` query for the HTML-linked images, stylesheets, scripts, posters and deferred media URLs. The bootstrap inserts these URLs before the browser parses resource tags, avoiding duplicate initial downloads. The page does not claim to disable GitHub's HTTP caches or clear DNS/TLS/connection caches. First Content includes the diagnostic panel. Images load eagerly; unplayed videos do not contribute to initial load. Metrics stay in the visitor's browser.

The panel reports HTML and image browser-cache use from same-origin Resource Timing sizes. Network counts can include revalidation; CDN hits are still network transfers from the browser's perspective. An unused `page_run` address is prepared for the next reload without making another request. **Run fresh test** navigates to another random HTML URL. Reopening the exact canonical link can still reuse its cached HTML. Neither method resets DNS, connections or GitHub's CDN cache. Browsers that do not expose timing sizes show unknown results.

There is no backend, database, enquiry delivery, API key or customer data here. Product/navigation links go to the actual CN site. The production website, DNS and Cloudflare configuration are unchanged. GitHub may process technical request information for hosting/security: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement

Publish `main` / repository root using GitHub Pages. `.nojekyll` keeps the static files unchanged. No custom domain is configured.

<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Hjelpi Next.js App Router project. Client-side tracking is initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.js` to route events through `/ingest` to the EU PostHog endpoint. A shared server-side PostHog client is available via `lib/posthog-server.ts`. User identification is performed on login and registration, linking client and server events to the same person.

| Event | Description | File |
|---|---|---|
| `user_logged_in` | User successfully logs in with email and password | `components/auth/LoginForm.tsx` |
| `login_failed` | User login attempt fails (invalid credentials) | `components/auth/LoginForm.tsx` |
| `user_registered` | Buyer successfully submits the registration form | `components/auth/RegisterForm.tsx` |
| `seller_registered` | Seller successfully submits the seller registration form | `components/auth/RegisterForm.tsx` |
| `password_reset_requested` | User requests a password reset email | `components/auth/ForgotPasswordForm.tsx` |
| `password_updated` | User successfully sets a new password | `components/auth/UpdatePasswordForm.tsx` |
| `search_submitted` | User submits a search query from the home search bar | `components/home/HomeSearchBar.tsx` |
| `popular_tag_clicked` | User clicks a popular search tag suggestion | `components/home/HomeSearchBar.tsx` |
| `provider_list_sorted` | User changes the sort order on a provider listing page | `components/providers/SubcategoryProviderList.tsx` |
| `provider_profile_clicked` | User clicks a provider card in a subcategory listing | `components/providers/SubcategoryProviderList.tsx` |
| `seller_profile_completed` | Seller successfully submits the complete-profile onboarding form | `components/seller/CompleteSellerProfileForm.tsx` |
| `email_verified` | User email verified via auth callback (server-side) | `app/[locale]/auth/callback/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/152412/dashboard/601711
- **New registrations (buyers vs sellers)**: https://eu.posthog.com/project/152412/insights/0D6r8vNV
- **Login success vs failure rate**: https://eu.posthog.com/project/152412/insights/c5g1G8Ir
- **Buyer signup-to-login conversion funnel**: https://eu.posthog.com/project/152412/insights/JOA8HM79
- **Seller onboarding funnel**: https://eu.posthog.com/project/152412/insights/ZD9b67cs
- **Search & provider engagement**: https://eu.posthog.com/project/152412/insights/JuABJkUs

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

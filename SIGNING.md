# Windows code signing (free, via SignPath Foundation)

Unsigned Windows installers trigger "Windows protected your PC". SignPath Foundation signs
open-source projects for free. They review each project by hand, so it takes a few days.

## What's already in place
- An OSI-approved open-source licence (GPL-3.0, see `LICENSE`).
- Public source code and releases on GitHub.
- Automated builds and tests on GitHub Actions (`.github/workflows/test.yml`).
- A code signing policy (below), which SignPath requires on the project page.

## What you need to do
1. Apply at https://signpath.org/apply with the repository URL
   `https://github.com/hollowbit-dev/fileshaper` and the website
   `https://hollowbit-dev.github.io/fileshaper/`.
2. When they approve it, they'll give you an organization ID and an API token.
   Add the token to the repo as a secret: GitHub → Settings → Secrets and variables → Actions →
   New repository secret, named `SIGNPATH_API_TOKEN`.
3. Ask Claude to add the signing step: the Windows installer is then built on GitHub Actions,
   sent to SignPath to be signed, and attached to the release automatically.

## Code signing policy
Free code signing for Windows releases will be provided by SignPath.io, with a certificate by
SignPath Foundation, once the project is approved.

- Committers and approvers: Elvis Zygmanta ([@hollowbit-dev](https://github.com/hollowbit-dev))
- Only builds produced from this repository by GitHub Actions are signed.
- Privacy: Fileshaper does not transfer any information to other networked systems, except an
  optional update check (it asks GitHub for the latest version number) that the user can turn
  off in Settings. See the privacy policy: https://hollowbit-dev.github.io/fileshaper/privacy.html

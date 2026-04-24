# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-04-25

### Added
- Advanced calculator inputs for panel presets/custom electrical values, bifacial gain, and motor load surge sizing.
- KaTeX-rendered computation formulas in results UI.
- Expanded explanations and glossary/term definitions for technical outputs.
- Public share flow for generated builds with social sharing controls.
- Saved build management with account save and delete actions.
- Export endpoints for JSON and printable quote output.
- Build retention policy and automatic expiry handling.
- Open Graph image generation for site and shared build pages.
- Auth hardening via resilient `safeAuth` behavior and custom auth error page.
- Production containerization assets (`Dockerfile`, `.dockerignore`, OCI compose stack).
- Local Docker Postgres compose setup and helper npm scripts.

### Changed
- Documentation updated to reflect implemented features and deployment guidance (OCI Ampere + Portainer + Nginx Proxy).
- `next.config.ts` configured for standalone output suitable for container deployment.

### Notes
- Initial stable release targeted for deployment and sharing workflows.

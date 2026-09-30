\# Accessibility Baseline \& Repository Architecture Audit



\## Project Overview



This project documents an accessibility baseline audit of the public-facing website India.gov.in and provides a maintainable full-stack repository foundation for future implementation.



The goal is to identify accessibility issues, document evidence and remediation steps, and organize the project using a clear client-server architecture.



\## Audited Website



Website: India.gov.in



Audit Date: September 30, 2026



\## Audit Tools



\- Chrome DevTools Lighthouse

\- Keyboard-only navigation

\- WCAG 2.2 accessibility principles



\## Lighthouse Result



The audited homepage received an Accessibility score of 82/100 in Lighthouse.



Note: Lighthouse reported that the page loaded too slowly to finish within the configured time limit. Therefore, the Lighthouse results may be incomplete.



\## Accessibility Findings



Five accessibility issues were documented:



| ID | Issue | Priority |

|---|---|---|

| A11Y-001 | Carousel buttons do not have accessible names | High |

| A11Y-002 | Select controls do not have associated labels | High |

| A11Y-003 | Embedded frames do not have descriptive titles | Medium |

| A11Y-004 | Insufficient color contrast | High |

| A11Y-005 | Heading levels are not sequential | Medium |



Detailed evidence, user impact, and recommended remediation are available in:



docs/accessibility-audit.csv



\## Repository Architecture



```text

accessibility-baseline-audit/

|-- client/

|   `-- README.md

|-- server/

|   `-- README.md

|-- docs/

|   |-- accessibility-audit.csv

|   `-- architecture.md

|-- tests/

|   `-- README.md

`-- README.md


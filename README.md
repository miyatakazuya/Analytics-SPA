# CSE 135 Homework 3 - Analytics System
Team / Individual: Kazuya Miyata

## Site Information
- **Testing Site:** https://test.kazuyamiyata.site
- **Collector Endpoint:** https://collector.kazuyamiyata.site/api/collect.php
- **Reporting API:** https://reporting.kazuyamiyata.site/api/sessions

## Server Access
- **IP Address:** 138.68.249.83
- **SSH User:** kmiyata
- **SSH Key Required:** Use standard class SSH key

## How to Test
1. Visit `https://test.kazuyamiyata.site` and interact with the pages (click products, move mouse, browse to other pages, stay idle for 3 seconds).
2. The `collector.js` script will aggregate interaction metrics, performance tracking, web vitals, static client data, and errors into JSON payloads.
3. Upon navigation (or asynchronously), payloads are sent to `collector.kazuyamiyata.site` and stored in the MySQL `webanalytics` database across 4 relational tables: `sessions`, `pageviews`, `activities`, and `errors`.

## Deviations & Notes
- **Challenging Point Addressed:** Instead of relying solely on `sessionStorage`, we implemented **First-Party Cookies** in `collector.js` (`collector_sid`). This ensures the exact same cryptographic Session ID generated and used by the JavaScript payload is intrinsically passed along with every HTTP Request to the server, allowing us to perfectly tie server access logs (`test.kazuyamiyata.site-access.log`) with client-side event streams in MySQL.
- **REST Implementation:** The reporting API uses a raw PHP front-controller architecture (`index.php`) utilizing `switch` and `PDO` instead of an MVC framework, demonstrating a deep understanding of core routing and HTTP methods.

## Files Included in Delivery
- `log-verify.jpg`: Demonstrates the `collector_sid` captured in Apache logs.
- `database-verify.jpg`: Demonstrates organic data ingested into MySQL.
- `REST.png`: Demonstrates retrieving session data via a GET request from the Reporting API.
- `example-routes.pdf`: Detail of available API endpoints.
- `collector.js`: The final optimized tracking script.

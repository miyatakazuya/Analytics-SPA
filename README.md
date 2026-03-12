# CSE 135 Homework 5 - FINAL Project Submission
Team / Individual: Kazuya Miyata

Repository: https://github.com/miyatakazuya/Analytics-SPA

## Site Information
- **Testing Site:** https://test.kazuyamiyata.site
- **Collector Endpoint:** https://collector.kazuyamiyata.site/api/collect.php
- **Reporting Dashboard:** https://reporting.kazuyamiyata.site/

## Test Accounts
- **Admin:** `admin@site.com` / `password123`
- **Data Analyst:** `analyst@site.com` / `password123`
- **Report Viewer:** `viewer@site.com` / `password123`

## Use of AI

I used gemini often to help me debug issues after encountering them many times, like UNIX permission issues related to my github deployment, SQL syntax errors, and niche issues regarding graphing and visualizations that I would've spent much more time trying to figure out.

I think the value of these tools come best in an assitive capacity, where they can help you find solutions to problems you're already aware of, rather than generating entire features or codebases for you.
Through working on this project, I asked several times about how they would implement certain features, but I realized the value in the work comes in the ability to make the decision on what structures and systems to design rather than having an AI make those decisions for you because of it's nature often selecting for the most common or simplest solutions which may not always be the best for my specific needs.

## Roadmap

I think in terms of what I would add to this project if I had more time, I would want to make the platform more much "no-code" friendly, allowing users to create custom reports and dashboards without having to make any complex edits. 

I also want to make them more mutable, with a greater selection of visualizations and ways to display data because the only filter I was able to implement in a reasonable manner was based on time, and I think it would be cool to have more options for filtering and displaying data.

Lastly, I think CRUD of user accounts and supporting multiple sites beyond just the test site is cool, as I think the collector script I made it super generalizable to any site so having the option to add it to any site and have it show up on the dashboard would be cool to see.
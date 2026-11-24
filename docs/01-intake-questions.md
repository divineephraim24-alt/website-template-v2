# Intake questions (master list)

Use these on a call, or send the Google Form version (`01b-google-form-questions.md`). Skip anything that doesn't apply. "Not sure" is a fine answer: Claude turns gaps into `QUESTIONS.md`. The note in brackets shows where each answer goes in `client/content.js`.

## 1. The business
1. What is the business called, exactly as it should appear? (`business.name`)
2. In one line, what do you do and where? (`business.tagline`)
3. What type of business is it: trade, cleaning, beauty, food, fitness, mobile service, shop, other? (`business.type`)
4. Is it just you, or a team? Should the site say "I" or "we"? (`business.voice`)
5. Are you a **sole trader** or a **limited company**? (`business.legalForm`)
6. If limited: the full company name, company number, where it is registered, and the registered office address. These appear in the footer. (`business.company`) *Not legal advice. See gov.uk's guidance on business names and company information.*
7. Which payment methods do you accept? (`business.paymentAccepted`)

## 2. How customers reach you
8. Which should customers use: WhatsApp, phone, email, online booking link? Which one is the **main** button? (`contact`)
9. The number, email address or booking link for each.
10. Instagram, Facebook or TikTok links? (`social`)
11. Do you have a Google Business Profile? Please send its link and its "ask for reviews" link. (`social.googleReviews`, `social.googleLeaveReview`)

## 3. Where you work
12. Do customers come to you, do you go to them, or both? (`serviceMode`)
13. **If you travel:** which towns and areas? How far will you go? What does the customer need to provide (parking, water, power, access)? (`coverage`)
14. **If customers visit:** full address, a Google Maps link, opening hours for each day, holiday closures, walk-ins or appointment only, parking. (`location`)

## 4. What you sell
15. List each service or package, and what's included. (`services`)
16. The price of each: fixed, "from", or "by quote"? (`services`)
17. Do prices change by size or option? Send the full price list. (`priceTable`)
18. Any add-ons or extras, and their prices? (`addons`)
19. Do you offer regular visits, memberships or a subscription? How does it work and what does it cost? (`plan`)

## 5. How it works
20. How does a customer book, step by step? (`bookingSteps`)
21. Your cancellation, deposit and late policies? (`bookingSteps.note`, `faq`, `policies.refunds`)
22. What do customers ask most often, and what do you tell them? (`faq`)
23. What should customers know before they book? Any limits on what you can do?
24. How do you handle customers' personal details, and how long do you keep them? (`faq.privacy`, shown as the privacy policy)
24a. Your terms: how are bookings confirmed, how long is a quote valid, when and how do customers pay? (`policies.terms`)
24b. If a customer isn't happy, what do you do, and when do you give money back? (`policies.refunds`, together with question 21)
24c. Is there anything you can't promise or are not responsible for (results, weather, existing damage)? (`policies.terms`)

## 6. Why choose you
25. Two to four genuine reasons to choose you. Only things you can back up. (`reassurance`)
26. Any insurance, qualifications or memberships you'd like shown? Please send proof or details. (Only listed if confirmed.)
27. Real customer reviews, word for word. **Has each customer agreed to their first name and town being shown?** (`reviews`)

## 7. Look and photos
28. Do you have a logo? Please send the best-quality file. (`brand.logo`)
29. Any brand colours? Do you prefer a dark or a light site? (`brand`)
30. Style: modern, classic or friendly? Sharp, soft or round corners? (`brand`)
31. Please send your best photos and any short videos. Follow the **[photo guide](client-photo-guide.md)**. Do you own them, or have permission to use them? (`photos`, `work`)
32. Any websites you like the look of?

## 8. Domain and accounts
33. Do you already own a web address? Who is it with, and can you log in? (`business.domain`)
34. If not, what address would you like? It will be bought **in your name, on your account**. See `04-hosting-domain-ownership.md`.
35. Do you use email on that address (like hello@yourbusiness.co.uk)? This must be checked before anything changes.
36. Do you have an existing website? What should happen to it?

## 9. The project
37. When would you like it live? Is there a deadline?
38. Who approves the wording? (They sign off in writing before launch.)
39. Would you like ongoing updates after launch (a care plan), or a one-off build?

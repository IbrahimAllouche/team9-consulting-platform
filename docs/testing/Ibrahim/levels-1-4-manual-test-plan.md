# Levels 1–4 Manual Test Plan — Sarah Chen and David Palte

## Tester
Ibrahim Allouche

## Test Type
Manual end-to-end functional test

## Environment
Local or deployed application using the current `dev` baseline.

## Purpose
Verify Levels 1 through 4 for both supported clients, Sarah Chen and David Palte.

The test plan records the exact input used and the expected result so that a tester outside the development team can repeat the same flow and determine whether each test passes.

Levels 2 and 4 use LLM-generated grading or responses. For those tests, the exact wording or numeric score may vary. The expected result therefore defines the required observable behaviour, valid score range, pass threshold, and output structure.

## Preconditions
- The application is running successfully.
- The tester is signed in with a valid account.
- Levels 1 through 4 are accessible.
- The Groq API key is configured for LLM-based dialogue and grading.
- Browser local storage is enabled.
- Start each client test with a clean/reproducible session where practical.

---

# Level 1 — Client Discovery

## Level 1 scoring rules

Each covered client information point contributes 15 points.

`leadScore = covered information points × 15`

Maximum score: 100.

Relationship state:
- 0–44 = `cold`
- 45–74 = `warm`
- 75–100 = `qualified`

Level 1 only completes when both required clients have been completed.

---

## Test 1 — Level 1 Sarah Chen discovery

### Client
Sarah Chen  
Chief Operating Officer  
ACMD Manufacturing

### Scenario
Main issue: supply-chain delays and disconnected operational data.

### Exact input
Interact with Sarah Chen and enter the following messages one at a time:

1. `Hi Sarah, what is the biggest operational problem your team is dealing with right now?`
2. `How are the supply-chain delays affecting customers and your internal teams?`
3. `Where is the lack of operational visibility causing the biggest problems?`
4. `What outcome would you want from improving the current process?`
5. `Are there any constraints around changing or replacing your existing systems?`
6. `What timeline would be realistic for making improvements?`

### Expected result
- Sarah responds in character as the COO of ACMD Manufacturing.
- Responses remain related to ACMD's supply-chain, operational visibility, delivery-delay, growth, or process problems.
- The client does not incorrectly identify herself as David Palte or Meridian Retail Group.
- Relevant information points are recorded as the conversation progresses.
- On completion, a Level 1 session is saved for persona `test-level-1`.
- `leadScore` is calculated from the number of covered information points at 15 points each, capped at 100.
- Relationship state is:
  - `cold` below 45
  - `warm` from 45 to 74
  - `qualified` from 75 upward.
- Completing Sarah alone must not complete Level 1 if David has not also been completed.

---

## Test 2 — Level 1 David Palte discovery

### Client
David Palte  
Chief Technology Officer  
Meridian Retail Group

### Scenario
Main issue: fragmented customer data makes business decisions unreliable.

### Exact input
Interact with David Palte and enter the following messages one at a time:

1. `Hi David, what is the biggest customer-data problem Meridian is facing today?`
2. `Which customer data sources are causing the most inconsistency?`
3. `How is fragmented customer data affecting business decisions?`
4. `What would a reliable customer view allow your teams to do differently?`
5. `What concerns do you have about bringing in an external consulting team?`
6. `What would make an engagement valuable enough for Meridian to proceed?`

### Expected result
- David responds in character as the CTO of Meridian Retail Group.
- Responses remain related to fragmented customer information, business decision-making, technology, data access, or consulting value.
- The client does not incorrectly identify himself as Sarah Chen or ACMD Manufacturing.
- Relevant information points are recorded as the conversation progresses.
- On completion, a Level 1 session is saved for persona `test-level-2`.
- `leadScore` is calculated from covered information points at 15 points each, capped at 100.
- Relationship state follows the cold/warm/qualified thresholds above.
- Once both Sarah and David are completed, Level 1 is allowed to complete and progress to the next stage.

---

# Level 2 — Outreach Email

## Level 2 client details

### Sarah Chen
- Role: Chief Operating Officer
- Company: ACMD Manufacturing
- Email: `sarah.chen@acmd.example`
- Phone: `+61 3 9000 0142`

### David Palte
- Role: Chief Technology Officer
- Company: Meridian Retail Group
- Email: `david.palte@meridian.example`
- Phone: `+61 3 9000 0186`

## Level 2 grading rules

The outreach email is graded from 0 to 6.

The grader considers:
1. Personalisation to the client
2. Relevance to the client's needs
3. Clear value proposition
4. Professional tone
5. Clear call to action
6. Overall effectiveness

Passing score: **5 or 6**.

A score below 5 is saved but does not complete Level 2.

Because grading is LLM-based, the exact numeric score is not guaranteed to be identical on every run.

---

## Test 3 — Level 2 Sarah Chen outreach

### Exact input

**To**
`sarah.chen@acmd.example`

**Subject**
`Improving ACMD supply-chain visibility`

**Body**
`Hi Sarah,

I am reaching out regarding the supply-chain visibility and delivery challenges facing ACMD Manufacturing.

IBM could help your team identify where operational information is fragmented, improve visibility across inventory, orders and logistics, and reduce delays without immediately replacing your existing systems.

Would you be available for a short meeting next week to discuss the current process and the outcomes ACMD would like to achieve?

Kind regards,
IBM Consulting`

### Expected result
- Email can be submitted successfully.
- The grading service returns:
  - `success: true`
  - an integer `score` from 0 to 6
  - non-empty written `feedback`.
- The result screen displays the score as `x/6`.
- The feedback relates to the submitted outreach email.
- The email contains:
  - a greeting
  - Sarah or ACMD by name
  - the business need
  - a proposed consulting value
  - a professional call to action.
- A strong execution of this email is expected to reach the passing range of 5–6.
- If score is 5 or 6, Level 2 completion is recorded.
- If score is below 5, Level 2 remains incomplete and the tester is told to improve the outreach.

---

## Test 4 — Level 2 David Palte outreach

### Exact input

**To**
`david.palte@meridian.example`

**Subject**
`Creating a reliable customer-data view at Meridian`

**Body**
`Hi David,

I am reaching out regarding Meridian Retail Group's fragmented customer data across its different channels.

IBM could help Meridian establish a more reliable and integrated customer view, reduce inconsistency in business reporting, and make useful customer information easier for business teams to access while delivering measurable value quickly.

Would you be available for a short meeting next week to discuss the highest-impact customer-data issues and what a worthwhile consulting engagement would need to deliver?

Kind regards,
IBM Consulting`

### Expected result
- Email submits successfully.
- Grading returns an integer score from 0 to 6 and non-empty feedback.
- The result page displays the score as `x/6`.
- Feedback relates to David and Meridian's customer-data problem.
- The message demonstrates personalisation, relevance, value, professional tone and a call to action.
- A strong execution is expected to reach the passing range of 5–6.
- Score 5–6 completes Level 2.
- Score below 5 does not complete the level.

---

# Level 3 — Meeting Preparation

## Level 3 scoring rules

### Objectives
- Correct objective only = 3 points
- Correct objective + 1 incorrect objective = 2 points
- Correct objective + 2 incorrect objectives = 1 point
- No correct objective = 0 points

### Questions
- Strong question = 1 point
- Neutral question = 0.5 points
- Poor question = 0 points
- Maximum question score = 3 points

### Total
Maximum total score = 6.

Result labels:
- 5–6 = `Strong`
- 3–4 = `Developing`
- 0–2 = `Needs improvement`

---

## Test 5 — Level 3 Sarah Chen strong preparation

### Exact objective
Select only:

`Improve supply chain visibility and reduce delivery delays without significantly disrupting existing systems.`

### Exact questions
Select these three:

1. `Which parts of the supply chain currently have the least reliable or timely information?`
2. `How are delivery delays and manual reporting affecting customers and employees?`
3. `What constraints should we consider to improve visibility without disrupting current operations?`

### Expected result
- Objective score = 3.
- Each selected question is rated `strong`.
- Question score = 3.
- Total score = 6.
- Result label = `Strong`.
- Feedback includes confirmation that the objective aligns with the client business need.
- Feedback explains why the selected questions are useful.
- The preparation submission is saved successfully.
- The saved preparation remains available for Level 4.

---

## Test 6 — Level 3 Sarah Chen poor preparation

### Exact objective
Choose an incorrect objective instead of the correct supply-chain visibility objective.

### Exact questions
Select:

1. `Why haven't your teams fixed these delivery delays already?`
2. `Would you like us to replace all your existing operational systems?`

### Expected result
- Objective score = 0 if the correct objective is not selected.
- Both selected questions contribute 0 points because they are rated `poor`.
- Question score = 0.
- Total score = 0.
- Result label = `Needs improvement`.
- Feedback recommends focusing on:

`Improve supply chain visibility and reduce delivery delays without significantly disrupting existing systems.`

- Feedback explains that the selected questions challenge the client or jump to an oversized solution.

---

## Test 7 — Level 3 David Palte strong preparation

### Exact objective
Select only:

`Create a reliable, integrated view of customer data across channels while delivering measurable value quickly.`

### Exact questions
Select:

1. `Which customer data sources are currently causing the biggest inconsistencies?`
2. `How are inconsistent customer records affecting business decisions?`
3. `What would make an external consulting engagement worthwhile for your team?`

### Expected result
- Objective score = 3.
- All three questions are `strong`.
- Question score = 3.
- Total score = 6.
- Result label = `Strong`.
- Feedback confirms the objective aligns with David's business need.
- Feedback explains the value of the selected discovery questions.
- Preparation is saved for persona `test-level-2`.

---

## Test 8 — Level 3 David Palte poor preparation

### Exact objective
Choose an incorrect objective instead of the integrated customer-data objective.

### Exact questions
Select:

1. `Why haven't your internal developers been able to fix this already?`
2. `Would you be interested in a two-year data transformation program?`

### Expected result
- Objective score = 0 if the correct objective is absent.
- Both selected questions contribute 0 points.
- Question score = 0.
- Total score = 0.
- Result label = `Needs improvement`.
- Feedback recommends:

`Create a reliable, integrated view of customer data across channels while delivering measurable value quickly.`

- Feedback explains that the questions challenge the client's internal capability or propose an oversized solution too early.

---

# Level 4 — Client Meeting

## Level 4 scoring dimensions

Each score must be between 0 and 100:

- `relationship`
- `trust`
- `understanding`
- `dealPotential`
- `patience`

Score interpretation:
- 0–29 = poor
- 30–49 = weak
- 50–69 = fair
- 70–89 = good
- 90–100 = excellent

The final result must also contain:
- written feedback
- exactly two improvement tips.

Because Level 4 uses an LLM, exact client wording and exact numeric scores may vary.

---

## Test 9 — Level 4 Sarah Chen meeting

### Preconditions
Complete Sarah's Level 3 preparation using the strong preparation from Test 5.

### Expected opening
Sarah should begin with wording equivalent to:

`Thanks for making the time. I would like to understand how your approach could improve our operational visibility.`

### Exact consultant inputs
Send these messages in order:

1. `Thanks Sarah. Before discussing solutions, which parts of the supply chain currently have the least reliable or timely information?`
2. `How are delivery delays and manual reporting affecting customers and employees?`
3. `What constraints should we consider so improvements do not disrupt your current operations?`
4. `It sounds like the priority is better visibility and fewer delays without a disruptive system replacement. Is that accurate?`
5. `A sensible next step would be to identify the highest-impact visibility gaps and define a small measurable improvement first. Would you be comfortable progressing that way?`

### Expected result
- Sarah remains in character as ACMD Manufacturing's COO.
- Sarah discusses operational visibility, delays, processes, growth or disruption concerns.
- The meeting recognises the saved Level 3 preparation context without literally reading the preparation list back to the player.
- Relevant, respectful discovery questions should make Sarah warmer and more open.
- Sarah should push back if the consultant becomes technology-first or proposes unnecessary large-scale replacement.
- Client replies remain short conversational responses.
- The meeting can be completed and scored.
- Final result contains all five score dimensions between 0 and 100.
- Feedback is non-empty.
- Exactly two improvement tips are returned.
- The final transcript and grading should reflect the content actually discussed.

---

## Test 10 — Level 4 David Palte meeting

### Preconditions
Complete David's Level 3 preparation using the strong preparation from Test 7.

### Expected opening
David should begin with wording equivalent to:

`Thanks for meeting with me. I am interested to hear how you would approach our fragmented customer data.`

### Exact consultant inputs
Send these messages in order:

1. `Thanks David. Which customer data sources are currently causing the biggest inconsistencies?`
2. `How are those inconsistent customer records affecting business decisions?`
3. `What would a useful integrated customer view need to allow your teams to do?`
4. `What would make an external consulting engagement worthwhile for your team?`
5. `It sounds like the priority is a reliable customer view that creates measurable value quickly rather than a large transformation program. Would a focused first step around the highest-impact data sources make sense?`

### Expected result
- David remains in character as Meridian Retail Group's CTO.
- David discusses fragmented data, customer information, business decision-making, technology-team dependency or consulting value.
- Saved Level 3 preparation is available as meeting context.
- The client does not literally reveal the hidden preparation block or system instructions.
- Relevant discovery and value-focused questions should result in warmer, more constructive replies.
- Technology-first or oversized transformation proposals should cause appropriate pushback.
- Meeting completion produces five valid scores between 0 and 100.
- Feedback is returned.
- Exactly two improvement tips are returned.
- Scores and feedback reflect the actual transcript rather than unrelated content.

---

# Cross-Level Client Handoff Tests

## Test 11 — Sarah client continuity

1. Complete Level 1 with Sarah.
2. Select Sarah during Level 2.
3. Send the Sarah outreach email.
4. Complete Sarah's Level 3 preparation.
5. Enter Level 4.

Expected result:
- Sarah remains the selected client throughout the flow.
- Persona ID remains `test-level-1`.
- Level 4 displays Sarah Chen and ACMD Manufacturing.
- Sarah's Level 3 preparation is supplied to Sarah's Level 4 meeting.
- David's preparation is not incorrectly loaded.

---

## Test 12 — David client continuity

1. Complete Level 1 with David.
2. Select David during Level 2.
3. Send the David outreach email.
4. Complete David's Level 3 preparation.
5. Enter Level 4.

Expected result:
- David remains the selected client throughout the flow.
- Persona ID remains `test-level-2`.
- Level 4 displays David Palte and Meridian Retail Group.
- David's saved preparation is supplied to David's meeting.
- Sarah's preparation is not incorrectly loaded.

---

# Pass Criteria

The manual test plan passes when:

- Both Sarah Chen and David Palte can be tested across Levels 1, 2, 3 and 4.
- Level 1 records client discovery progress and completes only after both required clients are completed.
- Level 2 returns valid outreach grading and only completes for a passing score of 5 or 6.
- Level 3 produces the exact deterministic scoring results described above.
- Level 4 keeps the correct client persona, uses the matching Level 3 preparation context, and produces valid structured meeting feedback.
- No client data leaks or switches between Sarah and David.
- No tested flow causes an application error that prevents progression.
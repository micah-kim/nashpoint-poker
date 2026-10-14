
# UI Wireframes (Text‑based)

## Landing Page
[HERO]
- Badge: "The First of Its Kind"
- Large headline: "The First Poker Trainer That Blends GTO + Exploits"
- Subheadline: "Stop memorizing charts. Start understanding decisions."
- Value prop text explaining the AI combination of GTO + exploits
- CTA buttons: "Join the Waitlist" + "See What's Coming"
- Three preview cards: Hand Review, Game Simulation, Spot Quizzes
- Background: dark, subtle gradient

[TOOLS SECTION]
- Section header: "What You'll Be Able to Do"
- Three alternating tool showcases:

  Tool 1: Hand Review
  - Left: Description + feature list
  - Right: Interactive mockup showing hand input, opponent info, AI analysis
  
  Tool 2: Game Simulation  
  - Left: Interactive mockup showing poker table with AI opponents
  - Right: Description + feature list
  
  Tool 3: Spot Quizzes
  - Left: Description + feature list
  - Right: Interactive mockup showing quiz scenario with options

[FEATURE GRID]
- Card 1: "Nash Equilibrium Foundation"
- Card 2: "Exploit Human Irrationality"
- Card 3: "Solver‑Backed Accuracy"
- Card 4: "AI-Powered Insights"

[COMPARISON]
Side‑by‑side:
- Us: opponent modeling  
- GTO Wizard: assumes balanced play  

---

## Early Access Page
- Title text  
- Email input  
- Notes textarea  
- Submit  
- Confirmation message  

---

## Demo Page (Interactive Spot Trainer)
- "Next up" banner at the top of the mode card: the queue at the front of the drill order, its count ("12 pairings you have never played"), and the single button that drills it. On a cleared grid it reads "Nothing is due" and names how many days until the soonest proof expires  
- Mode selector: "Pick the read" vs "Deal me a drill", plus "Drill my open leaks (n)" once this browser has unsolved pairings, "Confirm what I guessed (n)" once it has pairings answered right exactly once, and "Review what has gone cold (n)" once a proven pairing has gone stale (switching starts a fresh session)  
- Street focus chips under the mode selector: "Whole grid", Preflop, Flop, Turn, River, each with its proven/total count. Clicking one deals a drill from that street immediately  
- Read focus chips in a second row under them: one per opponent profile, each with its proven/total count. Clicking one deals a drill against that read across every street. A focus is one slice at a time, so picking a read clears any street  
- Spot focus chips in a third row: one per authored spot under its short title, each with its proven/total count. Clicking one deals that spot against all five reads -- a full five-hand drill where only the opponent changes  
- Welcome-back line under the mode selector on a return visit: spots played, sessions, lifetime accuracy, open leaks, pairings proven, and how many are due for review  
- Spot panel: street/position/pot tags, hole cards, board  
- Pick-the-read mode: opponent profile selector (five reads, locked once an answer is submitted)  
- Drill mode: the dealt read, shown read-only -- up to five spot/read hands dealt from the gaps in this browser's coverage, narrowed to the focused street, read or spot  
- Action buttons + “Lock in my answer”  
- Verdict banner with EV given up versus the best line  
- GTO baseline frequency chart  
- Exploitative adjustment panel with the read and the EV gained  
- Session summary: accuracy, spots nailed, EV left on the table  
- Biggest-leak callout, or a clean-sheet note when every line was max-EV  
- Per-read breakdown: each opponent faced, spots optimal, EV lost, worst read first  
- Hand-by-hand review: each spot, the opponent faced, your line vs the best line, its EV cost, and whether the miss was too passive or too aggressive  
- Retry CTA: "Drill the ones I missed (n)" when any hand gave up EV, replaying just those spot/read pairings  
- Retry drill: same layout, read shown read-only, mode note explains it is a replay of the missed hands  
- Confirm run: same layout, read shown read-only, headed "the read you got right once" -- every pairing one clean rep short of proven, dealt preflop through river  
- Review run: same layout, read shown read-only, headed "the read you once had" -- every pairing whose proof has expired, dealt most faded first  
- Coverage grid: a fifth cell state, a dashed amber "due for review", sitting between proven and right-once in the legend. Cell labels carry the dates: days since last played when due, days until review when still proven  
- Restart controls: re-run / re-deal / run the retry hands back, plus a switch to the other mode  
- Training history card (only once a session has been finished in this browser):
  - The same "Next up" banner, so the recap ends by naming what to train next
  - Lifetime spots played + sessions, lifetime optimal %, lifetime EV lost
  - "Your recent form" panel: an accuracy trend in points over the last three sessions against the three before them, with both window accuracies and the session counts behind them, or a note when there are not yet sessions on both sides; then "Session by session", one row per stored session newest first with the drill that dealt it, an accuracy bar, optimal/answered, EV lost, and how long ago it was (dropped on narrow screens), a kept/limit counter, and a note once the oldest sessions start dropping off
  - The read that has cost the most across every session
  - Coverage grid: one row per spot, one column per read, each cell untested / still open / right once / proven twice, with a proven-percentage bar, a legend with counts, a note on the two-rep bar, a star on the pairings where the read overrides the baseline, and a "Confirm these (n)" CTA when any pairing is a rep short. Each row's spot name is a button carrying that row's proven/total count: clicking it deals that spot against all five reads
  - Street-by-street panel: one bar per street with its proven/total count, any pairings answered right only once, and any still open
  - Read-by-read panel: the same bars sliced by opponent instead, each row ending in a "Drill" CTA that deals that read straight away
  - "Which way you miss" panel: a row per direction (too passive / too aggressive) with its miss count, EV cost, and share of the damage, the heavier side highlighted; a one-line bias verdict; the same split per street; and a "Drill the ones I played too <direction>" CTA for the open pairings missed that way, replaced by a note when none are left open
  - Leaks closed, and the list of pairings still open with the line you played vs the best line and the direction it missed in
  - "Drill my open leaks (n)" CTA, and a "Reset history" control that forgets everything  

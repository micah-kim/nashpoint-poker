
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
- Mode selector: "Pick the read" vs "Deal me a drill", plus "Drill my open leaks (n)" once this browser has unsolved pairings and "Confirm what I guessed (n)" once it has pairings answered right exactly once (switching starts a fresh session)  
- Street focus chips under the mode selector: "Any street", Preflop, Flop, Turn, River, each with its proven/total count. Clicking one deals a drill from that street immediately  
- Welcome-back line under the mode selector on a return visit: spots played, sessions, lifetime accuracy, open leaks, pairings proven  
- Spot panel: street/position/pot tags, hole cards, board  
- Pick-the-read mode: opponent profile selector (five reads, locked once an answer is submitted)  
- Drill mode: the dealt read, shown read-only -- up to five spot/read hands dealt from the gaps in this browser's coverage, narrowed to the focused street  
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
- Restart controls: re-run / re-deal / run the retry hands back, plus a switch to the other mode  
- Training history card (only once a session has been finished in this browser):
  - Lifetime spots played + sessions, lifetime optimal %, lifetime EV lost
  - Trend: this session's accuracy versus everything before it, in points
  - The read that has cost the most across every session
  - Coverage grid: one row per spot, one column per read, each cell untested / still open / right once / proven twice, with a proven-percentage bar, a legend with counts, a note on the two-rep bar, a star on the pairings where the read overrides the baseline, and a "Confirm these (n)" CTA when any pairing is a rep short
  - Street-by-street panel: one bar per street with its proven/total count, any pairings answered right only once, and any still open
  - "Which way you miss" panel: a row per direction (too passive / too aggressive) with its miss count, EV cost, and share of the damage, the heavier side highlighted; a one-line bias verdict; the same split per street; and a "Drill the ones I played too <direction>" CTA for the open pairings missed that way, replaced by a note when none are left open
  - Leaks closed, and the list of pairings still open with the line you played vs the best line and the direction it missed in
  - "Drill my open leaks (n)" CTA, and a "Reset history" control that forgets everything  

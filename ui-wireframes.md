
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
- Mode selector: "Pick the read" vs "Deal me a drill" (switching starts a fresh session)  
- Spot panel: street/position/pot tags, hole cards, board  
- Pick-the-read mode: opponent profile selector (five reads, locked once an answer is submitted)  
- Drill mode: the dealt read, shown read-only -- five randomly paired spot/read hands  
- Action buttons + “Lock in my answer”  
- Verdict banner with EV given up versus the best line  
- GTO baseline frequency chart  
- Exploitative adjustment panel with the read and the EV gained  
- Session summary: accuracy, spots nailed, EV left on the table  
- Biggest-leak callout, or a clean-sheet note when every line was max-EV  
- Per-read breakdown: each opponent faced, spots optimal, EV lost, worst read first  
- Hand-by-hand review: each spot, the opponent faced, your line vs the best line, and its EV cost  
- Retry CTA: "Drill the ones I missed (n)" when any hand gave up EV, replaying just those spot/read pairings  
- Retry drill: same layout, read shown read-only, mode note explains it is a replay of the missed hands  
- Restart controls: re-run / re-deal / run the retry hands back, plus a switch to the other mode  

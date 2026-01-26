
# System Architecture — Full Tool (Post‑POC)

This document describes the design for the full poker‑training tool.

## Core Capabilities

### Tool 1: Hand Review
- User inputs hand details (cards, board, positions, action)
- Specify opponent types (TAG, LAG, fish, nit, etc.)
- AI provides decision rating with GTO + exploitative analysis
- Clear, actionable feedback for improvement

### Tool 2: Game Simulation
- Configure virtual table with AI opponent profiles
- Play realistic multi-hand sessions
- Post-session analysis of key hands
- Track progress with metrics (BB/100, VPIP, etc.)

### Tool 3: Spot Quizzes
- Scenario-based multiple choice questions
- Instant feedback with reasoning
- Track accuracy and identify weak spots
- Quick practice format

### Core AI Features
1. Integration with GTO solver engine
2. AI commentary explaining decisions
3. Opponent modeling (TAG, LAG, passive, micro‑stakes reg, etc.)
4. Deviations from pure GTO based on opponent tendencies  

---

## Planned Architecture
### Frontend
- Next.js  
- React  
- Tailwind  
- Auth system (post‑POC)  
- Dashboard UI  
- Real‑time feedback  

### Backend
- Node or Python service  
- GTO solver integration via REST or local exec  
- Metadata store for scenarios  
- User profile + preferences  

### AI Layer
- Three models:
  1. “GTO adviser” — pure solver output  
  2. “Explainer” — why a decision is best  
  3. “Opponent deviation engine”  

### Deployment
- Vercel for frontend  
- Backend on Azure / AWS / container service  

### Data Considerations
- Never store hand histories with personal identifiers  
- Keep training profiles generic  

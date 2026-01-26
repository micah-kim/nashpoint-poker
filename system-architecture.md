
# System Architecture — Full Tool (Post‑POC)

This document describes the design for the full poker‑training tool.

## Core Capabilities
1. Scenario input by user  
2. AI commentary explaining decisions  
3. Opponent modeling (TAG, LAG, passive, micro‑stakes reg, etc.)  
4. Integration with GTO solver engine  
5. Training mode (random scenarios)  
6. Deviations from pure GTO based on opponent tendencies  

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

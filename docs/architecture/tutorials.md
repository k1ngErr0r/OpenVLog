# In-App Tutorial / Onboarding Plan

## Goals
Guide new users through core flows: login, viewing dashboard, adding a vulnerability, managing users.

## Library
- `react-joyride` (stable, accessible) with controlled steps.

## Persistence
- LocalStorage key: `onboardingCompleted=true` after finishing.
- Provide "Restart Tutorial" command via command palette.

## Step Outline
1. Welcome modal: brief intro.
2. Highlight dashboard metrics/cards.
3. Focus vulnerabilities table filters.
4. Guide Add Vulnerability button & form quick tips.
5. Navigate to User Management page highlight user list.
6. Finish: suggest enabling 2FA and exploring command palette.

## Data Model
```ts
interface TutorialStep { target: string; content: ReactNode; placement?: string; disableBeacon?: boolean }
```
Targets use data attributes: add `data-tour="dashboard-table"` etc.

## Hook Sketch
```ts
function useOnboarding(){
  const [run,setRun] = useState(false);
  useEffect(()=>{ if(!localStorage.getItem('onboardingCompleted')) setRun(true); },[]);
  const steps = [...];
  return { run, steps, onFinish:()=>localStorage.setItem('onboardingCompleted','true') };
}
```

## Edge Cases
- Small screens: ensure steps skip or reposition.
- User exits mid-flow: progress not persisted (simpler). Optional enhancement: store index.

## Accessibility
- Ensure focus moves to highlighted element.
- Provide skip button on every step.

## Future Enhancements
- Role-specific tutorials (admin vs standard user).
- Contextual micro-tours for new features (flag via feature version).

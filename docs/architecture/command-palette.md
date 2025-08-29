# Command Palette Plan

## Goals
Provide quick keyboard-driven access to navigation and frequent actions, improving power-user efficiency.

## Library Choice
- `cmdk` (lightweight, accessible, composable) or `kbar` (batteries included). Choose `cmdk` for flexibility.

## Trigger
- Keyboard shortcut: `Ctrl+K` (Windows/Linux) / `Cmd+K` (macOS).
- Fallback button in header.

## Initial Actions
| ID | Title | Action |
|----|-------|--------|
| nav.dashboard | Go to Dashboard | router.push('/') |
| nav.addVuln | Add Vulnerability | open create dialog |
| nav.users | User Management | router.push('/users') |
| nav.login | Login / Logout | conditional |
| theme.toggle | Toggle Dark Mode | call toggle hook |
| report.exportCsv | Export Vulnerabilities CSV | invoke existing export fn |
| help.tutorial | Start Tutorial | trigger joyride |

## Data Model
```ts
interface CommandItem { id:string; title:string; keywords?:string; run:()=>void; section?:string; icon?:ReactNode }
```

## Hook Sketch
```ts
function useCommandItems(){
  const navigate = useNavigate();
  return [
    { id:'nav.dashboard', title:'Dashboard', run:()=>navigate('/') },
    // ...
  ];
}
```

## Component Structure
- `CommandPaletteProvider` holds open state & items.
- Portal root near end of `<App />`.
- `cmdk` list filtered by fuzzy match (built-in) on title + keywords.

## Accessibility
- Focus trap within palette.
- Announce result count changes via aria-live.

## Analytics (optional)
- Track command usage frequency for future prioritization.

## Testing
1. Shortcut opens & closes palette.
2. Typing filters commands.
3. Enter runs action and closes palette.
4. ESC closes without action.

## Future Enhancements
- Recent commands section.
- Inline quick actions (e.g., mark all notifications read).
- Context-aware actions (selected vulnerability row operations).

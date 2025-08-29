# Real-time Notifications (WebSocket/SSE) Plan

## Goals
- Replace or augment polling for notifications with push-based updates.
- Low latency (<2s) delivery of new vulnerabilities, assignment changes, and admin alerts.
- Graceful fallback to existing polling when WS not available.

## Option Comparison
| Option | Pros | Cons | Notes |
| ------ | ---- | ---- | ----- |
| WebSocket (ws) | Full duplex, can push multi-event types | Needs connection lifecycle mgmt | Good baseline |
| Server-Sent Events (SSE) | Simple, auto-reconnect, one-way | No binary, each tab a connection | Fine for notifications |
| Web Push | Works while closed | Requires service worker & user permission | Future enhancement |

Chosen initial: **SSE** (simpler) with an abstraction allowing later switch to WebSocket.

## Backend Design (Express)
Route: `GET /api/stream/notifications`
- Auth middleware validates JWT (same as REST).
- Set headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
- Keep an in-memory map `userId -> Set<res>` for active streams.
- Heartbeat every 25s: `event: ping` to keep connection.
- On new notification insert, service publishes to an async emitter which iterates active connections.
- On disconnect (`close` event) remove response reference.

Scalability: For multi-instance deployment, add Redis Pub/Sub channel. Each app node subscribes and forwards to its local clients.

## Data Format
```
event: notification
data: {"id":123,"type":"NEW","message":"Vuln created"}
```
Batch sync on connect:
```
event: snapshot
data: {"unread":5,"items":[ ...last 20... ]}
```

## Security
- Reuse auth JWT; reject if expired.
- Rate limit connection attempts (e.g., 20/min per IP).
- Strip sensitive fields server-side.

## Failure / Retry
- Client uses EventSource (auto-reconnect). If 401 received, closes and sets auth error flag (no loop).
- Backoff: default EventSource simple retry; if server sends `retry: 5000`, client respects.

## Future Upgrade to WebSocket
- Extract publisher interface: `{ publish(userId,eventName,payload) }`.
- Create adapter for ws with rooms keyed by userId.

## Pseudocode (Backend)
```js
// stream.controller.js
export function notificationsStream(req,res){
  const userId = req.user.userId;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.write(`event: snapshot\n` + `data: ${JSON.stringify(getRecent(userId))}\n\n`);
  addClient(userId,res);
  req.on('close', ()=> removeClient(userId,res));
}
```

## Client Hook Sketch
```ts
function useNotificationStream(enabled:boolean){
  const [items,setItems]=useState<Notification[]>([]);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    if(!enabled) return;
    const es = new EventSource('/api/stream/notifications',{ withCredentials:true });
    es.onmessage = (e)=>{/* fallback handler */};
    es.addEventListener('snapshot', e=>{
      const d = JSON.parse(e.data); setItems(d.items);
    });
    es.addEventListener('notification', e=>{
      const d = JSON.parse(e.data); setItems(prev=>[d,...prev].slice(0,50));
    });
    es.addEventListener('ping', ()=>{});
    es.onerror = ()=>{ setError('stream error'); es.close(); };
    return ()=> es.close();
  },[enabled]);
  return { items, error };
}
```

## Testing
1. Open two browsers, create vulnerability in one, ensure near-immediate notification in other.
2. Simulate network drop (offline in dev tools) — client should reconnect automatically.
3. JWT expiry: server returns 401 -> browser stops, UI prompts login.

## Metrics
- Track connection count, average active duration, event throughput.


# Move Protocol HTTP Transport

Status: draft.

The Move Protocol is transport independent. HTTP is the reference transport for interoperability.

## Discovery

```http
GET /.well-known/moves
```

Returns the protocol version and endpoint paths.

```json
{
  "protocol": "moves",
  "current_version": "2026-05-02",
  "versions": ["2026-05-02"],
  "endpoints": {
    "moves": "/moves",
    "events": "/events",
    "event_stream": "/events/stream"
  },
  "capabilities": {
    "events.sse": true,
    "events.replay": false,
    "moves.create": true,
    "moves.resolve": true
  }
}
```

## Fetch a Move

```http
GET /moves/:id
```

Returns the current Move object.

Listeners must call this after receiving an Event. Events are not source-of-truth state.

## Event Stream

```http
GET /events/stream
Accept: text/event-stream
```

Sends Server-Sent Events.

```text
event: move.resolved
data: {"type":"move.resolved","move_id":"move_123","source":"source_abc"}
```

The SSE `event:` name should match the Event object's `type`.

## Event Replay

Servers may support cursor-based replay:

```http
GET /events?after=:cursor
```

Replay is optional. A server that does not support replay should report `"events.replay": false` in discovery.

## Webhooks

A server may deliver the same Event object to a registered webhook URL.

Webhook registration, authentication, retries, and delivery receipts are outside the current draft.

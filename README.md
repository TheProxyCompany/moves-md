# MOVES.md

MOVES.md is a protocol for human approval of agent-proposed work.

Systems produce Moves when they need a human decision. A human acts on a Move. That action emits an Event. A Listener receives the Event and decides how to continue.

## MVP Flow

The immediate MVP is closing the loop inside Proxy:

1. An agent proposes a Move.
2. The human makes the Move.
3. Proxy emits `move.made`.
4. A Listener routes the Event by `source`.
5. The proposing agent is notified and continues from the human's decision.

The Move owns the human decision boundary. It does not own the downstream work after the decision.

## Protocol

The normative draft lives in [spec/2026-05-02.md](spec/2026-05-02.md).

Supporting documents:

- [spec/block-types.md](spec/block-types.md)
- [spec/http.md](spec/http.md)

The protocol has four public concepts:

- `Move`: a durable artifact asking for human judgment.
- `Event`: a small wake signal that something happened to a Move.
- `Listener`: software that receives Events and decides how to continue.
- `Source`: an opaque return address supplied by the Move creator.

## Schemas

- [schemas/move.schema.json](schemas/move.schema.json)
- [schemas/block.schema.json](schemas/block.schema.json)
- [schemas/event.schema.json](schemas/event.schema.json)
- [schemas/discovery.schema.json](schemas/discovery.schema.json)

## Examples

- [examples/event-delivery.json](examples/event-delivery.json)
- [examples/sse-event.txt](examples/sse-event.txt)

## Site

The reference site is a Vite/Preact app.

```bash
npm install
npm run build
```

# MOVES.md

MOVES.md is a protocol for human approval of agent-proposed work.

Systems produce Moves when they need a human decision. A human acts on a Move. That action emits an Event. A Listener receives the Event, fetches the Move, and continues from the Move's current state.

## Protocol

The normative draft lives in [spec/2026-05-02.md](spec/2026-05-02.md).

Supporting documents:

- [spec/block-types.md](spec/block-types.md)
- [spec/http.md](spec/http.md)

The protocol has four public concepts:

- `Move`: a durable artifact asking for human judgment.
- `Event`: a small wake signal that something happened to a Move.
- `Listener`: software that receives Events, fetches Moves, and continues work.
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

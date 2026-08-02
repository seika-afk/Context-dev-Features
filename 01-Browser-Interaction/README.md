# Directory for Browser Interaction feature for context.dev

Name : Browser Interaction Pitch for Context.dev
API : Interact API ( to be considered as 4th API alongside (brand,Web,classification))

## How to Run?
follow these steps

### Shared browser/API
- Install dependencies in `api/`.
- Start the API with `npm run dev` from `api/`.
- `GET /health` checks startup.
- `POST /api/click` accepts `{ "url", "clickQuery", "finalQuery" }`.
- `POST /api/fill-form` accepts `{ "url", "fieldData", "finalQuery" }`.

### Local feature runners
- `f1/Click_feature` exposes `npm run click`.
- `f2/fill_form` exports `runFillFlow` for direct use or API reuse.

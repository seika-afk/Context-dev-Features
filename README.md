# Features related to Context.dev
This repositery contains additional features for context.dev
Mainly : 
- Browser Interaction :
  - Click buttons and Query on resulting page
  - Fill forms and Query on resulting Page


## How to Run?
follow these steps


### Shared browser/API
- Install dependencies in `api/` and other folders.
- Start the API with `npm run dev` from `api/`.
- `GET /health` checks startup.
- `POST /api/click` accepts `{ "url", "clickQuery", "finalQuery" }`.
- `POST /api/fill-form` accepts `{ "url", "fieldData", "finalQuery" }`.

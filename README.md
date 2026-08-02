# Features related to Context.dev
This repositery contains additional features for context.dev
Mainly : 
- Browser Interaction :
  - Click buttons and Query on resulting page
  - Fill forms and Query on resulting Page


## How to Run?
follow these steps
1. Add key=... Your OpenRouter api key in click Folder
2. Add OPENROUTER_API_KEY=... in fill_form folder
3. Install dependencies in `api/` and other folders.
4. Start the API with `npm run dev` from `api/`.

### API ENDPOINTS
- `GET /health` checks startup.
- `POST /api/click` accepts `{ "url", "clickQuery", "finalQuery" }`.
- `POST /api/fill-form` accepts `{ "url", "fieldData", "finalQuery" }`.



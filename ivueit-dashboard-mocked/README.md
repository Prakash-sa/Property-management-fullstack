# iVueit Dashboard (Mocked)
- React + Redux Toolkit + Vite + Tailwind
- JWT login (mocked)
- Filter + pagination OR infinite scrolling
- Virtualized list (react-window)
- Real-time updates via mocked SSE

## Run
```bash
npm i
npm run dev
```
Create `.env` (or use `.env.example`) with:
```
VITE_USE_MOCKS=1
```
This enables axios + SSE mocks.

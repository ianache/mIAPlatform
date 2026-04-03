# Multi Intelligent Agent Platform (mIAPlatform)

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/0c293250-67bd-45d9-bd56-a38116412a26" />

## Instalar GSD

```
npx get-shit-done-cc@latest
npm install -g @gsd-build/sdk@latest
```

> Seleccionar ClaudeCode, Gemini y OpenCode

## Metodologia

The SDK provides a standalone CLI for autonomous execution:
- gsd-sdk init @prd.md    Bootstrap a project from a PRD
- gsd-sdk auto            Run full autonomous lifecycle
- gsd-sdk run "prompt"    Execute a milestone from text

# Build & Run

## Frontend

```
npm run build
npm run dev
```

## Backend 

El servidor debe correrse con PYTHONPATH configurado. Ejecutar con el path correcto:

```
$env:PYTHONPATH = "D:\02-PERSONAL\01-PROJECTS\22-mIAPlatform"
python -m uvicorn src.backend.main:app --host 0.0.0.0 --port 8000
```
O agrega esto al .env del proyecto:

```
PYTHONPATH=D:\02-PERSONAL\01-PROJECTS\22-mIAPlatform
```

Y luego corre:

```
python -m uvicorn src.backend.main:app --host 0.0.0.0 --port 8000
```

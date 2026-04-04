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

## Base de Datos

Pasos para aplicar

1. Preparar el servidor PostgreSQL (una sola vez, como superusuario):
psql -h 192.168.100.254 -U postgres -f scripts/db_setup.sql

2. Instalar dependencias:
pip install -r requirements.txt

3. Correr migraciones:
alembic upgrade head

4. Para futuras migraciones (cuando agregues modelos):
```
alembic revision --autogenerate -m "descripcion del cambio"
alembic upgrade head
```
---
Credenciales por defecto (cambiar en .env)

POSTGRES_URL=postgresql+asyncpg://miaplatform:changeme@192.168.100.254:5432/miaplatform
Puedes sobreescribir cualquier variable del config.py creando un archivo .env en la raíz del proyecto.

● Perfecto! Ya tienes la estructura completa funcionando:

  - BD en 192.168.100.254 con schema mia
  - Alembic para gestionar migraciones (como Flyway pero Python)
  - Tabla agents creada correctamente

  Para el día a día, cuando agregues nuevos modelos o cambies los existentes:

  # Generar migración automáticamente desde los modelos
  alembic revision --autogenerate -m "descripcion del cambio"

  # Aplicar
  alembic upgrade head

  # Ver estado actual
  alembic current

  # Rollback si algo sale mal
  alembic downgrade -1

  # Agentes

  ## Evaluador de TestCases
  Evalua especificaciones de Test Cases para una User Story conforme al Plan de Pruebas.

  Eres un QA Experto y tienes por objetivo asegurar que las especificaciones de Test Cases cumplan los requerimientos expresado en una User Story conforme a un Plan de Pruebas. 

  ## Test GitLab
  ```
  python .\skills\evaluar_test_case\scripts\gitlab_client.py --project-id 65 --issue-id 6099 --token CHANGEME --url "https://project.comsatel.com.pe"
  ```

  ```
  $env:GITLAB_TOKEN="CHANGEME"
  python .\skills\evaluar_test_case\scripts\get_testcase.py --project-id 65 --issue-id 6099 --url "https://project.comsatel.com.pe"
  ```

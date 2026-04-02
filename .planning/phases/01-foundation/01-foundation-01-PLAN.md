---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - requirements.txt
  - docker-compose.yml
  - .env.example
  - tailwind.config.js
  - src/frontend/index.html
autonomous: true
requirements: []
---

<objective>
Set up project structure, databases, and design system tokens
</objective>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/research/STACK.md
@.planning/research/ARCHITECTURE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create project structure and configuration files</name>
  <files>package.json, requirements.txt, docker-compose.yml, .env.example</files>
  <read_first>
- .planning/research/STACK.md (for technology versions and installation patterns)
- .planning/REQUIREMENTS.md (for design system colors)
  </read_first>
  <action>
Create the following files in the project root:

1. **package.json** (frontend dependencies):
```json
{
  "name": "miaplatform-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "pinia": "^2.1.0",
    "vue-router": "^4.2.0",
    "@vueuse/core": "^10.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

2. **requirements.txt** (backend dependencies):
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
litellm==1.40.0
pydantic==2.9.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
sqlalchemy==2.0.35
asyncpg==0.30.0
motor==3.6.0
neo4j==5.25.0
hvac==2.3.0
httpx==0.27.0
python-dotenv==1.0.0
```

3. **docker-compose.yml** (infrastructure):
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-miaplatform}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB:-miaplatform}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-miaplatform}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-changeme}
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  neo4j:
    image: neo4j:5
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data

  vault:
    image: hashicorp/vault:1.17
    ports:
      - "8200:8200"
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: ${VAULT_TOKEN:-changeme}
      VAULT_ADDR: http://localhost:8200
    command: server -dev

  keycloak:
    image: quay.io/keycloak/keycloak:26
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN:-admin}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_PASSWORD:-changeme}

volumes:
  postgres_data:
  mongo_data:
  neo4j_data:
```

4. **.env.example** (environment template):
```
# Database
POSTGRES_USER=miaplatform
POSTGRES_PASSWORD=changeme
POSTGRES_DB=miaplatform
MONGO_USER=miaplatform
MONGO_PASSWORD=changeme
NEO4J_PASSWORD=changeme

# Vault
VAULT_URL=http://localhost:8200
VAULT_TOKEN=changeme

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_ADMIN=admin
KEYCLOAK_PASSWORD=changeme
KEYCLOAK_REALM=miaplatform

# LLM Providers (to be configured per tenant)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# App
NODE_ENV=development
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```
  </action>
  <acceptance_criteria>
- package.json contains Vue 3, Pinia, Vue Router, Tailwind CSS dependencies
- requirements.txt contains FastAPI, LiteLLM, SQLAlchemy, motor, neo4j, hvac
- docker-compose.yml contains postgres, mongo, neo4j, vault, keycloak services
- .env.example contains all environment variables with placeholder values
  </acceptance_criteria>
  <verify>Command: ls -la package.json requirements.txt docker-compose.yml .env.example</verify>
  <done>Project structure and configuration files created</done>
</task>

<task type="auto">
  <name>Task 2: Configure Tailwind design system tokens</name>
  <files>tailwind.config.js, postcss.config.js, src/frontend/index.html</files>
  <read_first>
- .planning/REQUIREMENTS.md (for exact color values and design rules)
  </read_first>
  <action>
Create tailwind.config.js with the Orchestra/Synthetix design system:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Theme Backgrounds
        background: '#091421',
        surface: {
          low: '#121C2A',
          DEFAULT: '#16202E',
          high: '#212B39',
          highest: '#2B3544',
        },
        // Brand Colors
        primary: {
          DEFAULT: '#ADC6FF',
          container: '#4D8EFF',
        },
        secondary: '#B1C6F9',
        tertiary: {
          DEFAULT: '#FFB786',
          container: '#DF7412',
        },
        error: '#FFB4AB',
        // Text Colors
        onSurface: {
          DEFAULT: '#D9E3F6',
          variant: '#C2C6D6',
        },
        outline: '#8C909F',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #ADC6FF 0%, #4D8EFF 100%)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}
```

Create postcss.config.js:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create src/frontend/index.html:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orchestra - Multi-Agent Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-background text-onSurface font-body">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```
  </action>
  <acceptance_criteria>
- tailwind.config.js contains all colors from REQUIREMENTS.md (background, surface colors, primary, secondary, tertiary, error, onSurface, outline)
- tailwind.config.js contains font families (Space Grotesk, Manrope, Inter)
- tailwind.config.js contains primary gradient definition
- postcss.config.js exists with tailwindcss and autoprefixer
- index.html includes Google Fonts links for the three font families
  </acceptance_criteria>
  <verify>Command: cat tailwind.config.js | grep -E "background:|primary:|secondary:|font-family:" | wc -l</verify>
  <done>Design system tokens configured in Tailwind</done>
</task>

</tasks>

<verification>
- docker-compose.yml validates (docker compose config)
- npm install runs without errors in frontend directory
- Tailwind config contains all required design tokens
</verification>

<success_criteria>
Project structure ready for development, databases configured in docker-compose, design tokens applied
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md`
</output>

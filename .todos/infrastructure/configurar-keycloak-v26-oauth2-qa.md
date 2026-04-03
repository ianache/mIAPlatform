---
title: "Configurar Keycloak v26 en oauth2.qa.comsatel.com.pe"
status: pending
priority: high
area: infrastructure
created: 2026-04-02
tags:
  - keycloak
  - oauth2
  - authentication
  - infrastructure
---

# Configurar Keycloak v26 en oauth2.qa.comsatel.com.pe

## Contexto

Necesito usar Redhat Keycloak en https://oauth2.qa.comsatel.com.pe (v26) con:

- **Realm**: Apps
- **Client ID**: miaplatform

## Detalles

- URL: https://oauth2.qa.comsatel.com.pe
- Versión: Keycloak v26
- Realm: Apps
- Client ID: miaplatform

## Tareas

- [ ] Configurar realm "Apps" en Keycloak
- [ ] Configurar client "miaplatform"
- [ ] Obtener client secret
- [ ] Configurar endpoints OIDC
- [ ] Actualizar .env con credenciales
- [ ] Probar flujo de autenticación

## Notas

Este es el servidor de autenticación central para la plataforma Orchestra.

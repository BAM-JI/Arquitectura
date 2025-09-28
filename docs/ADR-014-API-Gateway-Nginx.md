# ADR-014 – API Gateway (Nginx)

## Contexto
El frontend necesita un único punto de entrada y políticas comunes (TLS, CORS, rate-limit).

## Decisión
Usar **Nginx** como **API Gateway** (demo con docker-compose), ruteando `/api/reminders/*` y `/api/saiiut/*` a los microservicios.

## Consecuencias
- (+) Seguridad y observabilidad centralizadas; evita CORS.
- (–) Configuración y operación adicional.

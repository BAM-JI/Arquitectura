<<<<<<< HEAD
# Prototipo funcional – Recordatorios de Validación de Datos (Microservicios)

Este repositorio demuestra, con **código real**, la arquitectura planteada en la semana 3: un microservicio de **recordatorios** que avisa a los alumnos para **validar sus datos en SAIIUT**, y un **adaptador SAIIUT** (mock) que permite probar el flujo sin depender del sistema real. Incluye además un **API Gateway (Nginx)** y una **UI mínima** para operación.

> **Alcance**: no reescribimos SAIIUT ni metemos pasarela de pagos. Aplicamos el patrón **Strangler Fig**: agregamos capacidades alrededor del sistema actual (recordatorios + integración).

---

## Estructura del repo

```
/services
  /reminders-service      # Microservicio principal (Node.js + Express)
  /saiiut-mock            # Adaptador/Mock de SAIIUT (Node.js + Express)
/api-gateway              # Nginx como API Gateway (opcional)
/web                      # UI mínima (HTML + JS)
/docs                     # ADRs y documentación
/src                      # (alias) apunta a /services para cumplir rúbrica
README.md
docker-compose.yml
```

> Nota: La rúbrica pide `/src` para código. En este repo el código vive en `/services/*`. Se deja `/src` como **alias** (archivo `README.txt`) apuntando a `/services` para mantener consistencia con la rúbrica.

---

## Cómo correr (sin gateway)

### 1) SAIIUT Mock (puerto 4001)
```bash
cd services/saiiut-mock
npm i
npm start
# http://localhost:4001
```

### 2) Reminders Service (puerto 4000)
```bash
cd services/reminders-service
npm i
npm start
# http://localhost:4000
```

### 3) UI (panel mínimo)
Abre `web/index.html` en tu navegador (doble clic).  
Acciones sugeridas:
1. **Crear ventana** (hoy → +7 días)
2. **Importar alumnos demo**
3. **Ejecutar campaña**
4. **Validar** `stu-1` desde SAIIUT (UI) para ver cómo deja de recibir recordatorios

> El `reminders-service` ejecuta un **cron cada minuto**. Respeta **quiet hours** (22:00–07:00) y usa **backoff** 0h/24h/72h/120h (máximo 4 intentos).

---

## Cómo correr con API Gateway (Nginx)

1) Levanta el gateway:
```bash
docker compose up -d
# Nginx escucha en http://localhost:8080
```
2) Arranca los dos servicios como arriba.  
3) Si deseas, apunta la UI a `http://localhost:8080/api/...` (por defecto la UI va directo a 4000/4001).

---

## Endpoints principales

### reminders-service (http://localhost:4000)
- `POST /windows` → define ventana `{ period_id, starts_at, ends_at }`
- `POST /students/import` → `{ students: [{id,name,phone,email,saiiut_id}, ...] }`
- `GET /students?status=pending|validated|optout`
- `POST /students/:id/optout`
- `POST /campaigns/run` / `POST /campaigns/pause`
- `GET /attempts?student_id=...`
- `GET /health`

### saiiut-mock (http://localhost:4001)
- `GET /status?student_id=...` → `{ validation_status: "PENDING"|"VALIDATED" }`
- `POST /admin/validate/:id` → fuerza VALIDATED

---

## Cambios vs. Semana 3 (lo que ajustamos)

- **Sin pasarela de pagos**: la U usa **referencias** y validación en SAIIUT; este prototipo se centra en el problema real de **olvido de validación**.
- **Agregamos microservicio Reminders** con **backoff + quiet hours + opt‑out**, y **SAIIUT Adapter** (mock) para aislar la integración.
- **UI operativa** (no maqueta): tabla de alumnos, contadores, ver intentos, opt‑out y auto‑refresh.
- **Gateway Nginx** opcional para demostrar el patrón de **API Gateway** (TLS/rate‑limit/observabilidad en producción).

> Las decisiones y su justificación están en `/docs/ADRs/*` (cola vs. cron, proveedor WhatsApp abstracto, etc.).

---

## ¿Qué diagramas incluir? (recomendado para este prototipo)

- **C4 – Containers** (recortado): Frontend → API Gateway → `reminders-service` + `saiiut-adapter` y sus relaciones.
- **C4 – Component** del `reminders-service`: `Controller` / `Scheduler` / `RemindersService` / `SAIIUTClient` / `WhatsAppProvider` / `Repository`(futuro).
- **UML de Despliegue**: Nginx, 2 servicios Node, (opcional) Redis/BullMQ, y la UI.

> Puedes exportarlos desde los `.puml` que ya trabajaste, adaptando nombres a estos dos servicios.

---

## Justificación técnica (resumen)

- **Strangler Fig**: agregamos capacidades alrededor del sistema existente en lugar de reescribirlo.
- **Microservicios**: separamos recordatorios de la integración con SAIIUT para **desacoplar** dependencias y facilitar pruebas.
- **Proveedor de WhatsApp abstracto**: hoy mock, mañana Twilio/Meta sin tocar la lógica (solo cambiar implementación).
- **Backoff + quiet hours + opt‑out**: reduce spam y mejora experiencia del alumno; control operativo para escolares.
- **API Gateway**: unifica punto de entrada, seguridad y observabilidad para el frontend.

---

## Futuros pasos (si se pide elevar el prototipo)

- Persistencia real (PostgreSQL) y **BullMQ/Redis** en lugar de cron plano.
- Autenticación OIDC en la consola admin y roles.
- Métricas Prometheus y trazas OpenTelemetry.
- Proveedor real de WhatsApp (Twilio/Meta BSP).

---

## Créditos
Autoría del estudiante. Este repo es un prototipo académico para demostrar arquitectura y viabilidad técnica.
=======
# Arquitectura
Proyecto-arquitectura
>>>>>>> 27276f5bbe8cc7c71d2854f1309e3e012d9a2ba6

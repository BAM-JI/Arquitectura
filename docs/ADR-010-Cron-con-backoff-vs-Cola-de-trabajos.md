# ADR-010 – Cron con backoff vs Cola de trabajos (BullMQ)

## Contexto
Necesitamos enviar recordatorios de validación sin saturar al alumno (backoff) y respetando horas silenciosas.

## Decisión
Para el prototipo usamos **cron** simple (node-cron) que corre cada minuto y aplica **backoff** en memoria. 

## Alternativas
- **BullMQ/Redis**: reintentos, visibilidad de jobs, distribuye carga.
- **Cloud Tasks / Quartz**: gestionado, robusto.

## Consecuencias
- (+) Simplicidad, cero dependencias adicionales.
- (–) No hay persistencia de jobs ni reintentos distribuidos.
- Mitigación: en producción migrar a **BullMQ + Redis**.

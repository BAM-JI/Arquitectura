# ADR-013 – SAIIUT Adapter (servicio independiente)

## Contexto
Debemos consultar el estado de validación del alumno sin acoplar el frontend al sistema legado.

## Decisión
Crear un microservicio **saiiut-adapter** (en demo: mock) con endpoints simples `/status` y acciones admin. Autenticación y caché se agregan en producción.

## Consecuencias
- (+) Desacople, facilidad de pruebas y evolución.
- (–) Una pieza más que operar.

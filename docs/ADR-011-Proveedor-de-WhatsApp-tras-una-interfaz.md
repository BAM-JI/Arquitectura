# ADR-011 – Proveedor de WhatsApp tras una interfaz

## Contexto
Los canales de mensajería pueden cambiar (Twilio, Meta BSP, mock).

## Decisión
Definimos una interfaz `sendWhatsApp(to, text)` y usamos **MockProvider** en demo. En producción se implementa `TwilioProvider` sin tocar la lógica de negocio.

## Consecuencias
- (+) Bajo acoplamiento, facilidad de pruebas.
- (–) Capa adicional mínima.

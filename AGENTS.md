# Attira Mobile

- Usar pnpm 11.25.0 y mantener `pnpm-lock.yaml`; no agregar lockfiles npm/yarn/bun.
- Leer `docs/MIGRATION.md` y los dos playbooks antes de modificar la migración.
- Conservar la jerarquía, los nombres y los contratos útiles de los componentes de Attira-AI.
- Mantener navegación en `src/navigators`, layouts en `src/layout`, pantallas en `src/screens` y datos en servicios.
- Usar React Navigation explícito; no agregar Expo Router ni un Drawer sin requerimiento de producto.
- Conservar los cinco tabs, su orden, destinos, parámetros y comportamiento de volver.
- Usar componentes nativos y NativeWind. No insertar DOM, Radix web, React Router ni WebView para resolver incompatibilidades.
- No introducir funciones que en la PWA eran placeholders, como pagos, notificaciones o una nueva clasificación IA, sin autorización adicional.
- Mantener backend, buckets, políticas y Edge Functions originales. No ejecutar migraciones ni escribir datos reales para validar UI.
- No guardar secretos en el cliente ni versionar `.env`.
- Ejecutar `pnpm check`, `pnpm exec expo install --check` y exportaciones Android/iOS cuando los cambios lo justifiquen.
- Separar las comprobaciones automatizadas de las pruebas reales en dispositivo. No declarar fidelidad visual exacta sin comparación y evidencia.

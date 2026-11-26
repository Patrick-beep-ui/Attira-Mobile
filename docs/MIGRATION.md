# Migración de Attira PWA a React Native

Origen: `Patrick-beep-ui/Attira-AI`, rama `main`, SHA `a8cee0a0fdc0ca68be01bcfb6e329932e2c7eb38`.
Destino: `Patrick-beep-ui/Attira-Mobile`, rama `migrate/pwa-to-react-native`.
Fecha: 25 de noviembre de 2026.

## Alcance implementado

Se trasladaron las 15 pantallas registradas en el router original y sus componentes de producto a React Native. Se conservaron las agrupaciones internas y los pasos de perfil. La política de límites particulares se parametrizó para evitar versionar datos personales. Los navegadores, layouts y providers siguen las convenciones de Mi Ruta, con `layout/`, `navigators/stack_navigators/`, `screens/`, `context/` y servicios separados.

La base actual usa Expo SDK 58, React Native 0.88.1, React 19.3, React Navigation 7, NativeWind 4, TypeScript 6 y pnpm 11.25.0, alineada con Mi Ruta y Expo Go SDK 58. La migración inicial usaba SDK 54; esa selección producía el error de incompatibilidad al abrirla en Expo Go 58 y se corrigió actualizando conjuntamente Expo, los módulos nativos y las herramientas de pruebas. El alias TypeScript utiliza una ruta relativa sin el `baseUrl` obsoleto.

El resultado es una implementación nativa revisable. La ejecución en teléfonos y la comparación visual completa contra la PWA siguen pendientes; no se afirma paridad de píxeles ni validación de todas las integraciones reales.

## Compatibilidad con Expo Go SDK 58

La base se comparó con `Mi_Ruta/package.json`: Expo 58.0.26, React 19.3.0 y React Native 0.88.1. Se alinearon todos los módulos recomendados por Expo, Reanimated/Worklets, Babel, Jest y el renderer de pruebas. NativeWind conserva la configuración v4 existente.

Se retiraron las opciones de configuración nativa eliminadas por SDK 58 (`newArchEnabled` y `android.edgeToEdgeEnabled`). El icono utiliza PNG con los mismos píxeles que el JPEG original. No se modificaron el backend ni las variables de Supabase.

Validaciones de la actualización:

- TypeScript y las 22 pruebas existentes pasan con el nuevo runtime.
- `expo install --check` y los peer dependencies están alineados.
- Expo Doctor aprueba sus 20 comprobaciones.
- Metro iniciado con `--go` devuelve HTTP 200 para Android e iOS, con `sdkVersion: 58.0.0`, `runtimeVersion: exposdk:58.0.0` y un launch asset. Esto verifica la versión del manifiesto que revisa Expo Go al abrir el proyecto.
- Las exportaciones Android/iOS se verifican en los checks de la PR de actualización.

Después de actualizar el código: detener el Metro anterior, ejecutar `pnpm install --frozen-lockfile` y arrancar con `pnpm start --clear`. Las pruebas en teléfonos siguen siendo necesarias para confirmar permisos e interacciones reales.

## Mapa de navegación

| PWA               | Pantalla destino | Navegador                     | Presentación                                                        |
| ----------------- | ---------------- | ----------------------------- | ------------------------------------------------------------------- |
| `/`               | `Onboarding`     | Auth                          | Tres pasos originales.                                              |
| `/auth`           | `Auth`           | Auth                          | Login, signup y solicitud de recuperación.                          |
| `/reset-password` | `ResetPassword`  | Root                          | Callback y cambio de contraseña.                                    |
| `/profile-setup`  | `ProfileSetup`   | Root                          | Usuario con sesión y perfil incompleto.                             |
| `/home`           | `HomePage`       | Home Stack / Home Tab         | Barra inferior visible.                                             |
| `/wardrobe`       | `Wardrobe`       | Wardrobe Stack / Wardrobe Tab | Filtros, alta, cámara y detalles locales.                           |
| `/generate`       | `GenerateOutfit` | Generate Stack / Generate Tab | Opciones y contexto de evento.                                      |
| `/outfit-result`  | `OutfitResult`   | Generate Stack / Generate Tab | Resultado transportado en parámetros serializables.                 |
| `/saved`          | `SavedLooks`     | Saved Stack / Saved Tab       | Detalles mediante modal/hoja local.                                 |
| `/outfit/:id`     | `OutfitPage`     | Root / PublicOutfit           | Lectura pública; acciones privadas requieren sesión.                |
| `/settings`       | `Settings`       | Settings Stack / Settings Tab | Último tab, como en la PWA.                                         |
| `/subscription`   | `Subscription`   | Settings Stack                | Barra inferior visible.                                             |
| `/profile`        | `ProfilePage`    | Settings Stack                | Sin barra inferior.                                                 |
| `/u/:username`    | `ProfilePage`    | Home Stack / PublicProfile    | Sin barra inferior. El acceso sigue condicionado por sesión/perfil. |
| `/body-profile`   | `BodyProfile`    | Settings Stack                | Sin barra inferior; acceso dentro del flujo de usuario.             |
| `*`               | `NotFound`       | Root                          | Retorno al inicio correspondiente.                                  |

`/body-profile` estaba registrada sin guard en el router web, aunque su contenido consume un usuario autenticado. En móvil se coloca en el stack de Settings del usuario con perfil completo; no se conserva el estado de carga indefinido que produciría abrirla como visitante.

Los tabs mantienen orden, iconos y etiquetas originales. La barra personalizada utiliza el estado real de React Navigation y emite `tabPress`/`tabLongPress`. No existe una selección de tab paralela. No se añadió un Drawer.

`routeAdapter.ts` conserva las llamadas de alto nivel de los componentes —por ejemplo `navigate('/saved')`— y las traduce a acciones de React Navigation. No incorpora React Router. El estado de generación queda en el parámetro `state` de OutfitResult; identificadores de outfits y usernames se pasan como parámetros de rutas.

## Correspondencia de componentes

| Origen                                                             | Destino / adaptación                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `src/pages/*.tsx` registradas                                      | `src/screens/` con los mismos componentes y composición.                                          |
| `HomePage → FeedOutfitCard → CommentDialog`                        | Se mantiene la composición y los callbacks.                                                       |
| `SavedLooks → OutfitCard → AiBadge`                                | Se conservan tarjetas y composición SVG; el detalle local usa modal nativo.                       |
| `Wardrobe → WardrobeItemDetails → ColorPicker`                     | Se conserva el agrupamiento y el contrato de edición.                                             |
| `ProfileSetup → StepIntro/Name/Physical/Style/Location/Geo/Review` | Se mantienen los siete pasos y sus payloads.                                                      |
| `AppShell`                                                         | Marco de contenido, scroll y encabezado sticky; los tabs se alojan en el navegador.               |
| `HeaderBar`                                                        | Encabezado reutilizable con retorno nativo.                                                       |
| `BottomNav`                                                        | Presentación personalizada del Bottom Tab Navigator.                                              |
| `TagChip`, `AiBadge`, `OutfitCard`                                 | Componentes de producto conservados sobre primitivas nativas.                                     |
| Controles shadcn/Radix DOM utilizados                              | Implementaciones nativas de Button, Input, Select, Dialog, Sheet, AlertDialog, Avatar y Skeleton. |
| `CameraCapture`                                                    | Expo Camera con permiso, guía, captura, vista previa, repetición y confirmación.                  |
| HTML                                                               | `Box`, `TextLabel`, `Tap`, `Picture`, Form y controles nativos.                                   |
| `dangerouslySetInnerHTML` con SVG                                  | `Composition` con `react-native-svg`; sin DOM ni WebView.                                         |

`Box` y los controles de `ui/native.tsx` son componentes React Native, no un motor web. Conservan clases y contratos útiles mientras adaptan herencia tipográfica, grids, espacios, texto, eventos y scroll. La jerarquía de dominio se conserva; los wrappers técnicos cambian cuando lo exige la plataforma.

`Index.tsx` y `SignupWizard.tsx` no estaban registradas en el router del origen. No se añadieron rutas nuevas para ellas. Tampoco se copiaron todos los componentes de UI web sin consumidores. Las funciones de clasificación aleatoria y las acciones de menú/CTA que ya eran placeholders en la PWA siguen identificadas como tales; no se implementaron pagos ni nuevas notificaciones.

## Capacidades de plataforma

| Web / PWA                        | Adaptación móvil                                                               | Estado de comprobación                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Auth en localStorage             | SecureStore fragmentado, escrituras serializadas y refresco ligado a AppState. | Pruebas de almacenamiento; sesión real pendiente.                                                                    |
| IndexedDB query cache            | Persister AsyncStorage, misma ventana de restauración de cinco minutos.        | Empaquetado; persistencia en teléfono pendiente.                                                                     |
| Cola IndexedDB                   | AsyncStorage con acceso serializado y limpieza al logout.                      | Contrato local portado. La PWA no tenía un consumidor de reintentos funcional en su árbol activo; no se inventó uno. |
| Preferencia de idioma            | AsyncStorage y diccionarios ES/EN originales.                                  | Usada en pruebas de interacción.                                                                                     |
| `navigator.onLine`               | NetInfo y conexión con TanStack Query.                                         | Empaquetado; transición real de red pendiente.                                                                       |
| File input / FileReader          | ImagePicker, FileSystem y ArrayBuffer para Storage.                            | Empaquetado; selección y subida real pendientes.                                                                     |
| Cámara del navegador             | Expo Camera con controles de captura y confirmación.                           | Prueba en dispositivo pendiente.                                                                                     |
| Canvas de análisis de color      | ImageManipulator + UPNG; media y paleta de píxeles no transparentes.           | Algoritmo adaptado; puede producir nombres/paleta distintos del muestreo web.                                        |
| Geolocalización                  | Expo Location con permiso y flujo de omitir/denegar.                           | Prueba en dispositivo pendiente.                                                                                     |
| Composición SVG                  | SvgXml.                                                                        | Incluida en ambos bundles; revisión de los SVG reales pendiente.                                                     |
| Share API                        | Expo Sharing para PNG de OG y Share para texto/enlace como fallback.           | El chooser y la combinación imagen/caption dependen de la plataforma; prueba real pendiente.                         |
| Toasters web                     | Avisos no bloqueantes nativos con textos originales.                           | UI nativa; revisión visual pendiente.                                                                                |
| Posición CSS fixed               | Portal nativo para el FAB del armario.                                         | Evita que el botón se desplace con la lista.                                                                         |
| Hoja inferior / diálogos         | Modal y scroll nativos; cierre por fondo y Atrás.                              | Interacción de modal cubierta; teclado/safe area pendientes en dispositivos.                                         |
| Framer Motion                    | Animaciones de entrada con Animated y presentación modal nativa.               | Las transiciones de salida y `mode=wait` no reproducen exactamente Framer Motion.                                    |
| Instalación PWA / service worker | Configuración Expo y perfiles EAS.                                             | Sin build instalable ni publicación.                                                                                 |

Los datos que una PWA guardó en el navegador no aparecen automáticamente en AsyncStorage. No se ha implementado una importación entre ambas instalaciones.

## Integraciones y configuración externa

- Se conserva el proyecto Supabase, los buckets `wardrobe-images` e `images`, las tablas y las funciones `generate-outfit`, `process-image`, `get-subscription` y `og`.
- Solo se configuraron nombres de variables públicas. La lista de correos usada para límites en el origen se excluyó del repositorio móvil y se reemplazó por `EXPO_PUBLIC_WARDROBE_LIMIT_BASELINES`; si falta o es inválida, se bloquea la carga. No se obtuvo ni incluyó un `.env` real.
- No se ejecutaron migraciones, cambios de políticas, funciones remotas, pruebas de correo ni mutaciones de producción.
- Los tipos de origen estaban incompletos: se añadieron `username`, campos de imágenes procesadas y relaciones respaldadas por las migraciones existentes.
- `outfit_comments` aparece en los servicios y pantallas originales, pero su DDL no está en las migraciones del repositorio. Su tipo local refleja el contrato consumido por la PWA; la existencia de esa tabla y sus políticas deben verificarse contra el backend. No se creó una tabla por inferencia. Los comentarios resuelven sus perfiles mediante una consulta separada y no dependen de un FK no documentado hacia `profiles`.
- Autorizar redirects `attira://auth` y `attira://reset-password` en Supabase antes de verificar confirmación/recuperación. El esquema propio requiere un build compatible para pruebas completas; Expo Go tiene su propio esquema.
- Los universal/app links HTTPS requieren asociación de dominio, firma y configuración nativa adicional. El dominio sigue sirviendo los enlaces web existentes.

## Validación automatizada

| Comprobación                        | Resultado                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| TypeScript estricto                 | Aprobado.                                                                                              |
| Pruebas unitarias                   | 16 aprobadas: correspondencia de rutas, parámetros, almacenamiento seguro y tokens.                    |
| Pruebas de interacción React Native | 6 aprobadas: onboarding, autenticación/recuperación, medidas, username, modal y select.                |
| Compatibilidad de dependencias Expo | Aprobada mediante `expo install --check`.                                                              |
| Peer dependencies                   | Sin conflictos en la revisión final.                                                                   |
| Exportación Hermes Android          | Ver reporte final de exportación en la PR.                                                             |
| Exportación Hermes iOS              | Ver reporte final de exportación en la PR.                                                             |
| CI de GitHub                        | Configurado para repetir checks y exportar ambas plataformas. Su ejecución remota se informa en la PR. |

Las pruebas de interacción sustituyen servicios remotos; no equivalen a login real ni a persistencia comprobada en teléfonos. No se instaló ni ejecutó un emulador Android o simulador iOS en este entorno.

## Validación pendiente antes de distribución

1. Configurar `.env` con los valores públicos del proyecto correcto, los límites de cuentas heredados y los callbacks permitidos.
2. Instalar un development/preview build en Android e iOS y recorrer login, restauración, logout y recuperación.
3. Completar perfil, abrir cada tab, generar, guardar, compartir, publicar y volver con datos reales autorizados.
4. Probar permisos concedidos/denegados, cámara, galería, procesamiento, geolocalización, teclado y red desconectada/reconectada.
5. Comparar cada pantalla y estado con la PWA a tamaño lógico y datos equivalentes. Corregir diferencias de tipografía, dimensiones, blur, animaciones y composición SVG antes de afirmar fidelidad visual completa.
6. Confirmar identificadores, proyecto EAS y firma antes de generar una APK/IPA de distribución.

## Historial y reversión

La PWA permanece en el SHA de referencia y no recibe cambios. La implementación móvil se entrega en una rama y PR del repositorio nuevo, con commits separados por base Expo/pnpm, componentes/adaptadores, pantallas/navegación y documentación/pruebas.

Revertir la PR o volver a la referencia anterior de este repositorio revierte el cliente. No hay cambios de base de datos que deshacer. Un eventual build instalado se reemplaza con otro build; volver a un commit no actualiza automáticamente los teléfonos.

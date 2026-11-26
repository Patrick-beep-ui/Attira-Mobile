# React PWA → React Native / Expo

Guía reutilizable de ejecución para OpenCode y otros agentes.
Versión 1.0 · 25 de noviembre de 2026 · Patrick Solis.

## 1. Objetivo

Migrar una aplicación React PWA existente a React Native conservando su jerarquía y relación de componentes, diseño, contenido, estados y flujo de usuario. Aplicar la organización de `React_Native_Architecture_Playbook.md` como estructura del destino.

Usar la PWA como especificación del producto y la guía de React Native como especificación de organización. Adaptar la implementación a la plataforma sin convertir la migración en un rediseño o una ampliación funcional.

Conservar JSX/TSX y React. Reemplazar elementos DOM, estilos web, navegación web y dependencias del navegador por implementaciones nativas. No interpretar esta tarea como cambiar extensiones de archivo ni sustituir etiquetas mediante una búsqueda y reemplazo global.

Exigir fidelidad visual y funcional. Comparar referencias equivalentes y corregir diferencias; no prometer identidad de píxeles entre motores de renderizado. Registrar cualquier diferencia de plataforma inevitable y no aprobar silenciosamente aproximaciones visibles.

## 2. Fuentes y precedencia

Aplicar las instrucciones del usuario y del repositorio. Leer la PWA real y la guía de arquitectura antes de implementar. Usar `React_Vite_to_Nextjs_Agent_Playbook.md` como antecedente metodológico de inventario, migración por fases y verificación; no trasladar sus decisiones de servidor, SEO o App Router.

Referencias originales:

- [Arquitectura React Native](React_Native_Architecture_Playbook.md).
- Playbook React SPA a Next.js (antecedente metodológico; no requerido para esta migración).

Si el agente no puede abrir estas referencias, buscar los documentos por nombre en la documentación del proyecto. Usar las convenciones resumidas en esta guía para avanzar; indicar qué versión de la arquitectura se pudo consultar. Resolver conflictos de producto con el comportamiento de origen y las instrucciones del usuario.

## 3. Invariantes de la migración

1. Conservar nombres, responsabilidades, composición, props, callbacks y relaciones padre/hijo de los componentes de producto siempre que sean compatibles.
2. Conservar estados, validaciones, reglas de negocio y contratos de datos existentes.
3. Conservar orden de pantallas, destinos, condiciones de acceso, enlaces, acciones y resultados de cada recorrido.
4. Conservar colores, fuentes, iconos, imágenes, proporciones, radios, espaciados, textos, estados y animaciones observables.
5. Reubicar módulos por responsabilidad dentro de la estructura nativa sin reestructurar arbitrariamente el árbol de componentes.
6. Adaptar únicamente las fronteras necesarias: renderizado, estilos, navegación, eventos, almacenamiento y capacidades de plataforma.
7. No añadir tabs, drawer, login, SQLite, backend ni pantallas por el solo hecho de aparecer en un ejemplo de arquitectura.
8. No envolver la PWA completa en un WebView ni presentar una exportación web como migración nativa terminada.

Distinguir el árbol de componentes de producto del árbol de navegadores. La infraestructura nativa puede añadir providers y contenedores, y la virtualización puede modificar wrappers internos. Mantener la composición lógica y documentar cada excepción necesaria. No fusionar componentes existentes en una pantalla monolítica.

## 4. Inventario antes de editar

Registrar origen, rama y SHA o referencia recuperable; destino; cambios ajenos; plataformas objetivo; entorno; dependencias; gestor de paquetes y alcance autorizado. Si las plataformas no están definidas, preparar código portable y señalar la validación pendiente por plataforma.

Inspeccionar:

- Árbol de rutas y enlaces reales, incluidos enlaces construidos desde datos.
- Pantallas, layouts, componentes compartidos y sus consumidores.
- Props, callbacks, contextos, hooks, estado local y persistente.
- CSS, tokens, fuentes y pesos, iconos, SVG, imágenes y animaciones.
- Backend, autenticación, permisos, payloads y estados de error.
- APIs DOM, storage, service worker, caché, offline, notificaciones, mapas, archivos y permisos.
- Dependencias que importan DOM o solo funcionan en navegador, aunque sus consumidores usen nombres de componentes React.

Capturar referencias de la PWA a dimensiones móviles identificadas, con datos reproducibles. Cubrir estados normales, vacíos, carga, error, selección, formularios y overlays existentes. Si no se puede ejecutar el origen, documentar esa limitación y avanzar desde código y assets; no declarar comprobada la fidelidad visual.

Crear tres mapas de trabajo en la documentación del proyecto:

| Mapa        | Campos mínimos                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Componentes | Ruta origen, padre y consumidores, ruta destino, props/callbacks, cambio nativo, estado de verificación.                          |
| Navegación  | Ruta/enlace/acción origen, destino, parámetros, acceso, navegador responsable, header/barras visibles, Atrás, estado a conservar. |
| Capacidades | API/dependencia web, uso observable, equivalente nativo, cambio de configuración, prueba o bloqueo.                               |

No exigir al usuario que reconstruya información que el repositorio ya contiene. Preguntar solo si falta una decisión que cambia el producto o impide elegir entre alternativas incompatibles; continuar trabajo independiente.

## 5. Estructura nativa del destino

Usar React Native con Expo, React Navigation explícito, TypeScript y pnpm para un destino nuevo, verificando versiones compatibles. Respetar decisiones explícitas y restricciones del destino existente. Conservar el lenguaje del origen cuando convertir JavaScript a TypeScript ampliaría el alcance sin necesidad.

| Ubicación                               | Responsabilidad                                                      |
| --------------------------------------- | -------------------------------------------------------------------- |
| `App.tsx`                               | Providers, inicialización y un `NavigationContainer` raíz.           |
| `src/layout/ScreenLayout.tsx`           | Marco visual compartido, configurable según la pantalla original.    |
| `src/layout/ScreenHeading.tsx`          | Encabezado propio reutilizable cuando exista.                        |
| `src/layout/HeadingStyles.ts`           | Opciones compartidas de headers y tabs, cuando aporten valor.        |
| `src/layout/AuthStyles.ts`              | Estilos compartidos de autenticación, si existe.                     |
| `src/navigators/RootNavigator.tsx`      | Composición raíz y selección de flujos.                              |
| `src/navigators/BottomTabNavigator.tsx` | Secciones que ya tengan navegación inferior equivalente.             |
| `src/navigators/DrawerNavigator.tsx`    | Menú lateral existente, con su alcance real.                         |
| `src/navigators/AuthNavigator.tsx`      | Flujo de acceso existente.                                           |
| `src/navigators/stack_navigators/`      | Stacks de destinos relacionados.                                     |
| `src/navigators/types.ts`               | Rutas y parámetros tipados.                                          |
| `src/screens/`                          | Entradas de pantalla que conservan la composición del origen.        |
| `src/components/`                       | Componentes originales adaptados, conservando agrupaciones internas. |
| `src/context/`, `src/hooks/`            | Estado y comportamiento React con sus alcances originales.           |
| `src/services/`, `src/config/`          | Operaciones de datos e inicialización técnica.                       |
| `src/types/`                            | Tipos de dominio compartidos.                                        |
| `src/database/`                         | Persistencia local cuando la aplicación realmente la requiera.       |

Crear solo módulos necesarios. Conservar `layout/` y `stack_navigators/`; usar `BottomTab`, con Tab. No introducir Expo Router como sustituto de los navegadores acordados. No imponer un stack por pantalla.

Por ejemplo, conservar `Dashboard → Summary → MetricCard` aunque `Dashboard` pase a `screens/DashboardScreen.tsx` y los demás permanezcan agrupados bajo `components/dashboard/`. Cambiar ubicación o añadir el marco de pantalla no autoriza reescribir esa composición.

## 6. Adaptar los enlaces al árbol de navegación

Reconstruir el flujo desde rutas, enlaces, menús y acciones de la PWA. La ausencia de navegadores explícitos en el origen no implica ausencia de jerarquía funcional. No inferir toda la navegación únicamente desde segmentos de URL.

| Comportamiento en la PWA             | Adaptación nativa                                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Barra inferior con secciones         | Bottom Tabs con los mismos destinos, orden, etiquetas e iconos.                                              |
| Menú lateral                         | Drawer con el mismo contenido y alcance.                                                                     |
| Listado → detalle → edición          | Pantallas registradas en el stack responsable.                                                               |
| Login, registro, recuperación        | Flujo de autenticación si ya existe, conservando acceso público y retorno al destino solicitado.             |
| Overlay o diálogo local              | Mantener estado local; usar presentación modal de navegación solo si corresponde a un destino independiente. |
| Ruta dinámica                        | Nombre de pantalla y parámetros tipados equivalentes.                                                        |
| Query, filtro o paso de un asistente | Conservar su significado en parámetros serializables o estado con el alcance y persistencia adecuados.       |
| Enlace externo, teléfono o correo    | Acción de plataforma equivalente; no registrarlo como pantalla interna.                                      |
| URL pública entrante o callback      | Configuración de deep links y validación de parámetros cuando forme parte del alcance.                       |

Elegir la anidación según el comportamiento visible: un stack dentro de tabs suele mantener la barra inferior; un detalle en el stack raíz puede cubrirla. Colocar el drawer en el nivel que reproduce su alcance. Definir el dueño de cada header y evitar duplicarlo con `ScreenHeading` o `ScreenLayout`.

Reproducir la barra o menú original mediante presentación personalizada del navegador cuando sus estilos predeterminados difieran. Conectar esa presentación al estado y acciones del navegador; no mantener un índice de tab paralelo desconectado. Conservar eventos, foco, accesibilidad y comportamiento de pulsar la sección ya activa según la implementación elegida.

Adaptar los controles de volver y probar también Atrás de Android y gestos de iOS. No copiar ciegamente `history.back()` cuando una entrada directa no tenga historial nativo. Documentar el destino de retorno inicial y conservar borradores, filtros, selección y scroll cuando el flujo original lo haga.

Mantener parámetros serializables; pasar identificadores en vez de funciones, conexiones o clientes. Evitar que el ciclo de vida diferente de pantallas persistentes en tabs produzca cargas obsoletas o mutaciones duplicadas.

## 7. Adaptar componentes sin perder su identidad

Recorrer las dependencias desde componentes compartidos hacia pantallas y validar una sección completa antes de multiplicar la adaptación.

| Origen web                                    | Implementación nativa orientativa                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `div`, `section`, contenedores                | `View` y composición equivalente.                                                    |
| Texto, encabezados, `span`                    | `Text`, con tipografía y semántica accesible explícitas.                             |
| `button` o enlace interno interactivo         | `Pressable` u otro control nativo adecuado con contenido y estilo originales.        |
| `input`, `textarea`                           | `TextInput`, valor controlado, teclado y comportamiento equivalentes.                |
| `img`                                         | `Image` o componente compatible, con dimensiones, ajuste y fuente correctos.         |
| Lista desplazable                             | `ScrollView`, `FlatList` o `SectionList` según volumen y comportamiento.             |
| Formulario HTML                               | Composición nativa que conserva validación, mensajes y submit.                       |
| SVG, canvas, mapas, portales, bibliotecas DOM | Sustitución específica compatible; conservar el contrato del componente de producto. |

Tratar esta tabla como orientación, no como conversión mecánica. Envolver texto en `Text`; adaptar `onClick` a eventos de presión y `onChange` a la API real del control. Conservar significado de props y callbacks; cambiar solo contratos dependientes del DOM y actualizar sus consumidores.

Mantener componentes de dominio como `BookingCard`, `SearchFilters` o `ProfileForm`. Si un control compartido depende de Radix, shadcn web u otra biblioteca DOM, reemplazar su implementación por una nativa compatible conservando su interfaz útil y presentación. No asumir compatibilidad por compartir React.

Conservar lógica pura, validadores y hooks independientes de plataforma cuando funcionen. Auditar hooks que usan `window`, `document`, eventos DOM o APIs de navegación web. Separar adaptadores de plataforma cuando haga falta, sin crear capas vacías.

## 8. Conservar el diseño

Extraer valores efectivos de estilos y tokens del origen. Portar CSS/Tailwind a estilos nativos o a una solución nativa compatible ya elegida; no copiar clases web suponiendo soporte.

Comprobar explícitamente herencia tipográfica, medidas, unidades relativas, layout flex/grid, posición fija, sombras, gradientes, bordes, z-index, overflow, estados de presión y animaciones. Cargar fuentes y pesos reales; no sustituir iconos por otros parecidos sin registrar la diferencia.

Recrear controles con estilos propios cuando el control predeterminado del sistema altere el diseño. Preservar accesibilidad, área táctil y funcionamiento del teclado. Ajustar safe areas e insets sin duplicar espacios. No envolver automáticamente mapas o listas virtualizadas en un `ScrollView`.

Comparar al mismo tamaño lógico, datos y estado. Distinguir contenido de la app de chrome del navegador y barras del sistema. Revisar cada pantalla y sus estados; registrar diferencias pendientes con su causa. Aplicar adaptaciones imprescindibles para teclado, safe area y escalado de texto conservando el diseño a la escala de referencia y sin recortar contenido accesible.

## 9. Portar las capacidades PWA existentes

Auditar comportamiento, no solo UI. No trasladar un service worker o el manifiesto PWA como si proporcionaran offline, instalación o notificaciones en nativo.

| Capacidad                                           | Trabajo requerido cuando exista                                                                                                                |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| localStorage, sessionStorage, IndexedDB             | Adaptador nativo con semántica equivalente de persistencia, serialización, borrado y restauración; no convertir todo automáticamente a SQLite. |
| Datos ya guardados en la PWA                        | Explicar que el almacenamiento del navegador no aparece en la app nativa; definir transferencia solo si es requisito.                          |
| Caché y operaciones offline                         | Conservar disponibilidad, colas, reintentos y resolución de conflictos existentes; probar reinicio y recuperación de red.                      |
| Sesión, cookies, OAuth y recovery                   | Verificar SDK, almacenamiento apropiado, callbacks y restauración de sesión en nativo.                                                         |
| API relativa, por ejemplo `/api/...`                | Configurar origen remoto accesible al dispositivo conservando contrato y autorización.                                                         |
| Geolocalización, cámara, archivos, compartir y push | Elegir APIs nativas compatibles, permisos y manejo de rechazo; mantener el resultado de usuario.                                               |
| Actualizaciones PWA                                 | Documentar el mecanismo nativo que se requiera sin activar publicación o distribución por defecto.                                             |

Conservar backend, datos y permisos. Mantener secretos del lado servidor: las variables incluidas en una app distribuida no son privadas. No crear otra base de datos para resolver una incompatibilidad visual. No sustituir una integración existente por mocks y reportarla como funcional.

## 10. Ejecución por fases

1. Registrar inventario, referencias visuales, mapas y dependencias incompatibles.
2. Preparar destino Expo, versiones compatibles, providers y navegación raíz; preservar un origen recuperable.
3. Portar tokens, assets, fuentes, layouts y componentes compartidos.
4. Completar un recorrido representativo que incluya navegación y una interacción con estado; verificar composición, diseño y contratos.
5. Extender la adaptación a todas las pantallas y estados del alcance, conservando los mapas de correspondencia.
6. Completar adaptadores de plataforma, autenticación y capacidades existentes.
7. Ejecutar controles técnicos, pruebas de flujo y comparación visual en las plataformas objetivo.
8. Retirar dependencias web sin consumidores y actualizar documentación y reporte.

Continuar la implementación autorizada tras el inventario. Agrupar cambios revisables por responsabilidades y etapas; respetar la política de ramas y commits del proyecto. No borrar la PWA ni sustituir su despliegue de manera implícita. No publicar builds, cambiar accesos ni realizar escrituras de producción fuera de la autorización del usuario.

## 11. Criterios de aceptación

| Área          | Evidencia necesaria                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Componentes   | Cada componente del alcance tiene destino o excepción justificada; conserva sus relaciones y contrato útil.                                         |
| Arquitectura  | Navegadores separados de contenido, layouts y operaciones de datos; sin stacks o providers sin propósito.                                           |
| Flujo         | Se reproducen destinos, pasos, condiciones, parámetros, retorno, estado y visibilidad de barras/headers.                                            |
| Diseño        | Referencias comparadas con datos y tamaño equivalentes; colores, fuentes, assets, espaciado y estados revisados.                                    |
| Interacción   | Formularios, teclado, desplazamiento, foco, overlays, disabled, carga, error y reintento funcionan.                                                 |
| Datos         | Se conservan contratos, persistencia, permisos y comportamiento de red existentes.                                                                  |
| Autenticación | Si existe: restaurar sesión, entrar, salir, expirar y abrir callback sin permitir retorno indebido a destinos restringidos.                         |
| Runtime       | Instalación reproducible, chequeo de tipos si aplica, lint y controles pertinentes; arranque y recorrido en Android/iOS según alcance.              |
| Empaquetado   | Verificar un build instalable cuando esté en el alcance y existan credenciales; no confundir exportar JS o ejecutar web con validar una app nativa. |

Reutilizar pruebas existentes y añadir cobertura útil para el recorrido principal y los adaptadores de mayor riesgo. No ocultar errores de tipos o retirar checks para declarar éxito. No marcar como probada una plataforma sin ejecutarla.

Buscar y revisar restos como `react-dom`, `react-router-dom`, `window`, `document`, `localStorage`, service workers y estilos CSS importados por módulos nativos. Revisar cada coincidencia: la PWA conservada o adaptadores web pueden contenerlas legítimamente.

Entregar un reporte con referencias de origen/destino, versiones, mapas finales, cambios necesarios de plataforma, comandos y resultados reales, comparaciones visuales, bloqueos, diferencias pendientes y forma de volver a la versión anterior. Clasificar cada comprobación como aprobada, fallida o no ejecutada.

No declarar terminada una migración que solo tenga el esqueleto, pantallas aproximadas, navegación simulada o componentes web embebidos. Identificar con precisión cualquier parte pendiente.

## 12. Prompt para ejecutar la guía

```text
Migra [PROYECTO] de React PWA a React Native / Expo siguiendo
React_PWA_to_React_Native_Agent_Playbook.md y
React_Native_Architecture_Playbook.md.

Origen: [REPOSITORIO/RUTA Y REFERENCIA].
Destino: [RUTA/RAMA O DESCUBRIR EN EL REPOSITORIO].
Plataformas: [ANDROID / IOS / AMBAS].
Alcance autorizado: [IMPLEMENTACIÓN LOCAL / BUILD / OTRO].

Usa la PWA como especificación de componentes, visuales y flujo.
Conserva su jerarquía y relaciones de componentes, contratos y estados.
Aplica nuestra estructura de layouts, screens y navigators al destino.
Adapta los enlaces y recorridos existentes a Bottom Tabs, Drawer y Stacks
solo donde corresponda a la navegación real. Conserva headers, barras,
parámetros y comportamiento de volver.

Reemplaza DOM, CSS y APIs web por implementaciones nativas compatibles.
Mantén JSX/TSX. No rediseñes ni agregues funciones. No incrustes la PWA
completa en un WebView. Usa presentaciones personalizadas de los navegadores
cuando haga falta para conservar la UI original.

Primero inspecciona instrucciones, código, componentes, rutas y capacidades.
Registra los mapas origen-destino; luego implementa y valida por fases.
Continúa el trabajo autorizado sin detenerte en el plan. Consulta únicamente
decisiones que cambien el producto y no puedan resolverse desde el origen.

Entrega implementación, documentación y evidencia de fidelidad visual,
funcional y estructural, indicando diferencias, bloqueos y checks no ejecutados.
```

## 13. Referencias técnicas al ejecutar

Consultar documentación correspondiente a las versiones instaladas, sin copiar configuraciones de otra versión:

- [React Native: React y JSX](https://reactnative.dev/docs/intro-react).
- [Componentes nativos](https://reactnative.dev/docs/components-and-apis).
- [Texto y composición](https://reactnative.dev/docs/text).
- [React Navigation: anidación](https://reactnavigation.org/docs/nesting-navigators/).
- [Bottom Tabs y barra personalizada](https://reactnavigation.org/docs/bottom-tab-navigator/).
- [Flujos de autenticación](https://reactnavigation.org/docs/auth-flow/).
- [Documentación Expo](https://docs.expo.dev/).

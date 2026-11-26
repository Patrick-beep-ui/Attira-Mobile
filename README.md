# Attira Mobile

Versión móvil de [Attira-AI](https://github.com/Patrick-beep-ui/Attira-AI), con React Native, Expo, TypeScript, React Navigation y **pnpm**. La PWA permanece en su repositorio original.

Esta migración conserva las pantallas, los componentes de producto, los textos ES/EN, los tokens visuales y los contratos de Supabase. Reemplaza DOM, CSS web, almacenamiento del navegador y capacidades web por implementaciones nativas. No utiliza un WebView.

## Ejecutar

Requisitos: Node.js 24 y pnpm 11.25.0. El campo `packageManager` fija la versión y `pnpm-lock.yaml` fija las dependencias. `pnpm-workspace.yaml` usa `nodeLinker: hoisted` para Metro.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm start
```

Configurar las variables públicas del **mismo proyecto Supabase que utiliza la PWA** y la política de límites de cuentas:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU-CLAVE-PUBLICA
EXPO_PUBLIC_WARDROBE_LIMIT_BASELINES=
```

`EXPO_PUBLIC_WARDROBE_LIMIT_BASELINES` recibe un objeto JSON de correo → cantidad base. Copiar la política de cuentas del proyecto original a esta variable local, sin versionar los correos. Un valor ficticio de ejemplo sería `{"limited@example.com":10}`: esa cuenta permite 15 prendas (base + 5), y las cuentas no incluidas no tienen ese límite particular. Si la variable falta o es inválida, la carga queda bloqueada. Usar `{}` explícitamente solo si no se requieren límites particulares. Como cualquier variable `EXPO_PUBLIC_`, esta configuración se incorpora al cliente distribuido.

No usar service role, claves de IA ni credenciales privadas en la app. Las Edge Functions existentes mantienen la lógica privilegiada. No se ha cambiado ni desplegado el backend.

Sin variables se puede recorrer el onboarding y ver autenticación; las acciones de acceso muestran un mensaje de configuración. No hay una sesión ficticia ni datos demo para entrar al área privada.

La base actual es **Expo SDK 58 / React Native 0.88.1 / React 19.3 / NativeWind 4**, alineada con Mi Ruta y con Expo Go SDK 58. Después de actualizar el repositorio, ejecutar `pnpm install --frozen-lockfile` y reiniciar Metro con `pnpm start --clear`. Para callbacks del esquema `attira://` y distribución, usar un build propio. No se ha registrado una cuenta EAS ni se han generado certificados.

## Android e iOS

```sh
pnpm android
pnpm ios
```

Estos comandos abren clientes/emuladores disponibles; `pnpm ios` necesita un entorno compatible. Para una APK interna, el perfil `preview` de `eas.json` usa distribución interna y `buildType: apk`:

```sh
pnpm dlx eas-cli build --platform android --profile preview
```

El build remoto requiere iniciar sesión en la cuenta Expo del propietario y vincular el proyecto EAS. Definir también las tres variables de `.env` en el entorno de EAS correspondiente antes del build remoto. Los identificadores iniciales son `com.attiraai.mobile`; confirmar su propiedad y disponibilidad antes de distribuir. El proyecto aún no contiene un `projectId` EAS.

Para iOS, el perfil preview necesita la firma y los dispositivos/cuenta Apple correspondientes. La exportación de JavaScript no constituye una APK ni un IPA.

## Estructura

| Ruta                               | Responsabilidad                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `App.tsx`                          | Fuentes, providers, navegación, conectividad y notificaciones.                          |
| `src/navigators/`                  | Root, Auth, Bottom Tabs, parámetros y adaptación de los enlaces originales.             |
| `src/navigators/stack_navigators/` | Stacks de Inicio, Armario, Generar, Guardados y Perfil/Settings.                        |
| `src/layout/`                      | Marco de pantalla y opciones de encabezados.                                            |
| `src/screens/`                     | Las 15 pantallas que estaban registradas en la PWA.                                     |
| `src/components/`                  | Componentes originales y siete pasos de configuración del perfil.                       |
| `src/components/ui/`               | Controles nativos compartidos que conservan las interfaces útiles de los controles web. |
| `src/context/`                     | Sesión, idioma y alcance de tabs.                                                       |
| `src/platform/`                    | Imágenes, cámara, geolocalización, colores, almacenamiento seguro y avisos.             |
| `src/services/`                    | Contratos existentes de Supabase y cola local.                                          |

La barra inferior conserva **Inicio, Armario, Generar, Guardados y Perfil**. El último tab abre `/settings`, igual que en la PWA. No se incorpora Drawer porque el producto original no tiene menú lateral. Los detalles públicos de outfits mantienen una ruta raíz y la navegación inferior; las pantallas de perfil y medidas conservan su presentación sin tabs.

## Comprobar

```sh
pnpm check
pnpm exec expo install --check
pnpm exec expo export --platform all --output-dir dist
```

`pnpm check` ejecuta TypeScript, las pruebas unitarias y las pruebas de interacción con React Native Testing Library. Estas últimas usan mocks de servicios, sin enviar correos, subir imágenes ni escribir datos de producción.

Ver [el reporte de migración](docs/MIGRATION.md) para el mapa completo, las diferencias de plataforma y las validaciones pendientes. La fidelidad visual completa, permisos, cámara, autenticación real y flujos privados deben comprobarse en dispositivos antes de aprobar una versión de distribución.

## Autenticación y enlaces

La sesión se guarda con Expo SecureStore, fragmentando datos largos y serializando escrituras. Query cache y preferencias utilizan AsyncStorage; la caché privada y la cola local se limpian al cerrar sesión.

La app utiliza el esquema `attira://`. Autorizar `attira://auth` y `attira://reset-password` en los redirects del proyecto Supabase antes de probar confirmación y recuperación en un build propio. Esta configuración externa no fue modificada durante la migración.

Los enlaces `https://app.attiraai.com/outfit/:id` siguen siendo enlaces compartibles web. La configuración de React Navigation reconoce esa forma si el sistema entrega el enlace a la app; abrirlos automáticamente como universal/app links requiere los archivos de asociación del dominio y la configuración de firma. Eso no está desplegado.

## Referencias

- [Guía de migración PWA → React Native](docs/React_PWA_to_React_Native_Agent_Playbook.md).
- [Arquitectura acordada para React Native](docs/React_Native_Architecture_Playbook.md).
- [Mapa y estado de la migración](docs/MIGRATION.md).

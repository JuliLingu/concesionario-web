This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Variables de entorno

```bash
# --- Base de datos ---
# El adaptador de Prisma 7 se conecta con los campos sueltos, no con la URL.
DATABASE_HOST=""
DATABASE_PORT=          # TiDB Cloud: 4000. MySQL/MariaDB local: 3306.
DATABASE_NAME=""
DATABASE_USER=""
DATABASE_PASSWORD=""

# Solo la usa el CLI de Prisma (`prisma db push`), no la aplicación. No hace
# falta cargarla en el hosting.
DATABASE_URL=""

# Opcional. Conexiones por instancia del proceso; por defecto 2, pensado para
# serverless. Subirlo solo si se despliega como contenedor persistente.
DATABASE_POOL_MAX=

# --- Auth.js ---
# Generar con: openssl rand -base64 32
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_TRUST_HOST=true

# --- Cloudinary ---
# Las subidas van firmadas desde el servidor: el api_secret nunca llega al
# navegador y no hay preset sin firmar.
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# --- Avisos por correo ---
# Sin estas dos, el sitio funciona igual pero no manda avisos: las consultas
# quedan solo en el panel. El remitente tiene que ser de un dominio verificado
# en Resend.
RESEND_API_KEY=""
MAIL_FROM=""            # Ej: Avisos <avisos@midominio.com>

# Opcional. Desvía los avisos a otra casilla; sirve para probar la puesta en
# marcha. Si no está, van al email de contacto cargado en /dashboard/settings.
MAIL_TO=

# --- Opcionales ---
# Enciende financiación (portada, simulador, /dashboard/planes y /solicitudes).
NEXT_PUBLIC_FEATURE_FINANCIACION=

# Base pública del sitio, para que los avisos puedan enlazar al panel. En Vercel
# se deduce sola; en un contenedor propio hay que cargarla.
APP_URL=
```

## Base de datos

El esquema se versiona con `prisma migrate`. Cada cambio de
`prisma/schema.prisma` deja un archivo SQL en `prisma/migrations/` que se
commitea junto al cambio: es el historial que permite llevar la base de una
instalación ya en uso a la forma nueva sin tocar los datos que tiene adentro.

No hay seed: las categorías las carga el administrador desde
`/dashboard/categorias`.

**Al desarrollar**, después de tocar el esquema:

```bash
npm run db:migrate -- --name descripcion_del_cambio
```

Crea la migración, la aplica a la base local y regenera el cliente.

**Al desplegar**, en cada instalación:

```bash
npm run db:deploy
```

Aplica solo las migraciones que a esa base le falten. Es idempotente y no pide
confirmación, así que puede ir en el arranque del contenedor o en el paso de
build del hosting.

### Instalaciones que venían de `db push`

Una base creada con el `db push` anterior ya tiene las tablas, pero no la tabla
de control de migraciones, así que `migrate deploy` intentaría crear todo de
nuevo y fallaría. Hay que marcarle una sola vez que la migración inicial ya está
aplicada:

```bash
npx prisma migrate resolve --applied 20260818000000_init
```

Después de eso, `npm run db:deploy` funciona normalmente. En bases nuevas no
hace falta: `migrate deploy` las crea desde cero.

El cliente de Prisma se genera solo en cada `npm install` (script `postinstall`)
y no se versiona: `generated/` está ignorado.

## Deploy en Vercel

1. Cargar en el proyecto de Vercel todas las variables de arriba. `DATABASE_URL`
   ahora también hace falta: la usa `prisma migrate deploy` para aplicar las
   migraciones pendientes durante el build. La aplicación en sí sigue sin
   leerla.
2. Fijar el *Build Command* en `npm run db:deploy && npm run build`, para que
   ninguna versión llegue a producción contra una base que todavía no tiene el
   esquema que esa versión espera.
3. Añadir `https://<dominio>/api/auth/callback/google` a los *Authorized
   redirect URIs* de la consola de Google Cloud.
4. `vercel.json` fija la región en `iad1` para que las funciones queden en la
   misma región que la base (`us-east-1`). Si la base se muda, hay que mover
   esto también: cada query paga la latencia entre ambas.

Dos límites conocidos de correr esto en serverless, por si el sitio crece: el
limitador de intentos de `src/lib/rate-limit.ts` cuenta en memoria y cada
instancia lleva el suyo, así que el cupo efectivo se multiplica; y cada
instancia abre su propio pool contra la base. Ambos desaparecen si el despliegue
pasa a ser un contenedor persistente.

## Pruebas

```bash
npm test          # una corrida
npm run test:watch
```

Cubren los flujos que no pueden romperse en una actualización de dependencias:
inicio de sesión, alta de vehículo, firma de subida de imagen y envío de
consulta, más los avisos por correo. Corren sobre las server actions con la
base, Auth.js y Cloudinary reemplazados por dobles, así que no necesitan
infraestructura y terminan en un segundo.

Lo que **no** cubren es el navegador: nada verifica que un formulario se
renderice ni que un botón haga lo suyo. Para eso haría falta Playwright y una
base de verdad. Mientras tanto, quien tapa buena parte de ese hueco es
`npm run build`, que typechequea y compila todas las rutas: es el paso que suele
delatar un salto de versión de Next o de React.

## Integración continua

`.github/workflows/ci.yml` corre en cada push y pull request contra `master` y
`dev`: levanta un MySQL descartable, aplica las migraciones desde cero —lo que
de paso comprueba que una instalación nueva se puede crear— y después pasa
lint, tipos, pruebas y build.

El paso de lint está en `continue-on-error` a propósito: el proyecto arrastra 23
avisos previos. Se informan en cada corrida para que no crezcan, pero no cortan.
Al limpiarlos hay que quitar esa línea para que el lint bloquee como el resto.


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

# --- Opcionales ---
# Enciende financiación (portada, simulador, /dashboard/planes y /solicitudes).
NEXT_PUBLIC_FEATURE_FINANCIACION=
```

## Base de datos

El esquema se sincroniza con `prisma db push` desde `prisma/schema.prisma`; no
hay migraciones versionadas ni seed. Las categorías las carga el administrador
desde `/dashboard/categorias`.

```bash
npx prisma db push
```

El cliente de Prisma se genera solo en cada `npm install` (script `postinstall`)
y no se versiona: `generated/` está ignorado.

## Deploy en Vercel

1. Cargar en el proyecto de Vercel todas las variables de arriba salvo
   `DATABASE_URL`.
2. Añadir `https://<dominio>/api/auth/callback/google` a los *Authorized
   redirect URIs* de la consola de Google Cloud.
3. `vercel.json` fija la región en `iad1` para que las funciones queden en la
   misma región que la base (`us-east-1`). Si la base se muda, hay que mover
   esto también: cada query paga la latencia entre ambas.

Dos límites conocidos de correr esto en serverless, por si el sitio crece: el
limitador de intentos de `src/lib/rate-limit.ts` cuenta en memoria y cada
instancia lleva el suyo, así que el cupo efectivo se multiplica; y cada
instancia abre su propio pool contra la base. Ambos desaparecen si el despliegue
pasa a ser un contenedor persistente.


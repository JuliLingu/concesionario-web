# Alta de una instalación nueva

Cada cliente es una instalación independiente: su base, sus imágenes, su
dominio, sus credenciales. No hay nada compartido entre clientes salvo el
código.

Esta lista es el orden en que conviene hacerlo, porque cada paso produce algo
que el siguiente necesita. Saltearse el orden funciona, pero termina en tres
idas y vueltas por el panel de Google.

Tiempo estimado la primera vez: una tarde. A partir de la tercera: alrededor de
una hora, salvo la propagación del DNS.

## 0. Antes de empezar: qué pedirle al cliente

Sin esto no se puede arrancar:

- **El dominio.** Comprado a su nombre, con acceso al panel del registrador.
- **Una casilla de correo suya** para dar de alta los servicios. Ver el paso 1.
- **Quién va a administrar el sitio**: nombre y correo de esa persona. Es la
  cuenta que va a terminar siendo ADMIN.

Lo que conviene pedirle aunque no bloquee, porque si no la entrega queda a
medias: logo en PNG o SVG con fondo transparente, dirección, teléfono,
WhatsApp, horarios de atención, redes, y dos o tres fotos buenas para la
portada.

### De quién es cada cuenta

La regla: **tuyo lo que es tu producto, del cliente lo que son sus datos.**

| Servicio | Titular | Por qué |
| --- | --- | --- |
| GitHub | Vos | Es tu código, se lo vendés también a otros |
| Vercel | Vos | Una cuenta Pro, un proyecto por cliente |
| Google Cloud (OAuth) | Vos | Solo lo tocás vos; el cliente no gana nada teniéndolo |
| Dominio | **El cliente** | Es su identidad, no la tuya |
| Base de datos | **El cliente** | Sus datos |
| Cloudinary | **El cliente** | Sus fotos, y su cupo gratis sin compartir |
| Resend | **El cliente** | Envía desde su dominio |

Las cuentas del cliente las creás vos, con una casilla suya, y las credenciales
quedan en un gestor de contraseñas compartido. Pedirle que las cree él termina
siempre en una videollamada donde las creás vos igual, tres semanas después.

## 1. Correo y dominio

**Primero preguntá si ya tienen correo propio.** Un concesionario con dominio
casi seguro ya tiene Google Workspace, Microsoft 365 o el webmail del hosting
donde estaba la web vieja. Si es así, pediles `web@sudominio.com` y saltá al
paso 2.

> ⚠️ **No toques los registros MX si ya tienen correo.** Ahí es donde se cae el
> correo de toda la empresa, y es el tipo de error que se nota un lunes a la
> mañana.

Si no tienen correo, la opción más simple es **Cloudflare Email Routing**:
gratis, alias ilimitados, solo reenvía. Alcanza de sobra, porque lo único que
necesitamos es recibir los correos de verificación de los pasos 3 a 5.

Creá un alias de función que reenvíe a dos destinos:

```
web@sudominio.com  →  duenio@gmail.com  +  vos@tuestudio.com
```

Que sea de función y no el correo personal del dueño importa: el día que cambie
el dueño, el alias sobrevive y se le cambia el destino. Si diste de alta todo
con tu casilla personal, cada renovación y cada recuperación de contraseña pasa
por vos para siempre.

## 2. Base de datos

Creá la base (TiDB Cloud, o la que uses) **en la misma región que el hosting**.
Hoy `vercel.json` fija `iad1`, que es `us-east-1`: si la base queda en otra
región, cada consulta paga la latencia entre ambas y se nota en el catálogo.

Anotá para más adelante: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`,
`DATABASE_USER`, `DATABASE_PASSWORD`, y la `DATABASE_URL` completa.

No hace falta correr las migraciones ahora: las aplica el build del paso 6.

## 3. Cloudinary

Cuenta nueva, a nombre del cliente, dada de alta con la casilla del paso 1. Una
por cliente y no una compartida: el plan gratis se mide por cuenta, así que
juntarlos hace que el que sube cuatrocientas fotos le rompa el cupo a los
demás.

Del panel salen `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y
`CLOUDINARY_API_SECRET`.

No hay que crear ningún preset de subida: las subidas van firmadas desde el
servidor (`src/actions/upload.ts`), que es lo que evita que el secreto llegue al
navegador.

## 4. Google OAuth

Un proyecto nuevo por cliente en tu Google Cloud Console. Separarlos es lo que
permite dar de baja a uno sin tocar la configuración de los otros.

1. **Pantalla de consentimiento**: tipo *External*, nombre de la app = el
   nombre del concesionario, correo de soporte = el alias del paso 1.
2. **Publicá la app** (*In production*). Como solo se piden los scopes `email`,
   `profile` y `openid` —que no son sensibles— no pasa por revisión de Google, y
   así el administrador no ve la advertencia de "app no verificada".
3. **Credenciales → OAuth client ID → Web application.**
4. En *Authorized redirect URIs*, por ahora cargá solo la de desarrollo. La
   definitiva se agrega en el paso 7, cuando el dominio ya existe.

De acá salen `AUTH_GOOGLE_ID` y `AUTH_GOOGLE_SECRET`.

## 5. Resend

Cuenta a nombre del cliente. Verificá el dominio **sobre un subdominio**, no
sobre la raíz:

```
notificaciones.sudominio.com
```

Dos razones. Aísla la reputación de envío de los avisos de la del correo humano
del concesionario, y —más importante— el registro MX que pide Resend cae sobre
el subdominio de Return-Path, así que **no puede romper el correo corporativo
que ya tengan**.

De acá sale `RESEND_API_KEY`. Y `MAIL_FROM` se arma así:

```bash
MAIL_FROM="Avisos <avisos@notificaciones.sudominio.com>"
```

Mientras dure la puesta en marcha, cargá también `MAIL_TO` con tu propia
casilla: desvía todos los avisos hacia vos y evita que al cliente le lluevan
consultas de prueba antes de la entrega. Se quita en el paso 10.

Si este paso se saltea, el sitio funciona igual: las consultas quedan en el
panel y nadie recibe aviso.

## 6. Proyecto en Vercel

1. Proyecto nuevo desde el repo, en tu cuenta Pro.
2. **Build Command**: `npm run db:deploy && npm run build`

   El `db:deploy` adelante no es decorativo: garantiza que ninguna versión
   llegue a producción contra una base que todavía no tiene el esquema que esa
   versión espera.
3. Cargá todas las variables (tabla del final). `DATABASE_URL` también, aunque
   la app no la lea: la usa `prisma migrate deploy` durante el build.

`AUTH_SECRET` se genera nuevo para cada cliente. En Windows:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Nunca reutilices el mismo entre instalaciones: con un secreto compartido, un
token de sesión de un cliente sirve en el sitio de otro.

## 7. Dominio y callback

1. En Vercel, Settings → Domains, agregá el dominio y su `www`.
2. Cargá en el registrador los valores **que muestra ese panel**. No los copies
   de un tutorial: hoy cada proyecto tiene su propio CNAME, con forma
   `d1d4fc829fe7bc7c.vercel-dns-017.com`. El viejo `cname.vercel-dns.com` ya no
   va.
3. Con el dominio andando, volvé a Google Cloud y agregá el redirect URI real:

   ```
   https://sudominio.com/api/auth/callback/google
   ```

4. Cargá `APP_URL=https://sudominio.com` para que los avisos enlacen al panel.

## 8. Crear el primer ADMIN ⚠️

**Este es el paso que no se puede deducir de la aplicación.** `register` crea
todos los usuarios con rol `USER`, y no hay ninguna pantalla que promueva a
nadie. Si te lo saltás, el cliente se registra, inicia sesión, y el sitio lo
manda al inicio sin explicarle nada.

1. Que la persona que va a administrar se registre en `https://sudominio.com/register`.
2. Promovela a mano contra la base:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@sudominio.com';
```

3. **Que cierre sesión y vuelva a entrar.** El rol viaja dentro del JWT
   (`src/auth.ts`), así que la sesión vieja sigue siendo `USER` hasta que se
   renueve.
4. Verificá que `/dashboard` abra.

## 9. Carga inicial

En este orden, porque cada cosa depende de la anterior:

1. **`/dashboard/categorias`** — no hay seed, y sin al menos una categoría no se
   puede cargar ningún vehículo.
2. **`/dashboard/settings`** — como mínimo: nombre de la concesionaria, email de
   contacto (es el que recibe los avisos, no sale de ninguna variable de
   entorno), teléfono, WhatsApp, dirección, horarios, y la cotización del dólar
   si publican precios en dólares. Después: logo, favicon, textos de portada y
   la paleta de colores.

   Preguntale al cliente si publica los precios. Si prefiere manejarlos por
   consulta, apagá **Precios → Mostrar precios en el sitio** *antes* de cargar
   las unidades: con el interruptor apagado el alta no pide el importe y las
   unidades se guardan en cero. Si lo apagás después, los precios ya cargados
   quedan guardados y vuelven a aparecer si lo encendés de nuevo.
3. **`/dashboard/vehicles`** — dos o tres unidades reales para que la entrega no
   se vea vacía.

Una configuración incompleta no rompe nada: el sitio cae a textos genéricos. Se
ve mal, pero no se cae.

## 10. Verificación antes de entregar

- [ ] La portada carga con el nombre y los colores del cliente
- [ ] El catálogo filtra, ordena y pagina
- [ ] Una ficha de vehículo abre y el botón de WhatsApp arma bien el mensaje
- [ ] Los precios se ven —o no— según lo que eligió el cliente, en la portada,
      el catálogo y la ficha
- [ ] Enviar una consulta desde el sitio → aparece en `/dashboard/consultas`
- [ ] Llegó el aviso por correo de esa consulta
- [ ] Login con Google y con contraseña, ambos
- [ ] Subir una foto desde el panel y verla en el catálogo
- [ ] `https://` fuerza redirección y el candado está bien
- [ ] `www` redirige al dominio principal
- [ ] **Quitar `MAIL_TO`** y volver a desplegar, para que los avisos empiecen a
      ir al cliente

## 11. Entrega

- Credenciales de las cuatro cuentas del cliente en el gestor compartido.
- Explicarle que el dominio es suyo y está a su nombre.
- Mostrarle `/dashboard`: cargar un vehículo, cambiar el estado de una consulta,
  actualizar la cotización del dólar.
- Dejarle claro qué queda a cargo tuyo (actualizaciones, hosting) y qué no.

## Referencia: de dónde sale cada variable

| Variable | Paso | Obligatoria |
| --- | --- | --- |
| `DATABASE_HOST` `DATABASE_PORT` `DATABASE_NAME` `DATABASE_USER` `DATABASE_PASSWORD` | 2 | Sí |
| `DATABASE_URL` | 2 | Sí, para el build |
| `DATABASE_POOL_MAX` | — | No (subirlo solo en contenedor) |
| `AUTH_SECRET` | 6 | Sí, uno nuevo por cliente |
| `AUTH_GOOGLE_ID` `AUTH_GOOGLE_SECRET` | 4 | Sí |
| `AUTH_TRUST_HOST` | 6 | Sí (`true`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` `CLOUDINARY_API_KEY` `CLOUDINARY_API_SECRET` | 3 | Sí |
| `RESEND_API_KEY` `MAIL_FROM` | 5 | No, pero sin ellas no hay avisos |
| `MAIL_TO` | 5 | Solo durante la puesta en marcha |
| `APP_URL` | 7 | En Vercel se deduce; cargarla igual |
| `NEXT_PUBLIC_FEATURE_FINANCIACION` | — | No (hoy apagada) |

## Pendientes conocidos

Cosas que hoy se resuelven a mano y convendría resolver en el código:

- **La promoción a ADMIN** (paso 8) requiere entrar a la base. Un comando de
  consola o una variable con el correo del primer administrador lo sacaría del
  camino crítico de cada alta.
- **`/register` queda abierto** en todas las instalaciones. Un visitante puede
  crear una cuenta `USER`, que no habilita nada —el panel exige `ADMIN`— pero
  ensucia la tabla y no tiene ningún sentido en la web de un concesionario.
  Vale la pena cerrarlo una vez creado el administrador.
- **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`** solo se lee del lado del servidor
  (`src/actions/upload.ts`), así que el prefijo `NEXT_PUBLIC_` la congela en el
  build sin necesidad. Quitárselo es requisito para que una sola imagen de
  Docker pueda servir a varios clientes.

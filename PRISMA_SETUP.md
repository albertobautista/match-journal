# Configuración de Prisma

## Paso 1: Variables de Entorno

Copia el archivo `.env.example` a `.env` y actualiza tus credenciales de base de datos:

```bash
cp .env.example .env
```

Edita `.env` con tu conexión a PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/match_journal"
DIRECT_URL="postgresql://usuario:contraseña@localhost:5432/match_journal"
```

## Paso 2: Crear Migraciones

Después de hacer cambios al schema (`prisma/schema.prisma`), ejecuta:

```bash
npx prisma migrate dev --name <nombre_de_la_migracion>
```

Por ejemplo:
```bash
npx prisma migrate dev --name init
```

## Paso 3: Generar Prisma Client

El cliente de Prisma se genera automáticamente después de cada migración. Para regenerarlo manualmente:

```bash
npx prisma generate
```

## Comandos Útiles

- **Ver la base de datos visualmente:**
  ```bash
  npx prisma studio
  ```

- **Ver el estado de las migraciones:**
  ```bash
  npx prisma migrate status
  ```

- **Resetear la base de datos (solo desarrollo):**
  ```bash
  npx prisma migrate reset
  ```

## Estructura del Proyecto

- `prisma/schema.prisma` - Define tu schema de base de datos
- `prisma/migrations/` - Historial de migraciones
- `.env` - Variables de entorno (NO incluir en git)
- `.env.example` - Template de variables (incluir en git)

## Próximos Pasos

1. Define tus modelos en `prisma/schema.prisma`
2. Ejecuta `npx prisma migrate dev --name init`
3. Usa `@prisma/client` en tu código para interactuar con la base de datos

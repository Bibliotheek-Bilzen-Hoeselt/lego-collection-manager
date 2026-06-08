# 🧱 LEGO Collectiebeheer

Een web-app om je LEGO-collectie te beheren en vermiste onderdelen bij te houden. Gebouwd voor gebruik op tablet, met grote knoppen en hoog contrast voor mensen met een motorische beperking.

## Functies

- **Snel sets opzoeken** — zoek op naam, setnummer of thema
- **Onderdelen per set** — zie alle onderdelen, markeer ze als aanwezig/gedeeltelijk/vermist met één tik
- **Automatisch ingevuld** — set-informatie en onderdelen worden opgehaald via de [Rebrickable API](https://rebrickable.com/api/)
- **Export naar CSV** — exporteer vermiste onderdelen per set of over alle sets heen
- **Tablet-vriendelijk** — grote touch targets (min. 48×48px), duidelijke knoppen, hoog contrast

## Installatie

### 1. Clone & installeer

```bash
git clone <repo-url>
cd lego-collection-manager
npm install
```

### 2. Database instellen (Neon — gratis)

1. Ga naar [neon.tech](https://neon.tech) en maak een gratis account
2. Maak een nieuw project aan
3. Kopieer de **Connection string** (postgresql://...)

### 3. Rebrickable API key

1. Ga naar [rebrickable.com](https://rebrickable.com/users/add/) en maak een gratis account
2. Ga naar **Settings → API** en genereer een API key

### 4. Environment variabelen

Kopieer `.env.local.example` naar `.env.local` en vul in:

```bash
cp .env.local.example .env.local
```

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/lego?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/lego?sslmode=require"
REBRICKABLE_API_KEY="jouw_api_key"
```

### 5. Database migreren

```bash
npx prisma migrate dev --name init
```

### 6. Lokaal starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy op Vercel (gratis)

1. Push naar GitHub
2. Ga naar [vercel.com](https://vercel.com) → **New Project** → importeer je repo
3. Voeg de environment variabelen toe in de Vercel dashboard:
   - `DATABASE_URL`
   - `REBRICKABLE_API_KEY`
4. Deploy!

## Tech stack

- **Next.js 16** (App Router)
- **Prisma 7** + **Neon PostgreSQL** (serverless)
- **Tailwind CSS**
- **Rebrickable API** (LEGO data)
- **Lucide React** (iconen)

## Gebruik

1. **Set toevoegen**: tik op "Toevoegen" → voer setnummer in (bijv. `75192` of `10497-1`)
2. **Onderdelen controleren**: tik op een set → tik op elk onderdeel om status te wisselen
3. **Vermiste exporteren**: tik "Export CSV" op de set-pagina of op de "Vermist" tab

# CINOVA

Plateforme du **Challenge national de l'innovation agropastorale et numérique** — gestion des appels à candidature et de la notation du jury.
Portée par le **Réseau National des Chambres d'Agriculture du Niger (RECA)** — « Le Dernier Kilomètre ».

## Stack technique

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Style | Tailwind CSS v4 + design system CINOVA |
| Base de données | PostgreSQL 16 (cluster local du projet) |
| ORM | Prisma 6 |
| i18n | next-intl v4 — Français, Anglais, Haoussa |
| Auth | Auth.js (NextAuth v5) — *branché à l'Étape 2* |

## Prérequis

- Node.js 18+ et npm
- PostgreSQL 16 (Homebrew : `brew install postgresql@16`)

> La plateforme utilise un **cluster PostgreSQL dédié au projet** (dossier `.pgdata/`, port **5544**, sans mot de passe). Elle ne touche pas à votre instance PostgreSQL système.

## Démarrage

```bash
# 1. Installer les dépendances
npm install

# 2. Copier la configuration
cp .env.example .env

# 3. Démarrer la base + appliquer le schéma
npm run db:start
npm run db:migrate

# 4. Lancer le serveur de développement (démarre la base automatiquement)
npm run dev
```

L'application est disponible sur http://localhost:3000
(langues : `/fr` — défaut, `/en`, `/ha`).

## Scripts

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (démarre la base au préalable) |
| `npm run build` | Build de production |
| `npm run db:start` / `db:stop` | Démarre / arrête le cluster PostgreSQL local |
| `npm run db:status` | État du serveur |
| `npm run db:psql` | Console SQL sur la base `cinova` |
| `npm run db:migrate` | Applique les migrations Prisma |
| `npm run db:studio` | Interface Prisma Studio |

## Compte administrateur sur le VPS

Depuis le dossier du projet, avec Node.js 22+ et `DATABASE_URL` configurée
dans l'environnement ou dans `.env`, exécuter dans Bash :

```bash
git pull --ff-only origin main
npm ci
npx prisma generate
read -r -p "Email administrateur : " ADMIN_EMAIL
read -r -s -p "Mot de passe (12 caractères minimum) : " ADMIN_PASSWORD
echo
export ADMIN_EMAIL ADMIN_PASSWORD
npm run admin:create
unset ADMIN_EMAIL ADMIN_PASSWORD
```

La commande crée un compte administrateur avec un email validé. Si le compte
existe déjà avec un mot de passe, elle le promeut administrateur et conserve
son mot de passe actuel. Se reconnecter sur `/login`, puis ouvrir `/admin`.
Le mot de passe saisi n'est pas affiché et ne figure pas dans l'historique Bash.

## Structure

```
src/
  app/[locale]/        # Pages (i18n) : accueil, login, register
  components/          # Header, Footer, Logo, sélecteur de langue…
  i18n/                # Configuration next-intl (routing, request, navigation)
  lib/prisma.ts        # Client Prisma (singleton)
  proxy.ts             # Routage i18n (ex-middleware)
messages/              # Traductions fr / en / ha
prisma/schema.prisma   # Modèle de données
public/brand/          # Logo CINOVA
scripts/pg.sh          # Gestion du cluster PostgreSQL local
```

## Modèle de données (schéma initial)

- **User** — comptes + rôles : `CANDIDATE`, `ADMIN`, `JURY`, `REGIONAL_RELAY` (+ modèles Auth.js).
- **Team** — une candidature = une équipe (piste création/adaptation, statut, région).
- **TeamMember** — membres renseignés par le chef d'équipe.
- **Edition / Challenge** — édition du challenge et ses défis.
- **Setting** — configuration de la plateforme (ex. SMTP éditable depuis l'admin).

## Feuille de route (par étapes)

- [x] **Étape 1** — Mise en place : plateforme, design system, i18n, page d'accueil, schéma DB.
- [ ] **Étape 2** — Création de compte (email + mot de passe, vérification email).
- [ ] **Étape 3** — Renseignement des informations (profil, équipe, membres).
- [ ] Suite — dossier de candidature, dépôt, présélection, espace jury & notation, paramètres admin…

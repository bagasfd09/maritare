# Deploying Maritare to a production VPS

This guide describes a single-VPS production deployment using Docker Compose:

```
                          ┌──────────────── VPS ─────────────────┐
  Internet ──443──▶ Reverse proxy (Caddy/nginx, host) ──▶ web  (Next.js, 127.0.0.1:3000)
                          │                                  │
                          │                          postgres + redis  (compose network)
                          └───────────────────────────────────────┘
```

- **web** — the Next.js app (`docker compose` service `web`), bound to `127.0.0.1:3000`.
- **postgres** — PostgreSQL 16 with a persistent volume.
- **redis** — Redis 7 (used by BullMQ; the worker isn't enabled yet).
- **migrate** — a one-off job that applies DB migrations before each release.
- A **reverse proxy on the host** terminates TLS and forwards to `127.0.0.1:3000`.

Image delivery is via **GHCR**: GitHub Actions builds and pushes the image on merge to `main`, then deploys it to the VPS over SSH. You can also build on the VPS (no registry) — see [Alternative](#alternative-build-on-the-vps).

> Stack: Next.js 16, Node 22, pnpm, PostgreSQL 16, Redis 7, Cloudflare R2, Auth.js v5, Midtrans, Fonnte, Resend.

---

## 1. Prerequisites

- A VPS (Debian/Ubuntu assumed) with a public IP, root or sudo.
- A domain pointed at the VPS (`A` record), e.g. `maritare.id` and/or `app.maritare.id`.
- Ports **80** and **443** open (plus **22** for SSH).
- Docker Engine + the Compose plugin:

```bash
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

---

## 2. First-time provisioning

### 2.1 Get the deploy files onto the VPS

The VPS needs `docker-compose.prod.yml`, `Dockerfile`, `scripts/`, and `.env`. Cloning the repo is simplest (also enables `git pull` during deploys):

```bash
sudo mkdir -p /opt/maritare && sudo chown "$USER" /opt/maritare
git clone https://github.com/<owner>/<repo>.git /opt/maritare
cd /opt/maritare
```

> `/opt/maritare` is the **app dir** referenced later as `VPS_APP_DIR`.

### 2.2 Create the production `.env`

Create `/opt/maritare/.env`. It is read by the `web` and `migrate` containers and never committed. Fill every value:

```dotenv
# ---- Postgres (compose-internal; password is required) ----
POSTGRES_USER=maritare
POSTGRES_PASSWORD=<long-random-password>
POSTGRES_DB=maritare

# ---- App config ----
# DB + Redis hostnames are the compose service names, not localhost.
DATABASE_URL=postgresql://maritare:<same-password>@postgres:5432/maritare
REDIS_URL=redis://redis:6379

# Public origin (https). Used for metadata/OG + invite links.
NEXT_PUBLIC_APP_URL=https://maritare.id

# ---- Auth.js v5 ----
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://maritare.id
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ---- Cloudflare R2 ----
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=maritare-media
# IMPORTANT in prod: a public CDN domain bound to the bucket (Image Resizing on),
# so WhatsApp/OG share images + gallery photos use stable, non-expiring URLs.
R2_PUBLIC_URL=https://media.maritare.id

# ---- Midtrans (set IS_PRODUCTION=true with live keys) ----
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=true

# ---- Fonnte (WhatsApp) ----
FONNTE_TOKEN=

# ---- Resend (email) ----
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@maritare.id
```

Generate the secrets:

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD (then set it in DATABASE_URL too)
```

Lock the file down: `chmod 600 .env`.

> `NEXT_PUBLIC_APP_URL` is also baked into the image at build time by CI (as a build-arg from the `NEXT_PUBLIC_APP_URL` repo **variable**). Keep the two in sync.

### 2.3 Authenticate to GHCR (if the image is private)

By default GHCR packages are private. Log in on the VPS with a GitHub PAT that has `read:packages`:

```bash
echo <GHCR_PAT> | docker login ghcr.io -u <github-username> --password-stdin
```

Then set the image in `.env` *or* rely on the Action passing `WEB_IMAGE`. For manual runs, export it:

```bash
export WEB_IMAGE=ghcr.io/<owner>/<repo>:latest
```

(If you make the package **public** in GitHub → Packages, no login is needed.)

### 2.4 First deploy

```bash
cd /opt/maritare
export WEB_IMAGE=ghcr.io/<owner>/<repo>:latest   # or a specific :sha-xxxxxxx
./scripts/deploy.sh
```

`deploy.sh` pulls the image, runs migrations (`migrate` service → `scripts/migrate.mjs`), then starts `postgres`, `redis`, and `web`. Verify:

```bash
docker compose -f docker-compose.prod.yml ps
curl -I http://127.0.0.1:3000        # expect HTTP 200/307
```

### 2.5 Reverse proxy + TLS

**Caddy** (simplest — automatic HTTPS):

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

`/etc/caddy/Caddyfile`:

```caddy
maritare.id {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
sudo systemctl reload caddy
```

Caddy provisions and renews Let's Encrypt certs automatically. Point DNS at the VPS first.

<details>
<summary>nginx + certbot alternative</summary>

```nginx
server {
    server_name maritare.id;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```
Then `sudo certbot --nginx -d maritare.id`. The `X-Forwarded-Proto` header is required so Auth.js builds correct callback URLs behind TLS.
</details>

---

## 3. CI/CD — auto-deploy on merge to `main`

Two workflows live in `.github/workflows/`:

- **`ci.yml`** — on every PR to `main`: `pnpm install → typecheck → lint → build`.
- **`deploy.yml`** — on push/merge to `main`: re-runs the checks, builds & pushes the image to GHCR, then SSHes to the VPS and runs `git pull` + `scripts/deploy.sh` with the new image tag.

### Required GitHub configuration

Repo → **Settings → Secrets and variables → Actions**.

**Secrets:**

| Secret | What |
| --- | --- |
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH user (e.g. `deploy`) |
| `VPS_SSH_KEY` | Private key (PEM) whose public key is in the VPS user's `~/.ssh/authorized_keys` |
| `VPS_APP_DIR` | App dir on the VPS (e.g. `/opt/maritare`) |
| `VPS_PORT` | SSH port (optional, default `22`) |

**Variables:**

| Variable | What |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public origin, e.g. `https://maritare.id` (baked into the image at build) |

Notes:
- GHCR push uses the built-in `GITHUB_TOKEN` (no secret needed) via the `packages: write` permission already set in `deploy.yml`.
- The VPS must be able to `docker pull` the image — either log in to GHCR (§2.3) or make the package public.
- The deploy SSH user needs Docker permission (`sudo usermod -aG docker <user>`).
- `appleboy/ssh-action` is third-party; pin it to a commit SHA if you want stricter supply-chain hygiene (a comment marks the line).

---

## 4. Operations

```bash
cd /opt/maritare
C="docker compose -f docker-compose.prod.yml"

$C logs -f web              # tail app logs
$C ps                       # status
$C restart web              # restart the app
$C run --rm migrate         # apply migrations manually
$C down                     # stop everything (keeps volumes/data)
```

### Backups (do this before relying on it in prod)

```bash
# nightly pg_dump via cron
docker compose -f /opt/maritare/docker-compose.prod.yml exec -T postgres \
  pg_dump -U maritare maritare | gzip > /opt/backups/maritare-$(date +\%F).sql.gz
```

Restore: `gunzip -c dump.sql.gz | docker compose ... exec -T postgres psql -U maritare -d maritare`.

### Rollback

Every push tags an immutable image `ghcr.io/<owner>/<repo>:sha-<7>`. To roll back:

```bash
export WEB_IMAGE=ghcr.io/<owner>/<repo>:sha-<older>
./scripts/deploy.sh
```

> Migrations are forward-only; rolling the image back does not revert schema changes. Avoid destructive migrations, or restore from a backup if needed.

---

## 5. Alternative: build on the VPS

No registry — build the image on the VPS from the checked-out repo:

```bash
cd /opt/maritare
git pull --ff-only
BUILD_LOCALLY=1 ./scripts/deploy.sh
```

`docker-compose.prod.yml` has a `build:` block for this. Building Next.js is memory-hungry; give the VPS ≥2 GB RAM (or swap).

---

## 6. Verification checklist

- [ ] `curl -I https://maritare.id` returns 200/307 with a valid cert.
- [ ] Sign-in works (Auth.js callback resolves to the https origin — `AUTH_URL` set, proxy forwards `X-Forwarded-Proto`).
- [ ] An invitation page renders and the WhatsApp link preview shows an image (needs `R2_PUBLIC_URL`).
- [ ] `docker compose ... run --rm migrate` reports "migrations applied".
- [ ] A test push to `main` triggers the Action and the change appears live.

## 7. Security & pre-launch notes

- Firewall: allow only 22/80/443 (`ufw allow 22,80,443/tcp`); postgres/redis are not published.
- `.env` is `chmod 600`, never committed; rotate any secret that leaks.
- Set `MIDTRANS_IS_PRODUCTION=true` with **live** keys only when going live.
- Set `R2_PUBLIC_URL` in prod — otherwise share/OG images fall back to 1-hour presigned URLs that can 403 on re-crawl.
- The Scarlet/Folk templates use third-party design assets (see `AGENTS.md`); replace them with own-licensed art before public launch.

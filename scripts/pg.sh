#!/usr/bin/env bash
# Cluster PostgreSQL local et isolé pour le projet CINOVA.
# N'utilise PAS l'instance Postgres système : tout vit dans .pgdata/ (gitignoré),
# sur un port dédié, en authentification "trust" (aucun mot de passe requis en local).
set -euo pipefail

# macOS : évite "postmaster became multithreaded during startup" (locale invalide)
export LC_ALL=C
export LANG=C

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA="$ROOT_DIR/.pgdata"
PGPORT="${CINOVA_PGPORT:-5544}"
PGUSER="cinova"
PGDB="cinova"
LOGFILE="$PGDATA/server.log"

find_bin() {
  # Trouve les binaires Postgres (Homebrew ou PATH)
  if command -v pg_ctl >/dev/null 2>&1; then return 0; fi
  for d in /opt/homebrew/opt/postgresql@16/bin /usr/local/opt/postgresql@16/bin /opt/homebrew/bin /usr/local/bin; do
    if [ -x "$d/pg_ctl" ]; then export PATH="$d:$PATH"; return 0; fi
  done
  echo "ERREUR: binaires PostgreSQL introuvables (installez postgresql@16)." >&2
  exit 1
}

cmd_init() {
  find_bin
  if [ -d "$PGDATA" ] && [ -f "$PGDATA/PG_VERSION" ]; then
    echo "Cluster déjà initialisé dans $PGDATA"
    return 0
  fi
  mkdir -p "$PGDATA"
  echo "Initialisation du cluster (utilisateur=$PGUSER, auth=trust)..."
  initdb -D "$PGDATA" -U "$PGUSER" --auth=trust --encoding=UTF8 --locale=C >/dev/null
  echo "port = $PGPORT" >> "$PGDATA/postgresql.conf"
  echo "listen_addresses = 'localhost'" >> "$PGDATA/postgresql.conf"
  echo "Cluster initialisé."
}

cmd_start() {
  find_bin
  cmd_init
  if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
    echo "Serveur déjà démarré (port $PGPORT)."
    return 0
  fi
  echo "Démarrage du serveur PostgreSQL sur le port $PGPORT..."
  pg_ctl -D "$PGDATA" -l "$LOGFILE" -o "-p $PGPORT" start
  # Attendre que le serveur réponde
  for _ in $(seq 1 30); do
    if pg_isready -h localhost -p "$PGPORT" -U "$PGUSER" >/dev/null 2>&1; then break; fi
    sleep 0.3
  done
  # Créer la base si absente
  if ! psql -h localhost -p "$PGPORT" -U "$PGUSER" -lqt | cut -d '|' -f1 | grep -qw "$PGDB"; then
    createdb -h localhost -p "$PGPORT" -U "$PGUSER" "$PGDB"
    echo "Base '$PGDB' créée."
  fi
  echo "Prêt : postgresql://$PGUSER@localhost:$PGPORT/$PGDB"
}

cmd_stop() {
  find_bin
  if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
    pg_ctl -D "$PGDATA" -m fast stop
    echo "Serveur arrêté."
  else
    echo "Serveur déjà arrêté."
  fi
}

cmd_status() {
  find_bin
  pg_ctl -D "$PGDATA" status || true
}

cmd_psql() {
  find_bin
  psql -h localhost -p "$PGPORT" -U "$PGUSER" "$PGDB"
}

case "${1:-}" in
  init)   cmd_init ;;
  start)  cmd_start ;;
  stop)   cmd_stop ;;
  status) cmd_status ;;
  psql)   cmd_psql ;;
  *) echo "Usage: $0 {init|start|stop|status|psql}"; exit 1 ;;
esac

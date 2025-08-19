name: Init Railway DB (one-time)

on:
  workflow_dispatch:   # ← GitHubから手動実行できる

jobs:
  init-db:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install PostgreSQL client
        run: sudo apt-get update && sudo apt-get install -y postgresql-client

      - name: Run init.sql on Railway DB
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: psql "$DATABASE_URL" -f backend/init.sql

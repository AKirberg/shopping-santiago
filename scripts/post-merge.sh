#!/bin/bash
set -e

npm install

: "${DATABASE_URL:?DATABASE_URL is required to apply the development review schema}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/review-reporting.sql

web: npm run start
worker: celery -A celery_app worker -E -Q celery,check_website,check_dns --loglevel=warning --max-tasks-per-child=1000 --concurrency=$CELERY_CONCURRENCY
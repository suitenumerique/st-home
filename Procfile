web: npm run start
worker: bash -c "cd data/ && export HOME=/app/data && source .profile.d/python.sh && celery -A celery_app worker -E -Q celery,check_website,check_dns --loglevel=warning --concurrency=$CELERY_CONCURRENCY --max-tasks-per-child=2000 -P gevent"
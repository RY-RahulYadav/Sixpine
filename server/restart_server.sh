#!/bin/bash
echo "Stopping any running Django processes..."
pkill -f "manage.py runserver" 2>/dev/null
sleep 2

echo "Clearing Python cache..."
find . -type d -name __pycache__ -exec rm -r {} + 2>/dev/null
find . -name "*.pyc" -delete 2>/dev/null

echo ""
echo "Starting Django server..."
echo ""
python manage.py runserver


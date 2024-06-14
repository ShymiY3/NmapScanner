#!/bin/bash
source /home/shymi/inzynierka/venv/bin/activate
exec /home/shymi/inzynierka/backend/venv/bin/python /home/shymi/inzynierka/backend/run_nmap.py "$@"

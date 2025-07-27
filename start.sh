#!/bin/bash

# Start nginx in background
nginx &

# Start Flask application
python main.py 
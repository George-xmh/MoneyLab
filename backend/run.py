"""
MoneyLab Backend Application Entry Point
"""
import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='127.0.0.1', port=port, debug=debug)

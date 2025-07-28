# Virtual Environment Setup Guide

## Overview

This project uses a Python virtual environment to isolate dependencies and avoid conflicts with other Python projects.

## Quick Start

### Windows (PowerShell)
```powershell
# Run the activation script
.\activate_venv.ps1
```

### Windows (Command Prompt)
```cmd
# Run the activation script
activate_venv.bat
```

### Manual Setup

#### 1. Create Virtual Environment
```bash
python -m venv venv
```

#### 2. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Verify Installation
```bash
python -c "from main import app; print('Flask app imported successfully')"
```

## Virtual Environment Structure

```
venv/
├── Scripts/              # Windows activation scripts
│   ├── activate.bat
│   ├── Activate.ps1
│   └── python.exe
├── bin/                  # Linux/Mac activation scripts
│   ├── activate
│   └── python
├── Lib/
│   └── site-packages/    # Installed packages
└── pyvenv.cfg           # Virtual environment configuration
```

## Installed Packages

The following packages are installed in the virtual environment:

- **Flask==2.3.3** - Web framework
- **requests==2.31.0** - HTTP library
- **python-dotenv==1.0.0** - Environment variable management
- **Flask-Caching==2.1.0** - Caching support
- **Flask-CORS==4.0.0** - Cross-Origin Resource Sharing

## Usage

### Starting the Application

1. **Activate the virtual environment:**
   ```bash
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Windows Command Prompt
   venv\Scripts\activate.bat
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Run the Flask application:**
   ```bash
   python main.py
   ```

3. **Access the application:**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000 (if running)

### Deactivating the Virtual Environment

```bash
deactivate
```

## Environment Variables

Create a `.env` file in the project root with your configuration:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your-actual-openai-api-key
OPENAI_ORG_ID=your-organization-id (optional)

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

## Troubleshooting

### Common Issues

#### 1. Virtual Environment Not Found
```bash
# Recreate the virtual environment
rmdir /s venv
python -m venv venv
```

#### 2. Permission Errors (Windows)
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. Missing Dependencies
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

#### 4. Flask App Import Error
```bash
# Check if all dependencies are installed
pip list
```

### Verification Commands

```bash
# Check Python version
python --version

# Check pip version
pip --version

# List installed packages
pip list

# Test Flask import
python -c "from main import app; print('Success')"
```

## Development Workflow

1. **Always activate the virtual environment before development:**
   ```bash
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

2. **Install new dependencies:**
   ```bash
   pip install package-name
   pip freeze > requirements.txt
   ```

3. **Run tests:**
   ```bash
   python test_api.py
   ```

4. **Deactivate when done:**
   ```bash
   deactivate
   ```

## Git Integration

The `venv/` directory is typically excluded from version control. Add to `.gitignore`:

```
venv/
__pycache__/
*.pyc
.env
```

## Benefits of Virtual Environment

- ✅ **Isolation:** Dependencies don't conflict with other projects
- ✅ **Reproducibility:** Same environment across different machines
- ✅ **Clean Installation:** No system-wide package pollution
- ✅ **Easy Management:** Simple activation/deactivation
- ✅ **Version Control:** Specific package versions for consistency

## Next Steps

After setting up the virtual environment:

1. Set up your `.env` file with API keys
2. Run the Flask application: `python main.py`
3. Test the API endpoints: `python test_api.py`
4. Access the frontend at http://localhost:3000 
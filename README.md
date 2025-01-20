# Xccel
# Hackathon: Hackville 2025
# Devpost: https://github.com/RafayK-code

# Running Front End

cd react-frontend

npm install

npm start


# Backend Steps

cd backend

python -m venv venv (to create virtual environment)

source venv/Scripts/activate (on Linux/MacOS)

venv\Scripts\activate (on Windows)

.\venv\Scripts\activate (on PowerShell)

pip install -r requirements.txt


# Running Chrome Extension on Chrome Web Browser

cd react-frontend

npm run build

(After build is made):

Remove static folder, index.html, and asset-manifest.json from chrome-extension folder

Copy the static folder, index.html, and asset-manifest.json from react-frontend/build and paste into chrome-extension folder

Go to chrome://extensions/ website, turn developer mode on.

If first time running the chrome extension, click load unpacked and select the chrome-extension folder

If already uploaded the project folder, then just refresh and changes will update.

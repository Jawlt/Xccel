[![GitHub Xccel][xccel-image]][xccel-edit-link]

[xccel-image]: https://socialify.git.ci/Jawlt/xccel/image?custom_description=%F0%9F%A5%89+Hackville+2025%0A&description=1&font=Inter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fhackville.s3.us-east-1.amazonaws.com%2Fhacklogo.png&name=1&pattern=Circuit+Board&pulls=1&stargazers=1&theme=Light
[xccel-edit-link]: https://socialify.git.ci/Jawlt/xccel?custom_description=%F0%9F%A5%89%20Hackville%202025%0A&description=1&font=Inter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fhackville.s3.us-east-1.amazonaws.com%2Fhacklogo.png&name=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Light

# Running Front End

cd react-frontend

npm install

npm start


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


## Acknowledgment

This project utilizes [Socialify](https://socialify.git.ci/) for generating stylish repository previews.

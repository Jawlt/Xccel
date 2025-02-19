[![GitHub Xccel][xccel-image]][xccel-edit-link]

[xccel-image]: https://socialify.git.ci/Jawlt/xccel/image?custom_description=%F0%9F%A5%89+Hackville+2025%0A&description=1&font=Inter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fhackville.s3.us-east-1.amazonaws.com%2Fhacklogo.png&name=1&pattern=Circuit+Board&pulls=1&stargazers=1&theme=Light
[xccel-edit-link]: https://socialify.git.ci/Jawlt/xccel?custom_description=%F0%9F%A5%89%20Hackville%202025%0A&description=1&font=Inter&forks=1&issues=1&language=1&logo=https%3A%2F%2Fhackville.s3.us-east-1.amazonaws.com%2Fhacklogo.png&name=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Light

```bash
Devpost: https://devpost.com/software/xccel
```

# Running Front End

```bash
cd react-frontend
```
```bash
npm install
```
```bash
npm start
```

# Running Front End

```bash
cd react-frontend
```
```bash
npm install
```
```bash
npm start
```

# Backend Steps

```bash
cd backend
```
```bash
python -m venv venv (to create virtual environment)
```
```bash
source venv/Scripts/activate (on Linux/MacOS)
```
```bash
venv\Scripts\activate (on Windows)
```
```bash
.\venv\Scripts\activate (on PowerShell)
```
```bash
pip install -r requirements.txt
```

# Running Chrome Extension on Chrome Web Browser

(After build is made):
1. Remove static folder, index.html, and asset-manifest.json from chrome-extension folder
2. Copy the static folder, index.html, and asset-manifest.json from react-frontend/build and paste into chrome-extension folder

Or
```bash
cd (to root directory)
```
```bash
bash deploy.sh (deply.sh is for maxOs/Linux)
```

Go to `chrome://extensions/` website, turn developer mode on.

If first time running the chrome extension, click load unpacked and select the chrome-extension folder

If already uploaded the project folder, then just refresh and changes will update.

## 1. Setting Up Environment Variables

We have provided a setup script to help you configure your environment variables quickly.

### Steps to Set Up:

1. **Ensure you are in the project's root directory**, where the `setup_env.sh` script is located.

2. **Run the environment setup script** to copy the required `.env` files:

   ```bash
   bash setup_env.sh
   ```

## Acknowledgment

This project utilizes [Socialify](https://socialify.git.ci/) for generating stylish repository previews.

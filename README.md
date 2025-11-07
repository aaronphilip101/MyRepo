# EstateHub Mobile Web Application

A responsive real-estate browsing experience built with HTML5, SCSS, TypeScript and jQuery. The application showcases Firebase authentication, Firestore persistence for viewing reservations and listing creation, plus Google Maps integration for property directions.

## Features

- Curated property catalogue with detailed views, galleries and feature tags.
- Responsive layouts optimised for mobile and tablet breakpoints.
- Firebase Authentication support for email/password login and registration.
- Firestore integration to store viewing reservations and property listings.
- Google Maps embedding for each property to display location information.

## Project Structure

```
public/
  index.html      # Main application shell and markup
  css/main.css    # Compiled CSS generated from the SCSS source
  js/app.js       # Compiled JavaScript generated from src/app.ts
src/
  app.ts          # TypeScript source responsible for app logic
  styles/main.scss # SCSS source defining the design system
```

## Getting Started (No-Code Friendly)

Follow these steps if you simply want to open and use the project on your own computer without writing any code.

1. **Download the project files.**
   - If this repository is on GitHub, press the green **Code** button and choose **Download ZIP**.
   - After the download finishes, right-click the ZIP file and select **Extract All…** (Windows) or double-click it (macOS) to unpack the `EstateHub` folder.

2. **Install a simple local web server.** Browsers block some features when you just double-click an HTML file, so the safest option is to run a tiny web server.
   - Install [Node.js](https://nodejs.org/en/download/) (LTS version) if it is not already on your machine.
   - Open a terminal/command prompt inside the extracted folder and run:

     ```bash
     npx serve public
     ```

     The command downloads a temporary utility called `serve` and shares the `public/` folder at a local address such as `http://localhost:3000`.

   - Prefer a different tool? Any static web server (VS Code “Live Server” extension, Python’s `python -m http.server` etc.) that points at the `public/` folder will work the same way.

3. **Open the printed address in your browser.** The EstateHub interface should load and let you browse the demo listings immediately.

4. **(Optional) Connect your own Firebase project.**
   - Create a Firebase project and enable **Authentication** (Email/Password) and **Firestore** (native mode).
   - Copy the configuration block Firebase gives you and paste it into `public/index.html` (or a separate file you load before `app.js`) so the snippet looks like this:

     ```html
     <script>
       window.ESTATE_HUB = {
         firebaseConfig: {
           apiKey: 'YOUR_KEY',
           authDomain: 'YOUR_DOMAIN',
           projectId: 'YOUR_PROJECT_ID',
           storageBucket: 'YOUR_BUCKET',
           messagingSenderId: 'YOUR_SENDER_ID',
           appId: 'YOUR_APP_ID'
         }
       };
     </script>
     ```

   - Refresh the browser tab after saving the file. Sign-up, login, viewing reservations and ad creation will now use your Firebase/Firestore project.

5. **(Optional) Enable Google Maps.** Replace `YOUR_GOOGLE_MAPS_API_KEY` in `public/index.html` with your own Maps JavaScript API key and reload the page to see real maps instead of placeholders.

6. **Test on your phone or tablet.** With the `serve` command running, you can open the same `http://localhost:3000` address on any device connected to the same Wi-Fi network. This helps you experience the mobile layout exactly as intended.

## Put the project on your own GitHub

Follow these steps if you want the EstateHub files to appear in a GitHub repository under your account. The instructions assume you downloaded the ZIP from GitHub in the “Getting Started” section above and already extracted it to a folder on your computer.

1. **Install Git.**
   - Windows: install [Git for Windows](https://git-scm.com/download/win). Keep the default settings so you can use the "Git Bash" terminal.
   - macOS: install via [Homebrew](https://brew.sh/) (`brew install git`) or download the [official installer](https://git-scm.com/download/mac).
   - Linux: use your package manager (for example `sudo apt install git`).

2. **Create an empty repository on GitHub.**
   - Visit [https://github.com/new](https://github.com/new) while signed in.
   - Give the repository a name such as `estatehub` and leave it **empty** (no README or .gitignore yet). Copy the **HTTPS** URL that GitHub shows on the final page (for example `https://github.com/yourname/estatehub.git`).

3. **Open a terminal in the project folder.**
   - On Windows, right-click inside the folder and choose **Git Bash Here**.
   - On macOS or Linux, open Terminal and `cd` into the folder that contains `public/`, `src/`, and `README.md`.

4. **Initialise Git and make your first commit.** Run the following commands exactly as written (replace `"Initial commit"` with a message you like if desired):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

5. **Connect the local folder to your GitHub repository.** Replace the example URL with the one you copied in step 2:

   ```bash
   git remote add origin https://github.com/yourname/estatehub.git
   ```

6. **Upload (push) the code to GitHub.**

   ```bash
   git push -u origin main
   ```

   - The first push may ask for your GitHub username/password or a Personal Access Token. GitHub’s [token guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) walks you through generating one if needed.
   - After the push finishes, refresh your new repository page on GitHub—you should see all of the EstateHub files there.

7. **Keep GitHub in sync.** Whenever you change files locally:
   - Run `git status` to see what changed.
   - Stage and commit (`git add . && git commit -m "Describe your change"`).
   - Upload the new commits (`git push`).

## Firestore Collections

- `properties`: stores property advertisements created by authenticated users. Documents follow the `Property` schema defined in `src/app.ts`.
- `viewings`: stores viewing reservation requests created through the booking form.

## Development Notes

- Keep `src/app.ts` and `src/styles/main.scss` as your source of truth. If you make updates, remember to recompile to `public/js/app.js` and `public/css/main.css`.
- The application falls back to bundled sample properties when Firebase or Firestore are unavailable, allowing offline demonstrations.
- Comments are provided throughout the HTML, SCSS and TypeScript files to outline structural decisions and aid future maintenance.
- Want to modify the look or functionality? Edit the files in `src/`, run `npm install` followed by `npm run build` (or your chosen TypeScript/SCSS build pipeline) to regenerate the compiled assets in `public/`.

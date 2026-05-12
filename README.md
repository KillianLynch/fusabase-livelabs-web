# Fusabase Recipe Share Workshop

This repository contains the Fusabase Recipe Share workshop, learner starter app, and finished reference implementation.

## Prerequisites

- Node.js 18 or later
- npm
- Live Server

## Quick Start

Clone the LiveLabs repository and move into the RecipeShare workshop folder:

```bash
git clone https://github.com/KillianLynch/fusabase-livelabs-web.git
cd fusabase-livelabs-web
```

Install the Fusabase JavaScript SDK from the workshop root:

```bash
npm install fusabase
```

Install Live Server if you do not already have it:

```bash
npm install -g live-server
```

Then serve the RecipeShare workshop root:

```bash
live-server --port=8000 --host=localhost
```

Open the entry point you need:

- Workshop shell: `http://localhost:8000/recipeshare/workshops/desktop/index.html`
- Starter app: `http://localhost:8000/starter/`
- Finished app: `http://localhost:8000/finished/`

Run the install and Live Server commands from `web/recipeShare`. The starter and finished apps both resolve the SDK from the shared root `node_modules/fusabase` folder, so one `npm install fusabase` makes both apps work.

## Repository Layout

- `recipeshare/`: Oracle LiveLabs workshop content and manifests
- `starter/`: learner editing surface for the labs
- `finished/`: completed reference implementation

## Workshop Flow

The workshop currently includes:

- Introduction
- Setup Fusabase
- Lab 1: Create Your First Project
- Lab 2: Connect the Starter App
- Lab 3: Build the Public Recipe Experience
- Lab 4: Authentication
- Lab 5: Write Recipe Data
- Lab 6: Photo Upload
- Lab 7: Security Rules

The setup lab is `recipeshare/start-environment/set-up-fusabase.md`.

## Starter App

Learners edit these files during the workshop:

- `starter/fusabase-config.js`: paste the generated Fusabase app config
- `starter/scripts/app.js`: implement the SDK TODOs directly in the real app flows for reads, auth, writes, edit, and photo upload
- `starter/index.html`: unhide the photo field in Lab 6
- `starter/scripts/data.js`: prebuilt support helpers used by the app

The starter app is intentionally incomplete. Preserve TODO markers unless a task is specifically completing that lab step.

## Finished App

The finished app shows the target workshop behavior. It connects with `finished/fusabase-config.js`, seeds demo recipe data, lists and filters recipes, supports auth, creates and edits recipes, records ratings, and uploads recipe photos.

Main files:

- `finished/index.html`
- `finished/scripts/app.js`
- `finished/scripts/data.js`
- `finished/scripts/view.js`
- `finished/styles/main.css`

# Fusabase Recipe Share Workshop — Web

This repository contains the **starter app**, **finished reference implementation**, and **per-lab checkpoints** for the Fusabase Recipe Share workshop (Web edition).

The workshop instructions are published on Oracle LiveLabs:

**[RecipeShare on LiveLabs (Web)](https://livelabs.oracle.com/ords/r/dbpm/livelabs/view-workshop?wid=4404)**

## Prerequisites

- Node.js 18 or later
- npm
- Live Server

## Quick Start

Clone this starter-app repo and move into it:

```bash
git clone https://github.com/KillianLynch/fusabase-livelabs-web.git
cd fusabase-livelabs-web
```

Install the Fusabase JavaScript SDK:

```bash
npm install fusabase
```

Install Live Server if you do not already have it:

```bash
npm install -g live-server
```

Serve the repo root:

```bash
live-server --port=8000 --host=localhost
```

Open the entry point you need:

- Starter app: `http://localhost:8000/starter/`
- Finished app: `http://localhost:8000/finished/`

The starter and finished apps both resolve the SDK from the shared root `node_modules/fusabase` folder, so one `npm install fusabase` makes both apps work.

## Repository Layout

- `starter/` — learner editing surface for the labs
- `finished/` — completed reference implementation
- `checkpoints/` — clean per-lab snapshots of the editable files

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

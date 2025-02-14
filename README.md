# Manga Tracker Dashboard

A modern, dark‑themed dashboard to track your manga collection from AniList. This tool integrates your AniList manga list, provides fuzzy search through your titles and synonyms, and automatically finds external reading links from multiple websites (with separate strategies for adult and non‑adult content).

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development & Running Both Frontend and Backend](#development--running-both-frontend-and-backend)
- [Configuration](#configuration)
- [Future Plans](#future-plans)
- [License](#license)

## Overview

The Manga Tracker Dashboard connects to the AniList GraphQL API to retrieve your personal manga list. It then allows you to:
- **Filter** your list by adult content or view all manga.
- **Search** titles (display name, native, synonyms) using fuzzy‑search (powered by Fuse.js) so that minor spelling differences won’t cause mismatches.
- **Toggle** between a traditional list view and a modern grid view.
- **Display external reading links** by searching dedicated websites:
  - For **adult manga**, it uses Omegascans and Toongod.
  - For **non‑adult manga**, it uses Comick (which uses a standard URL pattern).
- Enjoy a sleek dark theme inspired by popular modern designs (with fonts similar to Segoe UI, Tahoma, or even Helvetica).

## Features

- **AniList Integration:**  
  Fetches your manga list (with titles, synonyms, and cover images) using AniList’s GraphQL API.
  
- **Adult Content Filter:**  
  Toggle between "Adult Only" and "Show All" views. (The adult filter uses AniList’s `media.isAdult` and tag information.)
  
- **Fuzzy Search:**  
  Quickly search your manga by display title, English title, native title, or synonyms (powered by [Fuse.js](https://fusejs.io/)).

- **View Modes:**  
  Switch between a list view and a grid view (with nicely rounded cover images, etc.) to suit your preference.

- **External Links Search:**  
  For adult manga, external search is performed on Omegascans and Toongod. For non‑adult manga, only Comick is used. (The tool automatically verifies candidate links using custom logic to work around anti‑bot responses.)

- **Modern, Dark Theme:**  
  Enjoy a dark dashboard with modern fonts and a clean, elegant UI.

- **User Integration:**  
  (In future versions) Display your AniList username and avatar in the header.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ is recommended)
- npm

### Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/manga-tracker.git
   cd manga-tracker
2. **Install Backend Dependencies:**
   ```bash
    cd backend
    npm install
3. **Install Frontend Dependencies:**
   ```bash
    cd ../frontend
    npm install
4. **Configure Environment Variables:**
   ```bash
    ANILIST_API_URL=https://graphql.anilist.co
    ANILIST_USER=yourAniListUsername
    PORT=5001
   
## Usage

**Method 1: Seperate Terminals**
  1. **Backend**
     Open a terminal, navigate to the backend, and run:
     ```bash
      npm run dev
  2. **Frontend**
     Open another terminal, navigate to the frontend folder, and run:
     ```bash
      npm start
     
### Using the Dashboard
**Filter and Search:**
Use the Adult Only / Show All toggle buttons to switch between filtering modes.
Enter a search term into the search bar to use fuzzy‑matching on titles and synonyms.

**View Toggle:**
Click the List View or Grid View buttons to change how your manga items are arranged.

**External Links:**
Click on an individual manga item (or a dedicated “show external links” button within each item) to search for external reading links.

## Future Plans

**Additional External Website Integrations:**
    • Support for additional manga reading websites beyond Comick (for non‑adult) and Omegascans/Toongod (for adult).
    • A mechanism to dynamically update website integration without changing the core code.

**User Account Integration:**
    • Display AniList username and avatar on the dashboard header.
    • Allow users to authenticate and save preferences.

**Enhanced Adult Filtering:**
    • Improve the logic that determines adult content using both media.isAdult and tag information.
    • Provide more granular filters (e.g. by genre or content warnings).

**Improved UI/UX:**
    • Further modernize the dashboard (animations, transitions, etc.).
    • Responsive design improvements for mobile and tablet views.

**Backend Search Optimization:**
    • Option to move Fuse.js fuzzy search to the backend for large collections.

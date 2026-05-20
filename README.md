# spicetify-playlist-target

A Spicetify extension that adds a button to the now playing bar to instantly throw the current song into a specific playlist, without having to open context menus or clutter your Liked Songs.

## How it works
1. Right-click any playlist in your sidebar and select **"Set as target playlist"** (the custom button will turn green).
2. Click the new list icon on your playbar whenever you want to send the current track there.
3. If the song is already in that playlist, a native popup will ask if you want to add it anyway.
4. To reset, right-click any playlist and choose **"Clear target playlist"**.

Your choice is saved in localStorage, so it persists even after restarting Spotify.

## Installation

You can install this extension either automatically via Remote URL (recommended) or manually.

### Method 1: Remote URL (Recommended & Easiest)
This method allows Spicetify to fetch the extension directly from GitHub and keeps it updated automatically.

Run the following commands in your terminal (PowerShell on Windows, Terminal on Mac/Linux):

```bash
spicetify config extensions https://raw.githubusercontent.com/MasterEC27/spicetify-playlist-target/main/playlist-target.js
spicetify apply

# spicetify-playlist-target

A Spicetify extension that adds a button to the now playing bar to instantly throw the current song into a specific playlist, without having to open context menus or clutter your Liked Songs.

## How it works
1. Right-click any playlist in your sidebar and select **"Set as target playlist"** (the custom button will turn green).
2. Click the new list icon on your playbar whenever you want to send the current track there.
3. If the song is already in that playlist, a native popup will ask if you want to add it anyway.
4. To reset, right-click any playlist and choose **"Clear target playlist"**.

Your choice is saved in localStorage, so it persists even after restarting Spotify.

## Installation

1. Go to your Spicetify Extensions directory:
   - **Windows (PowerShell):** `shell:AppData\spicetify\Extensions`
   - **Linux/MacOS:** `~/.config/spicetify/Extensions/`

2. Create a file named `playlist-target.js` and paste the source code inside it.

3. Enable it via terminal:
```bash
spicetify config extensions playlist-target.js
spicetify apply

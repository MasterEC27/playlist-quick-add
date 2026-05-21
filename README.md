# Playlist Quick Add

A Spicetify extension that adds a button to the now playing bar to instantly throw the current song into a specific playlist, without having to open context menus or clutter your Liked Songs.

## Features
- Add the currently playing track to a chosen playlist with one click
- No need to open context menus
- Keeps your Liked Songs clean
- Remembers your selected playlist using `localStorage`

## How it works
1. Right-click any playlist in your sidebar  
   Select "Set as target playlist"  
   The custom button will turn green  

2. Click the new list icon on your playbar  
   The current track is instantly added to the selected playlist  

3. If the song is already in that playlist  
   A native popup will ask for confirmation  

4. To reset  
   Right-click any playlist  
   Select "Clear target playlist"

## Installation

### Method 1: Quick Install (Recommended)

Windows (PowerShell)
```
Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/MasterEC27/spicetify-playlist-target/main/playlist-target.js" -OutFile "$env:APPDATA\spicetify\Extensions\playlist-target.js"
spicetify config extensions playlist-target.js
spicetify apply
```

Linux / MacOS (Terminal)
```
curl -fsSL "https://raw.githubusercontent.com/MasterEC27/spicetify-playlist-target/main/playlist-target.js" -o ~/.config/spicetify/Extensions/playlist-target.js
spicetify config extensions playlist-target.js
spicetify apply
```

### Method 2: Manual Installation

1. Navigate to your Spicetify Extensions directory:
```
Windows: %appdata%\spicetify\Extensions\  
Linux/MacOS: ~/.config/spicetify/Extensions/
```
2. Create a file named:
```
playlist-target.js
```

3. Paste the extension source code inside it

4. Enable and apply the extension:
```
spicetify config extensions playlist-target.js
spicetify apply
```

## Persistence
Your selected playlist is saved using `localStorage`, so it persists even after restarting Spotify.

## License
MIT

// @ts-check

// NAME: Playlist Target
// AUTHOR: MasterEC
// DESCRIPTION: Adds a custom button next to the playbar to quickly add the currently playing track to a designated target playlist with persistence and duplicate checking.
// VERSION: 1.0.0

(function PlaylistTarget() {
  /** @type {any} */
  const SpicetifyWindow = window;

  // Retrieves the saved playlist from previous sessions
  /** @type {string | null} */
  let targetPlaylistUri = localStorage.getItem("playlist_target_uri");

  /** @type {string} */
  let targetPlaylistName = localStorage.getItem("playlist_target_name") || "";

  const BUTTON_ID = "playlist-target-custom-btn";

  /**
   * Verifies the availability of Spicetify core modules.
   * @returns {Promise<void>}
   */
  async function checkDependencies() {
    while (!SpicetifyWindow.Spicetify?.ContextMenu ||
      !SpicetifyWindow.Spicetify?.Platform?.PlaylistAPI ||
      !SpicetifyWindow.Spicetify?.PopupModal ||
      !SpicetifyWindow.Spicetify?.Player?.data) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  /**
   * Displays a system notification within the client.
   * @param {string} message 
   * @returns {void}
   */
  function sendNotification(message) {
    SpicetifyWindow.Spicetify.showNotification(message);
  }

  /**
   * Resolves the playlist name using DOM metadata.
   * @param {string} uri 
   * @returns {string}
   */
  function resolvePlaylistName(uri) {
    const id = uri.split(":").pop();
    const element = document.querySelector(`[href*="${id}"], [data-uri="${uri}"]`);
    if (element) {
      const text = element.textContent?.trim();
      if (text) return text;
    }
    return "Target Playlist";
  }

  /**
   * Initializes and registers the context menu items for playlists.
   * @returns {void}
   */
  function initContextMenu() {
    new SpicetifyWindow.Spicetify.ContextMenu.Item(
      "Set as target playlist",
      /** @param {string[]} uris */
      ([uri]) => {
        targetPlaylistUri = uri;
        targetPlaylistName = resolvePlaylistName(uri);

        // Persistent saving
        localStorage.setItem("playlist_target_uri", targetPlaylistUri);
        localStorage.setItem("playlist_target_name", targetPlaylistName);

        sendNotification(`Target destination set to: "${targetPlaylistName}"`);
        updateButtonState();
      },
      /** @param {string[]} uris */
      ([uri]) => {
        const type = SpicetifyWindow.Spicetify.URI.fromString(uri).type;
        return type === SpicetifyWindow.Spicetify.URI.Type.PLAYLIST ||
          type === SpicetifyWindow.Spicetify.URI.Type.PLAYLIST_V2;
      },
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`
    ).register();

    new SpicetifyWindow.Spicetify.ContextMenu.Item(
      "Clear target playlist",
      () => {
        targetPlaylistUri = null;
        targetPlaylistName = "";

        // Remove data
        localStorage.removeItem("playlist_target_uri");
        localStorage.removeItem("playlist_target_name");

        sendNotification("Custom target button deactivated.");
        updateButtonState();
      },
      () => targetPlaylistUri !== null
    ).register();
  }

  /**
   * Helper to execute the actual playlist insertion.
   * @param {string} playlistUri 
   * @param {string} trackUri 
   */
  async function addTrackToPlaylist(playlistUri, trackUri) {
    try {
      await SpicetifyWindow.Spicetify.Platform.PlaylistAPI.add(playlistUri, [trackUri], {
        position: { type: "BEFORE_ITEM", item: 0 }
      });
    } catch (error) {
      console.error("[PlaylistTarget] Error adding track:", error);
      sendNotification("Error occurred while adding the track.");
    }
  }

  /**
   * Handles the asynchronous addition and duplicate checking of the current track.
   * @returns {Promise<void>}
   */
  async function handleCustomButtonClick() {
    if (!targetPlaylistUri) {
      sendNotification("No target playlist selected. Right-click a playlist to set one.");
      return;
    }

    const currentTrackUri = SpicetifyWindow.Spicetify.Player.data?.item?.uri;
    if (!currentTrackUri) {
      sendNotification("No track currently playing.");
      return;
    }

    try {
      const playlistData = await SpicetifyWindow.Spicetify.Platform.PlaylistAPI.getContents(targetPlaylistUri);
      const isDuplicate = playlistData.items.some((/** @type {any} */ item) => item.uri === currentTrackUri);

      if (isDuplicate) {
        const container = document.createElement("div");
        container.style.padding = "20px";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "15px";

        const text = document.createElement("p");
        text.textContent = `This track is already in "${targetPlaylistName}". Do you want to add it again anyway?`;
        text.style.color = "var(--spice-text, #ffffff)";
        container.appendChild(text);

        const buttonWrapper = document.createElement("div");
        buttonWrapper.style.display = "flex";
        buttonWrapper.style.justifyContent = "flex-end";
        buttonWrapper.style.gap = "10px";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.style.padding = "8px 16px";
        cancelButton.style.borderRadius = "20px";
        cancelButton.style.border = "1px solid var(--spice-button, #ffffff)";
        cancelButton.style.background = "transparent";
        cancelButton.style.color = "var(--spice-text, #ffffff)";
        cancelButton.style.cursor = "pointer";
        cancelButton.style.fontWeight = "bold";
        cancelButton.onclick = () => SpicetifyWindow.Spicetify.PopupModal.hide();

        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Add anyway";
        confirmButton.style.padding = "8px 16px";
        confirmButton.style.borderRadius = "20px";
        confirmButton.style.border = "none";
        confirmButton.style.background = "var(--spice-button-active, #1db954)";
        confirmButton.style.color = "#000000";
        confirmButton.style.cursor = "pointer";
        confirmButton.style.fontWeight = "bold";
        confirmButton.onclick = () => {
          addTrackToPlaylist(/** @type {string} */(targetPlaylistUri), currentTrackUri);
          SpicetifyWindow.Spicetify.PopupModal.hide();
        };

        buttonWrapper.appendChild(cancelButton);
        buttonWrapper.appendChild(confirmButton);
        container.appendChild(buttonWrapper);

        SpicetifyWindow.Spicetify.PopupModal.display({
          title: "Already in playlist",
          content: container,
          isMedia: false
        });
      } else {
        await addTrackToPlaylist(targetPlaylistUri, currentTrackUri);
      }
    } catch (error) {
      console.error("[PlaylistTarget] Error checking playlist contents:", error);
      await addTrackToPlaylist(targetPlaylistUri, currentTrackUri);
    }
  }

  /**
   * Updates the visual state and accessibility attributes of the custom button.
   * @returns {void}
   */
  function updateButtonState() {
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;

    if (targetPlaylistUri) {
      btn.style.color = "var(--spice-button-active, #1db954)";
      btn.setAttribute("aria-label", `Add to: ${targetPlaylistName}`);
      btn.setAttribute("title", `Add to: ${targetPlaylistName}`);
    } else {
      btn.style.color = "var(--spice-subtext, #b3b3b3)";
      btn.setAttribute("aria-label", "Select a target playlist");
      btn.setAttribute("title", "Select a target playlist");
    }
  }

  /**
   * Injects the custom button into the DOM next to the native action element.
   * @returns {void}
   */
  function injectCustomButton() {
    if (document.getElementById(BUTTON_ID)) return;

    const targetContainer =
      document.querySelector(".main-nowPlayingBar-left") ||
      document.querySelector("[data-testid='now-playing-widget']") ||
      document.querySelector(".now-playing-bar-container") ||
      document.querySelector("[aria-label='Ora in riproduzione']") ||
      document.querySelector("[aria-label='Now playing']") ||
      document.querySelector(".Root__now-playing-bar");

    if (!targetContainer) return;

    const nativeButton = targetContainer.querySelector(
      "[data-testid='add-button'], button[aria-label*='Aungi'], button[aria-label*='Rimuovi'], button[aria-label*='Salva'], button[aria-label*='Add'], button[aria-label*='Save']"
    );

    const anchorPoint = nativeButton || targetContainer.querySelector(".main-trackInfo-container") || targetContainer.lastElementChild;
    if (!anchorPoint || !anchorPoint.parentNode) return;

    const customButton = document.createElement("button");
    customButton.id = BUTTON_ID;
    customButton.type = "button";

    customButton.style.background = "none";
    customButton.style.border = "none";
    customButton.style.cursor = "pointer";
    customButton.style.padding = "4px";
    customButton.style.display = "inline-flex";
    customButton.style.alignItems = "center";
    customButton.style.justifyContent = "center";
    customButton.style.transition = "transform 0.1s ease, color 0.2s ease";
    customButton.style.marginLeft = "12px";
    customButton.style.marginRight = "4px";
    customButton.style.verticalAlign = "middle";

    customButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
        `;

    customButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCustomButtonClick();
    });

    customButton.addEventListener("mouseenter", () => {
      if (!targetPlaylistUri) customButton.style.color = "var(--spice-text, #ffffff)";
      customButton.style.transform = "scale(1.08)";
    });
    customButton.addEventListener("mouseleave", () => {
      updateButtonState();
      customButton.style.transform = "scale(1)";
    });

    anchorPoint.parentNode.insertBefore(customButton, anchorPoint.nextSibling);
    updateButtonState();
  }

  /**
   * Initializes a MutationObserver to ensure button persistence against React lifecycle re-renders.
   * @returns {void}
   */
  function startDOMObserver() {
    const observer = new MutationObserver(() => {
      injectCustomButton();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setInterval(injectCustomButton, 1000);
  }

  /**
   * Main execution entry point.
   * @returns {Promise<void>}
   */
  async function main() {
    await checkDependencies();
    initContextMenu();
    injectCustomButton();
    startDOMObserver();
    console.log("[PlaylistTarget] Extension initialized with persistence and interactive modal.");
  }

  main();
})();

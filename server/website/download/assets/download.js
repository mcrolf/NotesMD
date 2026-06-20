/**
 * Loads latest.json and wires platform download buttons + checksum link.
 */
(function () {
  const PLATFORMS = [
    { key: "mac", buttonId: "btn-mac" },
    { key: "win", buttonId: "btn-win" },
    { key: "linux", buttonId: "btn-linux" },
  ];

  const statusEl = document.getElementById("release-status");
  const gridEl = document.getElementById("platform-grid");
  const checksumRow = document.getElementById("checksum-row");
  const checksumLink = document.getElementById("checksum-link");

  /** Manifest URL from ?manifest= query, html data attribute, or same-origin default */
  function resolveManifestUrl() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("manifest");
    if (fromQuery) {
      return fromQuery;
    }
    return document.documentElement.dataset.manifestUrl || "/downloads/notesmd/latest.json";
  }

  function setStatus(className, html) {
    statusEl.className = "status " + className;
    statusEl.innerHTML = html;
  }

  function formatReleased(dateStr) {
    if (!dateStr) {
      return "";
    }
    const parsed = new Date(dateStr + "T12:00:00Z");
    if (Number.isNaN(parsed.getTime())) {
      return dateStr;
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function applyManifest(manifest) {
    const version = manifest.version;
    const hasRelease = version && version !== "null";

    if (!hasRelease) {
      setStatus(
        "status--pending",
        "Desktop builds are not published yet. Check back soon or build from the private frontend repository."
      );
      gridEl.hidden = true;
      checksumRow.hidden = true;
      return;
    }

    const released = formatReleased(manifest.released);
    const releasedText = released ? ` · released ${released}` : "";
    setStatus(
      "status--ready",
      `Current release: <span class="version">v${escapeHtml(version)}</span>${escapeHtml(releasedText)}`
    );

    let anyLink = false;

    for (const { key, buttonId } of PLATFORMS) {
      const btn = document.getElementById(buttonId);
      const url = manifest.downloads && manifest.downloads[key];

      if (url) {
        btn.href = url;
        btn.removeAttribute("aria-disabled");
        btn.classList.remove("platform-card--disabled");
        anyLink = true;
      } else {
        btn.href = "#";
        btn.setAttribute("aria-disabled", "true");
        btn.classList.add("platform-card--disabled");
      }
    }

    gridEl.hidden = !anyLink;

    if (manifest.sha256) {
      checksumLink.href = manifest.sha256;
      checksumRow.hidden = false;
    } else {
      checksumRow.hidden = true;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadManifest() {
    const manifestUrl = resolveManifestUrl();

    try {
      const response = await fetch(manifestUrl, { cache: "no-cache" });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const manifest = await response.json();
      applyManifest(manifest);
    } catch (err) {
      setStatus(
        "status--error",
        "Could not load release information. Try again later or see the " +
          '<a href="https://github.com/mcrolf/NotesMD/blob/main/DOWNLOADS.md">download guide on GitHub</a>.'
      );
      gridEl.hidden = true;
      checksumRow.hidden = true;
      console.error("NotesMD download manifest failed:", manifestUrl, err);
    }
  }

  loadManifest();
})();

// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const APP_ID = "1863404124273847"; // <-- put your App ID here
const SHARE_PAGE = `${window.location.origin}/shareable.html`; // page we'll share
const CALLBACK_PATH = "/fb-share-callback.html";
const REDIRECT_URI = `${window.location.origin}${CALLBACK_PATH}`;

export default function App() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);

  const popupRef = useRef(null);
  const resolvedRef = useRef(false);
  const pollRef = useRef(null);
  const graceRef = useRef(null);

  useEffect(() => {
    function onMessage(e) {
      console.debug("onMessage event:", e);

      // STRICT origin check (safe). During debug you can temporarily relax this.
      if (e.origin !== window.location.origin) {
        console.debug("Ignored message from origin:", e.origin);
        return;
      }

      const data = e.data || {};
      console.debug("Callback data received:", data);

      if (typeof data.shared !== "undefined") {
        resolvedRef.current = true;

        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        if (graceRef.current) { clearTimeout(graceRef.current); graceRef.current = null; }

        try { if (popupRef.current && !popupRef.current.closed) popupRef.current.close(); } catch (_) {}

        setLoading(false);

        if (data.shared) {
          setType("success");
          setMessage(`Shared successfully. post_id: ${data.post_id || "unknown"}`);
        } else {
          setType("warning");
          setMessage("Share cancelled or not completed.");
        }
      }
    }

    window.addEventListener("message", onMessage, false);
    return () => window.removeEventListener("message", onMessage, false);
  }, []);

  const handleShare = () => {
    setLoading(true);
    setMessage("");
    resolvedRef.current = false;

    // Build Feed Dialog URL
    const feed = new URL("https://www.facebook.com/dialog/feed");
    feed.searchParams.set("app_id", APP_ID);
    feed.searchParams.set("display", "popup");
    // MUST share a page (with OG tags) — not a raw image URL
    feed.searchParams.set("link", SHARE_PAGE);
    feed.searchParams.set("redirect_uri", REDIRECT_URI);

    console.debug("Feed dialog URL:", feed.toString());
    // open popup
    popupRef.current = window.open(feed.toString(), "fb_feed", "width=700,height=600");

    if (!popupRef.current) {
      setLoading(false);
      setType("danger");
      setMessage("Popup blocked. Allow pop-ups to share.");
      return;
    }

    // Poll for popup close and give a short grace period for callback message
    pollRef.current = setInterval(() => {
      try {
        if (!popupRef.current || popupRef.current.closed) {
          clearInterval(pollRef.current);
          pollRef.current = null;

          if (!resolvedRef.current) {
            // allow 2s grace for callback->postMessage
            graceRef.current = setTimeout(() => {
              if (!resolvedRef.current) {
                setLoading(false);
                setType("warning");
                setMessage("Share window closed. Share result could not be verified.");
              }
              graceRef.current = null;
            }, 2000);
          }
        }
      } catch (err) {
        // ignore cross-window errors
        console.debug("Popup check error", err);
      }
    }, 300);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4 text-center" style={{ maxWidth: 480 }}>
        <h3 className="fw-bold mb-1">Share & Earn Rewards</h3>
        <p className="text-muted small mb-3">Share the content on Facebook and earn points.</p>

        <div className="ratio ratio-16x9 rounded overflow-hidden mb-3 bg-light">
          <iframe
            title="share-preview"
            src={SHARE_PAGE}
            style={{ border: "0", width: "100%", height: "100%" }}
          />
        </div>

        <button className="btn btn-primary w-100 mb-2" onClick={handleShare} disabled={loading}>
          {loading ? "Opening..." : "Share on Facebook"}
        </button>

        {message && (
          <div className={`alert alert-${type} alert-dismissible fade show mt-3`} role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")} />
          </div>
        )}

        <small className="text-muted d-block mt-2">
          Debug: feed URL is printed to console. Open it manually to test if needed.
        </small>
      </div>
    </div>
  );
}

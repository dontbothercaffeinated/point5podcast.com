// POINT5 Podcast: RGstat + Google Analytics Consent + Inline Banner CSS
(function() {
  const consentKey = "p5pp_cookie_consent";

  // -------------------------------
  // 1. RGstat Analytics (Always-On)
  // -------------------------------
  (function() {
    function rgstatTrack(eventType = "view", hash = "782f7db7") {
      if (window._phantom || window.navigator.webdriver || window.Cypress) return;
      const data = {
        event: eventType,
        url: window.location.href,
        hash: hash,
        referrer: document.referrer || null,
        browser_lang: navigator.language || null
      };
      (async d => {
        await fetch("https://handler.rgstats.com", {
          method: "POST",
          headers: {"Content-Type": "text/plain"},
          body: JSON.stringify(d)
        });
      })(data);
    }
    rgstatTrack();
    
    let lastUrl = window.location.href;
    const origPushState = history.pushState;
    history.pushState = function() {
      origPushState.apply(this, arguments);
      if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        rgstatTrack();
      }
    };
    window.addEventListener("popstate", () => {
      if (lastUrl !== window.location.href) {
        lastUrl = window.location.href;
        rgstatTrack();
      }
    });
  })();

  // -------------------------------
  // 2. Google Analytics (Consent Only)
  // -------------------------------
  function loadGA() {
    if (window.gtag) return; // prevent double loading
    const gaScript = document.createElement("script");
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-THDJ4ZS1SH"; // Replace with your GA4 ID
    gaScript.async = true;
    document.head.appendChild(gaScript);

    gaScript.onload = function() {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", "G-THDJ4ZS1SH", { anonymize_ip: true }); // Replace with your GA4 ID
    };
  }

  // -------------------------------
  // 3. Cookie Banner + Inline CSS
  // -------------------------------
  function createBanner() {
    const banner = document.createElement("div");
    banner.id = "p5pp-cookie-banner";
    banner.innerHTML = `
      <div class="p5pp-cookie-content">
        We use cookies for analytics to improve your experience. 
        <a href="/privacy.html" target="_blank">Privacy Policy</a>
        <div class="p5pp-cookie-buttons">
          <button id="p5pp-accept">Accept</button>
          <button id="p5pp-decline">Decline</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Inline CSS
    const style = document.createElement("style");
    style.innerHTML = `
      #p5pp-cookie-banner {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        background-color: #1e1e1e !important;
        color: #ffffff !important;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 9999 !important;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
      }
      #p5pp-cookie-banner .p5pp-cookie-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
      }
      #p5pp-cookie-banner a {
        color: #4fc3f7;
        text-decoration: underline;
      }
      #p5pp-cookie-banner .p5pp-cookie-buttons button {
        margin-left: 10px;
        padding: 8px 15px;
        background-color: #4fc3f7;
        border: none;
        color: #fff;
        cursor: pointer;
        border-radius: 4px;
        font-size: 13px;
      }
      #p5pp-cookie-banner .p5pp-cookie-buttons button:hover {
        background-color: #339bd8;
      }
      @media (max-width: 600px) {
        #p5pp-cookie-banner .p5pp-cookie-content {
          flex-direction: column;
          align-items: flex-start;
        }
        #p5pp-cookie-banner .p5pp-cookie-buttons {
          margin-top: 10px;
        }
      }
    `;
    document.head.appendChild(style);

    // Buttons
    document.getElementById("p5pp-accept").onclick = function() {
      localStorage.setItem(consentKey, "accepted");
      loadGA();
      banner.remove();
    };
    document.getElementById("p5pp-decline").onclick = function() {
      localStorage.setItem(consentKey, "declined");
      banner.remove();
    };
  }

  // -------------------------------
  // 4. Check existing consent
  // -------------------------------
  const consent = localStorage.getItem(consentKey);
  if (consent === "accepted") {
    loadGA();
  } else if (!consent) {
    createBanner();
  }
})();
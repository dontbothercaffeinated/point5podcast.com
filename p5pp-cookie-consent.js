// POINT5 Podcast: RGstat + Google Analytics Consent
(function() {
  const consentKey = "p5pp_cookie_consent";

  // -------------------------------
  // 1. RGstat Analytics (Always-On)
  // Insert your RGstat tracking code here
  // -------------------------------
  (() => {
    function rgstatTrack(eventType = "view", hash = "782f7db7") {
      if (window._phantom || window.navigator.webdriver || window.Cypress) return;
      const data = {};
      data.event = eventType;
      data.url = window.location.href;
      data.hash = hash;
      data.referrer = window.document.referrer || null;
      data.browser_lang = navigator.language || null;
      (async (d) => {
        await fetch("https://handler.rgstats.com", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
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
  // 3. Cookie Consent Banner
  // -------------------------------
  function createBanner() {
    const banner = document.createElement("div");
    banner.id = "p5pp-cookie-banner"; // matches the CSS
    banner.innerHTML = `
      <div class="p5pp-cookie-content">
        We use cookies for analytics to improve your experience. 
        <a href="/privacy-policy.html">Privacy Policy</a>
        <div class="p5pp-cookie-buttons">
          <button id="p5pp-accept">Accept</button>
          <button id="p5pp-decline">Decline</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner); // append to body

    document.getElementById("p5pp-accept").onclick = function() {
      localStorage.setItem("p5pp_cookie_consent", "accepted");
      loadGA(); // GA only loads after accept
      banner.remove(); // remove banner after consent
    };

    document.getElementById("p5pp-decline").onclick = function() {
      localStorage.setItem("p5pp_cookie_consent", "declined");
      banner.remove(); // remove banner after decline
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
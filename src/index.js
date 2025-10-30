// src/index.js
/**
 * Vinet Fibre Landing – Afrihost-style flow with coverage check.
 * - Serves landing HTML
 * - /api/coverage -> returns best service: FTTH / WIRELESS / PARTNER
 * - /submit -> stores lead with decision + lat/lng + fno
 * - /robots.txt, /sitemap.xml, /thanks, /privacy
 *
 * Bindings: DB (D1), COVERAGE_KV (KV), optional SPLYNX_* vars
 */

const INDEX_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vinet Fibre – Fast. Reliable. Local.</title>
  <meta name="description" content="Connect to fast, reliable internet with Vinet. Fibre first. Wireless if fibre isn't available. Local support." />
  <link rel="icon" href="https://static.vinet.co.za/logo.jpeg" />

  <!-- SEO Core -->
  <link rel="canonical" href="https://" id="canonicalHref"/>
  <meta name="robots" content="index,follow"/>
  <meta name="theme-color" content="#ED1C24"/>
  <meta name="geo.region" content="ZA-WC"/>
  <meta name="geo.placename" content="Western Cape" id="geoPlace"/>
  <meta name="geo.position" content="-33.91;18.85"/>
  <meta name="ICBM" content="-33.91, 18.85"/>

  <!-- Open Graph / Twitter -->
  <meta property="og:type" content="website"/>
  <meta property="og:title" content="Vinet Fibre – Fast, Reliable Fibre in your area" id="ogTitle"/>
  <meta property="og:description" content="Get uncapped fibre with local support. Check availability and sign up today." id="ogDesc"/>
  <meta property="og:image" content="https://static.vinet.co.za/logo.jpeg"/>
  <meta property="og:url" content="https://" id="ogUrl"/>
  <meta name="twitter:card" content="summary_large_image"/>

  <!-- JSON-LD -->
  <script type="application/ld+json" id="ldOrg">{"@context":"https://schema.org","@type":"Organization","name":"Vinet Internet Solutions","url":"https://www.vinet.co.za/","logo":"https://static.vinet.co.za/logo.jpeg","sameAs":["https://www.facebook.com/vinetIS"]}</script>
  <script type="application/ld+json" id="ldService">{"@context":"https://schema.org","@type":"Service","name":"Internet Access","provider":{"@type":"Organization","name":"Vinet Internet Solutions"},"areaServed":{"@type":"AdministrativeArea","name":"Western Cape"},"serviceType":"FTTH & Fixed Wireless"}</script>
  <script type="application/ld+json" id="ldOffers">{"@context":"https://schema.org","@type":"OfferCatalog","name":"Vinet Packages","itemListElement":[]}</script>

  <style>
    :root{
      --vinet-red:#ED1C24; --vinet-red-600:#C8141D;
      --ink:#0B1320; --muted:#6B7280; --bg:#F7F7F8; --card:#FFFFFF;
      --ok:#0A7D2B; --warn:#9B1C1C; --brand-shadow:0 10px 30px rgba(237,28,36,0.15)
    }
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,"Noto Sans","Helvetica Neue",sans-serif}
    a{color:var(--vinet-red);text-decoration:none} a:hover{text-decoration:underline}
    .container{max-width:1100px;margin:0 auto;padding:24px}

    header{position:sticky;top:0;background:#fff;z-index:50;border-bottom:1px solid #eee}
    .row{display:flex;align-items:center;gap:16px}
    .space-between{justify-content:space-between}
    .brand{display:flex;align-items:center;gap:12px}
    .brand img{width:40px;height:40px;border-radius:8px;object-fit:cover}
    .brand h1{font-size:18px;margin:0}
    .town-badge{font-size:12px;color:#fff;background:var(--vinet-red);padding:4px 10px;border-radius:999px}
    .hdr-cta{display:flex;gap:10px}
    .btn{appearance:none;border:0;cursor:pointer;padding:12px 18px;border-radius:12px;font-weight:600}
    .btn.primary{background:var(--vinet-red);color:#fff;box-shadow:var(--brand-shadow)}
    .btn.primary:hover{background:var(--vinet-red-600)}
    .btn.ghost{background:transparent;border:1px solid #e5e7eb}

    .hero{background: radial-gradient(1200px 400px at 50% 0%, rgba(237,28,36,0.10), transparent), linear-gradient(180deg,#fff, #fff 60%, var(--bg));}
    .hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center}
    .eyebrow{display:inline-block;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--vinet-red);font-weight:700;margin-bottom:10px}
    .hero h2{font-size:40px;line-height:1.05;margin:0 0 10px}
    .hero p{font-size:18px;color:#111827;margin:0 0 16px}
    .hero-card{background:var(--card);padding:16px;border-radius:16px;border:1px solid #eee;box-shadow:0 12px 30px rgba(0,0,0,.06)}
    .bullets{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 0}
    .bullet{display:flex;gap:10px;align-items:flex-start}
    .check{width:22px;height:22px;border-radius:6px;background:#E8F6EC;color:var(--ok);display:grid;place-items:center;font-size:14px;font-weight:800}

    .sec{padding:48px 0}
    .sec h3{font-size:26px;margin:0 0 6px}
    .sec p.lead{margin:0 0 18px;color:var(--muted)}
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .card{background:var(--card);border:1px solid #eee;border-radius:16px;padding:18px;box-shadow:0 6px 24px rgba(0,0,0,.05)}
    .price{font-weight:800;font-size:22px}
    .speed{font-weight:800;font-size:28px}
    .features{color:var(--muted);font-size:14px;line-height:1.5}
    .chip{font-size:12px;background:#F1F5F9;border-radius:999px;padding:6px 10px;display:inline-block;margin-right:8px}
    .form-wrap{background:var(--card);border:1px solid #eee;border-radius:16px;padding:18px;box-shadow:0 10px 25px rgba(0,0,0,.06)}
    form{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    label{font-size:12px;color:#111827;font-weight:700;display:block;margin:0 0 6px}
    input, select, textarea{width:100%;padding:12px 12px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;font-size:14px}
    textarea{min-height:110px;grid-column:1 / -1}
    .full{grid-column:1 / -1}
    .consent{display:flex;gap:10px;align-items:flex-start;font-size:12px;color:#374151}
    .consent input{width:18px;height:18px;margin-top:2px}
    .actions{display:flex;gap:10px;align-items:center}
    .map{border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;height:300px;background:#f0f0f0}
    .trust{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .trust .t{background:#fff;border:1px solid #eee;padding:14px;border-radius:12px;text-align:center;font-weight:600}
    @media (max-width: 920px){ .hero-grid{grid-template-columns:1fr} .grid{grid-template-columns:1fr} form{grid-template-columns:1fr} }
    .result{margin-top:12px;padding:12px;border-radius:12px;border:1px dashed #e5e7eb;background:#fff}
    .result.good{border-color:#c6f6d5}
    .result.warn{border-color:#fde68a}
    .result.bad{border-color:#fecaca}
  </style>
</head>
<body>
  <header>
    <div class="container row space-between">
      <div class="brand">
        <img src="https://static.vinet.co.za/logo.jpeg" alt="Vinet" />
        <h1>Vinet Internet</h1>
        <span class="town-badge" id="townBadge">Western Cape</span>
      </div>
      <div class="hdr-cta">
        <a class="btn ghost" href="#packages">Packages</a>
        <a class="btn primary" href="#lead">Check availability</a>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-grid">
      <div>
        <span class="eyebrow" id="eyebrowTxt">Fast. Reliable. Local.</span>
        <h2 id="heroTitle">Fibre for your home</h2>
        <p id="heroSub">We’ll check your address and recommend the best option: Fibre first, Wireless if needed.</p>
        <div class="actions" style="margin:16px 0 0">
          <button class="btn primary" id="btnLocate">Use my location</button>
          <a class="btn ghost" href="#lead">Manual address</a>
        </div>
        <div class="result" id="covResult" hidden></div>
        <div class="bullets">
          <div class="bullet"><div class="check">✓</div><div>Uncapped & unshaped options</div></div>
          <div class="bullet"><div class="check">✓</div><div>Local, friendly support</div></div>
          <div class="bullet"><div class="check">✓</div><div>Great speeds for streaming & gaming</div></div>
          <div class="bullet"><div class="check">✓</div><div>Trusted Western Cape ISP</div></div>
        </div>
      </div>
      <div class="hero-card">
        <div class="map" id="mapEmbed"></div>
        <div style="font-size:12px;color:var(--muted);margin-top:8px">
          Coverage changes often. Not sure? Submit the form below and we'll confirm.
        </div>
      </div>
    </div>
  </section>

  <section class="sec" id="why">
    <div class="container">
      <h3>Why choose Vinet?</h3>
      <p class="lead">Fibre where available. Wireless where it’s not. Always local support.</p>
      <div class="grid">
        <div class="card"><div class="chip">Performance</div><div class="speed">Uncapped</div><div class="features">Consistent for streaming, meetings, gaming.</div></div>
        <div class="card"><div class="chip">Local Support</div><div class="speed">Real People</div><div class="features">Nearby team that knows your area.</div></div>
        <div class="card"><div class="chip">Flexible</div><div class="speed">Simple Plans</div><div class="features">Pick the speed you need. Upgrade anytime.</div></div>
      </div>
    </div>
  </section>

  <section class="sec" id="packages" aria-labelledby="pkgH">
    <div class="container">
      <h3 id="pkgH">Recommended Packages</h3>
      <p class="lead">We’ll auto-adjust this list after we check your location.</p>
      <div class="grid" id="pkgGrid"></div>
    </div>
  </section>

  <section class="sec" id="lead">
    <div class="container">
      <div class="form-wrap">
        <h3 style="margin:0 0 8px">Request my connection</h3>
        <p class="lead" style="margin:0 0 16px">Enter your address and we’ll confirm coverage, pricing, and install options for <b id="townInline">your area</b>.</p>

        <form id="leadForm" novalidate>
          <div class="full" hidden>
            <label for="company">Company</label>
            <input id="company" name="company" autocomplete="organization" />
          </div>

          <div>
            <label for="name">Full name</label>
            <input id="name" name="name" autocomplete="name" required />
          </div>
          <div>
            <label for="phone">Phone number</label>
            <input id="phone" name="phone" inputmode="tel" autocomplete="tel" required />
          </div>

          <div>
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required />
          </div>
          <div>
            <label for="address">Street address</label>
            <input id="address" name="address" autocomplete="street-address" required />
          </div>

          <div>
            <label for="package">Select package</label>
            <select id="package" name="package" required></select>
          </div>
          <div>
            <label for="notes">Notes (optional)</label>
            <input id="notes" name="notes" placeholder="Complex/Erf, gate access, preferred install times, etc." />
          </div>

          <div class="full consent">
            <input id="consent" name="consent" type="checkbox" required />
            <label for="consent" style="font-weight:500">
              I accept that Vinet may contact me about this enquiry and confirm the address coverage and pricing.
            </label>
          </div>

          <div class="full actions">
            <button class="btn primary" id="submitBtn" type="submit">Submit request</button>
            <div id="formMsg" style="font-size:13px;color:var(--muted)"></div>
          </div>
        </form>
      </div>

      <div style="margin-top:14px;font-size:13px;color:var(--muted)">
        Need help fast? Call <a href="tel:0210070200">021 007 0200</a> or email <a href="mailto:sales@vinet.co.za">sales@vinet.co.za</a>.
      </div>
    </div>
  </section>

  <section class="sec" id="faq">
    <div class="container">
      <h3>FAQs</h3>
      <div class="card">
        <p><strong>How long does installation take?</strong><br/>Fibre 3–10 working days (area/FNO dependent). Wireless can be faster.</p>
        <p><strong>Is it truly uncapped?</strong><br/>Yes. Plans are uncapped. Speeds differ by package.</p>
        <p><strong>What if there’s no coverage?</strong><br/>We’ll contact our network partners and check footprint for you.</p>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="container">
      <h3>Trusted local provider</h3>
      <p class="lead">Connecting the Western Cape with fibre and wireless.</p>
      <div class="trust">
        <div class="t">Local Support</div>
        <div class="t">Uncapped Options</div>
        <div class="t">Fast Setup</div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container row space-between" style="background:#0b0f19;color:#cbd5e1;padding:28px;border-radius:16px 16px 0 0">
      <div class="brand">
        <img src="https://static.vinet.co.za/logo.jpeg" alt="Vinet"/>
        <div>
          <div style="font-weight:700;color:#fff">Vinet Internet Solutions</div>
          <div style="font-size:12px;color:#cbd5e1">© <span id="yr"></span> All rights reserved</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;font-size:14px">
        <a href="/privacy" style="color:#fff">Privacy</a>
        <span>·</span>
        <a href="mailto:sales@vinet.co.za" style="color:#fff">sales@vinet.co.za</a>
        <span>·</span>
        <a href="tel:0210070200" style="color:#fff">021 007 0200</a>
      </div>
    </div>
  </footer>

  <script>
    // --- Config ---
    const CONFIG = {
      townsByHost: {
        'villiersdorpfibre.co.za': { town: 'Villiersdorp', map: 'https://www.google.com/maps?q=Villiersdorp%2C+South+Africa&output=embed' },
        'www.villiersdorpfibre.co.za': { town: 'Villiersdorp', map: 'https://www.google.com/maps?q=Villiersdorp%2C+South+Africa&output=embed' },
        'twkfibre.co.za': { town: 'Theewaterskloof', map: 'https://www.google.com/maps?q=Theewaterskloof%2C+South+Africa&output=embed' },
        'www.twkfibre.co.za': { town: 'Theewaterskloof', map: 'https://www.google.com/maps?q=Theewaterskloof%2C+South+Africa&output=embed' },
        'ceresfibre.co.za': { town: 'Ceres', map: 'https://www.google.com/maps?q=Ceres%2C+South+Africa&output=embed' },
        'www.ceresfibre.co.za': { town: 'Ceres', map: 'https://www.google.com/maps?q=Ceres%2C+South+Africa&output=embed' },
        'worcesterfibre.co.za': { town: 'Worcester', map: 'https://www.google.com/maps?q=Worcester%2C+South+Africa&output=embed' },
        'www.worcesterfibre.co.za': { town: 'Worcester', map: 'https://www.google.com/maps?q=Worcester%2C+South+Africa&output=embed' },
      },
      defaultTown: { town: 'Western Cape', map: 'https://www.google.com/maps?q=Western+Cape%2C+South+Africa&output=embed' },

      // Default base lists (overridden by coverage result)
      FTTH_PACKAGES: {
        'VinetFibre': [
          { speed: '20 Mbps', price:'R 599 / mo', features:['Uncapped'], code:'20' },
          { speed: '50 Mbps', price:'R 749 / mo', features:['Uncapped'], code:'50' },
          { speed: '100 Mbps', price:'R 999 / mo', features:['Uncapped'], code:'100' }
        ],
        'Frogfoot': [
          { speed: '50 Mbps', price:'R 749 / mo', features:['Uncapped'], code:'50' },
          { speed: '100 Mbps', price:'R 999 / mo', features:['Uncapped'], code:'100' }
        ]
      },
      WIRELESS_PACKAGES: [
        { speed:'10 Mbps', price:'R 499 / mo', features:['Uncapped'], code:'W10' },
        { speed:'20 Mbps', price:'R 699 / mo', features:['Uncapped'], code:'W20' }
      ]
    };

    function hostCfg(){
      const h = (location.hostname||'').toLowerCase().replace(/^www\\./,'');
      return CONFIG.townsByHost[h] || CONFIG.defaultTown;
    }
    function el(id){ return document.getElementById(id); }

    // Town + Map
    const { town, map } = hostCfg();
    el('townBadge').textContent = town;
    el('townInline').textContent = town;
    el('eyebrowTxt').textContent = \`Fast. Reliable. Local in \${town}.\`;
    el('mapEmbed').innerHTML = \`<iframe title="Coverage map" src="\${map}" width="100%" height="100%" style="border:0" loading="lazy"></iframe>\`;

    // SEO runtime enrichment
    (function(){
      const base = \`https://\${location.hostname}\`;
      el('canonicalHref').setAttribute('href', base + '/');
      el('ogUrl').setAttribute('content', base + '/');
      document.title = \`Vinet Internet in \${town} – Fibre & Wireless\`;
      el('ogTitle').setAttribute('content', \`Vinet Internet in \${town} – Fibre & Wireless\`);
      el('ogDesc').setAttribute('content', \`Fibre where available. Wireless where it's not. Local support in \${town}.\`);
      el('geoPlace').setAttribute('content', town);
      // OfferCatalog gets filled when packages render
    })();

    // Render packages
    function renderPackages(list){
      const grid = document.getElementById('pkgGrid');
      grid.innerHTML = '';
      const select = document.getElementById('package');
      select.innerHTML = '';
      const itemsForLD = [];

      list.forEach((p, idx) => {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = \`
          <div class="speed">\${p.speed}</div>
          <div class="price" style="margin:6px 0 10px">\${p.price}</div>
          <div class="features">\${p.features.join(' · ')}</div>
          <div style="margin-top:12px"><button class="btn primary" data-pkg="\${p.code}">Select</button></div>
        \`;
        card.querySelector('button').addEventListener('click', () => {
          select.value = p.code; document.getElementById('lead').scrollIntoView({behavior:'smooth'});
        });
        grid.appendChild(card);

        const opt = document.createElement('option');
        opt.value = p.code; opt.textContent = \`\${p.speed} — \${p.price}\`;
        select.appendChild(opt);
        if (idx === 0) select.value = p.code;

        itemsForLD.push({
          "@type":"Offer",
          "itemOffered":{ "@type":"Service", "name": \`Internet \${p.speed}\` },
          "price": p.price.replace(/[^0-9.]/g,'') || undefined,
          "priceCurrency":"ZAR","availability":"https://schema.org/InStock"
        });
      });

      const ld = JSON.parse(document.getElementById('ldOffers').textContent);
      ld.itemListElement = itemsForLD;
      document.getElementById('ldOffers').textContent = JSON.stringify(ld);
    }

    // Initial (unknown coverage): show a sensible default (FTTH VinetFibre)
    renderPackages(CONFIG.FTTH_PACKAGES.VinetFibre);

    // Coverage check
    const covResult = el('covResult');
    let coverageDecision = 'UNKNOWN'; // FTTH / WIRELESS / PARTNER
    let coverageFNO = null;
    let covLat = null, covLng = null;

    async function checkCoverage(lat, lng){
      const r = await fetch('/api/coverage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({lat,lng})});
      const j = await r.json();
      return j;
    }

    async function locate(){
      covResult.hidden = false; covResult.className = 'result';
      covResult.textContent = 'Checking coverage...';
      try{
        const pos = await new Promise((res, rej)=>navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:true, timeout:10000}));
        covLat = pos.coords.latitude; covLng = pos.coords.longitude;
        const j = await checkCoverage(covLat, covLng);
        if (!j.ok) throw new Error('No result');

        coverageDecision = j.decision || 'PARTNER';
        coverageFNO = j.ftth?.fno || null;

        if (coverageDecision === 'FTTH') {
          covResult.className = 'result good';
          covResult.textContent = \`Great news! Fibre is available (\${coverageFNO}). We’ve loaded fibre packages.\`;
          const list = CONFIG.FTTH_PACKAGES[coverageFNO] || CONFIG.FTTH_PACKAGES.VinetFibre;
          renderPackages(list);
        } else if (coverageDecision === 'WIRELESS') {
          covResult.className = 'result warn';
          covResult.textContent = 'Fibre not available here yet. Good news: our Wireless Internet is available. We’ve loaded wireless packages.';
          renderPackages(CONFIG.WIRELESS_PACKAGES);
        } else {
          covResult.className = 'result bad';
          covResult.textContent = 'We don’t have direct coverage here. We’ll contact network partners and enquire about footprint for you.';
          // Keep default packages for capture, or render empty; we’ll capture interest anyway.
        }
      }catch(e){
        covResult.className = 'result bad';
        covResult.textContent = 'Could not get your location. Please enter your address and we’ll check manually.';
      }
    }
    el('btnLocate').addEventListener('click', locate);

    // Lead submit
    const form = document.getElementById('leadForm');
    const msg = document.getElementById('formMsg');
    const submitBtn = document.getElementById('submitBtn');

    function serializeForm(form){
      const fd = new FormData(form), data={}; fd.forEach((v,k)=>data[k]=v); return data;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = '';
      const hp = (document.getElementById('company')||{}).value || '';
      if (hp.trim() !== ''){ msg.textContent = 'Something went wrong. Try again.'; return; }

      const required = ['name','phone','email','address','package','consent'];
      for (const id of required){
        const elx = document.getElementById(id);
        if(!elx || (elx.type==='checkbox' ? !elx.checked : !String(elx.value||'').trim())){
          elx && elx.focus(); msg.style.color='var(--warn)';
          msg.textContent='Please complete all required fields.'; return;
        }
      }

      const payload = serializeForm(form);
      const h = (location.hostname||'').toLowerCase();
      payload.town = (CONFIG.townsByHost[h]?.town) || CONFIG.defaultTown.town;
      payload.hostname = location.hostname;
      payload.source = 'fibre-landing';
      payload.package_text = (function(){
        const all = [].concat(
          CONFIG.FTTH_PACKAGES.VinetFibre,
          CONFIG.FTTH_PACKAGES.Frogfoot||[],
          CONFIG.WIRELESS_PACKAGES
        );
        const hit = all.find(p=>p.code===payload.package);
        return hit ? \`\${hit.speed} – \${hit.price}\` : payload.package;
      })();
      payload.timestamp = Date.now();
      payload.fno = coverageFNO || null;
      payload.product = (coverageDecision==='FTTH'?'FTTH':coverageDecision==='WIRELESS'?'WIRELESS':'PARTNER');
      payload.lat = covLat; payload.lng = covLng;

      submitBtn.disabled = true; submitBtn.textContent = 'Submitting…';
      try{
        const res = await fetch('/submit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if (res.ok){
          msg.style.color='var(--ok)';
          msg.textContent='Thanks! We have your request and will confirm coverage soon.';
          form.reset();
          document.getElementById('package').selectedIndex = 0;
          // location.href = '/thanks';
        } else {
          const t = await res.text(); throw new Error(t||'Request failed');
        }
      }catch(err){
        console.error(err); msg.style.color='var(--warn)';
        msg.textContent='Could not submit right now. Please call 021 007 0200 or try again.';
      }finally{
        submitBtn.disabled=false; submitBtn.textContent='Submit request';
      }
    });

    // Footer year
    document.getElementById('yr').textContent = new Date().getFullYear();
  </script>
</body>
</html>`;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });
}
function bad(message, code = 400) { return json({ ok: false, error: message }, { status: code }); }

// --- KML loading/parsing (KV) ------------------------------------------------
async function loadCoverage(env) {
  // Simple in-memory cache per worker instance
  if (env.__COV && Date.now() - env.__COV.loadedAt < 15 * 60 * 1000) return env.__COV.data;

  async function getKml(key){ return await env.COVERAGE_KV.get(key); }
  const kmlFTTHVinet = await getKml('ftth_vinet.kml');
  const kmlFTTHFrog = await getKml('ftth_frogfoot.kml');
  const kmlWireless  = await getKml('wireless.kml');

  const areas = [];
  function parseKml(kml, type, fno) {
    if (!kml) return;
    const placemarkRe = /<Placemark[\s\S]*?<\/Placemark>/g;
    const nameRe = /<name>([\s\S]*?)<\/name>/;
    const coordsRe = /<coordinates>([\s\S]*?)<\/coordinates>/;
    const fnoRe = /<Data\s+name=\"fno\">[\s\S]*?<value>([\s\S]*?)<\/value>[\s\S]*?<\/Data>/;

    for (const pm of (kml.match(placemarkRe) || [])) {
      const name = (pm.match(nameRe)?.[1] || "").trim();
      const inferFno = (pm.match(fnoRe)?.[1] || "").trim() || fno || (name.includes(":") ? name.split(":")[1] : "");
      const coordsTxt = (pm.match(coordsRe)?.[1] || "").trim();
      if (!coordsTxt) continue;
      const ring = coordsTxt.split(/\s+/).map(p => {
        const [lng, lat] = p.split(",").map(Number);
        return [lng, lat];
      });
      if (ring.length > 2) areas.push({ name, fno: inferFno || null, polygon: ring, type });
    }
  }

  parseKml(kmlFTTHVinet, 'FTTH', 'VinetFibre');
  parseKml(kmlFTTHFrog,  'FTTH', 'Frogfoot');
  parseKml(kmlWireless,  'WIRELESS', null);

  const data = { areas };
  env.__COV = { data, loadedAt: Date.now() };
  return data;
}

// Ray casting
function pointInPoly([x,y], poly){
  let inside = false;
  for (let i=0, j=poly.length-1; i<poly.length; j=i++){
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const intersect = ((yi>y)!==(yj>y)) && (x < (xj - xi)*(y - yi)/(yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const { pathname } = url;

    // Landing + small pages
    if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
      return new Response(INDEX_HTML, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }});
    }
    if (req.method === "GET" && pathname === "/thanks") {
      return new Response(`<!doctype html><meta charset="utf-8"/><title>Thank you</title><body style="font-family:system-ui;padding:40px;background:#f7f7f8"><div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:24px"><h1>Thanks!</h1><p>We received your request. Our team will confirm next steps shortly.</p><p><a href="/">Back to Vinet</a></p></div></body>`, { headers: { "content-type": "text/html; charset=utf-8" }});
    }
    if (req.method === "GET" && pathname === "/privacy") {
      return new Response(`<!doctype html><meta charset="utf-8"/><title>Privacy</title><body style="font-family:system-ui;padding:40px;background:#f7f7f8"><div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:24px"><h1>Privacy</h1><p>We collect your submission (name, phone, email, address, chosen package, optional coordinates) to confirm coverage and provide service options. We do not sell your data.</p><p>To request deletion, email sales@vinet.co.za.</p></div></body>`, { headers: { "content-type": "text/html; charset=utf-8" }});
    }

    // SEO endpoints
    if (req.method === "GET" && pathname === "/robots.txt") {
      return new Response(`User-agent: *
Allow: /
Sitemap: https://${url.hostname}/sitemap.xml
`, { headers: { "content-type": "text/plain; charset=utf-8" }});
    }
    if (req.method === "GET" && pathname === "/sitemap.xml") {
      const base = `https://${url.hostname}`;
      const pages = ["/", "/thanks", "/privacy"];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p=>`<url><loc>${base}${p}</loc><changefreq>weekly</changefreq><priority>${p==="/"?"1.0":"0.6"}</priority></url>`).join("")}
</urlset>`;
      return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" }});
    }

    // Coverage API
    if (req.method === "POST" && pathname === "/api/coverage") {
      let body; try { body = await req.json(); } catch { return bad("Invalid JSON"); }
      const lat = Number(body.lat), lng = Number(body.lng);
      if (!isFinite(lat) || !isFinite(lng)) return bad("lat/lng required");

      const cov = await loadCoverage(env);
      let hasFTTH = null; // { fno, area }
      let hasWireless = false;

      for (const a of cov.areas) {
        if (pointInPoly([lng, lat], a.polygon)) {
          if (a.type === 'FTTH' && !hasFTTH) hasFTTH = { fno: a.fno || "Unknown", area: a.name };
          if (a.type === 'WIRELESS') hasWireless = true;
        }
      }

      let decision = 'PARTNER';
      if (hasFTTH) decision = 'FTTH';
      else if (hasWireless) decision = 'WIRELESS';

      return json({
        ok: true,
        decision,
        ftth: hasFTTH ? { available: true, fno: hasFTTH.fno, area: hasFTTH.area } : { available: false },
        wireless: { available: hasWireless },
      });
    }

    // Lead capture
    if (req.method === "POST" && pathname === "/submit") {
      let body;
      try { body = await req.json(); } catch { return bad("Invalid JSON"); }

      const required = ["name", "phone", "email", "address", "package", "consent"];
      for (const k of required) {
        const v = body[k];
        const ok = k === "consent" ? (v===true || v==="true" || v==="on" || v===1) : (v && String(v).trim() !== "");
        if (!ok) return bad(`Missing field: ${k}`);
      }
      if (body.company && String(body.company).trim() !== "") return bad("Rejected");

      const data = {
        name: String(body.name||"").trim(),
        phone: String(body.phone||"").trim(),
        email: String(body.email||"").trim().toLowerCase(),
        address: String(body.address||"").trim(),
        notes: String(body.notes||"").trim(),
        pkg_code: String(body.package||"").trim(),
        pkg_text: String(body.package_text||"").trim(),
        town: String(body.town||"").trim(),
        hostname: String(body.hostname||"").trim(),
        product: String(body.product||"PARTNER").trim(), // FTTH/WIRELESS/PARTNER
        fno: body.fno ? String(body.fno) : null,
        lat: isFinite(Number(body.lat)) ? Number(body.lat) : null,
        lng: isFinite(Number(body.lng)) ? Number(body.lng) : null,
        source: String(body.source||"fibre-landing").trim(),
        ts: Date.now(),
      };

      try {
        const q = await env.DB.prepare(`INSERT INTO leads
          (name, phone, email, address, notes, pkg_code, pkg_text, town, hostname, product, fno, lat, lng, source, created_at)
          VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)`)
          .bind(
            data.name, data.phone, data.email, data.address, data.notes,
            data.pkg_code, data.pkg_text, data.town, data.hostname,
            data.product, data.fno, data.lat, data.lng, data.source,
            new Date(data.ts).toISOString()
          )
          .run();
        const leadId = q.meta.last_row_id;

        // Optional Splynx
        if (String(env.SPLYNX_ENABLED || "0") === "1") {
          try {
            const sp = await fetch(`${env.SPLYNX_BASE_URL}/api/2.0/admin/crm/leads`, {
              method: "POST",
              headers: {
                "Authorization": `Basic ${env.SPLYNX_AUTH_B64}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                additional_attributes: {
                  pkg_code: data.pkg_code,
                  pkg_text: data.pkg_text,
                  town: data.town,
                  hostname: data.hostname,
                  product: data.product,
                  fno: data.fno,
                  lat: data.lat, lng: data.lng,
                  source: data.source,
                }
              })
            });
            if (!sp.ok) {
              const t = await sp.text().catch(()=> ""); console.warn("Splynx create failed", sp.status, t);
            }
          } catch (e) { console.warn("Splynx call error", e); }
        }

        return json({ ok: true, id: leadId });
      } catch (e) {
        console.error("D1 insert error", e);
        return bad("Failed to save your request, please try again later.", 500);
      }
    }

    return new Response("Not found", { status: 404 });
  },
};

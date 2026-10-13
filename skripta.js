let komisioni = JSON.parse(localStorage.getItem('komisioniInventar')) || [];
let kerkesatInventar = JSON.parse(localStorage.getItem('kerkesatInventar')) || [];
let regjistriAprovuar = JSON.parse(localStorage.getItem('regjistriAprovuar')) || [];
let asetetAktualeTeZyrës = [];
let eshteAdmin = false;
const PASSWORDI_ADMIN = "Ekonomia2026@";

function ruajNeMemorie() {
    localStorage.setItem('komisioniInventar', JSON.stringify(komisioni));
    localStorage.setItem('kerkesatInventar', JSON.stringify(kerkesatInventar));
    localStorage.setItem('regjistriAprovuar', JSON.stringify(regjistriAprovuar));
}

// TRAJTIMI I DREJTORISË MANUALISHT OSE SELEKTIM
function trajtoNdryshiminEDrejtorise() {
    let sel = document.getElementById("drejtoriaSelect").value;
    let grp = document.getElementById("grupiDrejtoriaManual");
    if (sel === "Tjetër") {
        grp.style.display = "flex";
    } else {
        grp.style.display = "none";
    }
}

// 1. KYÇJA SI ADMIN
function kerkoKyqje() {
    if (!eshteAdmin) {
        let pass = prompt("Shkruani fjalëkalimin e administratorit:");
        if (pass === PASSWORDI_ADMIN) {
            eshteAdmin = true;
            document.querySelectorAll(".admin-only").forEach(el => el.style.display = "block");
            document.getElementById("statusKyqje").className = "badge badge-success";
            document.getElementById("statusKyqje").innerText = "Admin i Kyçur";
            document.getElementById("btnKyqjeAdmin").innerText = "🚪 Çkyçu";
            rifreskoPaneltAdmin();
        } else if (pass !== null) {
            alert("Fjalëkalim i gabuar!");
        }
    } else {
        eshteAdmin = false;
        document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
        document.getElementById("statusKyqje").className = "badge badge-danger";
        document.getElementById("statusKyqje").innerText = "Regjistrues në Terren";
        document.getElementById("btnKyqjeAdmin").innerText = "🔐 Kyçu si Admin";
    }
}

// 2. MENAXHIMI I KOMISIONIT
function shtoAnetarinKomisionit() {
    let emri = document.getElementById("emriAnetarit").value.trim();
    if (!emri) { alert("Shkruani emrin e anëtarit të komisionit!"); return; }
    komisioni.push(emri);
    document.getElementById("emriAnetarit").value = "";
    ruajNeMemorie();
    rifreskoKomisionin();
    alert("Anëtari u shtua në komision!");
}

function rifreskoKomisionin() {
    let select = document.getElementById("regjistruesiSelect");
    let ul = document.getElementById("listaKomisionitUl");
    if (!select || !ul) return;

    select.innerHTML = '<option value="">-- Zgjidh Emrin Tënd --</option>';
    ul.innerHTML = "";

    if (komisioni.length === 0) {
        ul.innerHTML = "<li>Nuk ka anëtarë të komisionit. Shtojini nga paneli i adminit.</li>";
    }

    komisioni.forEach((anetar, index) => {
        select.innerHTML += `<option value="${anetar}">${anetar}</option>`;
        ul.innerHTML += `<li style="margin-bottom:6px; background:#f8fafc; padding:8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
            <b>${anetar}</b> 
            <button class="btn btn-sm btn-danger" onclick="fshiAnetarin(${index})">Fshi</button>
        </li>`;
    });
}

function fshiAnetarin(index) {
    komisioni.splice(index, 1);
    ruajNeMemorie();
    rifreskoKomisionin();
}

// 3. SHTIMI I ARTIKUJVE ME GJENDJE OPSIONALE
function shtoAsetinNeListe() {
    let aseti = document.getElementById("emriAsetit").value.trim() || "Artikull i papërkufizuar";
    let lloji = document.getElementById("llojiAsetit").value.trim() || "-";
    let sasia = parseInt(document.getElementById("sasiaAsetit").value) || 1;
    let barkod = document.getElementById("barkodAsetit").value.trim() || "-";
    let gjendja = document.getElementById("gjendjaAsetit").value;
    let koment = document.getElementById("komentAsetit").value.trim() || "-";

    asetetAktualeTeZyrës.push({ 
        aseti: aseti, 
        lloji: lloji,
        sasia: sasia,
        barkod: barkod,
        gjendja: gjendja,
        koment: koment
    });

    document.getElementById("emriAsetit").value = "";
    document.getElementById("llojiAsetit").value = "";
    document.getElementById("sasiaAsetit").value = "1";
    document.getElementById("barkodAsetit").value = "";
    document.getElementById("komentAsetit").value = "";
    rifreskoAsetetSot();
}

function rifreskoAsetetSot() {
    let ul = document.getElementById("listaAseteveSot");
    ul.innerHTML = "";
    asetetAktualeTeZyrës.forEach((item, idx) => {
        ul.innerHTML += `
            <li style="padding:8px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                <span>📌 <b>${item.sasia}x ${item.aseti}</b> (${item.lloji}) | Barkod: ${item.barkod} | <span style="color:var(--primary); font-weight:bold;">${item.gjendja}</span> (${item.koment})</span> 
                <button type="button" class="btn btn-sm btn-danger" onclick="fshiAsetinSot(${idx})">Largo</button>
            </li>`;
    });
}

function fshiAsetinSot(idx) {
    asetetAktualeTeZyrës.splice(idx, 1);
    rifreskoAsetetSot();
}

// 4. DËRGIMI I PROCESVERBALIT NGA TERRENI
function dergoProcesverbalin() {
    let regjistruesi = document.getElementById("regjistruesiSelect").value || "Komisioni";
    let data = document.getElementById("dataProcesverbalit").value || new Date().toISOString().split('T')[0];
    let komuna = document.getElementById("komunaInput").value.trim() || "Komuna e Rahovecit";
    let objekti = document.getElementById("objektiInput").value.trim() || "-";
    let lokacioni = document.getElementById("lokacioniInput").value.trim() || "-";
    let zyrtari = document.getElementById("zyrtariEmri").value.trim() || "Zyrtar i Paemëruar";
    
    let drejtoriaSel = document.getElementById("drejtoriaSelect").value;
    let drejtoria = drejtoriaSel === "Tjetër" ? (document.getElementById("drejtoriaManual").value.trim() || "Drejtori e Përgjithshme") : (drejtoriaSel || "Drejtori e Përgjithshme");
    
    let sektori = document.getElementById("sektoriZyrtarit").value.trim() || "-";
    let gjinia = document.getElementById("gjiniaZyrtarit").value;

    if (asetetAktualeTeZyrës.length === 0) {
        alert("Shtoni të paktën një artikull/aset për këtë zyrtar para se ta dërgoni!");
        return;
    }

    let procesverbal = {
        id: Date.now(),
        regjistruesi: regjistruesi,
        data: data,
        komuna: komuna,
        objekti: objekti,
        lokacioni: lokacioni,
        zyrtari: zyrtari,
        drejtoria: drejtoria,
        sektori: sektori,
        gjinia: gjinia,
        asetet: [...asetetAktualeTeZyrës]
    };

    kerkesatInventar.push(procesverbal);
    ruajNeMemorie();

    document.getElementById("zyrtariEmri").value = "";
    document.getElementById("sektoriZyrtarit").value = "";
    document.getElementById("drejtoriaManual").value = "";
    asetetAktualeTeZyrës = [];
    rifreskoAsetetSot();

    alert("Procesverbali u dërgua me sukses për aprovim!");
}

// 5. APROVIMI NGA ADMINI
function rifreskoNjoftimet() {
    let badge = document.getElementById("nrNjoftimeve");
    if (badge) badge.innerText = kerkesatInventar.length;

    let tbody = document.getElementById("tabelaKerkesave");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (kerkesatInventar.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nuk ka procesverbale në pritje.</td></tr>`;
        return;
    }

    kerkesatInventar.forEach(k => {
        let aseteTekst = k.asetet.map(a => `${a.sasia}x ${a.aseti} (${a.lloji}) [${a.gjendja}]`).join("<br>");
        tbody.innerHTML += `
            <tr>
                <td><b>${k.regjistruesi}</b><br><small>${k.data}</small></td>
                <td><b>${k.komuna}</b><br>${k.objekti} (${k.lokacioni})</td>
                <td><b>${k.zyrtari}</b> (${k.gjinia})<br><small>${k.drejtoria} / ${k.sektori}</small></td>
                <td>${aseteTekst}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="aprovoProcesverbalin(${k.id})">✅ Aprovo</button>
                    <button class="btn btn-sm btn-danger" onclick="refuzoProcesverbalin(${k.id})">❌ Refuzo</button>
                </td>
            </tr>
        `;
    });
}

function aprovoProcesverbalin(id) {
    let k = kerkesatInventar.find(x => x.id === id);
    if (k) {
        regjistriAprovuar.push(k);
        kerkesatInventar = kerkesatInventar.filter(x => x.id !== id);
        ruajNeMemorie();
        rifreskoPaneltAdmin();
        alert("Procesverbali u aprovua me sukses!");
    }
}

function refuzoProcesverbalin(id) {
    kerkesatInventar = kerkesatInventar.filter(x => x.id !== id);
    ruajNeMemorie();
    rifreskoNjoftimet();
    alert("Procesverbali u refuzua.");
}

function fshiRegjistrinAprovuar(id) {
    if (confirm("A jeni të sigurt që dëshironi ta fshini këtë regjistrim?")) {
        regjistriAprovuar = regjistriAprovuar.filter(r => r.id !== id);
        ruajNeMemorie();
        rifreskoPaneltAdmin();
    }
}

// 6. GENERIMI I ANALITIKËS SIPAS DREJTORIVE
function gjeneroAnalitiken() {
    let tbody = document.getElementById("tabelaAnalitikes");
    let filtri = document.getElementById("filtriDrejtoria").value;
    if (!tbody) return;

    let teDhenat = regjistriAprovuar;
    if (filtri !== "TE_GJITHA") {
        teDhenat = regjistriAprovuar.filter(r => r.drejtoria === filtri);
    }

    let totZyrtaret = teDhenat.length;
    let totArtikujt = 0;
    let totMire = 0;
    let totJoMire = 0;

    tbody.innerHTML = "";

    if (teDhenat.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nuk ka të dhëna për drejtorinë e zgjedhur.</td></tr>`;
    }

    teDhenat.forEach(r => {
        let sumArtikuj = 0;
        let detaje = r.asetet.map(a => {
            sumArtikuj += a.sasia;
            if (a.gjendja.includes("mirë")) totMire += a.sasia;
            else totJoMire += a.sasia;
            return `• ${a.sasia}x <b>${a.aseti}</b> (${a.lloji}) - <small style="color:var(--primary); font-weight:bold;">${a.gjendja}</small>`;
        }).join("<br>");

        totArtikujt += sumArtikuj;

        tbody.innerHTML += `
            <tr>
                <td><b>${r.drejtoria}</b></td>
                <td><b>${r.zyrtari}</b><br><small>${r.sektori}</small></td>
                <td>${r.objekti} (${r.lokacioni})</td>
                <td><span class="badge badge-warning">${sumArtikuj} artikuj</span></td>
                <td>${detaje}</td>
            </tr>
        `;
    });

    document.getElementById("statZyrtaret").innerText = totZyrtaret;
    document.getElementById("statArtikujt").innerText = totArtikujt;
    document.getElementById("statMire").innerText = totMire;
    document.getElementById("statJoMire").innerText = totJoMire;
}

// PRINTO RAPORTIN ANALITIK A4 SIPAS DREJTORISË
function printoRaportinAnalitikDrejtoria() {
    let filtri = document.getElementById("filtriDrejtoria").value;
    let titullDrejtoria = filtri === "TE_GJITHA" ? "TË GJITHA DREJTORITË MUNICIPALE" : filtri.toUpperCase();

    let teDhenat = filtri === "TE_GJITHA" ? regjistriAprovuar : regjistriAprovuar.filter(r => r.drejtoria === filtri);

    if (teDhenat.length === 0) {
        alert("Nuk ka të dhëna për të printuar për këtë drejtori!");
        return;
    }

    let fen = window.open('', '', 'width=900,height=1100');
    let rreshtat = "";

    teDhenat.forEach((r, idx) => {
        let aseteTekst = r.asetet.map(a => `${a.sasia}x ${a.aseti} (${a.lloji}) - <b>${a.gjendja}</b>`).join("<br>");
        rreshtat += `
            <tr>
                <td style="border:1px solid #333; padding:6px; text-align:center;">${idx+1}</td>
                <td style="border:1px solid #333; padding:6px;"><b>${r.zyrtari}</b><br><small>${r.sektori}</small></td>
                <td style="border:1px solid #333; padding:6px;">${r.objekti}<br><small>${r.lokacioni}</small></td>
                <td style="border:1px solid #333; padding:6px;">${aseteTekst}</td>
                <td style="border:1px solid #333; padding:6px; text-align:center;">${r.data}</td>
            </tr>
        `;
    });

    fen.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Raport Analitik - ${titullDrejtoria}</title>
            <style>
                @page { size: A4 landscape; margin: 15mm; }
                body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                .header h2 { margin: 0; font-size: 16pt; }
                .header h4 { margin: 5px 0 0 0; font-size: 12pt; font-weight: normal; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { border: 1px solid #000; background-color: #f2f2f2; padding: 6px; font-size: 10pt; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>KOMUNA E RAHOVECIT</h2>
                <h4>RAPORT ANALITIK I INVENTARIT DHE ASETEVE (2026)</h4>
                <p><b>Sektori / Drejtoria:</b> ${titullDrejtoria}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%;">Nr</th>
                        <th style="width: 25%;">Zyrtari & Pozita</th>
                        <th style="width: 25%;">Lokacioni / Zyra</th>
                        <th style="width: 35%;">Inventari i Regjistruar & Gjendja</th>
                        <th style="width: 10%;">Data</th>
                    </tr>
                </thead>
                <tbody>
                    ${rreshtat}
                </tbody>
            </table>
        </body>
        </html>
    `);

    fen.document.close();
    fen.focus();
    setTimeout(() => { fen.print(); }, 500);
}

function rifreskoTabelenZyrtareve() {
    let tbody = document.getElementById("tabelaZyrtareve");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (regjistriAprovuar.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nuk ka zyrtarë të regjistruar deri më tani.</td></tr>`;
        return;
    }

    regjistriAprovuar.forEach(r => {
        let nrAseteve = r.asetet.reduce((tot, item) => tot + item.sasia, 0);
        tbody.innerHTML += `
            <tr>
                <td><b>${r.zyrtari}</b> <br><small>Gjinia: ${r.gjinia}</small></td>
                <td><b>${r.drejtoria}</b><br><small>${r.sektori}</small></td>
                <td>${r.komuna}<br><small>${r.objekti} - ${r.lokacioni}</small></td>
                <td><span class="badge badge-warning">${nrAseteve} artikuj</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="printoProcesverbalinA4(${r.id})">📄 Gjendja / PDF (A4)</button>
                </td>
            </tr>
        `;
    });
}

function rifreskoRegjistrinAprovuar() {
    let tbody = document.getElementById("tabelaRegjistritAprovuar");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (regjistriAprovuar.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nuk ka të dhëna të aprovuara.</td></tr>`;
        return;
    }

    regjistriAprovuar.forEach(r => {
        let aseteTekst = r.asetet.map(a => `• <b>${a.sasia}x ${a.aseti}</b> (${a.lloji}) | Barkod: ${a.barkod} | <i>${a.gjendja}</i> (${a.koment})`).join("<br>");
        tbody.innerHTML += `
            <tr>
                <td>${r.data}</td>
                <td><b>${r.komuna}</b><br>${r.objekti} - ${r.lokacioni}</td>
                <td><b>${r.zyrtari}</b> (${r.gjinia})<br><small>${r.drejtoria} - ${r.sektori}</small></td>
                <td>${aseteTekst}</td>
                <td><b>${r.regjistruesi}</b></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="printoProcesverbalinA4(${r.id})">🖨️ A4 PDF</button>
                    <button class="btn-trash" onclick="fshiRegjistrinAprovuar(${r.id})">🗑️ Fshij</button>
                </td>
            </tr>
        `;
    });
}

function rifreskoPaneltAdmin() {
    rifreskoNjoftimet();
    gjeneroAnalitiken();
    rifreskoTabelenZyrtareve();
    rifreskoRegjistrinAprovuar();
}

// 7. EKSPORTI PERFEKT NË EXCEL (.XLSX)
function shkarkoExcelProfesional() {
    if (regjistriAprovuar.length === 0) { 
        alert("Nuk ka të dhëna të aprovuara për të shkarkuar!"); 
        return; 
    }

    let dataMatrix = [
        ["REGJISTRIMI I INVENTARIT DHE ASETEVE PËR PERIUDHËN 2026"],
        ["KOMUNA DHE OBJEKTET MUNICIPALE - REGJISTRI ZYRTAR"],
        [],
        ["Nr.", "Data", "Komuna", "Objekti Komunal", "Lokacioni / Kati / Zyra", "Zyrtari Komunal", "Gjinia", "Drejtoria", "Sektori / Pozita", "Artikulli / Pajisja", "Lloji / Modeli", "Sasia", "Barkodi", "Gjendja e Asetit", "Komenti Shtesë", "Anëtari i Komisionit"]
    ];

    let nr = 1;
    regjistriAprovuar.forEach(r => {
        r.asetet.forEach(a => {
            dataMatrix.push([
                nr++,
                r.data,
                r.komuna,
                r.objekti,
                r.lokacioni,
                r.zyrtari,
                r.gjinia,
                r.drejtoria,
                r.sektori,
                a.aseti,
                a.lloji,
                a.sasia,
                a.barkod,
                a.gjendja,
                a.koment,
                r.regjistruesi
            ]);
        });
    });

    let ws = XLSX.utils.aoa_to_sheet(dataMatrix);

    ws['!cols'] = [
        { wch: 6 },  // Nr
        { wch: 12 }, // Data
        { wch: 22 }, // Komuna
        { wch: 22 }, // Objekti
        { wch: 25 }, // Lokacioni
        { wch: 22 }, // Zyrtari
        { wch: 10 }, // Gjinia
        { wch: 28 }, // Drejtoria
        { wch: 22 }, // Sektori
        { wch: 22 }, // Artikulli
        { wch: 22 }, // Lloji
        { wch: 8 },  // Sasia
        { wch: 18 }, // Barkodi
        { wch: 25 }, // Gjendja
        { wch: 25 }, // Komenti
        { wch: 22 }  // Regjistruesi
    ];

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventari 2026");

    XLSX.writeFile(wb, "Regjistrimi_i_Inventarit_2026.xlsx");
}

// 8. PRINTO DOKUMENTIN ZYRTAR A4 / PDF PËR ZYRTARIN
function printoProcesverbalinA4(id) {
    let r = regjistriAprovuar.find(x => x.id === id);
    if (!r) return;

    let fen = window.open('', '', 'width=850,height=1100');
    let aseteRows = r.asetet.map((a, i) => `
        <tr>
            <td style="border:1px solid #333; padding:8px; text-align:center;">${i+1}</td>
            <td style="border:1px solid #333; padding:8px;"><b>${a.aseti}</b></td>
            <td style="border:1px solid #333; padding:8px;">${a.lloji}</td>
            <td style="border:1px solid #333; padding:8px; text-align:center;"><b>${a.sasia}</b></td>
            <td style="border:1px solid #333; padding:8px;">${a.barkod}</td>
            <td style="border:1px solid #333; padding:8px;">${a.gjendja} (${a.koment})</td>
        </tr>
    `).join('');

    fen.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Gjendja e Aseteve - ${r.zyrtari}</title>
            <style>
                @page { size: A4; margin: 20mm; }
                body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; padding: 10px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .header h2 { margin: 0; font-size: 16pt; text-transform: uppercase; }
                .header h4 { margin: 5px 0 0 0; font-size: 12pt; font-weight: normal; }
                .info-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
                .info-table td { padding: 4px 0; font-size: 12pt; }
                .main-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .main-table th { border: 1px solid #000; background-color: #f2f2f2; padding: 8px; font-size: 11pt; text-transform: uppercase; }
                .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
                .sig-box { width: 45%; text-align: center; }
                .sig-line { margin-top: 50px; border-top: 1px solid #000; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>${r.komuna.toUpperCase()}</h2>
                <h4>PROCESVERBAL I ASETEVE DHE INVENTARIT TË REGJISTRUAR (2026)</h4>
            </div>

            <table class="info-table">
                <tr>
                    <td><b>Objekti Komunal:</b> ${r.objekti}</td>
                    <td><b>Data e Verifikimit:</b> ${r.data}</td>
                </tr>
                <tr>
                    <td><b>Lokacioni / Zyra:</b> ${r.lokacioni}</td>
                    <td><b>Anëtari i Komisionit:</b> ${r.regjistruesi}</td>
                </tr>
                <tr>
                    <td><b>Zyrtari që pranon inventarin:</b> ${r.zyrtari} (${r.gjinia})</td>
                    <td><b>Drejtoria / Sektori:</b> ${r.drejtoria} - ${r.sektori}</td>
                </tr>
            </table>

            <h4 style="margin-bottom:8px; text-transform:uppercase;">Pasqyra e Aseteve të Regjistruara:</h4>
            <table class="main-table">
                <thead>
                    <tr>
                        <th style="width: 5%;">Nr</th>
                        <th style="width: 25%;">Artikulli / Pajisja</th>
                        <th style="width: 20%;">Lloji / Modeli</th>
                        <th style="width: 10%;">Sasia</th>
                        <th style="width: 18%;">Barkodi</th>
                        <th style="width: 22%;">Gjendja / Komenti</th>
                    </tr>
                </thead>
                <tbody>
                    ${aseteRows}
                </tbody>
            </table>

            <div class="signatures">
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <p><b>Zyrtari Komunal</b><br>${r.zyrtari}</p>
                </div>
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <p><b>Komisioni i Regjistrimit</b><br>${r.regjistruesi}</p>
                </div>
            </div>
        </body>
        </html>
    `);

    fen.document.close();
    fen.focus();
    setTimeout(() => { fen.print(); }, 500);
}

// Inicializimi
rifreskoKomisionin();
rifreskoNjoftimet();
rifreskoPaneltAdmin();
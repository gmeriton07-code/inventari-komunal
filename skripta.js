// Konfigurimi i Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD-EEhWvLrKJLGlV9gbm1kopnqZYfW-xtw",
    authDomain: "inventari-komunal.firebaseapp.com",
    databaseURL: "https://inventari-komunal-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "inventari-komunal",
    storageBucket: "inventari-komunal.appspot.com",
    messagingSenderId: "1048915057026",
    appId: "1:1048915057026:web:3688f1f547fbdd4326579b",
    measurementId: "G-KGGLQGM1ZS"
};

// Inicializimi i Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variablat kryesore
let komisioni = [];
let kerkesatInventar = [];
let regjistriAprovuar = [];
let asetetAktualeTeZyrës = [];
let eshteAdmin = false;
const PASSWORDI_ADMIN = "Ekonomia2026@";

// Lidhja në kohë reale me Firebase
db.ref('komisioni').on('value', (snapshot) => {
    komisioni = snapshot.val() || [];
    rifreskoKomisionin();
});

db.ref('kerkesatInventar').on('value', (snapshot) => {
    let data = snapshot.val();
    kerkesatInventar = data ? Object.values(data) : [];
    rifreskoPaneltAdmin();
});

db.ref('regjistriAprovuar').on('value', (snapshot) => {
    let data = snapshot.val();
    regjistriAprovuar = data ? Object.values(data) : [];
    rifreskoPaneltAdmin();
});

function ruajNeMemorie() {
    db.ref('komisioni').set(komisioni);
    db.ref('kerkesatInventar').set(kerkesatInventar);
    db.ref('regjistriAprovuar').set(regjistriAprovuar);
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
}

// 3. SHTIMI I ARTIKUJVE
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
                <span>📌 <b>${item.sasia}x ${item.aseti}</b> (${item.lloji}) | Barkod: ${item.barkod} | <b>${item.gjendja}</b> (${item.koment})</span> 
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
        alert("Shtoni të paktën një artikull/aset para se ta dërgoni!");
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

    alert("Procesverbali u dërgua me sukses për aprovim në server!");
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
        alert("Procesverbali u aprovua dhe u regjistrua në sistem!");
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

function rifreskoPaneltAdmin() {
    rifreskoNjoftimet();
    if (typeof gjeneroAnalitiken === 'function') gjeneroAnalitiken();
    if (typeof rifreskoRegjistrinAprovuar === 'function') rifreskoRegjistrinAprovuar();
}

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
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventari 2026");
    XLSX.writeFile(wb, "Regjistrimi_i_Inventarit_2026.xlsx");
}

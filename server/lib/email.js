const FROM   = 'KOMA — Simandou 2040 <noreply@koma-gn.com>'
const LOGO   = 'https://koma-gn.com/koma-logo.png'
const TEAL   = '#00798C'
const DARK   = '#00263B'
const RED    = '#D63E44'

function base(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>KOMA — Simandou 2040</title></head>
<body style="margin:0;padding:0;background:#F0F4F8;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,38,59,.10)">
    ${content}
    <div style="background:#F0F4F8;padding:20px 40px;border-top:1px solid rgba(0,38,59,.08);text-align:center">
      <p style="margin:0;font-size:11.5px;color:#8A9A90;line-height:1.6">
        KOMA · Plateforme Nationale d'Information sur les Capacités Techniques<br>
        Projet Simandou 2040 · République de Guinée · <a href="https://koma-gn.com" style="color:${TEAL};text-decoration:none">koma-gn.com</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function header(subtitle = '') {
  return `
    <div style="background:linear-gradient(135deg,${DARK} 0%,#004d6b 100%);padding:36px 40px 28px;text-align:center">
      <img src="${LOGO}" alt="KOMA" height="48"
           style="height:48px;width:auto;object-fit:contain;margin-bottom:14px;background:white;border-radius:8px;padding:6px 14px" />
      <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(0,121,140,.9);font-weight:600">
        Plateforme Nationale · Simandou 2040
      </div>
      ${subtitle ? `<p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,.65)">${subtitle}</p>` : ''}
    </div>`
}

async function send({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[email] RESEND_API_KEY manquant — email non envoyé :', subject)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Resend ${res.status}: ${body.message || JSON.stringify(body)}`)
  }
  const data = await res.json()
  console.log('[email] Envoyé :', subject, '→', to, '| id:', data.id)
}

// ── 1. Activation de compte utilisateur ──────────────────────────
export async function sendAccountActivation({ nom, email, activationLink, type }) {
  const html = base(`
    ${header()}
    <div style="padding:40px 40px 32px">
      <h2 style="margin:0 0 6px;font-size:26px;color:${DARK};font-weight:700">Bienvenue, ${nom} !</h2>
      <p style="margin:0 0 20px;font-size:12px;color:#8A9A90;text-transform:uppercase;letter-spacing:.1em;font-weight:600">${type || 'Nouvel utilisateur'}</p>

      <p style="margin:0 0 28px;font-size:15px;color:#3A4A40;line-height:1.75">
        Votre compte sur la plateforme <strong>KOMA — Simandou 2040</strong> a été créé avec succès.
        Cliquez sur le bouton ci-dessous pour <strong>activer votre compte</strong> et accéder à votre espace personnel.
      </p>

      <div style="text-align:center;margin:32px 0">
        <a href="${activationLink}"
           style="display:inline-block;background:${TEAL};color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:.03em">
          Activer mon compte →
        </a>
      </div>

      <div style="background:#F0F4F8;border-radius:10px;padding:14px 18px;margin-top:24px">
        <p style="margin:0;font-size:12.5px;color:#6B7280;line-height:1.65">
          Ce lien est valable <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.<br>
          <span style="word-break:break-all;font-size:11.5px">${activationLink}</span>
        </p>
      </div>
    </div>`)

  await send({ to: email, subject: 'Activez votre compte KOMA — Simandou 2040', html })
}

// ── 2. Invitation entreprise (lien définir mot de passe) ─────────
export async function sendEntrepriseInvite({ nom, email, inviteLink, entrepriseNom }) {
  const html = base(`
    ${header('Invitation à rejoindre la plateforme')}
    <div style="padding:40px 40px 32px">
      <h2 style="margin:0 0 6px;font-size:26px;color:${DARK};font-weight:700">Bienvenue, ${nom} !</h2>
      <p style="margin:0 0 20px;font-size:12px;color:${TEAL};text-transform:uppercase;letter-spacing:.1em;font-weight:600">${entrepriseNom}</p>

      <p style="margin:0 0 28px;font-size:15px;color:#3A4A40;line-height:1.75">
        L'administration KOMA a créé un espace pour votre entreprise sur la plateforme <strong>KOMA — Simandou 2040</strong>.
        Cliquez sur le bouton ci-dessous pour <strong>définir votre mot de passe</strong> et accéder à votre espace.
      </p>

      <div style="text-align:center;margin:32px 0">
        <a href="${inviteLink}"
           style="display:inline-block;background:${TEAL};color:white;text-decoration:none;padding:15px 40px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:.03em">
          Accéder à mon espace →
        </a>
      </div>

      <div style="background:#F0F4F8;border-radius:10px;padding:14px 18px;margin-top:24px">
        <p style="margin:0;font-size:12.5px;color:#6B7280;line-height:1.65">
          Ce lien est valable <strong>48 heures</strong>. Si vous n'êtes pas concerné, ignorez cet email.<br>
          <span style="word-break:break-all;font-size:11.5px">${inviteLink}</span>
        </p>
      </div>
    </div>`)

  await send({ to: email, subject: `Accédez à votre espace entreprise — KOMA Simandou 2040`, html })
}

// ── 3. Confirmation d'inscription forum ──────────────────────────
const TYPE_COLORS = {
  'Opérateur économique':             '#1A56DB',
  "Représentant de l'État":           '#1C7A4D',
  'Partenaire technique & financier': '#854F0B',
  'Société civile':                   '#534AB7',
  'Presse & Médias':                  '#A32D2D',
  'Autre':                            '#5A6A60',
}

export async function sendForumConfirmation({ nom, prenom, email, organisation, fonction, type_participant, numero_badge }) {
  const color = TYPE_COLORS[type_participant] || TEAL

  const rows = [
    ['Nom complet',   `${prenom} ${nom}`],
    ['Organisation',  organisation || '—'],
    ['Fonction',      fonction || '—'],
    ['Profil',        type_participant || '—'],
    ['N° de badge',   numero_badge],
  ].map(([label, val]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 18px;border-bottom:1px solid rgba(0,38,59,.06)">
      <span style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#8A9A90">${label}</span>
      <span style="font-size:14px;color:${DARK};font-weight:600">${val}</span>
    </div>`).join('')

  const html = base(`
    ${header('Forum de Remobilisation — Simandou 2040')}

    <!-- Bannière badge -->
    <div style="background:${color};padding:13px 40px;display:flex;align-items:center;justify-content:space-between">
      <span style="color:rgba(255,255,255,.8);font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:600">Numéro de badge</span>
      <span style="color:white;font-size:20px;font-weight:800;letter-spacing:.14em">${numero_badge}</span>
    </div>

    <div style="padding:36px 40px">
      <p style="margin:0 0 6px;font-size:12px;color:#8A9A90;letter-spacing:.1em;text-transform:uppercase;font-weight:600">Confirmation d'inscription</p>
      <h2 style="margin:0 0 22px;font-size:24px;color:${DARK};font-weight:700">Bonjour ${prenom} ${nom},</h2>

      <p style="margin:0 0 24px;font-size:15px;color:#3A4A40;line-height:1.75">
        Votre inscription au <strong>Forum de Remobilisation du Projet Simandou 2040</strong> a été enregistrée.
        Conservez cet email — il vous servira de <strong>justificatif d'accès</strong>.
      </p>

      <!-- Récapitulatif -->
      <div style="background:#F8FAFD;border-radius:12px;border:1px solid rgba(0,38,59,.08);overflow:hidden;margin-bottom:24px">
        ${rows}
      </div>

      <!-- Instructions -->
      <div style="background:#EBFCFF;border-radius:10px;padding:16px 18px;border:1px solid rgba(0,121,140,.2);margin-bottom:24px">
        <p style="margin:0;font-size:13px;color:${DARK};line-height:1.65">
          <strong>Instructions :</strong> Présentez votre numéro de badge <strong>${numero_badge}</strong> à l'accueil du forum pour récupérer votre accréditation.
        </p>
      </div>

      <div style="text-align:center;margin:28px 0">
        <a href="https://koma-gn.com/forum"
           style="display:inline-block;background:${RED};color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:.03em">
          Voir le programme du forum →
        </a>
      </div>

      <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.7">
        Pour toute question : <a href="mailto:contact@koma-gn.com" style="color:${TEAL};text-decoration:none">contact@koma-gn.com</a><br>
        Nous vous remercions pour votre participation.
      </p>
    </div>`)

  await send({
    to: email,
    subject: `✅ Inscription confirmée — Forum Simandou 2040 · Badge ${numero_badge}`,
    html,
  })
}

// ── 4. Message de contact ─────────────────────────────────────────
export async function sendContactMessage({ nom, email, sujet, message }) {
  const html = base(`
    ${header('Message de contact')}
    <div style="padding:36px 40px">
      <h2 style="margin:0 0 20px;font-size:22px;color:${DARK};font-weight:700">Nouveau message reçu</h2>
      <div style="background:#F8FAFD;border-radius:12px;border:1px solid rgba(0,38,59,.08);overflow:hidden;margin-bottom:24px">
        ${[['De', nom], ['Email', email], ['Sujet', sujet]].map(([l, v]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 18px;border-bottom:1px solid rgba(0,38,59,.06)">
            <span style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#8A9A90">${l}</span>
            <span style="font-size:14px;color:${DARK};font-weight:600">${v}</span>
          </div>`).join('')}
      </div>
      <div style="background:#F0F4F8;border-radius:10px;padding:18px 20px">
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.75;white-space:pre-wrap">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:#6B7280">
        Pour répondre, écrivez directement à : <a href="mailto:${email}" style="color:${TEAL}">${email}</a>
      </p>
    </div>`)
  await send({ to: 'contact@koma-gn.com', subject: `[Contact KOMA] ${sujet} — ${nom}`, html })
}

// ── 5. Notification admin : nouvelle inscription forum ────────────
export async function sendForumAdminNotification({ nom, prenom, email, organisation, type_participant, numero_badge }) {
  const html = base(`
    ${header('Nouvelle inscription forum')}
    <div style="padding:36px 40px">
      <h2 style="margin:0 0 20px;font-size:22px;color:${DARK};font-weight:700">Nouvelle inscription reçue</h2>
      <div style="background:#F8FAFD;border-radius:12px;border:1px solid rgba(0,38,59,.08);overflow:hidden">
        ${[
          ['Badge',         numero_badge],
          ['Nom',           `${prenom} ${nom}`],
          ['Email',         email],
          ['Organisation',  organisation || '—'],
          ['Profil',        type_participant || '—'],
        ].map(([l, v]) => `
          <div style="display:flex;justify-content:space-between;padding:10px 18px;border-bottom:1px solid rgba(0,38,59,.06)">
            <span style="font-size:11px;color:#8A9A90;font-weight:700;text-transform:uppercase;letter-spacing:.08em">${l}</span>
            <span style="font-size:13.5px;color:${DARK};font-weight:600">${v}</span>
          </div>`).join('')}
      </div>
    </div>`)

  await send({
    to: process.env.ADMIN_EMAIL || 'admin@koma-gn.com',
    subject: `[Forum] Nouvelle inscription — ${prenom} ${nom} · ${numero_badge}`,
    html,
  })
}

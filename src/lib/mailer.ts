import nodemailer from "nodemailer";
import { prisma } from "./prisma";

type SmtpConfig = {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
};

// Lit la config SMTP : d'abord les Paramètres admin (table Setting), sinon l'environnement.
async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: ["smtp_host", "smtp_port", "smtp_user", "smtp_password", "smtp_from"],
      },
    },
  });
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const host = s.smtp_host || process.env.SMTP_HOST;
  if (!host) return null;

  const user = s.smtp_user || process.env.SMTP_USER;
  // À défaut d'expéditeur explicite, on retombe sur le compte SMTP (évite un From
  // d'un autre domaine que la plupart des serveurs refusent).
  const from = s.smtp_from || process.env.SMTP_FROM || user || "CINOVA <no-reply@cinova.ne>";

  return {
    host,
    port: Number(s.smtp_port || process.env.SMTP_PORT || 587),
    user,
    pass: s.smtp_password || process.env.SMTP_PASSWORD,
    from,
  };
}

export type MailResult = { ok: boolean; skipped?: boolean; error?: string };

// Envoi bas niveau — ne lève jamais d'exception (retourne l'erreur).
async function deliver(to: string, subject: string, html: string): Promise<MailResult> {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    return { ok: false, skipped: true };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465, // 465 = SSL, 587 = STARTTLS
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
    await transporter.sendMail({ from: cfg.from, to, subject, html });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error(`[MAILER] échec d'envoi à ${to} :`, error);
    return { ok: false, error };
  }
}

type SendResult = { sent: boolean; devLink?: string };

// Email de vérification. Ne casse jamais l'inscription : en cas d'échec ou
// d'absence de SMTP, renvoie le lien pour que la personne puisse tout de même valider.
export async function sendVerificationEmail(
  to: string,
  url: string,
  name?: string | null,
): Promise<SendResult> {
  const res = await deliver(to, "CINOVA — Confirmez votre adresse email", verificationTemplate(url, name));
  if (res.skipped) {
    console.log(`\n[MAILER · dev] Aucun SMTP configuré. Lien de vérification pour ${to} :\n${url}\n`);
    return { sent: false, devLink: url };
  }
  return { sent: res.ok, devLink: res.ok ? undefined : url };
}

// Envoi d'un email de test (diagnostic de la config SMTP).
export function sendTestEmail(to: string): Promise<MailResult> {
  return deliver(
    to,
    "CINOVA — Email de test",
    emailShell(`<p>Ceci est un email de test envoyé depuis la plateforme CINOVA.</p>
      <p>Si vous le recevez, votre configuration SMTP fonctionne ✅</p>`),
  );
}

// ─────────────────────────── Notifications ───────────────────────────

type Locale = "fr" | "en" | "ha";
function loc(l?: string | null): Locale {
  return l === "en" || l === "ha" ? l : "fr";
}

type StatusContent = { subject: string; heading: string; body: string };
const STATUS_EMAILS: Record<Locale, Record<string, StatusContent>> = {
  fr: {
    UNDER_REVIEW: {
      subject: "CINOVA — Votre candidature est en cours d'examen",
      heading: "Candidature en cours d'examen",
      body: "Votre candidature est actuellement examinée par le comité technique. Vous serez informé(e) de la suite.",
    },
    PRESELECTED: {
      subject: "CINOVA — Votre candidature est présélectionnée 🎉",
      heading: "Félicitations, vous êtes présélectionné(e) !",
      body: "Votre candidature a été retenue pour la phase suivante du challenge. Toutes nos félicitations.",
    },
    REJECTED: {
      subject: "CINOVA — Suite donnée à votre candidature",
      heading: "Candidature non retenue",
      body: "Après examen attentif, votre candidature n'a pas été retenue pour cette édition. Nous vous remercions pour votre participation.",
    },
    FINALIST: {
      subject: "CINOVA — Vous êtes finaliste 🎉",
      heading: "Félicitations, vous êtes finaliste !",
      body: "Votre équipe fait partie des finalistes du challenge. Vous serez contacté(e) pour la suite du dispositif.",
    },
    WINNER: {
      subject: "CINOVA — Félicitations, vous êtes lauréat 🏆",
      heading: "Vous êtes lauréat(e) du challenge !",
      body: "Votre équipe figure parmi les lauréats de CINOVA. Toutes nos félicitations pour ce beau résultat.",
    },
  },
  en: {
    UNDER_REVIEW: {
      subject: "CINOVA — Your application is under review",
      heading: "Application under review",
      body: "Your application is currently being reviewed by the technical committee. You will be informed of the outcome.",
    },
    PRESELECTED: {
      subject: "CINOVA — Your application is preselected 🎉",
      heading: "Congratulations, you are preselected!",
      body: "Your application has been selected for the next phase of the challenge. Congratulations.",
    },
    REJECTED: {
      subject: "CINOVA — Update on your application",
      heading: "Application not selected",
      body: "After careful review, your application was not selected for this edition. Thank you for taking part.",
    },
    FINALIST: {
      subject: "CINOVA — You are a finalist 🎉",
      heading: "Congratulations, you are a finalist!",
      body: "Your team is among the finalists of the challenge. You will be contacted for the next steps.",
    },
    WINNER: {
      subject: "CINOVA — Congratulations, you are a winner 🏆",
      heading: "You are a winner of the challenge!",
      body: "Your team is among the winners of CINOVA. Congratulations on this great result.",
    },
  },
  ha: {
    UNDER_REVIEW: {
      subject: "CINOVA — Ana duba bukatarka",
      heading: "Ana duba bukatar",
      body: "Kwamitin fasaha na duba bukatarka a yanzu. Za a sanar da kai sakamakon.",
    },
    PRESELECTED: {
      subject: "CINOVA — An zaɓi bukatarka na farko 🎉",
      heading: "Taya murna, an zaɓe ka!",
      body: "An zaɓi bukatarka don mataki na gaba na gasar. Taya murna.",
    },
    REJECTED: {
      subject: "CINOVA — Sakamakon bukatarka",
      heading: "Ba a zaɓi bukatar ba",
      body: "Bayan dubawa sosai, ba a zaɓi bukatarka a wannan bugu ba. Mun gode da shiga.",
    },
    FINALIST: {
      subject: "CINOVA — Kai ɗan wasan ƙarshe ne 🎉",
      heading: "Taya murna, ka kai ƙarshe!",
      body: "Ƙungiyarka na cikin waɗanda suka kai ƙarshe. Za a tuntuɓe ka don mataki na gaba.",
    },
    WINNER: {
      subject: "CINOVA — Taya murna, kai ne wanda ya yi nasara 🏆",
      heading: "Kai ne wanda ya yi nasara!",
      body: "Ƙungiyarka na cikin waɗanda suka yi nasara a CINOVA. Taya murna.",
    },
  },
};

// Email de changement de statut (best-effort). Ne fait rien pour un statut non couvert.
export async function sendStatusEmail(
  to: string,
  name: string | null,
  status: string,
  note: string | null,
  locale?: string | null,
): Promise<MailResult> {
  const content = STATUS_EMAILS[loc(locale)][status];
  if (!content) return { ok: false, skipped: true };
  const hello = name ? `Bonjour ${name},` : "Bonjour,";
  const noteHtml = note
    ? `<div style="margin-top:16px;padding:12px 16px;background:#f6f2e8;border-radius:10px"><strong>Message du comité :</strong><br/>${escapeHtml(note)}</div>`
    : "";
  return deliver(
    to,
    content.subject,
    emailShell(
      `<p>${hello}</p>
       <h2 style="font-size:18px;color:#123a24;margin:8px 0">${content.heading}</h2>
       <p>${content.body}</p>${noteHtml}`,
    ),
  );
}

// Accusé de réception au dépôt d'une candidature (best-effort).
export async function sendSubmissionReceiptEmail(
  to: string,
  name: string | null,
  teamName: string,
  locale?: string | null,
): Promise<MailResult> {
  const l = loc(locale);
  const subject =
    l === "en"
      ? "CINOVA — Application received"
      : l === "ha"
        ? "CINOVA — An karɓi bukatar"
        : "CINOVA — Candidature bien reçue";
  const hello = name ? `Bonjour ${name},` : "Bonjour,";
  const body =
    l === "en"
      ? `We have received your application <strong>${escapeHtml(teamName)}</strong>. It will be reviewed by the technical committee.`
      : l === "ha"
        ? `Mun karɓi bukatarka <strong>${escapeHtml(teamName)}</strong>. Kwamitin fasaha zai duba ta.`
        : `Nous avons bien reçu votre candidature <strong>${escapeHtml(teamName)}</strong>. Elle sera examinée par le comité technique.`;
  return deliver(to, subject, emailShell(`<p>${hello}</p><p>${body}</p>`));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Enveloppe HTML brandée commune à tous les emails.
function emailShell(inner: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#22301d">
    <div style="background:#123a24;padding:24px;border-radius:12px 12px 0 0">
      <span style="color:#f6f2e8;font-size:20px;font-weight:bold">CINOVA</span>
    </div>
    <div style="border:1px solid #e6dcc4;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      ${inner}
      <p style="font-size:13px;color:#5b6650;margin-top:20px">Challenge national de l'innovation agropastorale et numérique — RECA</p>
    </div>
  </div>`;
}

function verificationTemplate(url: string, name?: string | null): string {
  const hello = name ? `Bonjour ${name},` : "Bonjour,";
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#22301d">
    <div style="background:#123a24;padding:24px;border-radius:12px 12px 0 0">
      <span style="color:#f6f2e8;font-size:20px;font-weight:bold">CINOVA</span>
    </div>
    <div style="border:1px solid #e6dcc4;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <p>${hello}</p>
      <p>Merci de créer votre compte sur la plateforme du Challenge national de l'innovation agropastorale et numérique.</p>
      <p>Confirmez votre adresse email en cliquant sur le bouton ci-dessous :</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${url}" style="background:#2e7d46;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold">Confirmer mon email</a>
      </p>
      <p style="font-size:13px;color:#5b6650">Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>
  </div>`;
}

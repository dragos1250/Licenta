import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRon(value) {
  return Number(value || 0).toLocaleString("ro-RO");
}

function shippingMethodLabel(method) {
  switch (method) {
    case "COURIER_STANDARD":
      return "Curier standard";
    case "COURIER_EXPRESS":
      return "Curier expres";
    case "EASYBOX":
      return "EasyBox";
    default:
      return "—";
  }
}

function paymentMethodLabel(method) {
  switch (method) {
    case "CARD":
      return "Card";
    case "CASH_ON_DELIVERY":
      return "Ramburs";
    default:
      return "—";
  }
}

function orderStatusLabel(status) {
  switch (status) {
    case "PENDING":
      return "În așteptare";
    case "PAID":
      return "Plătită";
    case "PROCESSING":
      return "În procesare";
    case "SHIPPED":
      return "Expediată";
    case "DELIVERED":
      return "Livrată";
    case "CANCELED":
      return "Anulată";
    default:
      return status || "Actualizată";
  }
}

function getStatusEmailContent(status, order) {
  const orderNumber = order?.orderNumber || order?.id || "—";

  switch (status) {
    case "PAID":
      return {
        subject: `Comanda ${orderNumber} a fost plătită`,
        title: "Plata a fost confirmată",
        intro:
          "Am confirmat plata comenzii tale. Urmează pregătirea produselor pentru expediere.",
        accent: "#06b6d4",
      };

    case "PROCESSING":
      return {
        subject: `Comanda ${orderNumber} este în procesare`,
        title: "Comanda este în procesare",
        intro:
          "Echipa noastră pregătește produsele din comandă. Te anunțăm imediat ce o expediem.",
        accent: "#3b82f6",
      };

    case "SHIPPED":
      return {
        subject: `Comanda ${orderNumber} a fost expediată`,
        title: "Comanda a fost expediată",
        intro:
          "Comanda ta a plecat către destinație. În curând ar trebui să ajungă la tine.",
        accent: "#8b5cf6",
      };

    case "DELIVERED":
      return {
        subject: `Comanda ${orderNumber} a fost livrată`,
        title: "Comanda a fost livrată",
        intro:
          "Comanda a fost marcată ca livrată. Sperăm să te bucuri de produsele primite!",
        accent: "#10b981",
      };

    case "CANCELED":
      return {
        subject: `Comanda ${orderNumber} a fost anulată`,
        title: "Comanda a fost anulată",
        intro:
          "Comanda ta a fost anulată. Dacă nu te așteptai la această modificare, contactează-ne.",
        accent: "#ef4444",
      };

    default:
      return {
        subject: `Status comandă actualizat ${orderNumber}`,
        title: "Status comandă actualizat",
        intro:
          "Statusul comenzii tale a fost actualizat. Mai jos găsești detaliile curente.",
        accent: "#2563eb",
      };
  }
}

function getClientUrl() {
  return process.env.CLIENT_URL || "http://localhost:5173";
}

function buildProductUrl(product) {
  if (!product?.id) return getClientUrl();

  // Dacă ruta ta reală este alta, schimbă doar linia asta.
  return `${getClientUrl()}/product/${product.id}`;
}

function productCardHtml(product) {
  const productName = escapeHtml(product?.name || "produsul selectat");
  const brand = escapeHtml(product?.brand || "");
  const url = buildProductUrl(product);

  return `
    <div style="margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
      <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 13px;">Produs</p>
      <p style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">
        ${productName}
      </p>
      ${
        brand
          ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 13px;">${brand}</p>`
          : ""
      }
      <p style="margin: 14px 0 0 0;">
        <a href="${escapeHtml(url)}" style="color: #2563eb; text-decoration: none; font-weight: 600;">
          Vezi produsul
        </a>
      </p>
    </div>
  `;
}

function contentBoxHtml(label, value) {
  return `
    <div style="margin: 18px 0; padding: 14px 16px; border-left: 4px solid #06b6d4; background: #f8fafc; border-radius: 8px;">
      <p style="margin: 0 0 6px 0; color: #64748b; font-size: 13px; font-weight: 700;">
        ${escapeHtml(label)}
      </p>
      <p style="margin: 0; color: #111827; line-height: 1.6;">
        ${escapeHtml(value || "—")}
      </p>
    </div>
  `;
}

function baseEmailHtml({
  title,
  greetingName,
  intro,
  product,
  contentLabel,
  content,
}) {
  const displayName = escapeHtml(greetingName || "utilizator");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
      <div style="margin-bottom: 20px; border-radius: 14px; background: linear-gradient(135deg, #06b6d4, #2563eb); color: white; padding: 22px;">
        <h2 style="margin: 0 0 8px 0;">${escapeHtml(title)}</h2>
        <p style="margin: 0; color: rgba(255,255,255,0.92);">
          Salut, ${displayName}!
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.6;">
        ${escapeHtml(intro)}
      </p>

      ${product ? productCardHtml(product) : ""}

      ${contentLabel ? contentBoxHtml(contentLabel, content) : ""}

      <p style="margin-top: 28px; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Acest email a fost trimis automat. Te rugăm să nu răspunzi direct la el.
      </p>
    </div>
  `;
}

export class Mailer {
  constructor() {
    this.transporter = createTransporter();
    this.from = process.env.MAIL_FROM;
  }

  async sendVerificationEmail({ to, name, verificationUrl }) {
    const displayName = escapeHtml(name || "utilizator");
    const safeVerificationUrl = escapeHtml(verificationUrl);

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Confirmă-ți contul",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Salut, ${displayName}!</h2>
          <p>Îți mulțumim pentru înregistrare.</p>
          <p>Pentru a-ți activa contul, apasă pe butonul de mai jos:</p>

          <p style="margin: 24px 0;">
            <a
              href="${safeVerificationUrl}"
              style="
                background: #2563eb;
                color: #ffffff;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
              "
            >
              Confirmă contul
            </a>
          </p>

          <p>Dacă butonul nu funcționează, folosește linkul de mai jos:</p>
          <p><a href="${safeVerificationUrl}">${safeVerificationUrl}</a></p>

          <p>Linkul expiră în 24 de ore.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail({ to, name, resetUrl }) {
    const displayName = escapeHtml(name || "utilizator");
    const safeResetUrl = escapeHtml(resetUrl);

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Resetează-ți parola",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Salut, ${displayName}!</h2>
          <p>Am primit o cerere pentru resetarea parolei contului tău.</p>
          <p>Pentru a seta o parolă nouă, apasă pe butonul de mai jos:</p>

          <p style="margin: 24px 0;">
            <a
              href="${safeResetUrl}"
              style="
                background: #2563eb;
                color: #ffffff;
                padding: 12px 20px;
                text-decoration: none;
                border-radius: 8px;
                display: inline-block;
                font-weight: bold;
              "
            >
              Resetează parola
            </a>
          </p>

          <p>Dacă butonul nu funcționează, folosește linkul de mai jos:</p>
          <p><a href="${safeResetUrl}">${safeResetUrl}</a></p>

          <p>Linkul expiră în 1 oră.</p>
          <p>Dacă nu tu ai cerut resetarea parolei, poți ignora acest email.</p>
        </div>
      `,
    });
  }

  async sendReviewSubmittedForModerationEmail({ to, name, product, review }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Review-ul tău a fost trimis către moderare",
      html: baseEmailHtml({
        title: "Review trimis către moderare",
        greetingName: name,
        intro:
          "Am primit review-ul tău. Acesta va fi verificat de un administrator înainte să apară public pe site.",
        product,
        contentLabel: review?.title || "Review-ul tău",
        content: review?.content,
      }),
    });
  }

  async sendReviewApprovedEmail({ to, name, product, review }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Review-ul tău a fost publicat",
      html: baseEmailHtml({
        title: "Review publicat",
        greetingName: name,
        intro:
          "Review-ul tău a fost aprobat și este acum vizibil pe pagina produsului.",
        product,
        contentLabel: review?.title || "Review-ul publicat",
        content: review?.content,
      }),
    });
  }

  async sendReviewRejectedEmail({ to, name, product, review }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Review-ul tău nu a fost aprobat",
      html:
        baseEmailHtml({
          title: "Review respins",
          greetingName: name,
          intro:
            "Review-ul tău a fost verificat de un administrator, dar nu a putut fi publicat pe site.",
          product,
          contentLabel: review?.title || "Review-ul trimis",
          content: review?.content,
        }) +
        contentBoxHtml(
          "Motiv respingere",
          review?.rejectionReason ||
            "Conținutul nu respectă regulile de publicare."
        ),
    });
  }

  async sendQuestionSubmittedForModerationEmail({ to, name, product, question }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Întrebarea ta a fost trimisă către moderare",
      html: baseEmailHtml({
        title: "Întrebare trimisă către moderare",
        greetingName: name,
        intro:
          "Am primit întrebarea ta. Aceasta va fi verificată de un administrator înainte să apară public pe site.",
        product,
        contentLabel: "Întrebarea ta",
        content: question?.question,
      }),
    });
  }

  async sendQuestionApprovedEmail({ to, name, product, question }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Întrebarea ta a fost publicată",
      html: baseEmailHtml({
        title: "Întrebare publicată",
        greetingName: name,
        intro:
          "Întrebarea ta a fost aprobată și este acum vizibilă pe pagina produsului.",
        product,
        contentLabel: "Întrebarea publicată",
        content: question?.question,
      }),
    });
  }

  async sendQuestionRejectedEmail({ to, name, product, question }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Întrebarea ta nu a fost aprobată",
      html:
        baseEmailHtml({
          title: "Întrebare respinsă",
          greetingName: name,
          intro:
            "Întrebarea ta a fost verificată de un administrator, dar nu a putut fi publicată pe site.",
          product,
          contentLabel: "Întrebarea trimisă",
          content: question?.question,
        }) +
        contentBoxHtml(
          "Motiv respingere",
          question?.rejectionReason ||
            "Conținutul nu respectă regulile de publicare."
        ),
    });
  }

  async sendAnswerSubmittedForModerationEmail({
    to,
    name,
    product,
    question,
    answer,
  }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Răspunsul tău a fost trimis către moderare",
      html:
        baseEmailHtml({
          title: "Răspuns trimis către moderare",
          greetingName: name,
          intro:
            "Am primit răspunsul tău. Acesta va fi verificat de un administrator înainte să apară public pe site.",
          product,
          contentLabel: "Răspunsul tău",
          content: answer?.answer,
        }) + contentBoxHtml("Întrebarea la care ai răspuns", question?.question),
    });
  }

  async sendAnswerApprovedEmail({ to, name, product, question, answer }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Răspunsul tău a fost publicat",
      html:
        baseEmailHtml({
          title: "Răspuns publicat",
          greetingName: name,
          intro:
            "Răspunsul tău a fost aprobat și este acum vizibil pe pagina produsului.",
          product,
          contentLabel: "Răspunsul publicat",
          content: answer?.answer,
        }) + contentBoxHtml("Întrebarea", question?.question),
    });
  }

  async sendAnswerRejectedEmail({ to, name, product, question, answer }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Răspunsul tău nu a fost aprobat",
      html:
        baseEmailHtml({
          title: "Răspuns respins",
          greetingName: name,
          intro:
            "Răspunsul tău a fost verificat de un administrator, dar nu a putut fi publicat pe site.",
          product,
          contentLabel: "Răspunsul trimis",
          content: answer?.answer,
        }) +
        contentBoxHtml("Întrebarea", question?.question) +
        contentBoxHtml(
          "Motiv respingere",
          answer?.rejectionReason ||
            "Conținutul nu respectă regulile de publicare."
        ),
    });
  }

  async sendQuestionAnsweredEmail({ to, name, product, question, answer }) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Ai primit un răspuns la întrebarea ta",
      html:
        baseEmailHtml({
          title: "Ai primit un răspuns",
          greetingName: name,
          intro:
            "Întrebarea ta a primit un răspuns. Îl poți vedea și pe pagina produsului.",
          product,
          contentLabel: "Răspuns primit",
          content: answer?.answer,
        }) + contentBoxHtml("Întrebarea ta", question?.question),
    });
  }

  async sendOrderConfirmationEmail({ to, order }) {
    const displayName = escapeHtml(order?.customerName || "client");
    const items = Array.isArray(order?.items) ? order.items : [];

    const itemsHtml = items.length
      ? items
          .map(
            (item) => `
              <tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb;">
                  <div style="font-weight: 600; color: #111827;">
                    ${escapeHtml(item.productName || "Produs")}
                  </div>
                  <div style="font-size: 12px; color: #6b7280;">
                    ${escapeHtml(item.brand || "—")} • ${escapeHtml(
              item.category || "—"
            )}
                  </div>
                </td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                  ${escapeHtml(item.quantity || 1)}
                </td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ${formatRon(item.unitPriceRon)} RON
                </td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
                  ${formatRon(item.lineTotalRon)} RON
                </td>
              </tr>
            `
          )
          .join("")
      : `
        <tr>
          <td colspan="4" style="padding: 12px 8px; color: #6b7280;">
            Nu există produse în această comandă.
          </td>
        </tr>
      `;

    const deliveryHtml =
      order.shippingMethod === "EASYBOX"
        ? `
          <p style="margin: 6px 0;"><strong>Metodă livrare:</strong> ${shippingMethodLabel(
            order.shippingMethod
          )}</p>
          <p style="margin: 6px 0;"><strong>Locker:</strong> ${escapeHtml(
            order.easyboxLockerName || "—"
          )}</p>
          <p style="margin: 6px 0;"><strong>Oraș:</strong> ${escapeHtml(
            order.easyboxCity || "—"
          )}</p>
        `
        : `
          <p style="margin: 6px 0;"><strong>Metodă livrare:</strong> ${shippingMethodLabel(
            order.shippingMethod
          )}</p>
          <p style="margin: 6px 0;"><strong>Adresă:</strong> ${escapeHtml(
            order.shippingStreet || "—"
          )}</p>
          <p style="margin: 6px 0;"><strong>Localitate:</strong> ${escapeHtml(
            order.shippingCity || "—"
          )}, ${escapeHtml(order.shippingCounty || "—")}</p>
          <p style="margin: 6px 0;"><strong>Cod poștal:</strong> ${escapeHtml(
            order.shippingPostalCode || "—"
          )}</p>
        `;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: `Confirmare comandă ${order.orderNumber || ""}`.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; color: #111827;">
          <h2>Mulțumim pentru comandă, ${displayName}!</h2>
          <p>Am primit comanda ta și o procesăm în acest moment.</p>

          <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
            <p style="margin: 6px 0;"><strong>Număr comandă:</strong> ${escapeHtml(
              order.orderNumber || order.id || "—"
            )}</p>
            <p style="margin: 6px 0;"><strong>Status:</strong> ${escapeHtml(
              order.status || "PENDING"
            )}</p>
            <p style="margin: 6px 0;"><strong>Client:</strong> ${escapeHtml(
              order.customerName || "—"
            )}</p>
            <p style="margin: 6px 0;"><strong>Email:</strong> ${escapeHtml(
              order.customerEmail || "—"
            )}</p>
            <p style="margin: 6px 0;"><strong>Telefon:</strong> ${escapeHtml(
              order.customerPhone || "—"
            )}</p>
          </div>

          <h3 style="margin-top: 32px;">Produse comandate</h3>

          <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px 8px; text-align: left;">Produs</th>
                <th style="padding: 10px 8px; text-align: center;">Cant.</th>
                <th style="padding: 10px 8px; text-align: right;">Preț</th>
                <th style="padding: 10px 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 28px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h3 style="margin-top: 0;">Livrare</h3>
            ${deliveryHtml}
          </div>

          <div style="margin-top: 20px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h3 style="margin-top: 0;">Plată și total</h3>
            <p style="margin: 6px 0;"><strong>Metodă plată:</strong> ${paymentMethodLabel(
              order.paymentMethod
            )}</p>
            <p style="margin: 6px 0;"><strong>Subtotal produse:</strong> ${formatRon(
              order.subtotalRon
            )} RON</p>
            <p style="margin: 6px 0;"><strong>TVA:</strong> ${formatRon(
              order.vatRon
            )} RON</p>
            <p style="margin: 6px 0;"><strong>Transport:</strong> ${formatRon(
              order.shippingFeeRon
            )} RON</p>
            <p style="margin: 6px 0;"><strong>Taxă plată:</strong> ${formatRon(
              order.paymentFeeRon
            )} RON</p>
            <p style="margin: 12px 0 0; font-size: 18px; font-weight: bold; color: #2563eb;">
              Total: ${formatRon(order.totalRon)} RON
            </p>
          </div>

          <p style="margin-top: 28px; color: #6b7280;">
            Vei primi actualizări suplimentare pe măsură ce comanda este procesată.
          </p>
        </div>
      `,
    });
  }

  async sendOrderStatusUpdateEmail({ to, order }) {
    const displayName = escapeHtml(order?.customerName || "client");
    const status = order?.status || "PENDING";
    const meta = getStatusEmailContent(status, order);

    const deliveryHtml =
      order.shippingMethod === "EASYBOX"
        ? `
          <p style="margin: 6px 0;"><strong>Livrare:</strong> ${shippingMethodLabel(
            order.shippingMethod
          )}</p>
          <p style="margin: 6px 0;"><strong>Locker:</strong> ${escapeHtml(
            order.easyboxLockerName || "—"
          )}</p>
          <p style="margin: 6px 0;"><strong>Oraș:</strong> ${escapeHtml(
            order.easyboxCity || "—"
          )}</p>
        `
        : `
          <p style="margin: 6px 0;"><strong>Livrare:</strong> ${shippingMethodLabel(
            order.shippingMethod
          )}</p>
          <p style="margin: 6px 0;"><strong>Adresă:</strong> ${escapeHtml(
            order.shippingStreet || "—"
          )}</p>
          <p style="margin: 6px 0;"><strong>Localitate:</strong> ${escapeHtml(
            order.shippingCity || "—"
          )}, ${escapeHtml(order.shippingCounty || "—")}</p>
        `;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: meta.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #111827;">
          <div style="margin-bottom: 20px; border-radius: 14px; background: ${meta.accent}; color: white; padding: 20px;">
            <h2 style="margin: 0 0 8px 0;">${escapeHtml(meta.title)}</h2>
            <p style="margin: 0; color: rgba(255,255,255,0.92);">
              Salut, ${displayName}!
            </p>
          </div>

          <p style="font-size: 15px; line-height: 1.6;">
            ${escapeHtml(meta.intro)}
          </p>

          <div style="margin: 24px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
            <p style="margin: 6px 0;"><strong>Număr comandă:</strong> ${escapeHtml(
              order.orderNumber || order.id || "—"
            )}</p>
            <p style="margin: 6px 0;"><strong>Status curent:</strong> ${orderStatusLabel(
              order.status
            )}</p>
            <p style="margin: 6px 0;"><strong>Total:</strong> ${formatRon(
              order.totalRon
            )} RON</p>
            <p style="margin: 6px 0;"><strong>Plată:</strong> ${paymentMethodLabel(
              order.paymentMethod
            )}</p>
            ${deliveryHtml}
          </div>

          <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
            Dacă ai întrebări legate de comandă, păstrează acest email și numărul comenzii pentru referință.
          </p>
        </div>
      `,
    });
  }
}

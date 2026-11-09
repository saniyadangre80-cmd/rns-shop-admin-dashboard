import nodemailer from 'nodemailer';
import { Order, Product } from './db.js';

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  html: string;
  sent_at: string;
  status: 'sent' | 'simulated';
  event_type: 'new_order' | 'order_cancelled' | 'low_stock' | 'password_reset';
}

const emailLogs: EmailLog[] = [];

// Nodemailer transporter initialization
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    });
  }
  return null;
}

export async function sendEmail({
  to,
  subject,
  html,
  eventType
}: {
  to: string;
  subject: string;
  html: string;
  eventType: EmailLog['event_type'];
}): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const logId = `EMAIL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const from = process.env.EMAIL_FROM || 'RNS SHOP Security <notifications@rnsshop.com>';

  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      console.log(`[SMTP EMAIL SENT] to: ${to} | subject: ${subject}`);
      emailLogs.unshift({
        id: logId,
        to,
        subject,
        html,
        sent_at: new Date().toISOString(),
        status: 'sent',
        event_type: eventType
      });
      return { success: true, simulated: false };
    } catch (err: any) {
      console.warn(`[SMTP SEND FAILED, FALLING BACK TO DISPATCH LOG]:`, err.message);
    }
  }

  // Fallback in development or when live SMTP credentials are not yet entered
  console.log(`[EMAIL DISPATCH LOGGED] to: ${to} | subject: ${subject}`);
  emailLogs.unshift({
    id: logId,
    to,
    subject,
    html,
    sent_at: new Date().toISOString(),
    status: 'simulated',
    event_type: eventType
  });

  return { success: true, simulated: true };
}

// 1. Password Reset Email
export async function sendPasswordResetEmail(toEmail: string, resetToken: string, resetLink: string) {
  const subject = `[RNS SHOP] Admin Password Reset Request`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px;">RNS SHOP Admin Security</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Password Reset Authorization</p>
      </div>

      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        We received a request to reset the administrator password for your account (<strong>${toEmail}</strong>).
      </p>

      <div style="margin: 24px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Your Security Reset Token</p>
        <div style="font-family: monospace; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #4f46e5;">
          ${resetToken}
        </div>
        <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px;">Token expires in 1 hour.</p>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
        If you did not request this password reset, please ignore this email. No unauthorized user can access your dashboard without this token.
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px;">
        RNS SHOP Secure Admin Console · ${new Date().toISOString()}
      </div>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
    eventType: 'password_reset'
  });
}

// 2. New Order Placed Notification
export async function sendNewOrderNotification(adminEmail: string, order: Order) {
  const subject = `🛍️ New Order Received: #${order.id} ($${order.total.toFixed(2)})`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">
        ${item.name} (${item.size})
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: center;">
        ${item.quantity}x
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #0f172a; text-align: right; font-weight: 600;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">
        <span style="background: #e0e7ff; color: #4338ca; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">NEW CUSTOMER ORDER</span>
        <h2 style="margin: 8px 0 0; color: #0f172a; font-size: 20px;">Order #${order.id}</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Placed by ${order.customer_name} (${order.customer_email})</p>
      </div>

      <div style="margin-bottom: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 12px; color: #475569;">
          <strong>Shipping to:</strong> ${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}
        </p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">
          <strong>Payment:</strong> ${order.payment_method} (${order.payment_status})
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">
            <th style="text-align: left; padding-bottom: 8px;">Product</th>
            <th style="text-align: center; padding-bottom: 8px;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top: 2px solid #0f172a; padding-top: 12px; text-align: right;">
        <span style="font-size: 14px; color: #64748b;">Grand Total: </span>
        <span style="font-size: 20px; font-weight: bold; color: #0f172a;">$${order.total.toFixed(2)}</span>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    eventType: 'new_order'
  });
}

// 3. Order Cancelled Notification
export async function sendOrderCancelledNotification(adminEmail: string, order: Order) {
  const subject = `⚠️ Order Cancelled: #${order.id}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 12px; background: #ffffff;">
      <div style="margin-bottom: 20px; border-bottom: 1px solid #fee2e2; padding-bottom: 16px;">
        <span style="background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">ORDER CANCELLED</span>
        <h2 style="margin: 8px 0 0; color: #0f172a; font-size: 20px;">Order #${order.id} was cancelled</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Customer: ${order.customer_name} (${order.customer_email})</p>
      </div>

      <p style="color: #334155; font-size: 13px; line-height: 1.6;">
        Order #${order.id} totaling <strong>$${order.total.toFixed(2)}</strong> has been cancelled. All associated line item inventory counts have been automatically restored to the RNS SHOP warehouse.
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    eventType: 'order_cancelled'
  });
}

// 4. Out of Stock Notification
export async function sendOutOfStockNotification(adminEmail: string, product: Product) {
  const subject = `🚨 Stock Depleted Alert: ${product.name} (SKU: ${product.sku})`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ffedd5; border-radius: 12px; background: #ffffff;">
      <div style="margin-bottom: 20px; border-bottom: 1px solid #ffedd5; padding-bottom: 16px;">
        <span style="background: #ffedd5; color: #c2410c; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">OUT OF STOCK ALERT</span>
        <h2 style="margin: 8px 0 0; color: #0f172a; font-size: 20px;">${product.name}</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">SKU: ${product.sku} · Category: ${product.category}</p>
      </div>

      <p style="color: #334155; font-size: 13px; line-height: 1.6;">
        Inventory for <strong>${product.name}</strong> has reached <strong>0 units</strong>. Customers will not be able to purchase this item until a restock is logged in the admin inventory console.
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject,
    html,
    eventType: 'low_stock'
  });
}

export function getEmailLogs(): EmailLog[] {
  return emailLogs.slice(0, 50);
}

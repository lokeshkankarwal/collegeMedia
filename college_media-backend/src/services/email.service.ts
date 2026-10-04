import nodemailer from "nodemailer";

interface SendResetEmailOptions {
  to: string;
  resetLink: string;
}

export const sendPasswordResetEmail = async ({
  to,
  resetLink,
}: SendResetEmailOptions): Promise<boolean> => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || `"College Media" <no-reply@collegemedia.edu>`;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from,
        to,
        subject: "Reset your College Media password",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
            <h2 style="color: #4f46e5; margin-bottom: 8px;">College Media</h2>
            <p style="font-size: 16px; margin-top: 0;">Password Reset Request</p>
            <p>You recently requested to reset your password for your College Media account. Click the button below to reset it. This link is valid for 15 minutes.</p>
            <p style="margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
            </p>
            <p style="color: #64748b; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px;">If you have trouble clicking the button, copy and paste this URL into your browser:<br/><a href="${resetLink}" style="color: #6366f1;">${resetLink}</a></p>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error("Error sending password reset email via SMTP:", error);
      return false;
    }
  }

  // Development fallback when SMTP credentials are not configured in environment
  console.log(`\n========================================`);
  console.log(`[EmailService DEV] Password reset email for: ${to}`);
  console.log(`[EmailService DEV] Reset Link: ${resetLink}`);
  console.log(`========================================\n`);

  return true;
};

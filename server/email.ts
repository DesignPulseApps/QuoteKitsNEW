import nodemailer from 'nodemailer';
import { User, UserCalculator } from '@shared/schema';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
  },
});

export class EmailService {
  // Send welcome email with calculator setup
  async sendWelcomeEmail(
    user: User, 
    userCalculator: UserCalculator,
    calculatorName: string
  ): Promise<void> {
    const embedCode = `<iframe src="${userCalculator.embedUrl}" 
  width="100%" height="600px" frameborder="0" 
  style="border: none; border-radius: 8px;">
</iframe>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-block { background: #1f2937; color: #10b981; padding: 15px; border-radius: 6px; font-family: 'Monaco', monospace; font-size: 12px; overflow-x: auto; margin: 15px 0; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .feature-list { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; }
        .feature-item { display: flex; align-items: center; margin: 10px 0; }
        .feature-icon { color: #10B981; margin-right: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to QuoteKit.ai!</h1>
          <p>Your ${calculatorName} calculator is ready</p>
        </div>
        
        <div class="content">
          <h2>Hi ${user.fullName || 'there'},</h2>
          
          <p>Congratulations! Your personalized quote calculator is now live and ready to start converting visitors into leads.</p>
          
          <div class="feature-list">
            <h3>What's included in your setup:</h3>
            <div class="feature-item">
              <span class="feature-icon">✅</span>
              <span>Your personalized ${calculatorName} calculator</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✅</span>
              <span>Custom embed code for your website</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✅</span>
              <span>Admin panel for customization</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✅</span>
              <span>Lead tracking and analytics</span>
            </div>
          </div>

          <h3>🎨 Customize Your Calculator</h3>
          <p>Access your admin panel to customize colors, upload your logo, and adjust pricing:</p>
          <a href="${userCalculator.adminUrl}" class="button">Open Admin Panel</a>

          <h3>🔗 Embed Code</h3>
          <p>Copy and paste this code anywhere on your website:</p>
          <div class="code-block">${embedCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

          <h3>📊 Track Your Results</h3>
          <p>Monitor quote requests, conversion rates, and lead quality from your dashboard:</p>
          <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/dashboard" class="button">View Dashboard</a>

          <h3>🚀 Quick Start Tips</h3>
          <ul>
            <li>Test your calculator with a few sample quotes</li>
            <li>Customize the pricing to match your business model</li>
            <li>Upload your logo and adjust brand colors</li>
            <li>Add the embed code to your website's pricing or services page</li>
          </ul>

          <h3>Need Help?</h3>
          <p>We're here to help you succeed:</p>
          <ul>
            <li>📖 <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/docs">Documentation & Tutorials</a></li>
            <li>💬 <a href="mailto:support@quotekit.ai">Email Support</a></li>
            <li>🎥 <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/tutorials">Video Walkthrough</a></li>
          </ul>

          <p>Ready to start converting more leads? Your calculator is live at:</p>
          <a href="${userCalculator.embedUrl}" class="button">View Your Calculator</a>

          <p>Best regards,<br>
          The QuoteKit.ai Team</p>
        </div>
      </div>
    </body>
    </html>`;

    const textContent = `
Welcome to QuoteKit.ai!

Hi ${user.fullName || 'there'},

Your ${calculatorName} calculator is now ready! Here are your access details:

Admin Panel: ${userCalculator.adminUrl}
Calculator URL: ${userCalculator.embedUrl}

Embed Code:
${embedCode}

Next Steps:
1. Customize your calculator in the admin panel
2. Add the embed code to your website
3. Start tracking leads in your dashboard

Need help? Contact us at support@quotekit.ai

Best regards,
The QuoteKit.ai Team
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@quotekit.ai',
      to: user.email,
      subject: `🎉 Your ${calculatorName} Calculator is Ready!`,
      text: textContent,
      html: htmlContent,
    });
  }

  // Send subscription confirmation
  async sendSubscriptionConfirmation(
    user: User,
    planName: string,
    amount: number
  ): Promise<void> {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .invoice-details { background: white; padding: 20px; border-radius: 6px; margin: 15px 0; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Subscription Confirmed</h1>
          <p>Thank you for choosing QuoteKit.ai</p>
        </div>
        
        <div class="content">
          <h2>Hi ${user.fullName || 'there'},</h2>
          
          <p>Your subscription has been successfully activated!</p>
          
          <div class="invoice-details">
            <h3>Subscription Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Amount:</strong> €${(amount / 100).toFixed(2)}/month</p>
            <p><strong>Billing Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Next Billing:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          </div>

          <p>You can manage your subscription, view invoices, and update payment methods:</p>
          <a href="${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/dashboard/billing" class="button">Manage Subscription</a>

          <p>Questions? We're here to help at support@quotekit.ai</p>

          <p>Best regards,<br>
          The QuoteKit.ai Team</p>
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@quotekit.ai',
      to: user.email,
      subject: `Subscription Confirmed - ${planName} Plan`,
      html: htmlContent,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://quotekit.ai'}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .warning { background: #fef3cd; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        
        <div class="content">
          <h2>Password Reset Request</h2>
          
          <p>We received a request to reset your password for your QuoteKit.ai account.</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>This link expires in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <p>If the button doesn't work, copy and paste this link:</p>
          <p style="word-break: break-all;">${resetUrl}</p>

          <p>Need help? Contact us at support@quotekit.ai</p>

          <p>Best regards,<br>
          The QuoteKit.ai Team</p>
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@quotekit.ai',
      to: email,
      subject: 'Password Reset - QuoteKit.ai',
      html: htmlContent,
    });
  }
}

export const emailService = new EmailService();
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    // Only create transporter if email credentials are properly configured
    if (
      process.env.EMAIL_PASS &&
      process.env.EMAIL_PASS !==
        "your_app_password_here_replace_with_real_password"
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      this.transporter = null;
      console.warn(
        "⚠️ Email service not configured. Please set up Gmail App Password in .env file"
      );
    }
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification email with OTP
  async sendVerificationEmail(email, firstName, otp) {
    // If no transporter configured, log the OTP for development
    if (!this.transporter) {
      console.log("📧 DEVELOPMENT MODE - Email would be sent to:", email);
      console.log("🔐 VERIFICATION CODE:", otp);
      console.log("👤 Recipient:", firstName);
      console.log("⏰ Code expires in 10 minutes");
      console.log(
        "🔗 To set up email: https://support.google.com/accounts/answer/185833"
      );
      return { success: true, development: true };
    }
    const mailOptions = {
      from: `"BookUp MotMot" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - BookUp MotMot",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">BookUp MotMot</h1>
            <p style="color: #666; margin: 5px 0;">Motorcycle Wash Booking System</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Hello ${firstName}!</h2>
            <p style="color: #666; line-height: 1.5; margin-bottom: 20px;">
              Thank you for registering with BookUp MotMot. To complete your account setup, 
              please verify your email address using the verification code below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #dc2626; color: white; font-size: 32px; font-weight: bold; 
                          padding: 15px 30px; border-radius: 8px; display: inline-block; 
                          letter-spacing: 5px;">${otp}</div>
            </div>
            
            <p style="color: #666; line-height: 1.5; margin-bottom: 15px;">
              This verification code will expire in <strong>10 minutes</strong>. 
              If you didn't create an account with us, please ignore this email.
            </p>
            
            <p style="color: #666; line-height: 1.5;">
              Best regards,<br>
              <strong>BookUp MotMot Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, firstName) {
    // If no transporter configured, just log for development
    if (!this.transporter) {
      console.log(
        "📧 DEVELOPMENT MODE - Welcome email would be sent to:",
        email
      );
      console.log("🎉 Welcome message for:", firstName);
      return { success: true, development: true };
    }
    const mailOptions = {
      from: `"BookUp MotMot" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to BookUp MotMot!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">BookUp MotMot</h1>
            <p style="color: #666; margin: 5px 0;">Motorcycle Wash Booking System</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Welcome ${firstName}! 🎉</h2>
            <p style="color: #666; line-height: 1.5; margin-bottom: 15px;">
              Your email has been successfully verified! You can now enjoy all the features 
              of BookUp MotMot:
            </p>
            
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>Book motorcycle wash services</li>
              <li>Manage your bookings</li>
              <li>Track your service history</li>
              <li>Update your profile</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL}/dashboard" 
                 style="background: #dc2626; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.5;">
              Best regards,<br>
              <strong>BookUp MotMot Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome email to new staff members
  async sendStaffWelcomeEmail(email, firstName, temporaryPassword) {
    if (!this.transporter) {
      console.log(
        "📧 DEVELOPMENT MODE - Staff welcome email would be sent to:",
        email
      );
      console.log("👤 New staff member:", firstName);
      console.log("🔑 Temporary password:", temporaryPassword);
      return { success: true, development: true };
    }

    const mailOptions = {
      from: `"BookUp MotMot Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to BookUp MotMot Staff Team!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">BookUp MotMot</h1>
            <p style="color: #666; margin: 5px 0;">Staff Portal</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Welcome to the Team, ${firstName}! 🎉</h2>
            <p style="color: #666; line-height: 1.5; margin-bottom: 15px;">
              You have been added as a staff member to the BookUp MotMot system. 
              As a staff member, you have access to:
            </p>
            
            <ul style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <li>Manage customer bookings</li>
              <li>Update booking statuses</li>
              <li>View customer information</li>
              <li>Access staff dashboard</li>
              <li>Communicate with customers</li>
            </ul>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Your Login Credentials:</h3>
              <p style="color: #856404; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #856404; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${temporaryPassword}</code></p>
            </div>

            <p style="color: #dc2626; line-height: 1.5; margin-bottom: 15px;">
              <strong>Important:</strong> Please change this password after your first login for security purposes.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL}/admin/login" 
                 style="background: #dc2626; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to Staff Portal
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.5;">
              If you have any questions, please contact your administrator.<br><br>
              Best regards,<br>
              <strong>BookUp MotMot Admin Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Staff welcome email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending staff welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset notification to staff
  async sendPasswordResetNotification(email, firstName, newPassword) {
    if (!this.transporter) {
      console.log(
        "📧 DEVELOPMENT MODE - Password reset email would be sent to:",
        email
      );
      console.log("👤 Staff member:", firstName);
      console.log("🔑 New password:", newPassword);
      return { success: true, development: true };
    }

    const mailOptions = {
      from: `"BookUp MotMot Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Has Been Reset - BookUp MotMot",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">BookUp MotMot</h1>
            <p style="color: #666; margin: 5px 0;">Staff Portal</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Password Reset Notification</h2>
            <p style="color: #666; line-height: 1.5; margin-bottom: 15px;">
              Hello ${firstName},
            </p>
            
            <p style="color: #666; line-height: 1.5; margin-bottom: 15px;">
              Your password has been reset by an administrator. Your new login credentials are:
            </p>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #856404; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #856404; margin: 5px 0;"><strong>New Password:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">${newPassword}</code></p>
            </div>

            <p style="color: #dc2626; line-height: 1.5; margin-bottom: 15px;">
              <strong>Important:</strong> Please change this password after logging in for security purposes.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL}/admin/login" 
                 style="background: #dc2626; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Login to Staff Portal
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.5;">
              If you did not request this password reset, please contact your administrator immediately.<br><br>
              Best regards,<br>
              <strong>BookUp MotMot Admin Team</strong>
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset notification sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error("Error sending password reset notification:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();

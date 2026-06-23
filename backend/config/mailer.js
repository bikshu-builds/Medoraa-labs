const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.APP_PASSWORD
    }
});

const sendLoginNotification = async (user) => {
    try {
        const recipient = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_SENDER;
        const mailOptions = {
            from: `"Medoraa Labs Security" <${process.env.EMAIL_SENDER}>`,
            to: recipient,
            subject: `Security Alert: ${user.name} logged in`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="background-color: #1A3263; color: white; padding: 15px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h2 style="margin: 0; font-size: 18px;">Medoraa Labs Portal Security</h2>
                    </div>
                    <div style="padding: 20px; color: #334155;">
                        <p style="font-size: 15px; margin-top: 0; font-weight: bold;">Hello Administrator,</p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">A login event has been recorded for a staff/administrator account:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                            <tr style="background-color: #f8fafc;">
                                <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; width: 35%; font-size: 13px;">Name</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 13px;">${user.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; font-size: 13px;">Email</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 13px;">${user.email}</td>
                            </tr>
                            <tr style="background-color: #f8fafc;">
                                <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; font-size: 13px;">Role</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; text-transform: uppercase; font-weight: bold; color: #1A3263;">${user.role || "admin"}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; border: 1px solid #e2e8f0; font-size: 13px;">Timestamp</td>
                                <td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 13px; font-family: monospace;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td>
                            </tr>
                        </table>

                        <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                            If this login was unexpected, please review the staff list and credentials immediately.
                        </p>
                    </div>
                    <div style="background-color: #f8fafc; color: #94a3b8; padding: 10px; text-align: center; font-size: 10px; border-radius: 0 0 8px 8px; border-top: 1px solid #e2e8f0;">
                        &copy; 2026 Medoraa Labs. All rights reserved.
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Login notification email successfully sent: %s", info.messageId);
    } catch (error) {
        console.error("Error dispatching login email notification:", error);
    }
};

module.exports = { sendLoginNotification };

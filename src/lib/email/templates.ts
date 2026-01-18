export const emailTemplates = {
  otp: (name: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
    .header { background-color: #7c3aed; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 40px 30px; text-align: center; color: #333333; }
    .otp-box { background-color: #f3f4f6; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #7c3aed; margin: 30px 0; display: inline-block; border: 2px dashed #ddd6fe; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .text { line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Code</h1>
    </div>
    <div class="content">
      <p class="text">Hello ${name},</p>
      <p class="text">Thank you for registering. Please use the verification code below to complete your sign-up process.</p>
      <div class="otp-box">${otp}</div>
      <p class="text">This code will expire in 10 minutes.</p>
      <p class="text" style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Hotelify. All rights reserved.
    </div>
  </div>
</body>
</html>
`
};

export const resetPasswordOtpTemplate = (name: string, otp: string, url?: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }
    .header { background-color: #ef4444; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
    .content { padding: 40px 30px; text-align: center; color: #333333; }
    .otp-box { background-color: #fef2f2; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ef4444; margin: 30px 0; display: inline-block; border: 2px dashed #fca5a5; }
    .btn { background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block; margin: 20px 0; transition: background-color 0.3s; }
    .btn:hover { background-color: #dc2626; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .text { line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Password Code</h1>
    </div>
    <div class="content">
      <p class="text">Hello ${name},</p>
      <p class="text">You requested to reset your password. Use the code below to proceed.</p>
      
      <div class="otp-box">${otp}</div>

      ${url ? `
      <p class="text">Or click the button below to verify automatically:</p>
      <a href="${url}" class="btn" style="color: #ffffff;">Reset Password Now</a>
      ` : ''}
      
      <p class="text">This code will expire in 15 minutes.</p>
      <p class="text" style="color: #6b7280; font-size: 14px;">If you didn't ask to reset your password, you can safely ignore this email.</p>
      
      ${url ? `
      <p class="link-text">Or copy and paste this link into your browser:<br>${url}</p>
      ` : ''}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Hotelify. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

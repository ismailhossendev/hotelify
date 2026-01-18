"use strict";exports.id=6699,exports.ids=[6699],exports.modules={29287:(e,t,o)=>{o.d(t,{V:()=>n});var i=o(11185),r=o.n(i);let a=new i.Schema({type:{type:String,required:!0,unique:!0},subject:{type:String,required:!0},htmlContent:{type:String,required:!0},variables:{type:[String],default:[]}},{timestamps:!0}),n=r().models.NotificationTemplate||r().model("NotificationTemplate",a)},56699:(e,t,o)=>{o.d(t,{EmailService:()=>n});var i=o(29287),r=o(56511);let a={otp:e=>`
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
      <p class="text">Hello ${e.name},</p>
      <p class="text">Thank you for registering. Please use the verification code below to complete your sign-up process.</p>
      <div class="otp-box">${e.otp}</div>
      <p class="text">This code will expire in 10 minutes.</p>
      <p class="text" style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Hotelify. All rights reserved.
    </div>
  </div>
</body>
</html>
`,welcome:e=>`
<h1>Welcome to Hotelify, ${e.name}!</h1>
<p>We are excited to have you on board.</p>
`},n={getTemplate:async(e,t)=>{try{await (0,r.default)();let o=await i.V.findOne({type:e});if(o&&o.htmlContent){let e=o.htmlContent;return Object.keys(t).forEach(o=>{let i=RegExp(`{{${o}}}`,"g");e=e.replace(i,t[o])}),e}}catch(e){console.error("Error fetching email template:",e)}return a[e]?a[e](t):`<p>Email content not found for type: ${e}</p>`},getSubject:async(e,t)=>{try{await (0,r.default)();let t=await i.V.findOne({type:e});if(t&&t.subject)return t.subject}catch(e){console.error("Error fetching email subject:",e)}return t}}}};
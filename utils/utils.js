export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; text-align: center;">
        
        <h2 style="color: #333;">OTP Verification</h2>
        
        <p style="color: #555;">
          Use the following One-Time Password (OTP) to complete your verification:
        </p>
        
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ff5722; margin: 20px 0;">
          ${otp}
        </div>
        
        <p style="color: #777;">
          This OTP is valid for 5 minutes. Do not share it with anyone.
        </p>

      </div>
    </div>
  `;
}



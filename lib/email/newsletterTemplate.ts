type NewsletterTemplateProps = {
  title: string
  content: string
  email: string
}

export function newsletterTemplate({
  title,
  content,
  email,
}: NewsletterTemplateProps) {
  return `
  <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; background:#f7f7f7; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; padding:24px; border-radius:8px;">
      
      <!-- HEADER -->
      <h2 style="margin-top:0; color:#0FA3A8;">
        KOJE24 🍹
      </h2>
      <p style="color:#666; margin-top:-8px;">
        Minuman sehat dari bahan segar & alami
      </p>

      <hr style="margin:20px 0;" />

      <!-- CONTENT -->
      <h3>${title}</h3>
      <div>
        ${content}
      </div>

      <br/>

      <!-- CLOSING -->
      <p>
        Tetap sehat ya 💚<br/>
        <b>Tim KOJE24</b>
      </p>

      <hr style="margin:24px 0;" />

      <!-- FOOTER -->
      <p style="font-size:12px; color:#666;">
        Kamu menerima email ini karena pernah berinteraksi dengan KOJE24.
        <br/>
        Jika tidak ingin menerima email lagi,
        <a href="https://koje24.id/unsubscribe?email=${email}">
          klik di sini untuk unsubscribe
        </a>.
      </p>
    </div>
  </div>
  `
}

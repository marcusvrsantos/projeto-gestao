import nodemailer from 'nodemailer';

// Cria um transportador de teste (Ethereal)
export const enviarEmail = async (para: string, assunto: string, texto: string) => {
  // Gera conta de teste se não tiver SMTP real configurado
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Sistema ARIES" <no-reply@aries.com>',
    to: para,
    subject: assunto,
    text: texto, // Versão texto simples
    html: `<div style="font-family: Arial;">${texto.replace(/\n/g, '<br>')}</div>`, // Versão HTML básica
  });

  console.log("📨 E-mail enviado: %s", info.messageId);
  console.log("🔗 Preview URL (Clique aqui): %s", nodemailer.getTestMessageUrl(info));
  
  return info;
};

import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  async sendEmailWithAttachment(
    attachmentPath: string,
    recipientEmail: string,
  ): Promise<void> {
    // Настройте транспорт для отправки электронной почты
    //TODO: change to your email and password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'bohdan.ilienko@nure.ua', pass: 'cewholrtxflavjru' },
    });

    // Получите только имя файла из пути
    const uniqueFileName = `receipt_${Date.now()}_${Math.floor(
      Math.random() * 1000,
    )}.pdf`;

    // Подготовьте письмо
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: recipientEmail,
      subject: 'Sale Receipt',
      text: 'Please find the attached sale receipt.',
      attachments: [
        {
          filename: uniqueFileName, // Установите имя файла для вложения
          path: attachmentPath,
        },
      ],
    };

    // Отправьте письмо
    await transporter.sendMail(mailOptions);

    // Удалите временный файл PDF после отправки
    fs.unlinkSync(attachmentPath);
  }

  async sendEmail(recipientEmail: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'bohdan.ilienko@nure.ua', pass: 'cewholrtxflavjru' },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: recipientEmail,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
  }
}

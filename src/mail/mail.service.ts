import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendUserConfirmation(user: any, token: string) {

    const baseUrl = process.env.LINK;
    const url = `${baseUrl}/verify-success?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Aktive kont Delivery ou kounye a!',
        text: `Byenveni ${user.name || "Kliyan"} ! Tanpri aktive kont ou nan lyen sa a: ${url}`,
        html: `
<div style="background-color: #fafafa; font-family: 'Inter', -apple-system, sans-serif; padding: 40px 20px; border-radius: 8px;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px; text-align: center;">
        <span style="font-size: 40px;">🍴</span>
        <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">DELIVERY</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px;">
        <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 15px 0;">Byenveni, ${user.name || 'Gourmet'}!</h2>
        <p style="color: #6b7280; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
            Nou kontan anpil pou w rantre nan fanmi <strong>Delivery</strong> a. 
            Pare pou w dekouvri pi bon restoran nan vil la ak yon sèvis ki rapid tankou zèklè.
        </p>

        <!-- CTA Button -->
        <a href="${url}" style="display: block; width: fit-content; margin: 0 auto; background-color: #09090b; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; letter-spacing: 0.5px;">
            Aktive Kont Mwen
        </a>
    </div>

    <!-- Footer -->
    <div style="padding: 30px; background: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Delivery Inc. Tout dwa rezève.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
            Ou resevwa imèl sa a paske ou te kreye yon kont sou platfòm nou an.
        </p>
    </div>
  </div>
</div>
`
      });
    } catch (error) {
      console.error('Mail Error:', error);
      throw new InternalServerErrorException({
        errorCode: 'ERR_MAIL_SEND_FAILED',
        message: 'Echèk nan voye imèl la. Tcheke konfigirasyon SMTP ou.',
      });
    }
  }

  async sendPasswordReset(user: any, token: string) {
    const baseUrl = process.env.LINK;
    const url = `${baseUrl}/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Demann pou chanje modpas ou - Delivery',
        text: `Alo ${user.name || 'Gourmet'}, nou resevwa yon demann pou chanje modpas ou. Klike sou lyen sa a pou kontinye: ${url}`,
        html: `
        <div style="background-color: #fafafa; font-family: 'Inter', -apple-system, sans-serif; padding: 40px 20px; border-radius: 8px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #111827 0%, #374151 100%); padding: 40px; text-align: center;">
                <span style="font-size: 40px;">🔒</span>
                <h1 style="color: #ffffff; margin: 10px 0 0 0; font-size: 24px; font-weight: 800;">Chanje Modpas</h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
                <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0 0 15px 0;">Alo ${user.name || 'Gourmet'},</h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.7; margin-bottom: 30px;">
                    Nou resevwa yon demann pou réinitialiser modpas kont <strong>Delivery</strong> ou an. 
                    Si se pa ou ki fè demann sa a, ou ka inyore imèl sa a san danje.
                </p>

                <!-- CTA Button -->
                <a href="${url}" style="display: block; width: fit-content; margin: 0 auto; background-color: #f97316; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
                    Réinitialiser Modpas
                </a>

                <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
                    Lyen sa a ap ekspire nan 1 èdtan.
                </p>
            </div>

            <!-- Footer -->
            <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #f3f4f6;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Delivery Inc. Tout dwa rezève.</p>
            </div>
          </div>
        </div>
        `,
      });
    } catch (error) {
      console.error('Mail Error:', error);
      throw new InternalServerErrorException({
        errorCode: 'ERR_RESET_MAIL_FAILED',
        message: 'Echèk nan voye imèl reset modpas la.',
      });
    }
  }
} 
import {
    Injectable,
    ConflictException,
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
    Logger
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { BecomeSellerDto } from './dto/become-seller.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private jwtService: JwtService,
    ) { }

    /**
     * Kreyasyon kont
     */
    async create(createUserDto: CreateUserDto) {
        const { password, email, ...rest } = createUserDto;
        const userExists = await this.prisma.user.findUnique({ where: { email } });
        if (userExists) {
            throw new ConflictException({
                errorCode: 'ERR_AUTH_EMAIL_ALREADY_EXISTS',
                message: 'Imèl sa a deja itilize pa yon lòt moun.',
            });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const confirmationToken = uuidv4();

            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    confirmationToken,
                    isEmailConfirmed: false,
                    role: 'CUSTOMER',
                    isAvailableForDelivery: false,
                    profile: {
                        create: {
                            username: email.split('@')[0] + Math.floor(1000 + Math.random() * 9000),
                        },
                    },
                },
                include: { profile: true },
            });

            this.mailService.sendUserConfirmation(user, confirmationToken).catch(err =>
                this.logger.error(`Mail failed: ${err.message}`)
            );

            const { password: _, ...cleanUser } = user;
            return { success: true, message: 'Kont ou kreye! Tanpri verifye imèl ou.', data: cleanUser };

        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException({
                errorCode: 'ERR_SERVER_ERROR',
                message: 'Yon pwoblèm teknik rive, tanpri eseye ankò.',
            });

        }
    }

    async requestEmailConfirmation(email: string) {

        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new NotFoundException({
                errorCode: 'ERR_USER_NOT_FOUND',
                message: 'imèl sa pa egziste ',
            });
        }

        const confirmationToken = uuidv4();
        await this.prisma.user.update({
            where: { email },
            data: { confirmationToken },
        });

        this.mailService.sendUserConfirmation(user, confirmationToken).catch(err =>
            this.logger.error(`Mail failed: ${err.message}`)
        );

        return {
            success: true,
            errorCode: 'EMAIL_CONFIRMATION',
            message: 'Nou voye yon imèl pou ou verifye bwat imèl ou. ',
        };

    }

    /**
     * 2. LOGIN KLASIK
     */
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user || !user.password) {
            throw new BadRequestException({
                errorCode: 'ERR_AUTH_INVALID',
                message: 'Imèl oswa modpas la pa kòrèk.',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException({
                errorCode: 'ERR_AUTH_INVALID',
                message: 'Imèl oswa modpas la pa kòrèk.',
            });
        }

        if (!user.isEmailConfirmed) {
            throw new BadRequestException({
                errorCode: 'ERR_AUTH_EMAIL_NOT_CONFIRMED',
                message: 'Tanpri konfime imèl ou anvan ou konekte.',
            });
        }

        const token = await this.jwtService.signAsync({ sub: user.id, email: user.email });
        const { password: _, ...safeUser } = user;

        return { success: true, token, user: safeUser };
    }

    /**
     * login avek google
     */
    async registerWithGoogle(googleUser: any) {
        const { email, firstName, lastName, picture } = googleUser;

        let user = await this.prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });

        if (!user) {
            this.logger.log(`Nouvo itilizatè Google: ${email}`);

            user = await this.prisma.user.create({
                data: {
                    email,
                    password: '',
                    isEmailConfirmed: true,

                    profile: {
                        create: {
                            username: email.split('@')[0] + Math.floor(Math.random() * 1000),
                            avatarUrl: picture,
                        }
                    }
                },
                include: { profile: true }
            });
        }

        const token = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email
        });

        return { token, user };
    }
    /**
     * 3. KONFIME IMÈL
     */
    async confirmEmail(token: string) {
        const user = await this.prisma.user.findFirst({
            where: { confirmationToken: token },
        });

        if (!user) {
            throw new BadRequestException({
                errorCode: 'ERR_INVALID_TOKEN',
                message: 'Lyen konfimasyon an pa valab oswa li ekspire.',
            });
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailConfirmed: true, confirmationToken: null },
        });

        return { success: true, message: 'Imèl ou konfime! Ou ka konekte kounye a.' };
    }

    /**
     * 4. deveni machann
     */
    async becomeSeller(userId: string, dto: BecomeSellerDto) {
        // 1. Tcheke si pwofil la egziste
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Pwofil sa a pa egziste.');
        }

        // 2. Si moun nan te voye yon demand deja ki an atant, nou bloke l
        if (profile.sellerStatus === 'PENDING') {
            throw new BadRequestException('Ou gen yon demand ki an atant pou verifikasyon deja.');
        }

        // 3. Mete pwofil la ajou nan mòd PENDING  pou admin ka analize l
        return this.prisma.profile.update({
            where: { userId },
            data: {
                username: dto.username,
                bio: dto.bio,
                location: dto.location,
                lat: dto.lat,
                lng: dto.lng,
                phone: dto.phone,
                documentUrl: dto.documentUrl,
                sellerStatus: 'PENDING',
                isSeller: false,
                storeStatus: 'CLOSED',
            },
        });
    }


    async approveOrRejectSeller(userId: string, status: 'APPROVED' | 'REJECTED') {
        const profile = await this.prisma.profile.findUnique({ where: { userId } });
        if (!profile) throw new NotFoundException('Pwofil sa a pa egziste.');

        return this.prisma.profile.update({
            where: { userId },
            data: {
                sellerStatus: status,
                isSeller: status === 'APPROVED', 
                storeStatus: status === 'APPROVED' ? 'OPEN' : 'CLOSED',
            },
        });
    }

    /**
     * 5. FIND ONE
     */
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });

        if (!user) {
            throw new NotFoundException({
                errorCode: 'ERR_USER_NOT_FOUND',
                message: 'Itilizatè a pa jwenn.',
            });
        }

        const { password, ...safeUser } = user;
        return safeUser;
    }


    /**
     * 8. Mande chanjman modpas
     */
    async forgotPassword(email: string) {

        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new NotFoundException({
                errorCode: 'ERR_USER_NOT_FOUND',
                message: 'Si imèl sa a egziste, nou voye yon lyen pou chanje modpas ou.',
            });
        }

        const resetToken = uuidv4();
        const expires = new Date(Date.now() + 3600000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: expires
            },
        });

        // Voye imèl ak lyen an
        this.mailService.sendPasswordReset(user, resetToken).catch(err =>
            this.logger.error(`Reset mail failed: ${err.message}`)
        );

        return { success: true, message: 'Lyen chanjman modpas la voye nan imèl ou.' };
    }

    /**
     * 9. Aplike nouvo modpas la
     */
    async resetPassword(token: string, newPassword: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            },
        });

        if (!user) {
            throw new BadRequestException({
                errorCode: 'ERR_INVALID_OR_EXPIRED_TOKEN',
                message: 'Lyen sa a pa valab oswa li ekspire.',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        return { success: true, message: 'Modpas ou chanje ak siksè!' };
    }
}
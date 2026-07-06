import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    UseGuards,
    Request,
    Req,
    Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { BecomeSellerDto } from './dto/become-seller.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // 1. REGISTER
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    // 2. LOGIN
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {

    }

    /**
     * 4. GOOGLE CALLBACK
     */
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res) {
        const result = await this.authService.registerWithGoogle(req.user);
        const frontendUrl = `${process.env.LINK}/verify-success` || 'http://localhost:5173/verify-success';
        return res.redirect(`${frontendUrl}?token=${result.token}&type=google`);
    }

    // 3. KONFIME IMÈL
    @Get('confirm/:token')
    async confirmEmail(@Param('token') token: string) {
        return this.authService.confirmEmail(token);
    }

    // 4. FORGOT PASSWORD
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    // 5. RESET PASSWORD
    @Post('reset-password')
    async resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
        return this.authService.resetPassword(token, newPassword);
    }

    @Post('requestEmailConfimation')
    async requestEmailConfimartion(@Body('email') email: string,) {

        return this.authService.requestEmailConfirmation(email)
    }

    // 6. BECOME A SELLER (Requires Auth)
    @UseGuards(JwtAuthGuard)
    @Patch('become-seller')
    async becomeSeller(@Req() req: any, @Body() payload: any) {
        // req.user ap genyen enfòmasyon itilizatè a gras ak JwtStrategy la
        const userId = req.user.id;
        return this.authService.becomeSeller(userId, payload);
    }

    // 7. GET PROFILE (Requires Auth)
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return this.authService.findOne(req.user.sub);
    }
}
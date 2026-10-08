import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { DriverService } from './driver.service';
import { JwtService } from '@nestjs/jwt';
@WebSocketGateway({ cors: true })
export class DriverGateway {
  @WebSocketServer() server!: Server;

  constructor(
    @Inject(forwardRef(() => DriverService))
    private driverService: DriverService,
    private readonly jwtService: JwtService,
  ) {}

  @SubscribeMessage('updateLocation')
  async handleLocation(
    @MessageBody() data: { driverId: string, lat: number, lng: number },
    @ConnectedSocket() client: Socket,
  ) {
    const authorization = client.handshake.headers.authorization;
    const token = client.handshake.auth?.token || (authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined);
    if (!token || !data || typeof data.driverId !== 'string' || !Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
      throw new WsException('Otantifikasyon oswa done pozisyon yo pa valab.');
    }
    let payload: { sub?: string };
    try { payload = await this.jwtService.verifyAsync(token); }
    catch { throw new WsException('Token sa a pa valab.'); }
    if (Math.abs(data.lat) > 90 || Math.abs(data.lng) > 180 || !payload.sub) throw new WsException('Pozisyon an pa valab.');
    // Sèvis la sove pozisyon an epi pibliye evènman driverMoved la.
    await this.driverService.updateLocation(data.driverId, payload.sub, data.lat, data.lng);
  }
}

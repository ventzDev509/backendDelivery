import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DriverService } from './driver.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class DriverGateway {
    @WebSocketServer() server!: Server;

  constructor(
    @Inject(forwardRef(() => DriverService))
    private driverService: DriverService
  ) {}

  @SubscribeMessage('updateLocation')
  async handleLocation(@MessageBody() data: { driverId: string, lat: number, lng: number }) {
    await this.driverService.updateLocation(data.driverId, data.lat, data.lng);
  }
}
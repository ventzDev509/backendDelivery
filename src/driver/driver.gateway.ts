import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { DriverService } from './driver.service';
@WebSocketGateway({ cors: true })
export class DriverGateway {
  @WebSocketServer() server!: Server;

  constructor(
    @Inject(forwardRef(() => DriverService))
    private driverService: DriverService,
  ) {}

  @SubscribeMessage('updateLocation')
  async handleLocation(@MessageBody() data: { driverId: string, lat: number, lng: number }) {
    // 1. Mete ajou nan baz done a
    await this.driverService.updateLocation(data.driverId, data.lat, data.lng);

    // 2. Voye l bay tout kliyan ki sou kat la
    this.server.emit('driverMoved', {
      driverId: data.driverId,
      lat: data.lat,
      lng: data.lng 
    });
  }
}
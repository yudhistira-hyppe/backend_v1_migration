import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AppGateway');

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): void {
        this.server.emit('msgToClient', payload);
    }

    directMessage(email: string, payload: string): void {
        this.server.emit(email, payload);
    }

    room(room: string, payload: string): void {
        //this.server.socketsJoin("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256");
        // this.server.socketsJoin(room);
        // this.server.to(room).emit("event_disqus", payload);
        
        console.log("room emit: " + payload);
        //this.server.emit(room, payload);
        this.server.emit("event_disqus", payload);
        //this.server.socketsLeave("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256");
    }

    event(event: string, payload: string): void {
        console.log("room emit: " + payload);
        this.server.emit(event, payload);
    }

    eventStream(event: string, payload: string): void {
        console.log(event);
        console.log(payload);
        this.server.emit(event, payload);
    }

    // event(event: string, payload: string): void {
    //     //this.server.socketsJoin("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256");
    //     // this.server.socketsJoin(room);
    //     // this.server.to(room).emit("event_disqus", payload);

    //     console.log("room emit: " + payload);
    //     //this.server.emit(room, payload);
    //     this.server.emit("event", payload);
    //     //this.server.socketsLeave("45b0bb4c-2ef6-4d9f-8ab2-c30a6ace1256");
    // }

    // @SubscribeMessage('joinRoom')
    // public joinRoom(client: Socket, room: string): void {
    //     client.join(room);
    //     client.emit('joinedRoom', room);
    // }

    // @SubscribeMessage('leaveRoom')
    // public leaveRoom(client: Socket, room: string): void {
    //     client.leave(room);
    //     client.emit('leftRoom', room);
    // }

    @SubscribeMessage('coba')
    coba(@MessageBody() payload: string): void {
        this.server.emit('coba', payload);
    }

    afterInit(server: Server) {
        this.logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
}
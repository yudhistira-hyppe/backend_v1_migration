import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { PosttaskService } from './posttask.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Posttask } from './schemas/posttask.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';


import mongoose from 'mongoose';

@Controller('api/posttask')
export class PosttaskController {
    constructor(
        private readonly PosttaskService: PosttaskService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
      
    ) { }
  
   
    @Post('/cron')
   // @UseGuards(JwtAuthGuard)
    async profi(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));

        var data = null;
        var id = null;

     

        const messages = {
            "info": ["The process successful"],
        };
        var lengdata = null;
        try {
            data = await this.PosttaskService.runCronTask();

        } catch (e) {
            data = null;

        }

        return { response_code: 202, data, messages };

    }

    @Post('/schedule')
   // @UseGuards(JwtAuthGuard)
    async profi3(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));

        var data = null;
        var id = null;

     

        const messages = {
            "info": ["The process successful"],
        };
        var lengdata = null;
        try {
            data = await this.PosttaskService.runCronSchedule();

        } catch (e) {
            data = null;

        }

        return { response_code: 202, data, messages };

    }
    @Post('/fcm')
    // @UseGuards(JwtAuthGuard)
     async profif(@Req() request: Request): Promise<any> {
         var request_json = JSON.parse(JSON.stringify(request.body));
 
         var data = null;
         var id = null;
 
      
 
         const messages = {
             "info": ["The process successful"],
         };
         var lengdata = null;
         try {
             data = await this.PosttaskService.requestFcm();
 
         } catch (e) {
             data = null;
 
         }
 
         return { response_code: 202, data, messages };
 
     }
}

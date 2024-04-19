import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { HistoryuserService } from './historyuser.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Historyuser } from './schemas/historyuser.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';


import mongoose from 'mongoose';

@Controller('api/historyuser')
export class HistoryuserController {
    constructor(
        private readonly HistoryuserService: HistoryuserService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
      
    ) { }
  
   

  
 
}

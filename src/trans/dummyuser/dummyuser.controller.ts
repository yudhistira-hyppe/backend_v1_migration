import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { DummyuserService } from './dummyuser.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Dummyuser } from './schemas/dummyuser.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';


import mongoose from 'mongoose';

@Controller('api/dummyuser')
export class DummyuserController {
    constructor(
        private readonly DummyuserService: DummyuserService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
      
    ) { }
  
   

  
 
}

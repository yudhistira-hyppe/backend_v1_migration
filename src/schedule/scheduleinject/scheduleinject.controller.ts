import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { ScheduleinjectService } from './scheduleinject.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Scheduleinject } from './schemas/scheduleinject.schema';



import mongoose from 'mongoose';

@Controller('api/scheduleinject')
export class ScheduleinjectController {
    constructor(
        private readonly ScheduleinjectService: ScheduleinjectService,
       
      
    ) { }
  
   

  
 
}

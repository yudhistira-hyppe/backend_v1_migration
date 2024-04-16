import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { TemppostService } from './temppost.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { temppost } from './schemas/temppost.schema';



import mongoose from 'mongoose';

@Controller('api/temppost')
export class TemppostController {
    constructor(
        private readonly temppostService: TemppostService,
        
      
    ) { }
  
   
 
}

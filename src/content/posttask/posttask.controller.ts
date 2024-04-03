import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { PosttaskService } from './posttask.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Posttask } from './schemas/posttask.schema';



import mongoose from 'mongoose';

@Controller('api/posttask')
export class PosttaskController {
    constructor(
      
      
    ) { }
  
   
}

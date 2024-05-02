import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers, UseInterceptors, UploadedFiles, Put, NotAcceptableException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

import mongoose from 'mongoose';

@Controller('api/monetize')
export class MonetizenewController {

    constructor(
 
    ) { }

  

}

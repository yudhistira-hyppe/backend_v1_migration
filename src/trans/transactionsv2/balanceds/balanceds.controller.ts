import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Headers, Get, Param, Req, Query } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { BalancedsService } from './balanceds.service';

@Controller('api/transactions/v2/balanceds')
export class BalancedsController {
    constructor(
        private readonly balancedsService: BalancedsService, 
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
    ) { }
}

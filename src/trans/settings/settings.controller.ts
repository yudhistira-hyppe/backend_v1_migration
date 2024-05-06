import { Body, Controller, Delete, Get, Param, Post, Put, Res, Request, UseGuards, HttpStatus, Req, Headers, Head } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings } from './schemas/settings.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService, private readonly logapiSS: LogapisService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Headers() headers, @Req() request): Promise<Settings> {
        var data = await this.settingsService.findOne(id);
        
        return data; 
        // return this.settingsService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Headers() headers, @Req() request): Promise<Settings[]> {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = await this.settingsService.findAll();

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data; 

        // return this.settingsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() CreateSettingsDto: CreateSettingsDto, @Headers() headers, @Req() request) {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateSettingsDto));
        
        const messages = {
            "info": ["The process successful"],
        };
        var data = await this.settingsService.create(CreateSettingsDto);

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        return { response_code: 202, data, messages };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.settingsService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateid(@Res() res, @Param('id') id: string, @Body() CreateSettingsDto: CreateSettingsDto, @Request() request, @Headers() headers) {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateSettingsDto));
        
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {


            let data = await this.settingsService.update(id, CreateSettingsDto);

            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {

            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }


    @Post('/list')
    @UseGuards(JwtAuthGuard)
    async profileuser(@Req() request: Request, @Headers() headers): Promise<any> {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var fullurl = headers.host + '/api/settings/list';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var jenis = null;
        var data = null;
        const messages = {
            "info": ["The process successful"],
        };

        jenis = request_json["jenis"];

        try {
            data = await this.settingsService.list(jenis);

        } catch (e) {
            data = [];

        }

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };


    }

}

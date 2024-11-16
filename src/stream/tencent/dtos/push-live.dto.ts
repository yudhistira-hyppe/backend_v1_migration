import { IsString, IsNotEmpty } from 'class-validator';

export class PushLiveDto {
  @IsString()
  @IsNotEmpty()
  streamName: string;
}

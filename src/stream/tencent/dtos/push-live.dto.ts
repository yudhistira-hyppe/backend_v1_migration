import { IsString, IsNotEmpty } from 'class-validator';

export class PushPlaybackLiveDto {
  @IsString()
  @IsNotEmpty()
  streamName: string;
}

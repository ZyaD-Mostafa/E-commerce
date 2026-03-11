import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateway';
import { TokenModule } from 'src/Modules/token/token.module';
import { UserModel } from 'src/DB/models/user.model';

@Module({
  imports: [TokenModule , UserModel],
  providers: [RealtimeGateway],
  controllers: [],
})
export class GatewayModule {
 
}

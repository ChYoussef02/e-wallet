import { Controller, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { EditUserDto } from './dto/edit-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch(':id')
  async editUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() dto: EditUserDto,
  ) {
    return this.userService.editUser(userId, dto);
  }
}

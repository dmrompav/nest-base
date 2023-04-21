import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/rolesGuard.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateUserRoleDto } from 'src/userRoles/dto/createUserRole.dto';
import { BanUserDto } from './dto/banUser.dto';
import { ChooseUserDto } from './dto/unblockUserDto';

@Controller('users')
export class UsersController {

  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @Post('/deleteSelf')
  @UseGuards(AuthGuard)
  deleteSelf(@Req() req) {
    return this.usersService.removeUser(req.user?.id);
  }

  @Get()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  getAll() {
    return this.usersService.getAllUsers();
  }

  @Post('/role')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  addRole(@Body() dto: CreateUserRoleDto) {
    return this.usersService.addRole(dto)
  }

  @Post('/ban')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  ban(@Body() dto: BanUserDto) {
    return this.usersService.ban(dto)
  }

  @Post('/unblock')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  unblock(@Body() dto: ChooseUserDto) {
    return this.usersService.unblock(dto)
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateUserDto } from './dto/createUser.dto';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserRoleDto } from 'src/userRoles/dto/createUserRole.dto';
import { BanUserDto } from './dto/banUser.dto';
import { ChooseUserDto } from './dto/unblockUserDto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    private roleService: RolesService
  ) {}

  async initFirstAdmin() {
    const existingAdmin = await this.userRepository.findOne({ where: { email: 'admin@admin' } });

    if (existingAdmin) return;

    const adminDto: CreateUserDto = {
      email: 'admin@admin',
      password: await bcrypt.hash('admin', Number(process.env.BCRYPT_LEVEL)),
    };

    this.createAdmin(adminDto);
  }

  async createAdmin(dto: CreateUserDto) {
    const admin = await this.userRepository.create(dto);
    const role = await this.roleService.getRoleByValue('ADMIN');
    await admin.$set('roles', [ role.id ]);
    admin.roles = [ role ];
    return admin;
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);
    const role = await this.roleService.getRoleByValue('USER');
    await user.$set('roles', [ role.id ]);
    user.roles = [ role ];
    return user;
  }

  async removeUser(userId) {
    if (userId) {
      const user = await this.userRepository.findByPk(userId);
      if (user) {
        user.destroy();
        throw new HttpException('Deleted', HttpStatus.OK)
      }
    }

    throw new HttpException('Something went wrong - we will fix it', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll({ include: { all: true } });
    return users;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email }, include: { all: true } });
    return user;
  }

  async addRole(dto: CreateUserRoleDto) {
    const user = await this.userRepository.findByPk(dto.userId);
    const role = await this.roleService.getRoleByValue(dto.value);

    if (role && user) {
      await user.$add('role', role.id);
      return dto;
    }

    throw new HttpException('User or role doesn\'n exist', HttpStatus.NOT_FOUND);
  }

  async ban(dto: BanUserDto) {
    const user = await this.userRepository.findByPk(dto.userId);

    if (!user) {
      throw new HttpException('User doesn\'t exist', HttpStatus.NOT_FOUND);
    }

    user.banned = true;
    user.banReason = dto.banReason;
    await user.save();
    return user;
  }

  async unblock(dto: ChooseUserDto) {
    const user = await this.userRepository.findByPk(dto.userId);

    if (!user) {
      throw new HttpException('User doesn\'t exist', HttpStatus.NOT_FOUND);
    }

    user.banned = false;
    user.banReason = null;
    await user.save();
    return user;
  }
}

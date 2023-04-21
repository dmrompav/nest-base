import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.model';

@Injectable()
export class AuthService {

  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(userDto: CreateUserDto) {
    if (userDto && userDto.email && userDto.password) {
      const user = await this.validateUser(userDto);
      return this.generateToken(user);
    }

    throw new HttpException('Wrong request parameters', HttpStatus.BAD_REQUEST);
  }

  async logout() {
    // TODO drop token
    throw new HttpException('Everything is fine', HttpStatus.OK)
  }

  async registration(userDto: CreateUserDto) {
    const candidate = await this.userService.getUserByEmail(userDto.email);
    if (candidate) {
      throw new HttpException('User is already exists', HttpStatus.BAD_REQUEST)
    }
    const hashPassword = await bcrypt.hash(userDto.password, Number(process.env.BCRYPT_LEVEL));
    const user = await this.userService.createUser({ ...userDto, password: hashPassword });
    return this.generateToken(user)
  }

  private async generateToken(user) {
    const payload = { email: user.email, id: user.id, roles: user.roles };
    const token = this.jwtService.sign(payload);

    throw new HttpException({ token }, HttpStatus.OK);
  }

  private async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    
    if (!user) {
      throw new UnauthorizedException({ message: 'No such user' });
    }

    const passwordEquals = await bcrypt.compare(userDto.password, user.password);

    if (passwordEquals) {
      return user;
    }

    throw new UnauthorizedException({ message: 'Invalid message or password' })
  }
}

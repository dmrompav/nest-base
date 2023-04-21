import { Model, Column, DataType, Table, BelongsToMany } from 'sequelize-typescript';
import { UserRole } from 'src/userRoles/userRoles.model';
import { User } from 'src/users/users.model';

interface RoleCreationAttrs {
  email: string,
  password: string
}

@Table({ tableName: 'roles' })
export class Role extends Model<Role, RoleCreationAttrs> {

  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  value: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @BelongsToMany(() => User, () => UserRole)
  users: User[];
}
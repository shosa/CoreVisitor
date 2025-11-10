import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class MobileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Login utente mobile
   */
  async login(username: string, password: string, appType: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: username },
    });

    if (!user) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verifica password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verifica permessi per app type
    const allowedRoles = this.getAllowedRolesForApp(appType);
    if (!allowedRoles.includes(user.role)) {
      throw new HttpException(
        'User not authorized for this app',
        HttpStatus.FORBIDDEN,
      );
    }

    // Log audit
    try {
      await this.prisma.auditLog.create({
        data: {
          action: 'login',
          entityType: 'user',
          entityId: user.id,
          details: `Mobile login - app: ${appType}`,
          userId: user.id,
          ipAddress: null,
        },
      });
    } catch (error) {
      console.log('Audit log error:', error.message);
    }

    // Rimuovi password dalla risposta
    const { password: _, ...userWithoutPassword } = user;

    return {
      status: 'success',
      message: 'Login successful',
      data: {
        ...userWithoutPassword,
        full_name: `${user.firstName} ${user.lastName}`,
        app_type: appType,
        enabled_modules: this.getEnabledModules(user.role),
      },
    };
  }

  /**
   * Ottieni lista utenti per app
   */
  async getUsers(appType: string) {
    const allowedRoles = this.getAllowedRolesForApp(appType);

    const users = await this.prisma.user.findMany({
      where: {
        role: {
          in: allowedRoles,
        },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return {
      status: 'success',
      data: users.map((user) => ({
        ...user,
        username: user.email,
        full_name: `${user.firstName} ${user.lastName}`,
      })),
    };
  }

  /**
   * Ottieni profilo utente
   */
  async getProfile(userId: string, appType: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpException(
        'User not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // TODO: Aggiungi statistiche app-specific (es. visite gestite)

    return {
      status: 'success',
      data: {
        ...user,
        full_name: `${user.firstName} ${user.lastName}`,
        app_type: appType,
        enabled_modules: this.getEnabledModules(user.role),
      },
    };
  }

  /**
   * Ruoli permessi per app type
   */
  private getAllowedRolesForApp(appType: string): UserRole[] {
    const rolesMap: Record<string, UserRole[]> = {
      'visitor-kiosk': ['admin', 'receptionist', 'security'],
    };

    return rolesMap[appType] || ['admin', 'receptionist', 'security'];
  }

  /**
   * Moduli abilitati per ruolo
   */
  private getEnabledModules(role: UserRole): string[] {
    const modulesMap: Record<UserRole, string[]> = {
      admin: ['visitor-kiosk'],
      receptionist: ['visitor-kiosk'],
      security: ['visitor-kiosk'],
      visitor: [],
    };

    return modulesMap[role] || [];
  }
}

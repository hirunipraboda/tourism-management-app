import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';
import { Role, UserStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === Role.ADMIN ? Role.ADMIN : Role.USER;

    const user = await prisma.user.create({
      data: {
        name: (name || 'Traveler').trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: userRole,
        phone: phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null,
        status: UserStatus.ACTIVE,
      },
    });

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithoutPassword,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('[authController.register] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status === UserStatus.INACTIVE) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('[authController.login] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: (error as Error).message,
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user && req.user.role === 'ADMIN') {
      user = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Current user profile fetched',
      user: userWithoutPassword,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('[authController.getMe] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: (error as Error).message,
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { password, name, profileImage, phone, bio, location } = req.body;

    // Explicitly enforce that password changes cannot happen here
    if (password) {
      return res.status(400).json({
        success: false,
        message: 'Password changes are not permitted from the profile. Password changes should only happen through reset password.',
      });
    }

    const updateData: any = {};
    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim();
    }
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }
    if (phone !== undefined) {
      updateData.phone = typeof phone === 'string' ? phone.trim() : phone;
    }
    if (bio !== undefined) {
      updateData.bio = typeof bio === 'string' ? bio.trim() : bio;
    }
    if (location !== undefined) {
      updateData.location = typeof location === 'string' ? location.trim() : location;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('[authController.updateProfile] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: (error as Error).message,
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      success: true,
      message: 'Password has been successfully reset. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[authController.resetPassword] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: (error as Error).message,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Account verified. Please proceed to set your new password.',
    });
  } catch (error) {
    console.error('[authController.forgotPassword] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request',
      error: (error as Error).message,
    });
  }
};

export const socialLogin = async (req: Request, res: Response) => {
  try {
    const { name, email, provider, avatarUrl } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (!user) {
      const generatedPassword = await bcrypt.hash(`social_${provider || 'auth'}_${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          name: (name || (normalizedEmail.split('@')[0])).trim(),
          email: normalizedEmail,
          password: generatedPassword,
          role: Role.USER,
          profileImage: avatarUrl || null,
          status: UserStatus.ACTIVE,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: userWithoutPassword,
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('[authController.socialLogin] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Social authentication failed',
      error: (error as Error).message,
    });
  }
};


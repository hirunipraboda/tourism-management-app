import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.slice(1).join('.')}: ${err.message}`
        );
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: errorMessages.join('; '),
        });
      }
      next(error);
    }
  };
};

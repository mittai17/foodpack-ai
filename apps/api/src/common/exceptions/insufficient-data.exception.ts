import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown whenever the recommendation pipeline would otherwise have to
 * invent a scientific value. Callers must surface this honestly rather
 * than falling back to a guessed number.
 */
export class InsufficientDataException extends HttpException {
  constructor(message: string, details?: unknown) {
    super(
      { code: 'INSUFFICIENT_DATA', message, details },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

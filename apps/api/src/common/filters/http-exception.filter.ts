import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Normalizes every thrown error into the { success: false, error: {...} }
 * shape the frontend/mobile clients rely on. Never leaks stack traces.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error: ApiErrorBody = {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        error = { code: httpStatusToCode(status), message: response };
      } else if (typeof response === 'object' && response !== null) {
        const body = response as Record<string, unknown>;
        error = {
          code:
            (body.code as string) ??
            (body.error as string) ??
            httpStatusToCode(status),
          message: Array.isArray(body.message)
            ? (body.message as string[]).join(', ')
            : ((body.message as string) ?? exception.message),
          details: body.details,
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    reply.status(status).send({
      success: false,
      error,
      meta: {
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL_ERROR';
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import Logger from "../modules/logger/logger";
import { wLogger } from "../modules/logger/logging.module";
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    try {
      const name = context.getHandler()?.name;
      console.time(`${name}`);
      return next.handle().pipe(
        tap((response) => {
          this.logger.logAction(context, response);
          console.timeEnd(`${name}`);
        }),
        catchError((error) => {
          this.logger.logAction(context, error, false);
          wLogger.error(error);
          return throwError(error);
        }),
      );
    } catch (e) {
      console.log("Intercept Error: " + e);
    }
  }
}

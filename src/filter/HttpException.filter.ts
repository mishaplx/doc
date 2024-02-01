import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { GqlContextType } from "@nestjs/graphql";
import { GraphQLError } from "graphql";

import { PREF_ERR } from "../common/enum/enum";
import { isPrefErr } from "../common/type/errorHelper.type";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus() ?? HttpStatus.BAD_REQUEST;
    // REST
    if (host.getType() === "http") {
      const context = host.switchToHttp();
      const response = context?.getResponse();
      response.status(status).json({
        statusCode: status,
        message: isPrefErr(exception.message) ? exception.message : PREF_ERR + exception.message,
      });

      // GRAPHQL
    } else if (host.getType<GqlContextType>() === "graphql") {
      console.error(exception);
      throw new GraphQLError(exception.message, { extensions: { code: status } });
      // иное
    } else {
      return new HttpException(PREF_ERR + "Server ERROR", status);
    }
  }
}

import { Query, Resolver } from "@nestjs/graphql";

import { IToken } from "src/BACK_SYNC_FRONT/auth";
import { Token } from "src/auth/decorator/token.decorator";
import { FileDownloadService } from "./fileDownload.service";

@Resolver()
export class FileDownloadResolver {
  constructor(private fileDownloadService: FileDownloadService) {}

  /**
   * GET CCSLITE VERSION
   */
  @Query(() => String, {
    description: "CCSLite: актуальная версия",
  })
  async getSignCcsVersion(
    @Token() token: IToken,
  ): Promise<string> {
    return this.fileDownloadService.ccsVersion({ org: token.url });
  }
}

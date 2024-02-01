import { PickType } from "@nestjs/graphql";
import { PostEntity } from "../../../../entity/#organization/post/post.entity";

class PostSeed extends PickType(PostEntity, ["id", "nm", "del", "temp"] as const) {}

export const postDefaultArr: PostSeed[] = [
  {
    id: 1,
    nm: "системный Администратор",
    del: false,
    temp: false,
  },
];

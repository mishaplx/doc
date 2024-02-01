import { TestHelper } from "../../../test/TestHelper";
import { IToken } from "../../common/interfaces/token.interface";
import { FavoritesService } from "./favorites.service";

const token: IToken = {
  user_id: 1,
  staff_id: 1,
  nm: "root",
  ln: "root",
  username: "rootrr",
  current_emp_id: 1,
  url: "docnodebelaz6",
  fio: "Root R.R.",
  post: "системный Администратор",
};

beforeAll(async () => {
  await TestHelper.instance.setupTestDB();
});

afterAll(() => {
  TestHelper.instance.teardownTestDB();
});

describe("favoritesResolver", () => {
  describe("getFavorites", () => {
    it("should return FavoritesEntity with emp_id: 1", async () => {
      const answer = await new FavoritesService(TestHelper.instance.dbConnect).getFavorites(token);
      expect(answer).toHaveProperty("emp_id", 1);
    });
  });

  describe("addFavorites", () => {
    it("should return FavoritesEntity with favorites", async () => {
      const answer = await new FavoritesService(TestHelper.instance.dbConnect).changeFavorites(
        token,
        1,
        2,
        3,
      );
      expect(answer).toHaveProperty("favorites");
      expect(answer).toHaveProperty("favorites.docId");
      expect(answer).toHaveProperty("favorites.jobId");
      expect(answer).toHaveProperty("favorites.projectId");
    });
  });

  describe("addFavoritesArray", () => {
    it("should return FavoritesEntity with favorites", async () => {
      const answer = await new FavoritesService(TestHelper.instance.dbConnect).changeFavoritesArray(
        token,
        [1],
        [2],
        [3],
      );
      expect(answer).toHaveProperty("favorites");
      expect(answer).toHaveProperty("favorites.docId");
      expect(answer).toHaveProperty("favorites.jobId");
      expect(answer).toHaveProperty("favorites.projectId");
    });
  });

  describe("deleteFavorites", () => {
    it("should return FavoritesEntity with favorites", async () => {
      const answer = await new FavoritesService(TestHelper.instance.dbConnect).changeFavorites(
        token,
        1,
        2,
        3,
        true,
      );
      expect(answer).toHaveProperty("favorites");
      expect(answer).toHaveProperty("favorites.docId");
      expect(answer).toHaveProperty("favorites.jobId");
      expect(answer).toHaveProperty("favorites.projectId");
    });
  });

  describe("deleteFavoritesArray", () => {
    it("should return FavoritesEntity with favorites", async () => {
      const answer = await new FavoritesService(TestHelper.instance.dbConnect).changeFavoritesArray(
        token,
        [1],
        [2],
        [3],
        true,
      );
      expect(answer).toHaveProperty("favorites");
      expect(answer).toHaveProperty("favorites.docId");
      expect(answer).toHaveProperty("favorites.jobId");
      expect(answer).toHaveProperty("favorites.projectId");
    });
  });
});

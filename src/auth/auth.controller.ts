import { Controller, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  /**
   * ПУСТЫШКА: ДЛЯ СБРОСА ТАЙМЕРА АКТИВНОСТИ ПОЛЬЗОВАТЕЛЯ И ИНЫХ СИТУАЦИЙ
   */
  @Post("activity_refresh")
  authActivityRefresh(): void { return; }
}

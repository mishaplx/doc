## ВАЖНО
- при установке системы тестирования версии @nest/core и @nest/testing ДОЛЖНЫ СОВПАДАТЬ
`npm i @nestjs/testing@8.2.0 --force`
- entity брать из src, а не dist
`const entities = [path.resolve(process.cwd(), "src/**/*.entity.ts")];`

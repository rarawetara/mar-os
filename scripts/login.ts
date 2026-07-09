/**
 * Разовый скрипт логина в Telegram-аккаунт под БД MAR.
 * Запуск: npm run login
 * Печатает StringSession — вставить в env как TELEGRAM_SESSION (только туда, никуда больше).
 */
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (question: string) => rl.question(question);

async function main() {
  const apiId = Number(process.env.TELEGRAM_API_ID || (await ask("TELEGRAM_API_ID: ")));
  const apiHash = process.env.TELEGRAM_API_HASH || (await ask("TELEGRAM_API_HASH: "));

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => ask("Номер телефона (с кодом страны): "),
    password: async () => ask("Пароль 2FA (если включён, иначе Enter): "),
    phoneCode: async () => ask("Код из Telegram: "),
    onError: (err) => console.error(err),
  });

  console.log("\nГотово. Залогинена. Вот StringSession — вставь в env как TELEGRAM_SESSION:\n");
  console.log(client.session.save());
  console.log("\nНикогда не клади это в репозиторий, фронт или логи — это полный доступ к аккаунту.");

  await client.disconnect();
  rl.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

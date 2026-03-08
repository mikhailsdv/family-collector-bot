import { trim } from "./utils.js";

export type PaymentMessageParams = {
  serviceName: string;
  paymentDeadline: string;
  totalPrice: number;
  baseCurrency: string;
  membersCount: number;
  perMemberBase: number;
  conversionUnavailable: boolean;
  convertedLines: { currency: string; totalPrice: number; perMember: number }[];
  [key: string]:
    | string
    | number
    | boolean
    | { currency: string; totalPrice: number; perMember: number }[];
};

export type GroupConfig = {
  name: string;
  telegramGroupId: number;
  paymentMessageTemplate: (params: PaymentMessageParams) => string;
  membersCount: number;
  paymentDayOfMonth: number;
  totalPrice: number;
  currency: string;
  targetCurrencies: string[];
};

const CONVERSION_UNAVAILABLE_TEXT = "❌ Конвертация временно недоступна";

export const testGroup: GroupConfig = {
  name: "Test Service",
  telegramGroupId: -1001462865755,
  paymentMessageTemplate: ({
    serviceName,
    paymentDeadline,
    totalPrice,
    baseCurrency,
    membersCount,
    conversionUnavailable,
    convertedLines,
  }) => {
    const convertedLinesText = convertedLines
      .map((line) => `💸 <b>${line.perMember} ${line.currency}</b> с человека`)
      .join("\n");

    return trim(`
      <b>🔔 Сегодня день оплаты за ${serviceName}</b>
      <b>🕒 Дедлайн по оплате</b>: ${paymentDeadline}
      <b>👥 Участников</b>: ${membersCount}/6

      <b>Общая сумма подписки</b>: ${totalPrice} ${baseCurrency}/мес

      <b>Суммы в валютах с человека</b>:
      ${convertedLinesText}${conversionUnavailable ? `\n\n${CONVERSION_UNAVAILABLE_TEXT}` : ""}

      <i>Пришлите квитанцию об оплате в этот чат</i>
    `);
  },
  membersCount: 6,
  paymentDayOfMonth: 12,
  totalPrice: 5000,
  currency: "KZT",
  targetCurrencies: ["USD", "RUB", "KZT"],
};

export const groups: GroupConfig[] = [
  {
    name: "Spotify",
    telegramGroupId: -1002116572307,
    paymentMessageTemplate: ({
      serviceName,
      paymentDeadline,
      totalPrice,
      baseCurrency,
      membersCount,
      conversionUnavailable,
      convertedLines,
    }) => {
      const convertedLinesText = convertedLines
        .map((line) => `<b>${line.perMember} ${line.currency}</b> с человека`)
        .join("\n");

      return trim(`
        <b>🔔 Сегодня день оплаты за ${serviceName}</b>
        <b>🕒 Дедлайн по оплате</b>: ${paymentDeadline}
        <b>👥 Участников</b>: ${membersCount}/6

        <b>Общая сумма подписки</b>: ${totalPrice} ${baseCurrency}/мес

        <b>Суммы в валютах с человека</b>:
        ${convertedLinesText}
        ${conversionUnavailable ? `\n${CONVERSION_UNAVAILABLE_TEXT}` : ""}

        <i>Пришлите квитанцию об оплате в этот чат</i>
      `);
    },
    membersCount: 6,
    paymentDayOfMonth: 15,
    totalPrice: 8,
    currency: "USD",
    targetCurrencies: ["USD", "RUB", "KZT"],
  },
  {
    name: "YouTube",
    telegramGroupId: -1002062006634,
    paymentMessageTemplate: ({
      serviceName,
      paymentDeadline,
      totalPrice,
      baseCurrency,
      membersCount,
      conversionUnavailable,
      convertedLines,
    }) => {
      const convertedLinesText = convertedLines
        .map((line) => `<b>${line.perMember} ${line.currency}</b> с человека`)
        .join("\n");

      return trim(`
        <b>🔔 Сегодня день оплаты за ${serviceName}</b>
        <b>🕒 Дедлайн по оплате</b>: ${paymentDeadline}
        <b>👥 Участников</b>: ${membersCount}/6

        <b>Общая сумма подписки</b>: ${totalPrice} ${baseCurrency}/мес

        <b>Суммы в валютах с человека</b>:
        ${convertedLinesText}
        ${conversionUnavailable ? `\n${CONVERSION_UNAVAILABLE_TEXT}` : ""}

        <i>Пришлите квитанцию об оплате в этот чат</i>
      `);
    },
    membersCount: 6,
    paymentDayOfMonth: 18,
    totalPrice: 8,
    currency: "USD",
    targetCurrencies: ["USD", "RUB", "KZT"],
  },
];

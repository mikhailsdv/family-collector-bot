import { fxService } from "./fx.js";
import { GroupConfig, PaymentMessageParams } from "./groups.js";
import { ceil1, formatDate } from "./utils.js";

type BuildPaymentMessageOptions = {
  conversionUnavailable: boolean;
};

export const buildPaymentMessage = (
  group: GroupConfig,
  rates: Record<string, number>,
  options?: BuildPaymentMessageOptions,
): string => {
  options = options ?? { conversionUnavailable: false };
  const notificationDate = new Date();
  const paymentDeadline = new Date(notificationDate);
  paymentDeadline.setDate(notificationDate.getDate() + 3);
  const paymentDeadlineText = formatDate(paymentDeadline);
  const totalPrice = group.totalPrice;
  const perMemberBase = totalPrice / group.membersCount;
  const baseCurrency = group.currency;
  const params: PaymentMessageParams = {
    serviceName: group.name,
    paymentDeadline: paymentDeadlineText,
    totalPrice: ceil1(totalPrice),
    baseCurrency,
    membersCount: group.membersCount,
    perMemberBase: ceil1(perMemberBase),
    conversionUnavailable: options.conversionUnavailable,
    convertedLines: [],
  };

  for (const targetCurrencyRaw of group.targetCurrencies) {
    const targetCurrency = targetCurrencyRaw;
    const rate = rates[targetCurrency];

    if (typeof rate !== "number") {
      continue;
    }

    const convertedTotal = fxService.convert(totalPrice, rate);
    const convertedPerMember = fxService.convert(perMemberBase, rate);
    params[`totalPrice${targetCurrency}`] = ceil1(convertedTotal);
    params[`perMember${targetCurrency}`] = ceil1(convertedPerMember);
    params.convertedLines.push({
      currency: targetCurrency,
      totalPrice: ceil1(convertedTotal),
      perMember: ceil1(convertedPerMember),
    });
  }

  if (!params.convertedLines.length) {
    params.convertedLines.push({
      currency: baseCurrency,
      totalPrice: ceil1(totalPrice),
      perMember: ceil1(perMemberBase),
    });
  }

  return group.paymentMessageTemplate(params);
};

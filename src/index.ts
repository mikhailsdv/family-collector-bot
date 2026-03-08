import { Bot } from "grammy";
import { SCHEDULE_HOUR_UTC, SCHEDULER_INTERVAL_MS } from "./constants.js";
import { BOT_TOKEN } from "./env.js";
import { fxService } from "./fx.js";
import { groups, testGroup } from "./groups.js";
import { buildPaymentMessage } from "./notifications.js";
import { formatDate } from "./utils.js";

const bot = new Bot(BOT_TOKEN);
let lastRunDateKey = "";

const sendNotifications = async (
  targetGroups: typeof groups,
): Promise<void> => {
  for (const group of targetGroups) {
    let rates: Record<string, number> = {};
    let conversionUnavailable = false;

    try {
      rates = await fxService.getRates(group.currency, group.targetCurrencies);
    } catch {
      conversionUnavailable = true;
      rates = {
        [group.currency]: 1,
      };
    }

    if (rates[group.currency] === undefined) {
      rates[group.currency] = 1;
    }

    const message = buildPaymentMessage(group, rates, {
      conversionUnavailable,
    });

    try {
      await bot.api.sendMessage(group.telegramGroupId, message, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(`Error sending message to group ${group.name}:`, error);
    }
  }
};

const sendMonthlyNotifications = async (): Promise<void> => {
  const todayDayOfMonth = new Date().getUTCDate();
  const groupsToNotify = groups.filter(
    (group) => group.paymentDayOfMonth === todayDayOfMonth,
  );

  if (!groupsToNotify.length) {
    console.log("Skip: no groups to notify");
    return;
  }
  console.log(
    `Notify groups: ${groupsToNotify.map((group) => group.name).join(", ")}`,
  );

  await sendNotifications(groupsToNotify);
};

const sendTestNotifications = async (): Promise<void> => {
  await sendNotifications([testGroup]);
};

const startScheduler = (): void => {
  console.log("Scheduler started");
  const schedulerTask = () => {
    const now = new Date();
    const hour = now.getUTCHours();
    const dateKey = formatDate(now);
    console.log(`Scheduler tick: utcHour=${hour}, dateKey=${dateKey}`);

    if (hour !== SCHEDULE_HOUR_UTC) {
      console.log("Skip: not scheduled hour");
      return;
    }

    if (lastRunDateKey === dateKey) {
      console.log("Skip: already ran today");
      return;
    }

    lastRunDateKey = dateKey;
    void sendMonthlyNotifications();
  };
  schedulerTask();
  setInterval(schedulerTask, SCHEDULER_INTERVAL_MS);
};

startScheduler();

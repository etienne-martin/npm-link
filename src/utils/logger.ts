import colors from "colors/safe";

type logType = "wait" | "info" | "ready" | "event" | "warn" | "error";

const rawLogger = (type: logType, messages: any[]) => {
  switch (type) {
    case "wait":
      console.log(colors.cyan("[ wait ] "), ...messages);
      break;
    case "info":
      console.info(colors.white("[ info ] "), ...messages);
      break;
    case "ready":
      console.log(colors.green("[ ready ]"), ...messages);
      break;
    case "event":
      console.log(colors.magenta("[ event ]"), ...messages);
      break;
    case "warn":
      console.warn(colors.yellow("[ warn ]"), ...messages);
      break;
    case "error":
      console.error(colors.red("[ error ]"), ...messages);
      break;
  }
};

export const logger = {
  wait: (...messages: any[]) => rawLogger("wait", messages),
  info: (...messages: any[]) => rawLogger("info", messages),
  ready: (...messages: any[]) => rawLogger("ready", messages),
  event: (...messages: any[]) => rawLogger("event", messages),
  warn: (...messages: any[]) => rawLogger("warn", messages),
  error: (...messages: any[]) => rawLogger("error", messages)
};

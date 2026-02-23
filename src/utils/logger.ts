export enum LogColors {
  BLACK = 'black',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  BLUE = 'blue',
  MAGENTA = 'magenta',
  CYAN = 'cyan',
  WHITE = 'white',
}

type LogColorKeys = keyof typeof LogColors;

type LoggerOptions = {
  mode?: 'text' | 'background';
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | string;
  color?: LogColorKeys;
};

/**
 * Change console log colors and background for reference you can read this article https://blog.logrocket.com/using-console-colors-node-js/
 */
export const Logger = (() => {
  const colors = {
    text: {
      black: 30,
      red: 31,
      green: 32,
      yellow: 33,
      blue: 34,
      magenta: 35,
      cyan: 36,
      white: 37,
    },
    background: {
      black: 40,
      red: 41,
      green: 42,
      yellow: 43,
      blue: 44,
      magenta: 45,
      cyan: 46,
      white: 47,
    },
  };

  // color mode config
  const mode: LoggerOptions['mode'] = 'background';

  function constructTextColor({
    color,
    label,
  }: {
    color: number;
    label: string;
  }) {
    return `\x1b[${color}m ${label} \x1b[0m`;
  }

  function constructLogMessage(text: string, options: LoggerOptions) {
    const {
      type,
      color: colorOption = 'BLUE',
      mode: modeOption = 'text',
    } = options;
    let label = '';
    let color: number;

    switch (options.type) {
      case 'ERROR':
        label = '[ERROR]';
        if (options.mode === 'background') {
          color = colors.background.red;
        } else {
          color = colors.text.red;
        }
        break;
      case 'WARN':
        label = '[WARN]';
        if (options.mode === 'background') {
          color = colors.background.yellow;
        } else {
          color = colors.text.yellow;
        }
        break;
      case 'SUCCESS':
        label = '[SUCCESS]';
        if (options.mode === 'background') {
          color = colors.background.green;
        } else {
          color = colors.text.green;
        }
        break;
      case 'INFO':
        label = '[INFO]';
        if (options.mode === 'background') {
          color = colors.background.blue;
        } else {
          color = colors.text.blue;
        }
        break;
      default:
        label = `[${options.type}]`;
        color = colors[modeOption][LogColors[colorOption]];
        break;
    }

    return console.log(
      `${constructTextColor({
        color,
        label,
      })} ${text}`,
    );
  }

  return {
    info: (text: string) => {
      return constructLogMessage(text, { type: 'INFO', mode });
    },
    error: (text: string) => {
      return constructLogMessage(text, { type: 'ERROR', mode });
    },
    success: (text: string) => {
      return constructLogMessage(text, {
        type: 'SUCCESS',
        mode: mode,
      });
    },
    warn: (text: string) => {
      return constructLogMessage(text, { type: 'WARN', mode });
    },
    custom: (text: string, options: LoggerOptions) =>
      constructLogMessage(text, options),
  };
})();

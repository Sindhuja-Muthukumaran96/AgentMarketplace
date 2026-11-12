const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function tag(label: string, color: string): string {
  return `${color}[${label}]${colors.reset}`;
}

/** Tagged console logger shared by every agent-marketplace plugin */
export class Logger {
  static step(stage: string, message: string): void {
    console.info(`${tag(stage, colors.magenta)} ${message}`);
  }

  static rag(message: string): void {
    console.info(`${tag('RAG', colors.cyan)} ${message}`);
  }

  static llm(message: string): void {
    console.info(`${tag('LLM', colors.yellow)} ${message}`);
  }

  static tool(message: string): void {
    console.info(`${tag('TOOL', colors.dim)} ${message}`);
  }

  static exec(message: string): void {
    console.info(`${tag('EXEC', colors.cyan)} ${message}`);
  }

  static success(message: string): void {
    console.info(`${tag('OK', colors.green)} ${message}`);
  }

  static warn(message: string): void {
    console.warn(`${tag('WARN', colors.yellow)} ${message}`);
  }

  static error(message: string): void {
    console.error(`${tag('ERROR', colors.red)} ${message}`);
  }
}

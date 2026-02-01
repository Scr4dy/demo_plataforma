type LogLevel = "debug" | "info" | "warn" | "error" | "none";

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  showTimestamp: boolean;
  showEmojis: boolean;
}

class Logger {
  private config: LoggerConfig = {
    enabled: __DEV__,
    level: "info",
    showTimestamp: true,
    showEmojis: true,
  };

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
  };

  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return this.levels[level] >= this.levels[this.config.level];
  }

  private format(emoji: string, prefix: string, ...args: any[]): any[] {
    const parts: any[] = [];

    if (this.config.showTimestamp) {
      const timestamp = new Date().toLocaleTimeString("es-ES");
      parts.push(`[${timestamp}]`);
    }

    if (this.config.showEmojis && emoji) {
      parts.push(emoji);
    }

    if (prefix) {
      parts.push(prefix);
    }

    return [...parts, ...args];
  }

  debug(prefix: string, ...args: any[]) {
    if (this.shouldLog("debug")) {
    }
  }

  info(prefix: string, ...args: any[]) {
    if (this.shouldLog("info")) {
    }
  }

  warn(prefix: string, ...args: any[]) {
    if (this.shouldLog("warn")) {
      // Log removed
    }
  }

  error(prefix: string, ...args: any[]) {
    if (this.shouldLog("error")) {
      // Log removed
    }
  }

  success(prefix: string, ...args: any[]) {
    if (this.shouldLog("info")) {
    }
  }

  auth = {
    login: (...args: any[]) => this.info("🔐 [AUTH]", ...args),
    logout: (...args: any[]) => this.info("👋 [AUTH]", ...args),
    register: (...args: any[]) => this.info("📝 [AUTH]", ...args),
    session: (...args: any[]) => this.debug("🔑 [SESSION]", ...args),
    error: (...args: any[]) => this.error("🚫 [AUTH]", ...args),
  };

  network = {
    request: (...args: any[]) => this.debug("📡 [NETWORK]", ...args),
    response: (...args: any[]) => this.debug("📥 [NETWORK]", ...args),
    error: (...args: any[]) => this.error("🔴 [NETWORK]", ...args),
    sync: (...args: any[]) => this.info("🔄 [SYNC]", ...args),
  };

  cache = {
    hit: (...args: any[]) => this.debug("💾 [CACHE HIT]", ...args),
    miss: (...args: any[]) => this.debug("❌ [CACHE MISS]", ...args),
    set: (...args: any[]) => this.debug("💿 [CACHE SET]", ...args),
    clear: (...args: any[]) => this.info("🗑️ [CACHE CLEAR]", ...args),
  };

  data = {
    fetch: (...args: any[]) => this.debug("📊 [DATA]", ...args),
    update: (...args: any[]) => this.info("✏️ [DATA]", ...args),
    delete: (...args: any[]) => this.info("🗑️ [DATA]", ...args),
    error: (...args: any[]) => this.error("💥 [DATA]", ...args),
  };

  ui = {
    render: (...args: any[]) => this.debug("🎨 [UI]", ...args),
    navigation: (...args: any[]) => this.debug("🧭 [NAV]", ...args),
    interaction: (...args: any[]) => this.debug("👆 [UI]", ...args),
  };

  demo = {
    info: (...args: any[]) => this.info("🎭 [DEMO]", ...args),
    mock: (...args: any[]) => this.debug("📦 [MOCK]", ...args),
  };

  group(label: string, callback: () => void) {
    if (this.config.enabled) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  time(label: string) {
    if (this.config.enabled) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.config.enabled) {
      console.timeEnd(label);
    }
  }

  table(data: any) {
    if (this.config.enabled && this.shouldLog("debug")) {
      console.table(data);
    }
  }
}

export const logger = new Logger();

export const configureForProduction = () => {
  logger.configure({
    enabled: false,
    level: "error",
  });
};

export const configureForDevelopment = () => {
  logger.configure({
    enabled: true,
    level: "debug",
    showTimestamp: true,
    showEmojis: true,
  });
};

export const configureForTesting = () => {
  logger.configure({
    enabled: true,
    level: "warn",
    showTimestamp: false,
    showEmojis: false,
  });
};

export default logger;

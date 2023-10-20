// import winston from 'winston'

const winston = require('winston');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.debug || '1'
  const isDevelopment = env === '1'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}


winston.addColors(colors)

const formatConsole = {
  format: winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
  )};

const formatFile =  winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
  winston.format.printf(
     (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
  )

const transports = [
  new winston.transports.Console(
    formatConsole),
  
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    levelOnly:true,
    format:formatFile,
  }),
  // new winston.transports.File({
  //   filename: 'logs/warn.log',
  //   level: 'warn',
  //   levelOnly:true,
  //   format:formatFile,
  // }),
  // new winston.transports.File({
  //   filename: 'logs/info.log',
  //   level: 'info',
  //   levelOnly:true,
  //   format:formatFile,
  // }),
  // new winston.transports.File({
  //   filename: 'logs/http.log',
  //   level: 'http',
  //   levelOnly:true,
  //   format:formatFile,
  // }),
  new winston.transports.File({
    filename: 'logs/debug.log',
    level: 'debug',
    
    levelOnly:true,
    format:formatFile,
  }),
  new winston.transports.File({ filename: 'logs/all.log', format: formatFile }),
  
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  // format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
})

// export default Logger
module.exports = Logger
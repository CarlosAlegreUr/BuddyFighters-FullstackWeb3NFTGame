const winston = require("winston");
const path = require("path");

function levelFilter(level) {
    return winston.format((info, opts) => {
        if (info.level === level) {
            return info;
        }
    })();
}

const logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: "info",
            filename: path.join(__dirname, "infoLogs.log"),
            format: winston.format.combine(
                levelFilter("info"),
                winston.format.timestamp(),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`
                )
            ),
        }),
        new winston.transports.File({
            level: "warn",
            filename: path.join(__dirname, "warningLogs.log"),
            format: winston.format.combine(
                levelFilter("warn"),
                winston.format.timestamp(),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`
                )
            ),
        }),
        new winston.transports.File({
            level: "error",
            filename: path.join(__dirname, "errorLogs.log"),
            format: winston.format.combine(
                levelFilter("error"),
                winston.format.timestamp(),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`
                )
            ),
        }),
    ],
});

module.exports = logger;

// ============================================================
// 📦 IMPORT MODULE / DEPENDENCIES
// ============================================================

const os = require('os');
const fs = require('fs');
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const QRCode = require('qrcode');
const sharp = require('sharp');
const axios = require('axios');
const fetch = require('node-fetch');
const FormData = require('form-data');
const winston = require('winston');
const { exec } = require('child_process');



// ============================================================
// 🤖 TELEGRAM / BOT MODULE
// ============================================================

const { Telegraf, session, Markup } = require('telegraf');


// ============================================================
// 💳 QRIS MODULE
// ============================================================

const { QRISGenerator } = require('autoft-qris');


// ============================================================
// 🌐 EXPRESS APP
// ============================================================

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================================================
// 📂 DATABASE & FOLDER CONFIGURATION
// ============================================================

const FOLDER_TEMPATDB = "/root/BotVPN2/sellvpn.db";

const tempDir = path.join(__dirname, 'temp');


// ============================================================
// 📁 CREATE TEMP DIRECTORY
// ============================================================

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}


// ============================================================
// 🌍 GLOBAL CONFIGURATION
// ============================================================

global.userConfigs = global.userConfigs || {};

const restoreState = {};


// ============================================================
// 📝 LOGGER / LOGGING SYSTEM
// ============================================================

const logger = winston.createLogger({
  level: 'info',

  format: winston.format.combine(
    winston.format.timestamp(),

    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),

  transports: [
    new winston.transports.File({
      filename: 'bot-error.log',
      level: 'error'
    }),

    new winston.transports.File({
      filename: 'bot-combined.log'
    }),
  ],
});


// ============================================================
// 🖥️ CONSOLE LOGGER (DEVELOPMENT MODE)
// ============================================================

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}


// ============================================================
// 🔐 CREATE ACCOUNT / TRIAL MODULE
// ============================================================

// ---------- Trial Account ----------
const {
  trialssh,
  trialvmess,
  trialvless,
  trialtrojan,
  trialshadowsocks
} = require("./modules/create");


// ---------- Permanent Account ----------
const {
  createssh,
  createvmess,
  createvless,
  createtrojan,
  createshadowsocks
} = require('./modules/create');


// ============================================================
// ♻️ RENEW ACCOUNT MODULE
// ============================================================

const {
  renewssh,
  renewvmess,
  renewvless,
  renewtrojan,
  renewshadowsocks
} = require('./modules/renew');


// ============================================================
// 📅 FORMAT TANGGAL INDONESIA
// ============================================================

function formatTanggalIndonesia(isoString) {
  const date = new Date(isoString);

  const hari = date.toLocaleDateString('id-ID', {
    weekday: 'long'
  });

  const tanggal = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const jam = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return `${hari}, ${tanggal} • ${jam}`;
}


// ============================================================
// ⚙️ LOAD ENV / VARIABLES CONFIGURATION
// ============================================================

const vars = JSON.parse(
  fs.readFileSync('./.vars.json', 'utf8')
);

// ============================================================
// ⚙️ APPLICATION CONFIGURATION
// ============================================================

// ---------- Saweria ----------
const SAWERIA_USERNAME = vars.SAWERIA_USERNAME;
const SAWERIA_EMAIL = vars.SAWERIA_EMAIL;


// ---------- Telegram Bot ----------
const BOT_TOKEN = vars.BOT_TOKEN;
const port = vars.PORT || 50123;
const ADMIN = vars.USER_ID;
const groupId = vars.GROUP_CHAT_ID;


// ---------- Store ----------
const NAMA_STORE = vars.NAMA_STORE || 'XWANSTORE';


// ---------- Admin ----------
const ADMIN_WA = vars.ADMIN_WA;
const AUTHX = vars.AUTHX;


// ---------- Orkut ----------

const DATA_QRIS = vars.DATA_QRIS;
const DATA_QRIS_GOPAY = vars.DATA_QRIS_GOPAY;
const MERCHANT_ID = vars.MERCHANT_ID;
const API_KEY = vars.API_KEY;


// ---------- Menu Image ----------
const GAMBAR_MENU = vars.GAMBAR_MENU;
const GAMBAR_TOPUP = vars.GAMBAR_TOPUP;


// ---------- Group Channel Configuration ----------

const GROUP_USERNAME = String(
    vars.GROUP_USERNAME || ''
).replace('@', '');

const CHANNEL_USERNAME = String(
    vars.CHANNEL_USERNAME || ''
).replace('@', '');


// ---------- Gopay ----------

const GOPAY_GENERATE_API =
    "https://v1-gateway.autogopay.site/qris/generate";

const GOPAY_STATUS_API =
    "https://v1-gateway.autogopay.site/qris/status";

const GOPAY_KEY = vars.GOPAY_KEY;
const GOPAY_ID = vars.GOPAY_ID;


// ---------- Pakasir ----------

const PAKASIR_API_KEY = vars.PAKASIR_API_KEY;
const PAKASIR_PROJECT = vars.PAKASIR_PROJECT;

const PAY_BASE = "https://app.pakasir.com";


// ============================================================
// 🤖 INITIALIZE TELEGRAM BOT
// ============================================================

const bot = new Telegraf(BOT_TOKEN);


// ============================================================
// 🔐 BASH ENCRYPT / DECRYPT MANAGER
// ============================================================

class BashEncryptManager {

    // ========================================================
    // 📁 CONSTRUCTOR
    // ========================================================

    constructor() {
        this.tempDir = "./temp-bash";
        this.ensureTempDir();
    }


    // ========================================================
    // 📂 ENSURE TEMP DIRECTORY
    // ========================================================

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, {
                recursive: true
            });
        }
    }


    // ========================================================
    // 🧹 CLEANUP TEMP FILES
    // ========================================================

    cleanupTempFiles() {
        try {

            if (!fs.existsSync(this.tempDir)) {
                return;
            }

            const files = fs.readdirSync(this.tempDir);

            files.forEach(file => {

                if (
                    file.startsWith("input_") ||
                    file.startsWith("temp_")
                ) {
                    fs.unlinkSync(
                        path.join(this.tempDir, file)
                    );
                }

            });

        } catch (e) {
            logger.error(e.message);
        }
    }


    // ========================================================
    // 🧹 CLEANUP ENCRYPTED / DECRYPTED FILES
    // ========================================================

    cleanupResultFiles() {
        try {

            if (!fs.existsSync(this.tempDir)) {
                return;
            }

            const files = fs.readdirSync(this.tempDir);

            files.forEach(file => {

                if (
                    file.startsWith("encrypted_") ||
                    file.startsWith("decrypted_")
                ) {
                    fs.unlinkSync(
                        path.join(this.tempDir, file)
                    );
                }

            });

        } catch (e) {
            logger.error(e.message);
        }
    }


    // ========================================================
    // 🔒 ENCRYPT BASH SCRIPT
    // ========================================================

    async encryptScript(inputPath, outputName) {

        return new Promise((resolve, reject) => {

            const outputPath = path.join(
                this.tempDir,
                outputName
            );

            exec(
                `bash-obfuscate ${inputPath} -o ${outputPath}`,

                (err, stdout, stderr) => {

                    // ---------- Error ----------
                    if (err) {
                        return reject(err);
                    }


                    // ---------- Stderr ----------
                    if (
                        stderr &&
                        !stderr.includes("Warning")
                    ) {
                        return reject(
                            new Error(stderr)
                        );
                    }


                    // ---------- Success ----------
                    resolve({
                        success: true,
                        outputPath,
                        fileName: outputName
                    });

                }
            );

        });

    }


    // ========================================================
    // 🔓 DECRYPT BASH SCRIPT
    // ========================================================

    async decryptScript(inputPath, outputName) {

        return new Promise((resolve, reject) => {

            try {

                // ---------- Read Encrypted File ----------
                const encrypted =
                    fs.readFileSync(
                        inputPath,
                        "utf8"
                    );


                // ---------- Replace Eval ----------
                const output =
                    encrypted.replace(
                        /eval/g,
                        "echo"
                    );


                // ---------- Temporary Script ----------
                const tempScript =
                    path.join(
                        this.tempDir,
                        "temp_decrypt.sh"
                    );


                // ---------- Output File ----------
                const outputPath =
                    path.join(
                        this.tempDir,
                        outputName
                    );


                // ---------- Write Temporary Script ----------
                fs.writeFileSync(
                    tempScript,
                    output
                );


                // ---------- Execute Decryption ----------
                exec(
                    `bash ${tempScript} > ${outputPath} 2>&1`,

                    err => {

                        // ---------- Remove Temporary File ----------
                        try {
                            fs.unlinkSync(tempScript);
                        } catch {}


                        // ---------- Fallback ----------
                        if (
                            err &&
                            !fs.existsSync(outputPath)
                        ) {

                            fs.writeFileSync(
                                outputPath,
                                output
                            );

                        }


                        // ---------- Success ----------
                        resolve({
                            success: true,
                            outputPath,
                            fileName: outputName
                        });

                    }
                );

            } catch (e) {

                reject(e);

            }

        });

    }


    // ========================================================
    // 🔍 CHECK BASH-OBFUSCATE
    // ========================================================

    async checkBashObfuscate() {

        return new Promise(resolve => {

            exec(
                "which bash-obfuscate",

                err => resolve(!err)

            );

        });

    }


    // ========================================================
    // 📦 INSTALL BASH-OBFUSCATE
    // ========================================================

    async installBashObfuscate() {

        return new Promise((resolve, reject) => {

            exec(
                "npm install -g bash-obfuscate",

                err => {

                    // ---------- Error ----------
                    if (err) {
                        return reject(err);
                    }


                    // ---------- Success ----------
                    resolve(true);

                }
            );

        });

    }

}

// ============================================================
// 🔐 INITIALIZE BASH ENCRYPT MANAGER
// ============================================================

const bashEncrypt = new BashEncryptManager();


// ============================================================
// 💾 DATABASE BACKUP CONFIGURATION
// ============================================================

const https = require("https");

const BACKUP_DIR = path.join(
    __dirname,
    "backup"
);


// ============================================================
// 📁 CREATE BACKUP DIRECTORY
// ============================================================

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(
        BACKUP_DIR,
        {
            recursive: true
        }
    );
}


// ============================================================
// 📄 GENERATE V2RAY YAML CONFIGURATION
// ============================================================

function generateV2RayYaml(
    v2rayConfig,
    configName = ""
) {

    console.log(
        '🛠️ Generating V2Ray YAML from:',
        v2rayConfig
    );


    // ========================================================
    // 🔍 VALIDATE V2RAY CONFIGURATION
    // ========================================================

    if (
        !v2rayConfig.id ||
        !v2rayConfig.add
    ) {
        throw new Error(
            'Konfigurasi tidak valid: missing ID atau address'
        );
    }


    // ========================================================
    // ⚙️ EXTRACT V2RAY PARAMETERS
    // ========================================================

    const proxyName =
        v2rayConfig.ps ||
        v2rayConfig.name ||
        "v2ray-proxy";


    const server =
        v2rayConfig.add ||
        v2rayConfig.address ||
        v2rayConfig.server ||
        "server.example.com";


    const port =
        v2rayConfig.port ||
        443;


    const uuid =
        v2rayConfig.id ||
        v2rayConfig.uuid ||
        "66ce30e3-4c14-42f6-b708-2f4dd60a161f";


    const alterId =
        v2rayConfig.aid ||
        v2rayConfig.alterId ||
        0;


    const cipher =
        v2rayConfig.cipher ||
        "auto";


    const tls =
        v2rayConfig.tls === "tls" ||
        v2rayConfig.tls === true ||
        v2rayConfig.security === "tls";


    const skipVerify =
        v2rayConfig.skipCertVerify !== undefined
            ? v2rayConfig.skipCertVerify
            : true;


    const servername =
        v2rayConfig.sni ||
        v2rayConfig.servername ||
        v2rayConfig.host ||
        server;


    const network =
        v2rayConfig.net ||
        v2rayConfig.network ||
        "tcp";


    const wsPath =
        v2rayConfig.path ||
        "/";


    const wsHost =
        v2rayConfig.host ||
        v2rayConfig.sni ||
        servername;


    const udp =
        v2rayConfig.udp !== undefined
            ? v2rayConfig.udp
            : true;


    // ========================================================
    // 🔀 DETERMINE PROXY TYPE
    // ========================================================

    const proxyType =
        v2rayConfig.type === 'vless'
            ? 'vless'
            : 'vmess';


    console.log(
        `🔧 YAML parameters: ${proxyType}://${uuid}@${server}:${port}`
    );

    console.log(
        `🔧 Network: ${network}, TLS: ${tls}, SNI: ${servername}, Path: ${wsPath}, Host: ${wsHost}`
    );


    // ========================================================
    // 📝 INITIALIZE YAML HEADER / NOTES
    // ========================================================

    let yaml =
        addYamlNotes(
            proxyType,
            configName
        );


    // ========================================================
    // 🌐 BASIC PROXY CONFIGURATION
    // ========================================================

    yaml += "proxies:\n";

    yaml +=
        `  - name: ${proxyName}\n`;

    yaml +=
        `    server: ${server}\n`;

    yaml +=
        `    port: ${port}\n`;

    yaml +=
        `    type: ${proxyType}\n`;

    yaml +=
        `    uuid: ${uuid}\n`;


    // ========================================================
    // ⚡ VMESS-SPECIFIC CONFIGURATION
    // ========================================================

    if (proxyType === 'vmess') {

        yaml +=
            `    alterId: ${alterId}\n`;

        yaml +=
            `    cipher: ${cipher}\n`;
    }


    // ========================================================
    // 🔒 TLS CONFIGURATION
    // ========================================================

    yaml +=
        `    tls: ${tls}\n`;

    yaml +=
        `    skip-cert-verify: ${skipVerify}\n`;


    // ========================================================
    // 🌍 SERVERNAME / SNI
    // ========================================================

    if (servername) {

        yaml +=
            `    servername: ${servername}\n`;
    }


    // ========================================================
    // 🌐 NETWORK CONFIGURATION
    // ========================================================

    yaml +=
        `    network: ${network}\n`;


    // ========================================================
    // 🔌 NETWORK-SPECIFIC OPTIONS
    // ========================================================

    // ---------- WebSocket ----------
    if (network === "ws") {

        yaml +=
            `    ws-opts:\n`;

        yaml +=
            `      path: "${wsPath}"\n`;


        // ---------- WebSocket Host ----------
        if (wsHost) {

            yaml +=
                `      headers:\n`;

            yaml +=
                `        Host: ${wsHost}\n`;
        }
    }


    // ---------- gRPC ----------
    else if (network === "grpc") {

        yaml +=
            `    grpc-opts:\n`;

        yaml +=
            `      grpc-service-name: "${wsPath}"\n`;
    }


    // ---------- HTTP/2 ----------
    else if (network === "h2") {

        yaml +=
            `    h2-opts:\n`;

        yaml +=
            `      path: "${wsPath}"\n`;


        // ---------- HTTP/2 Host ----------
        if (wsHost) {

            yaml +=
                `      host: ["${wsHost}"]\n`;
        }
    }


    // ---------- TCP ----------
    else if (network === "tcp") {

        // Custom TCP HTTP Header
        if (wsHost) {

            yaml +=
                `    http-opts:\n`;

            yaml +=
                `      headers:\n`;

            yaml +=
                `        Host: ${wsHost}\n`;
        }
    }


    // ========================================================
    // 🛡️ VLESS FLOW CONFIGURATION
    // ========================================================

    if (
        proxyType === 'vless' &&
        v2rayConfig.flow
    ) {

        yaml +=
            `    flow: ${v2rayConfig.flow}\n`;
    }


    // ========================================================
    // 📡 UDP CONFIGURATION
    // ========================================================

    yaml +=
        `    udp: ${udp}\n`;


    // ========================================================
    // ✅ YAML GENERATION COMPLETE
    // ========================================================

    console.log(
        '✅ YAML generated successfully'
    );

    console.log(
        '📄 Generated YAML:\n',
        yaml
    );


    return yaml;
}

// ============================================================
// 📝 ADD YAML HEADER / NOTES
// ============================================================

function addYamlNotes(
    proxyType,
    configName = ""
) {

    const now = new Date();

    const timestamp =
        now.toLocaleString('id-ID');


    // ========================================================
    // 📋 YAML HEADER
    // ========================================================

    let notes =
        `# ========================================\n`;

    notes +=
        `# KONFIGURASI ${proxyType.toUpperCase()} - ANSENDANTVPN\n`;

    notes +=
        `# ========================================\n`;


    // ========================================================
    // ℹ️ YAML INFORMATION
    // ========================================================

    notes +=
        `# - Pastikan server dalam keadaan aktif\n`;

    notes +=
        `# - Untuk masalah koneksi, cek status server\n`;


    // ========================================================
    // 🏷️ CONFIG NAME
    // ========================================================

    if (configName) {

        notes +=
            `# - Nama: ${configName}\n`;
    }


    // ========================================================
    // 🕒 GENERATE TIMESTAMP
    // ========================================================

    notes +=
        `# - Generated on: ${timestamp}\n\n`;


    return notes;
}


// ============================================================
// 🔗 PARSE VMESS LINK
// ============================================================

function parseVMessLink(link) {

    try {

        console.log(
            '🔗 Parsing VMess link'
        );


        // ========================================================
        // 📦 EXTRACT BASE64 DATA
        // ========================================================

        const base64Data =
            link.split('://')[1];


        // ========================================================
        // 🔓 DECODE BASE64
        // ========================================================

        const decoded =
            Buffer
                .from(base64Data, 'base64')
                .toString();


        console.log(
            '📋 Decoded VMess:',
            decoded
        );


        // ========================================================
        // 📄 PARSE JSON
        // ========================================================

        const config =
            JSON.parse(decoded);


        console.log(
            '📋 VMess config parsed:',
            config
        );


        // ========================================================
        // 🔄 NORMALIZE VMESS CONFIGURATION
        // ========================================================

        const normalizedConfig = {

            id:
                config.id ||
                config.uuid ||
                config.userID ||
                "66ce30e3-4c14-42f6-b708-2f4dd60a161f",


            add:
                config.add ||
                config.address ||
                config.host ||
                config.server ||
                "server.example.com",


            port:
                parseInt(config.port) ||
                443,


            ps:
                config.ps ||
                config.remarks ||
                config.name ||
                "vmess-proxy",


            type:
                'vmess',


            aid:
                parseInt(config.aid) ||
                parseInt(config.alterId) ||
                0,


            cipher:
                config.cipher ||
                config.security ||
                "auto",


            tls:
                config.tls === "tls" ||
                config.security === "tls" ||
                false,


            sni:
                config.sni ||
                config.host ||
                (
                    config.add ||
                    "server.example.com"
                ),


            host:
                config.host ||
                config.add,


            net:
                config.net ||
                config.type ||
                "tcp",


            path:
                config.path ||
                "/",


            skipCertVerify:
                config.skipCertVerify !== undefined
                    ? config.skipCertVerify
                    : true,


            udp:
                config.udp !== undefined
                    ? config.udp
                    : true

        };


        // ========================================================
        // ✅ VMESS PARSING SUCCESS
        // ========================================================

        console.log(
            '✅ VMess config normalized:',
            normalizedConfig
        );


        return normalizedConfig;


    } catch (error) {

        // ========================================================
        // ❌ VMESS PARSING ERROR
        // ========================================================

        console.error(
            '❌ VMess parsing error:',
            error
        );


        throw new Error(
            'Format link VMess tidak valid: ' +
            error.message
        );

    }
}


// ============================================================
// 🔗 PARSE VLESS LINK
// ============================================================

function parseVLessLink(link) {

    try {

        console.log(
            '🔗 Parsing VLESS link:',
            link
        );


        // ========================================================
        // 🌐 PARSE URL
        // ========================================================

        const url =
            new URL(link);


        const params =
            new URLSearchParams(
                url.search
            );


        // ========================================================
        // 🔄 BUILD VLESS CONFIGURATION
        // ========================================================

        const config = {

            id:
                url.username ||
                "66ce30e3-4c14-42f6-b708-2f4dd60a161f",


            add:
                url.hostname ||
                "server.example.com",


            port:
                parseInt(url.port) ||
                443,


            type:
                'vless',


            ps:
                url.hash
                    ? decodeURIComponent(
                        url.hash.substring(1)
                    )
                    : 'vless-proxy',


            tls:
                params.get('security') === 'tls' ||
                params.get('encryption') === 'tls'
                    ? 'tls'
                    : 'none',


            sni:
                params.get('sni') ||
                params.get('host') ||
                url.hostname,


            host:
                params.get('host') ||
                params.get('sni') ||
                url.hostname,


            net:
                params.get('type') ||
                params.get('network') ||
                'tcp',


            path:
                params.get('path') ||
                '/',


            aid:
                0,


            cipher:
                'auto',


            udp:
                true,


            skipCertVerify:
                true,


            flow:
                params.get('flow') ||
                ''

        };


        // ========================================================
        // ✅ VLESS PARSING SUCCESS
        // ========================================================

        console.log(
            '✅ VLESS config parsed:',
            config
        );


        return config;


    } catch (error) {

        // ========================================================
        // ❌ VLESS PARSING ERROR
        // ========================================================

        console.error(
            '❌ VLESS parsing error:',
            error
        );


        throw new Error(
            'Format link VLESS tidak valid: ' +
            error.message
        );

    }
}


// ============================================================
// 🔗 PARSE TROJAN LINK
// ============================================================

function parseTrojanLink(link) {

    try {

        console.log(
            '🔗 Parsing Trojan link:',
            link
        );


        // ========================================================
        // 🌐 PARSE URL
        // ========================================================

        const url =
            new URL(link);


        const params =
            new URLSearchParams(
                url.search
            );


        // ========================================================
        // 📍 DECODE PATH
        // ========================================================

        let path =
            params.get('path') ||
            '/';


        try {

            path =
                decodeURIComponent(path);

        } catch (e) {

            // Jika decode gagal,
            // gunakan path asli

        }


        // ========================================================
        // 🔄 BUILD TROJAN CONFIGURATION
        // ========================================================

        const config = {

            password:
                url.username ||
                "password",


            server:
                url.hostname ||
                "server.example.com",


            port:
                parseInt(url.port) ||
                443,


            sni:
                params.get('sni') ||
                params.get('host') ||
                url.hostname,


            allowInsecure:
                params.get('allowInsecure') === '1' ||
                true,


            name:
                url.hash
                    ? decodeURIComponent(
                        url.hash.substring(1)
                    )
                    : 'trojan-proxy',


            type:
                'trojan',


            network:
                params.get('type') ||
                params.get('network') ||
                'tcp',


            path:
                path,


            host:
                params.get('host') ||
                params.get('sni') ||
                url.hostname,


            udp:
                true

        };


        // ========================================================
        // ✅ TROJAN PARSING SUCCESS
        // ========================================================

        console.log(
            '✅ Trojan config parsed:',
            config
        );


        return config;


    } catch (error) {

        // ========================================================
        // ❌ TROJAN PARSING ERROR
        // ========================================================

        console.error(
            '❌ Trojan parsing error:',
            error
        );


        throw new Error(
            'Format link Trojan tidak valid: ' +
            error.message
        );

    }
}
// ============================================================
// 🔍 DETECT CONFIGURATION TYPE
// ============================================================

function detectConfigType(link) {

    // ========================================================
    // ❌ VALIDATE LINK
    // ========================================================

    if (!link) {
        return null;
    }


    // ========================================================
    // ⚡ DETECT VMESS
    // ========================================================

    if (link.startsWith("vmess://")) {

        return {
            type: "vmess",
            config: parseVMessLink(link)
        };
    }


    // ========================================================
    // 🛡️ DETECT VLESS
    // ========================================================

    if (link.startsWith("vless://")) {

        return {
            type: "vless",
            config: parseVLessLink(link)
        };
    }


    // ========================================================
    // 🐎 DETECT TROJAN
    // ========================================================

    if (link.startsWith("trojan://")) {

        return {
            type: "trojan",
            config: parseTrojanLink(link)
        };
    }


    // ========================================================
    // ❌ UNSUPPORTED CONFIGURATION
    // ========================================================

    throw new Error(
        "Format config tidak didukung."
    );
}


// ============================================================
// 📝 GENERATE YAML FROM CONFIG LINK
// ============================================================

function generateYamlFromLink(link) {

    // ========================================================
    // 🔍 DETECT CONFIG TYPE
    // ========================================================

    const result =
        detectConfigType(link);


    // ========================================================
    // 🔀 GENERATE YAML BASED ON TYPE
    // ========================================================

    switch (result.type) {

        // ---------- VMESS ----------
        case "vmess":

        // ---------- VLESS ----------
        case "vless":

            return generateV2RayYaml(
                result.config
            );


        // ---------- TROJAN ----------
        case "trojan":

            return generateTrojanYaml(
                result.config
            );


        // ====================================================
        // ❌ UNKNOWN CONFIG TYPE
        // ====================================================

        default:

            throw new Error(
                "Tipe config tidak didukung."
            );
    }
}


// ============================================================
// 🧪 TEMPORARY TEST CONFIGURATION
// ============================================================

const testLink =
    "vmess://eyJhZGQiOiIxMDQuMTcuMy44MSIsImFpZCI6IjAiLCJzY3kiOiJhdXRvIiwiaG9zdCI6ImRvOC52aXB0dW5uZWwubmV0IiwiaWQiOiJiYTZlNTA0NS1mNzViLTQyYTYtYTk5ZS00YmE5Yjc3NmM0OGUiLCJuZXQiOiJ3cyIsInBhdGgiOiJcL3ZtZXNzIiwicG9ydCI6IjgwIiwicHMiOiJuZXdqdWx5IDAyIiwidGxzIjoibm9uZSIsInNuaSI6IiIsInR5cGUiOiJub25lIiwidiI6IjIifQ==";


// ============================================================
// 🧪 TEST DETECT CONFIG
// ============================================================

// console.log(
//     detectConfigType(testLink)
// );


// ============================================================
// 🧪 TEST GENERATE YAML
// ============================================================

const yaml =
    generateYamlFromLink(testLink);

console.log(yaml);


// ============================================================
// 💾 FORMAT BACKUP DATABASE NAME
// ============================================================

function formatBackupName() {

    // ========================================================
    // 🕒 GET CURRENT DATE & TIME
    // ========================================================

    const d =
        new Date();


    // ========================================================
    // 📅 DATE COMPONENTS
    // ========================================================

    const y =
        d.getFullYear();

    const m =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            d.getDate()
        ).padStart(2, "0");


    // ========================================================
    // ⏰ TIME COMPONENTS
    // ========================================================

    const h =
        String(
            d.getHours()
        ).padStart(2, "0");

    const min =
        String(
            d.getMinutes()
        ).padStart(2, "0");

    const s =
        String(
            d.getSeconds()
        ).padStart(2, "0");


    // ========================================================
    // 🏷️ GENERATE BACKUP FILE NAME
    // ========================================================

    return `sellvpn-${y}-${m}-${day}_${h}-${min}-${s}.db`;
}

// ============================================================
// 💾 CREATE DATABASE BACKUP
// ============================================================

async function createDatabaseBackup() {

    return new Promise((resolve, reject) => {

        // ========================================================
        // 🏷️ GENERATE BACKUP NAME
        // ========================================================

        const backupName =
            formatBackupName();


        // ========================================================
        // 📂 BACKUP FILE PATH
        // ========================================================

        const backupPath =
            path.join(
                BACKUP_DIR,
                backupName
            );


        // ========================================================
        // 📋 COPY DATABASE FILE
        // ========================================================

        fs.copyFile(
            FOLDER_TEMPATDB,
            backupPath,

            err => {

                // ==================================================
                // ❌ BACKUP ERROR
                // ==================================================

                if (err) {
                    return reject(err);
                }


                // ==================================================
                // ✅ BACKUP SUCCESS
                // ==================================================

                resolve({
                    name: backupName,
                    path: backupPath
                });

            }
        );

    });

}


// ============================================================
// 📤 SEND DATABASE BACKUP TO ADMIN
// ============================================================

async function sendBackupToAdmin(
    filePath,
    fileName
) {

    try {

        // ========================================================
        // 📤 SEND FILE TO TELEGRAM
        // ========================================================

        await bot.telegram.sendDocument(
            ADMIN,

            {
                source:
                    fs.createReadStream(
                        filePath
                    ),

                filename:
                    fileName
            },

            {
                caption:
`📦 <b>Backup Database Otomatis</b>

🗂 File :
<code>${fileName}</code>

✅ Backup berhasil dibuat.`,

                parse_mode: "HTML"
            }
        );


        // ========================================================
        // 📝 LOG SUCCESS
        // ========================================================

        logger.info(
            "Backup database berhasil dikirim ke Telegram."
        );


    } catch (err) {

        // ========================================================
        // ❌ LOG ERROR
        // ========================================================

        logger.error(
            "Gagal kirim backup : " +
            err.message
        );

    }

}


// ============================================================
// 🔐 REQUIRED JOIN GATE
// 📢 CHANNEL + 👥 GROUP
// ============================================================

const REQUIRED_CHANNEL =
    `@${CHANNEL_USERNAME}`;

const REQUIRED_GROUP =
    `@${GROUP_USERNAME}`;


// ============================================================
// 🔗 CHANNEL & GROUP LINK
// ============================================================

const channelLink =
    `https://t.me/${CHANNEL_USERNAME}`;

const groupLink =
    `https://t.me/${GROUP_USERNAME}`;


// ============================================================
// 🚪 SEND JOIN GATE
// ============================================================

async function sendJoinGate(ctx) {

    // ========================================================
    // 📝 JOIN GATE MESSAGE
    // ========================================================

    const gateText =
`🔔 *Selamat Datang Di ${NAMA_STORE} 🤗*

\`\`\`
Untuk menggunakan bot ini, Anda harus bergabung
dengan komunitas kami terlebih dahulu.
\`\`\`

📢 *Channel*: ${REQUIRED_CHANNEL}
👥 *Group*  : ${REQUIRED_GROUP}

Silakan gabung ke keduanya, lalu tekan tombol
"✅ Saya Sudah Bergabung" di bawah ini untuk lanjut.`;


try {

    // ====================================================
    // 📤 SEND JOIN GATE MESSAGE
    // ====================================================

    await ctx.reply(
        gateText,
        {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,

            reply_markup: {
                inline_keyboard: [

                    // ------------------------------------
                    // 📢 JOIN CHANNEL
                    // 🔵 BIRU
                    // ------------------------------------

                    [
                        {
                            text: '🔗 Gabung Channel kami',
                            url: channelLink,
                            style: 'primary'
                        }
                    ],

                    // ------------------------------------
                    // 👥 JOIN GROUP
                    // 🔵 BIRU
                    // ------------------------------------

                    [
                        {
                            text: '💬 Gabung Group kami',
                            url: groupLink,
                            style: 'primary'
                        }
                    ],

                    // ------------------------------------
                    // ✅ CONTINUE
                    // 🟢 HIJAU
                    // ------------------------------------

                    [
                        {
                            text: '✅ Saya Sudah Bergabung, Lanjutkan',
                            callback_data: 'continue_after_join',
                            style: 'success'
                        }
                    ]

                ]
            }
        }
    );

} catch (e) {

    // ====================================================
    // ❌ JOIN GATE ERROR
    // ====================================================

    logger.error(
        'Gagal mengirim Join Gate: ' +
        e.message
    );

}
}

// ============================================================
// 👥 CHECK CHANNEL & GROUP MEMBERSHIP
// ============================================================

async function checkMembership(ctx) {

    // ========================================================
    // 🆔 GET USER ID
    // ========================================================

    const userId =
        ctx.from?.id;

    if (!userId) {
        return false;
    }


    try {

        // ====================================================
        // 📢 CHECK CHANNEL MEMBERSHIP
        // ====================================================

        const ch =
            await ctx.telegram.getChatMember(
                REQUIRED_CHANNEL,
                userId
            );


        // ====================================================
        // 👥 CHECK GROUP MEMBERSHIP
        // ====================================================

        const gr =
            await ctx.telegram.getChatMember(
                REQUIRED_GROUP,
                userId
            );


        // ====================================================
        // 📝 LOG MEMBERSHIP STATUS
        // ====================================================

        logger.info(
            `Status channel user ${userId}: ${ch?.status}`
        );

        logger.info(
            `Status group user ${userId}: ${gr?.status}`
        );


        // ====================================================
        // ✅ VALID MEMBERSHIP STATUS
        // ====================================================

        const okStatus =
            new Set([
                'creator',
                'administrator',
                'member',
                'restricted'
            ]);


        // ====================================================
        // 🔍 CHECK BOTH MEMBERSHIPS
        // ====================================================

        return (
            okStatus.has(ch?.status) &&
            okStatus.has(gr?.status)
        );


    } catch (e) {

        // ====================================================
        // ⚠️ MEMBERSHIP CHECK ERROR
        // ====================================================

        logger.warn(
            'checkMembership warn: ' +
            e.message
        );

        return false;
    }
}


// ============================================================
// ♻️ RESTORE DATABASE BUTTON
// ============================================================

bot.action(
    "restore_database",
    async (ctx) => {

        // ====================================================
        // 🔐 CHECK ADMIN ACCESS
        // ====================================================

        if (!adminIds.includes(ctx.from.id)) {
            return ctx.answerCbQuery(
                "Ditolak!"
            );
        }


        // ====================================================
        // 📝 ENABLE RESTORE STATE
        // ====================================================

        restoreState[ctx.from.id] = true;


        // ====================================================
        // ✅ ANSWER CALLBACK
        // ====================================================

        await ctx.answerCbQuery();


        // ====================================================
        // 📤 REQUEST DATABASE FILE
        // ====================================================

        await ctx.reply(
`📤 Kirim file database (*.db)

Contoh:
sellvpn.db

Backup lama akan otomatis dibuat sebelum restore.`
        );

    }
);


// ============================================================
// 💾 BACKUP DATABASE BUTTON
// ============================================================

bot.action(
    "backup_database",
    async (ctx) => {

        // ====================================================
        // 🔐 CHECK ADMIN ACCESS
        // ====================================================

        if (!adminIds.includes(ctx.from.id)) {
            return ctx.answerCbQuery(
                "Ditolak!"
            );
        }


        // ====================================================
        // ⏳ CALLBACK STATUS
        // ====================================================

        await ctx.answerCbQuery(
            "Membuat Backup..."
        );


        try {

            // ==================================================
            // 💾 CREATE DATABASE BACKUP
            // ==================================================

            const backup =
                await createDatabaseBackup();


            // ==================================================
            // ✅ BACKUP CREATED
            // ==================================================

            await ctx.reply(
                "📦 Backup berhasil dibuat."
            );


            // ==================================================
            // 📤 SEND BACKUP FILE
            // ==================================================

            await ctx.replyWithDocument({

                source:
                    backup.path,

                filename:
                    backup.name

            });


        } catch (err) {

            // ==================================================
            // ❌ BACKUP ERROR
            // ==================================================

            await ctx.reply(
                "❌ Backup gagal."
            );


            logger.error(err);

        }

    }
);


// ============================================================
// ✅ CONTINUE AFTER JOIN
// ============================================================

bot.action(
    'continue_after_join',
    async (ctx) => {

        // ====================================================
        // ✅ ANSWER CALLBACK
        // ====================================================

        try {

            await ctx.answerCbQuery();

        } catch (e) {
            // Ignore callback error
        }


        // ====================================================
        // 👥 VERIFY MEMBERSHIP
        // ====================================================

        if (
            await checkMembership(ctx)
        ) {

            return sendMainMenu(ctx);
        }


        // ====================================================
        // 🚪 MEMBERSHIP NOT COMPLETE
        // ====================================================

        return sendJoinGate(ctx);

    }
);


// ============================================================
// 👑 ADMIN CONFIGURATION
// ============================================================

const adminIds =
    ADMIN;


// ============================================================
// 🤖 BOT INITIALIZED
// ============================================================

logger.info(
    'Bot initialized'
);


// ============================================================
// 🗄️ SQLITE DATABASE CONNECTION
// ============================================================

const db =
    new sqlite3.Database(
        './sellvpn.db',

        (err) => {

            // ==================================================
            // ❌ DATABASE CONNECTION ERROR
            // ==================================================

            if (err) {

                logger.error(
                    'Kesalahan koneksi SQLite3:',
                    err.message
                );

                return;
            }


            // ==================================================
            // ✅ DATABASE CONNECTED
            // ==================================================

            logger.info(
                '✅ Terhubung ke SQLite3'
            );


            // ==================================================
            // 🔄 SERIALIZE DATABASE OPERATIONS
            // ==================================================

            db.serialize(() => {


                // ==================================================
                // 🧩 ADD config_json COLUMN
                // ==================================================

                db.run(`
                    ALTER TABLE user_accounts
                    ADD COLUMN config_json TEXT
                `, (err) => {

                    // ==============================================
                    // ❌ ALTER TABLE ERROR
                    // ==============================================

                    if (err) {

                        if (
                            !err.message.includes(
                                "duplicate column name"
                            )
                        ) {

                            console.error(
                                "❌ Gagal menambah kolom config_json:",
                                err.message
                            );

                        } else {

                            console.log(
                                "ℹ️ Kolom config_json sudah ada."
                            );

                        }

                    }

                    // ==============================================
                    // ✅ COLUMN ADDED
                    // ==============================================

                    else {

                        console.log(
                            "✅ Kolom config_json berhasil ditambahkan."
                        );

                    }

                });


                // ==================================================
                // 💰 BONUS CONFIGURATION
                // ==================================================

                // Inisialisasi tabel bonus_config
          
// ============================================================
// 💰 BONUS CONFIGURATION TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS bonus_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        enabled INTEGER DEFAULT 0,
        min_topup INTEGER DEFAULT 0,
        bonus_percent INTEGER DEFAULT 0,
        start_at INTEGER DEFAULT 0,
        end_at INTEGER DEFAULT 0
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel bonus_config:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel bonus_config siap'
        );

    }

});


// ============================================================
// 💰 INSERT DEFAULT BONUS CONFIG
// ============================================================

db.run(`
    INSERT OR IGNORE INTO bonus_config (
        id,
        enabled,
        min_topup,
        bonus_percent
    )
    VALUES (
        1,
        0,
        0,
        0
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal insert default bonus_config:',
            err.message
        );

    } else {

        logger.info(
            '✅ Default bonus_config dijamin ada'
        );

    }

});


// ============================================================
// 📝 BONUS LOG TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS bonus_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        amount INTEGER,
        bonus INTEGER,
        timestamp TEXT
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel bonus_log:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel bonus_log siap'
        );

    }

});


// ============================================================
// 🔍 CHECK BONUS CONFIG COLUMNS
// ============================================================

db.all(
    "PRAGMA table_info(bonus_config)",
    (err, columns) => {

        if (err) {
            return logger.error(
                err.message
            );
        }


        // ====================================================
        // 🔎 CHECK start_at COLUMN
        // ====================================================

        const hasStart =
            columns.some(
                c => c.name === "start_at"
            );


        // ====================================================
        // 🔎 CHECK end_at COLUMN
        // ====================================================

        const hasEnd =
            columns.some(
                c => c.name === "end_at"
            );


        // ====================================================
        // ➕ ADD start_at IF MISSING
        // ====================================================

        if (!hasStart) {

            db.run(
                "ALTER TABLE bonus_config ADD COLUMN start_at INTEGER DEFAULT 0"
            );

        }


        // ====================================================
        // ➕ ADD end_at IF MISSING
        // ====================================================

        if (!hasEnd) {

            db.run(
                "ALTER TABLE bonus_config ADD COLUMN end_at INTEGER DEFAULT 0"
            );

        }

    }
);


// ============================================================
// 💳 PENDING DEPOSITS TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS pending_deposits (
        unique_code TEXT PRIMARY KEY,
        user_id INTEGER,
        username TEXT,
        amount INTEGER,
        original_amount INTEGER,
        timestamp INTEGER,
        status TEXT,
        qr_message_id INTEGER
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel pending_deposits:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel pending_deposits siap'
        );

    }

});


// ============================================================
// 🧾 LOG PENJUALAN TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS log_penjualan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        nama_server TEXT,
        tipe_akun TEXT,
        harga INTEGER,
        masa_aktif_hari INTEGER,
        waktu_transaksi TEXT,
        action_type TEXT,
        user_role TEXT DEFAULT 'member'
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel log_penjualan:',
            err.message
        );

        return;
    }


    // ========================================================
    // ✅ LOG PENJUALAN TABLE READY
    // ========================================================

    logger.info(
        '✅ Tabel log_penjualan siap'
    );


    // ========================================================
    // 🔍 CHECK LOG PENJUALAN COLUMNS
    // ========================================================

    db.all(
        "PRAGMA table_info(log_penjualan)",
        (err, columns) => {

            // ==================================================
            // ❌ PRAGMA ERROR
            // ==================================================

            if (err) {

                logger.error(
                    'Error getting table info for log_penjualan:',
                    err.message
                );

                return;
            }


            // ==================================================
            // 🔎 VALIDATE COLUMN RESULT
            // ==================================================

            if (
                columns &&
                Array.isArray(columns)
            ) {

                // ==============================================
                // 🔍 CHECK user_role COLUMN
                // ==============================================

                const hasUserRoleColumn =
                    columns.some(
                        col =>
                            col.name === 'user_role'
                    );


                // ==============================================
                // ➕ ADD user_role IF MISSING
                // ==============================================

                if (!hasUserRoleColumn) {

                    db.run(
                        "ALTER TABLE log_penjualan ADD COLUMN user_role TEXT DEFAULT 'member'",

                        (err) => {

                            if (err) {

                                logger.error(
                                    'Error adding user_role column to log_penjualan table:',
                                    err.message
                                );

                            } else {

                                logger.info(
                                    '✅ Added user_role column to log_penjualan table'
                                );

                            }

                        }
                    );

                }

            } else {

                // ==============================================
                // ⚠️ INVALID PRAGMA RESULT
                // ==============================================

                logger.warn(
                    'PRAGMA table_info(log_penjualan) did not return an array for columns.'
                );

            }

        }
    );

});

// ============================================================
// 🎁 UNLIMITED TRIAL USERS TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS unlimited_trial_users (
        user_id INTEGER PRIMARY KEY
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel unlimited_trial_users:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel unlimited_trial_users siap'
        );

    }

});


// ============================================================
// 🖥️ UI CONFIGURATION TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS ui_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        show_trial_button INTEGER DEFAULT 1,
        show_sewa_script_button INTEGER DEFAULT 1
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel ui_config:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel ui_config siap'
        );

    }

});


// ============================================================
// 🖥️ INSERT DEFAULT UI CONFIG
// ============================================================

db.run(`
    INSERT OR IGNORE INTO ui_config (
        id,
        show_trial_button,
        show_sewa_script_button
    )
    VALUES (
        1,
        1,
        1
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal insert default ui_config:',
            err.message
        );

    } else {

        logger.info(
            '✅ Default ui_config dijamin ada'
        );

    }

});


// ============================================================
// 🔍 CHECK UI CONFIG COLUMNS
// ============================================================

db.all(
    `PRAGMA table_info(ui_config)`,
    (err, columns) => {

        // ====================================================
        // ❌ PRAGMA ERROR
        // ====================================================

        if (err) {

            logger.error(
                '❌ Gagal ambil info kolom ui_config:',
                err.message
            );

            return;
        }


        // ====================================================
        // 🔍 CHECK show_sewa_script_button
        // ====================================================

        const hasSewaScriptColumn =
            columns.some(
                col =>
                    col.name ===
                    'show_sewa_script_button'
            );


        // ====================================================
        // ➕ ADD COLUMN IF MISSING
        // ====================================================

        if (!hasSewaScriptColumn) {

            db.run(
                `ALTER TABLE ui_config
                 ADD COLUMN show_sewa_script_button INTEGER DEFAULT 1`,

                (err) => {

                    if (err) {

                        logger.error(
                            '❌ Gagal menambah kolom show_sewa_script_button:',
                            err.message
                        );

                    } else {

                        logger.info(
                            '✅ Kolom show_sewa_script_button ditambahkan ke ui_config'
                        );

                    }

                }
            );

        } else {

            logger.info(
                'ℹ️ Kolom show_sewa_script_button sudah tersedia di ui_config'
            );

        }

    }
);


// ============================================================
// 💼 RESELLER CONFIGURATION TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS reseller_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        discount_percent INTEGER DEFAULT 0
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel reseller_config:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel reseller_config siap'
        );

    }

});


// ============================================================
// 💼 INSERT DEFAULT RESELLER CONFIG
// ============================================================

db.run(`
    INSERT OR IGNORE INTO reseller_config (
        id,
        discount_percent
    )
    VALUES (
        1,
        0
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal insert default reseller_config:',
            err.message
        );

    } else {

        logger.info(
            '✅ Default reseller_config dijamin ada'
        );

    }

});


// ============================================================
// 💰 TOPUP LOG TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS topup_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        amount INTEGER,
        method TEXT,
        waktu TEXT
    )
`, (err) => {

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel topup_log:',
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel topup_log siap'
        );

    }

});


// ============================================================
// 🖥️ SERVER TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS Server (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT,
        auth TEXT,
        harga INTEGER,
        nama_server TEXT,
        quota INTEGER,
        iplimit INTEGER,
        batas_create_akun INTEGER,
        total_create_akun INTEGER,
        cloudfront TEXT DEFAULT ''
    )
`, (err) => {

    // ========================================================
    // ❌ SERVER TABLE ERROR
    // ========================================================

    if (err) {

        logger.error(
            'Kesalahan membuat tabel Server:',
            err.message
        );

        return;
    }


    // ========================================================
    // ✅ SERVER TABLE READY
    // ========================================================

    logger.info(
        'Server table created or already exists'
    );


    // ========================================================
    // 🔍 CHECK SERVER TABLE COLUMNS
    // ========================================================

    db.all(
        "PRAGMA table_info(Server)",
        (err, columns) => {

            // ==================================================
            // ❌ PRAGMA ERROR
            // ==================================================

            if (err) {

                logger.error(
                    'Gagal cek struktur tabel Server: ' +
                    err.message
                );

                return;
            }


            // ==================================================
            // 🔍 CHECK CLOUDFRONT COLUMN
            // ==================================================

            const hasCloudfront =
                columns.some(
                    col =>
                        col.name === 'cloudfront'
                );


            // ==================================================
            // ➕ ADD CLOUDFRONT IF MISSING
            // ==================================================

            if (!hasCloudfront) {

                db.run(
                    "ALTER TABLE Server ADD COLUMN cloudfront TEXT DEFAULT ''",

                    (err) => {

                        if (err) {

                            logger.error(
                                "❌ Gagal menambah kolom cloudfront: " +
                                err.message
                            );

                        } else {

                            logger.info(
                                "✅ Kolom cloudfront berhasil ditambahkan."
                            );

                        }

                    }
                );

            } else {

                logger.info(
                    "ℹ️ Kolom cloudfront sudah tersedia."
                );

            }

        }
    );

});


// ============================================================
// 👤 USERS TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        saldo INTEGER DEFAULT 0,
        role TEXT DEFAULT 'member',
        CONSTRAINT unique_user_id UNIQUE (user_id)
    )
`, (err) => {

    // ========================================================
    // ❌ USERS TABLE ERROR
    // ========================================================

    if (err) {

        logger.error(
            'Kesalahan membuat tabel users:',
            err.message
        );

        return;
    }


    // ========================================================
    // ✅ USERS TABLE READY
    // ========================================================

    logger.info(
        'Users table created or already exists'
    );


    // ========================================================
    // 🔍 CHECK USERS TABLE COLUMNS
    // ========================================================

    db.all(
        "PRAGMA table_info(users)",
        (err, columns) => {

            // ==================================================
            // ❌ PRAGMA ERROR
            // ==================================================

            if (err) {

                logger.error(
                    'Error getting table info:',
                    err.message
                );

                return;
            }


            // ==================================================
            // 🔎 VALIDATE PRAGMA RESULT
            // ==================================================

            if (
                columns &&
                Array.isArray(columns)
            ) {

                // ==============================================
                // 🔍 CHECK ROLE COLUMN
                // ==============================================

                const hasRoleColumn =
                    columns.some(
                        col =>
                            col.name === 'role'
                    );


                // ==============================================
                // ➕ ADD ROLE COLUMN IF MISSING
                // ==============================================

                if (!hasRoleColumn) {

                    db.run(
                        "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member'",

                        (err) => {

                            if (err) {

                                logger.error(
                                    'Error adding role column to users table:',
                                    err.message
                                );

                            } else {

                                logger.info(
                                    '✅ Added role column to users table'
                                );

                            }

                        }
                    );

                }

            } else {

                // ==============================================
                // ⚠️ INVALID PRAGMA RESULT
                // ==============================================

                logger.warn(
                    'PRAGMA table_info(users) did not return an array for columns.'
                );

            }

        }
    );

});


// ============================================================
// 🧪 TRIAL LOG TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS TrialLog (
        user_id INTEGER,
        date TEXT,
        count INTEGER DEFAULT 0,
        UNIQUE(user_id, date)
    )
`);


// ============================================================
// 🔚 END DATABASE SERIALIZE
// ============================================================

}); // End of db.serialize


// ============================================================
// 🔚 END SQLITE CONNECTION
// ============================================================

});


// ============================================================
// 👤 USER ACCOUNTS TABLE
// ============================================================

db.run(`
    CREATE TABLE IF NOT EXISTS user_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        server_id INTEGER,
        server_name TEXT,
        account_type TEXT,
        exp_days INTEGER DEFAULT 0,
        expired_at TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_notified_h1 INTEGER DEFAULT 0,
        last_notified_expired INTEGER DEFAULT 0,
        UNIQUE(username, server_id, account_type)
    )
`, (err) => {

    // ========================================================
    // ❌ USER ACCOUNTS TABLE ERROR
    // ========================================================

    if (err) {

        logger.error(
            '❌ Gagal membuat tabel user_accounts: ' +
            err.message
        );

    } else {

        logger.info(
            '✅ Tabel user_accounts siap'
        );

    }

});


// ============================================================
// 🧠 USER STATE MANAGEMENT
// ============================================================

const lastMenus = {};
const userState = {};

logger.info(
    'User state initialized'
);


// ============================================================
// 🤖 HANDLER /START & /MENU
// 🔐 DENGAN GATE WAJIB JOIN
// ============================================================

bot.command(
    ['start', 'menu'],
    async (ctx) => {

        // ====================================================
        // 📥 COMMAND RECEIVED
        // ====================================================

        logger.info(
            '📥 Perintah /start atau /menu diterima'
        );


        // ====================================================
        // 🆔 GET USER & CHAT ID
        // ====================================================

        const userId =
            ctx.from.id;

        const chatId =
            ctx.chat.id;


        // ====================================================
        // 🧹 DELETE USER COMMAND MESSAGE
        // ====================================================

        try {

            await ctx.telegram.deleteMessage(
                chatId,
                ctx.message.message_id
            );

        } catch (e) {

            // Ignore delete message error

        }


        // ====================================================
        // 👥 CHECK CHANNEL & GROUP MEMBERSHIP
        // ====================================================

        const joined =
            await checkMembership(ctx);


        // ====================================================
        // 🚪 USER BELUM JOIN
        // ====================================================

        if (!joined) {

            return sendJoinGate(ctx);

        }


        // ====================================================
        // 👤 REGISTER / CHECK USER DATABASE
        // ====================================================

        await new Promise(
            (resolve) => {

                db.get(
                    'SELECT * FROM users WHERE user_id = ?',

                    [userId],

                    (err, row) => {

                        // ==========================================
                        // ❌ DATABASE ERROR
                        // ==========================================

                        if (err) {

                            logger.error(
                                '❌ Kesalahan saat memeriksa user_id:',
                                err.message
                            );

                            resolve();

                            return;
                        }


                        // ==========================================
                        // 🆕 USER BELUM TERDAFTAR
                        // ==========================================

                        if (!row) {

                            db.run(
                                'INSERT INTO users (user_id, role) VALUES (?, ?)',

                                [
                                    userId,
                                    'member'
                                ],

                                (err) => {

                                    if (err) {

                                        logger.error(
                                            '❌ Gagal menyimpan user_id:',
                                            err.message
                                        );

                                    } else {

                                        logger.info(
                                            `✅ User ID ${userId} berhasil disimpan`
                                        );

                                    }

                                    resolve();

                                }
                            );

                        }


                        // ==========================================
                        // 👤 USER SUDAH TERDAFTAR
                        // ==========================================

                        else {

                            logger.info(
                                `ℹ️ User ID ${userId} sudah ada`
                            );

                            resolve();

                        }

                    }
                );

            }
        );


        // ====================================================
        // 🏠 SEND MAIN MENU
        // ====================================================

        await sendMainMenu(ctx);

    }
);


// ============================================================
// 🔚 END /START & /MENU HANDLER
// ============================================================


// =======================
// Handler /admin
// =======================
bot.command('admin', async (ctx) => {
  logger.info('Admin menu requested');

  if (!adminIds.includes(ctx.from.id)) {
    try { await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id); } catch (e) {}
    return ctx.reply('❌ Anda tidak memiliki izin untuk mengakses menu admin.');
  }

  try { await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id); } catch (e) {}

  if (lastMenus[ctx.from.id]) {
    try { await ctx.telegram.deleteMessage(ctx.chat.id, lastMenus[ctx.from.id]); } catch (e) {}
    delete lastMenus[ctx.from.id];
  }

  const sent = await sendAdminMenu(ctx);
  if (sent?.message_id) {
    lastMenus[ctx.from.id] = sent.message_id;
  }
});


// =======================
// Fungsi sendMainMenu
// =======================
// =======================
// Fungsi sendMainMenu (FIX userId undefined + gambar lebih stabil)
// =======================
async function sendMainMenu(ctx) {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!userId || !chatId) {
    logger.warn('⚠️ sendMainMenu gagal: userId/chatId tidak valid');
    return null;
  }

  // helper kirim menu baru (gambar -> fallback teks)
  const sendNewMenu = async (messageText, inlineKeyboard) => {
    try {
      // hapus menu lama jika ada
      if (lastMenus[userId]) {
        try {
          await ctx.telegram.deleteMessage(chatId, lastMenus[userId]);
          logger.info(`🧹 Menu lama user ${userId} dihapus`);
        } catch (e) {
          if (!String(e.message).includes('message to delete not found')) {
            logger.warn(`⚠️ Gagal hapus menu lama user ${userId}: ${e.message}`);
          }
        }
        delete lastMenus[userId];
      }

      // ambil gambar dulu sebagai buffer biar lebih aman
      let sentMessage;
      try {
        const response = await axios.get(GAMBAR_MENU, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

        const imageBuffer = Buffer.from(response.data);

        sentMessage = await ctx.replyWithPhoto(
          { source: imageBuffer, filename: 'menu.jpg' },
          {
            caption: messageText,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
          }
        );
      } catch (imgErr) {
        logger.warn(`⚠️ Gagal ambil/kirim gambar langsung, fallback ke URL: ${imgErr.message}`);

        sentMessage = await ctx.replyWithPhoto(
          GAMBAR_MENU,
          {
            caption: messageText,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: inlineKeyboard }
          }
        );
      }

      lastMenus[userId] = sentMessage.message_id;
      logger.info(`✅ Menu utama dengan gambar dikirim untuk user ${userId}`);
      return sentMessage;

    } catch (e) {
      logger.error(`❌ Gagal kirim menu gambar user ${userId}: ${e.message}`);

      try {
        const fallback = await ctx.reply(messageText, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: { inline_keyboard: inlineKeyboard }
        });

        lastMenus[userId] = fallback.message_id;
        logger.info(`✅ Fallback menu teks berhasil dikirim untuk user ${userId}`);
        return fallback;
      } catch (err) {
        logger.error(`❌ Fallback menu teks juga gagal untuk user ${userId}: ${err.message}`);
        return null;
      }
    }
  };

  try {
    // Bersihkan state user
    delete userState[chatId];
    if (global.depositState?.[userId]) {
      delete global.depositState[userId];
    }

    // Ambil data user
    const userName = ctx.from.username
      ? `@${ctx.from.username}`
      : (ctx.from.first_name || 'Member');

    let saldo = 0;
    let userRole = 'member';

    try {
      const row = await new Promise((resolve, reject) => {
        db.get(
          'SELECT saldo, role FROM users WHERE user_id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      saldo = row?.saldo || 0;
      userRole = row?.role || 'member';
    } catch (e) {
      logger.error(`❌ Error fetching user data ${userId}: ${e.message}`);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let userToday = 0, userWeek = 0, userMonth = 0;
    let globalToday = 0, globalWeek = 0, globalMonth = 0;

    try {
      [userToday, userWeek, userMonth] = await Promise.all([
        new Promise((resolve) => {
          db.get(
            `SELECT COUNT(*) as count
             FROM log_penjualan
             WHERE user_id = ?
             AND waktu_transaksi >= ?
             AND action_type IN ("create","renew")`,
            [userId, todayStart],
            (err, row) => resolve(row?.count || 0)
          );
        }),
        new Promise((resolve) => {
          db.get(
            `SELECT COUNT(*) as count
             FROM log_penjualan
             WHERE user_id = ?
             AND waktu_transaksi >= ?
             AND action_type IN ("create","renew")`,
            [userId, weekStart],
            (err, row) => resolve(row?.count || 0)
          );
        }),
        new Promise((resolve) => {
          db.get(
            `SELECT COUNT(*) as count
             FROM log_penjualan
             WHERE user_id = ?
             AND waktu_transaksi >= ?
             AND action_type IN ("create","renew")`,
            [userId, monthStart],
            (err, row) => resolve(row?.count || 0)
          );
        })
      ]);

      [globalToday, globalWeek, globalMonth] = await Promise.all([
        new Promise((resolve) => {
          db.get(
            `SELECT COUNT(*) as count
             FROM log_penjualan
             WHERE waktu_transaksi >= ?
             AND action_type IN ("create","renew")`,
            [todayStart],
            (err, row) => resolve(row?.count || 0)
          );
        }),
        new Promise((resolve) => {
          db.get(
            `SELECT COUNT(*) as count
             FROM log_penjualan
             WHERE waktu_transaksi >= ?
             AND action_type IN ("create","renew")`,
            [weekStart],
            (err, row) => resolve(row?.count || 0)
          );
        }),
        new Promise((resolve) => {
          db.get(
            `SELECT COUNT(*) as count
             FROM log_penjualan
             WHERE waktu_transaksi >= ?
             AND action_type IN ("create","renew")`,
            [monthStart],
            (err, row) => resolve(row?.count || 0)
          );
        })
      ]);
    } catch (e) {
      logger.error(`❌ Error fetching statistics ${userId}: ${e.message}`);
    }

    let jumlahPengguna = 0;
    let jumlahServer = 0;

    try {
      const [userCount, serverCount] = await Promise.all([
        new Promise((resolve) => {
          db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
            if (err) resolve(0);
            else resolve(row?.count || 0);
          });
        }),
        new Promise((resolve) => {
          db.get('SELECT COUNT(*) AS count FROM Server', (err, row) => {
            if (err) resolve(0);
            else resolve(row?.count || 0);
          });
        })
      ]);

      jumlahPengguna = userCount;
      jumlahServer = serverCount;
    } catch (e) {
      logger.error(`❌ Gagal ambil data jumlah user/server: ${e.message}`);
    }

    const [tombolTrialAktif, tombolSewaScriptAktif, isUnlimited] = await Promise.all([
      new Promise((resolve) => {
        db.get('SELECT show_trial_button FROM ui_config WHERE id = 1', (err, row) => {
          if (err) resolve(false);
          else resolve(row?.show_trial_button === 1);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT show_sewa_script_button FROM ui_config WHERE id = 1', (err, row) => {
          if (err) resolve(false);
          else resolve(row?.show_sewa_script_button === 1);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT * FROM unlimited_trial_users WHERE user_id = ?', [userId], (err, row) => {
          if (err) resolve(false);
          else resolve(row != null);
        });
      })
    ]);

    const isAdmin = adminIds.includes(userId);
    const bolehLihatTrial = tombolTrialAktif || isUnlimited || isAdmin;

    let adminUsername = 'Admin';
    try {
      const adminChat = await bot.telegram.getChat(ADMIN);
      if (adminChat.username) {
        adminUsername = adminChat.username;
      }
    } catch (e) {
      logger.warn(`⚠️ Gagal mengambil username admin: ${e.message}`);
    }

    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = dayNames[now.getDay()];
    const currentDate = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(now);
    const timeNow = now.toTimeString().split(' ')[0];

    let statusText = '';
    if (isAdmin) statusText = `👑 <b>ꜱᴛᴀᴛᴜꜱ:</b> <code>Admin</code>`;
    else if (userRole === 'reseller') statusText = `🏆 <b>ꜱᴛᴀᴛᴜꜱ:</b> <code>Reseller</code>`;
    else statusText = `👤 <b>ꜱᴛᴀᴛᴜꜱ:</b> <code>Member</code>`;

    const messageText = `
<blockquote>ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ <b>${NAMA_STORE}</b> 💎
ɴɪᴋᴍᴀᴛɪ ᴘᴇɴɢᴀʟᴀᴍᴀɴ ᴍᴇᴍʙᴇʟɪ ᴀᴋᴜɴ ᴠᴘɴ ᴛᴇʀᴄᴇᴘᴀᴛ, ᴀᴍᴀɴ, ᴅᴀɴ ᴀᴜᴛᴏᴍᴀᴛɪꜱ 🚀</blockquote>

🧭 <b>ɪɴꜰᴏʀᴍᴀꜱɪ ᴀᴋᴜɴ</b>
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 💰 <b>ꜱᴀʟᴅᴏ:</b> <code>Rp.${saldo.toLocaleString('id-ID')}</code>
┃ ${statusText}
┃ 🌐 <b>ᴜꜱᴇʀɴᴀᴍᴇ:</b> ${userName}
┃ 🆔 <b>ɪᴅ ᴘᴇɴɢɢᴜɴᴀ:</b> <code>${userId}</code>
┗━━━━━━━━━━━━━━━━━━━━━┛

🕒 <b>ᴡᴀᴋᴛᴜ & ꜱᴇʀᴠᴇʀ</b>
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 🧭 ᴡᴀᴋᴛᴜ: <code>${timeNow} WIB</code>
┃ 📅 ᴛᴀɴɢɢᴀʟ: <code>${currentDay}, ${currentDate}</code>
┃ 🖥️ ꜱᴇʀᴠᴇʀ: <code>${jumlahServer}</code> | 👥 ᴜꜱᴇʀ: <code>${jumlahPengguna}</code>
┃ ⏱️ <b>ʙᴏᴛ ᴀᴋᴛɪꜰ:</b> <code>${uptimeFormatted}</code>
┗━━━━━━━━━━━━━━━━━━━━━┛

☎️ <b>ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ</b>
<a href="https://t.me/${adminUsername}">╰📨 @${adminUsername}</a>

📦━━━━━━━━━━━━━━━━━━━━━📦
     <code>🌐 ᴅɪᴋᴇʟᴏʟᴀ ᴏʟᴇʜ ${NAMA_STORE} ɴᴇᴛᴡᴏʀᴋ</code>
📦━━━━━━━━━━━━━━━━━━━━━📦
`;

    const finalKeyboard = [];

if (bolehLihatTrial) {
  finalKeyboard.push([
    {
      text: '🌐 Menu VPN',
      callback_data: 'menu_vpn',
      style: 'success'
    }
  ]);
}

if (tombolSewaScriptAktif) {
  finalKeyboard.push([
    {
      text: '🛒 Sewa Script',
      callback_data: 'service_sewascript',
      style: 'primary'
    }
  ]);
}

finalKeyboard.push([
  {
    text: '📜 Riwayat Transaksi',
    callback_data: 'menu_riwayat_transaksi',
    style: 'primary'
  },
  {
    text: '📊 Cek Statistik',
    callback_data: 'menu_statistik',
    style: 'primary'
  }
]);

finalKeyboard.push([
  {
    text: '💰 TopUp Saldo',
    callback_data: 'menu_topup',
    style: 'success'
  }
]);

    let sentMessage = null;

    if (ctx.updateType === 'callback_query' && ctx.callbackQuery?.message?.message_id) {
      try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id).catch(() => {});
      } catch (e) {}
    }

    sentMessage = await sendNewMenu(messageText, finalKeyboard);

    if (sentMessage?.message_id) {
      lastMenus[userId] = sentMessage.message_id;
      return sentMessage;
    }

    logger.warn(`⚠️ sendMainMenu tidak mengembalikan message_id untuk user ${userId}`);
    return null;

  } catch (error) {
    logger.error(`❌ Error fatal di sendMainMenu untuk user ${userId}: ${error.message}`);
    try {
      return await ctx.reply('⚠️ Gagal menampilkan menu utama, coba /menu.');
    } catch (e) {
      logger.error(`❌ Gagal kirim fallback untuk user ${userId}: ${e.message}`);
      return null;
    }
  }
}
/// menu vpn
bot.action('menu_vpn', async (ctx) => {
  try {
    await ctx.answerCbQuery().catch(() => {});

    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    const text = `
<blockquote><b>🌐 MENU VPN PREMIUM</b>
<code>Pilih kategori layanan VPN yang ingin kamu akses</code></blockquote>

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 💠 <b>Trial Akun</b>
┃ <code>Cocok untuk tes server & performa</code>
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ ✏️ <b>Create Akun</b>
┃ <code>Buat akun baru sesuai layanan</code>
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ ♻️ <b>Renew Akun</b>
┃ <code>Perpanjang masa aktif akun VPN</code>
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 📡 <b>Akun Saya</b>
┃ <code>Melihat data akun VPN saya</code>
┗━━━━━━━━━━━━━━━━━━━━━┛

📌 <b>Petunjuk:</b>
<code>Silakan pilih salah satu menu di bawah ini untuk lanjut.</code>
`;

if (ctx.callbackQuery?.message?.message_id) {
  const msg = ctx.callbackQuery.message;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '💠 Trial Akun',
          callback_data: 'menu_trial',
          style: 'success'
        }
      ],
      [
        {
          text: '✏️ Buat Akun',
          callback_data: 'menu_create',
          style: 'primary'
        },
        {
          text: '♻️ Renew Akun',
          callback_data: 'menu_renew',
          style: 'primary'
        }
      ],
      [
        {
          text: '📡 Akun Saya',
          callback_data: 'menu_akun_saya',
          style: 'success'
        }
      ],
      [
        {
          text: '🔙 Kembali ke Menu Utama',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  };

  if (msg.photo) {
    return await ctx.editMessageCaption(text, {
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
  }

  return await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

await ctx.reply(text, {
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '💠 Trial Akun',
          callback_data: 'menu_trial',
          style: 'primary'
        }
      ],
      [
        {
          text: '✏️ Buat Akun',
          callback_data: 'menu_create',
          style: 'primary'
        },
        {
          text: '♻️ Renew Akun',
          callback_data: 'menu_renew',
          style: 'success'
        }
      ],
      [
        {
          text: '📡 Akun Saya',
          callback_data: 'menu_akun_saya',
          style: 'success'
        }
      ],
      [
        {
          text: '🔙 Kembali ke Menu Utama',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  }
});
} catch (err) {
  logger.error(`❌ Gagal membuka Menu VPN: ${err.message}`);
  await ctx.reply('❌ Gagal membuka Menu VPN.');
}
});
//menu akun saya
bot.action("menu_akun_saya", async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    tampilkanAkun(ctx, 1);
});
bot.action(/^akun_page_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery().catch(() => {});
    tampilkanAkun(ctx, Number(ctx.match[1]));
});
async function tampilkanAkun(ctx, page = 1) {
    const userId = ctx.from.id;
    const perPage = 10;

    db.all(`
        SELECT id, username, server_name, account_type
        FROM user_accounts
        WHERE user_id = ?
        ORDER BY datetime(expired_at) ASC
    `, [userId], async (err, rows) => {

        if (err) return ctx.reply("❌ Gagal mengambil akun.");

        if (!rows.length) {
            return ctx.reply("📡 Belum ada akun.");
        }

        const icons = {
            ssh: "🔐",
            vmess: "⚡",
            vless: "🛡",
            trojan: "🐎",
            shadowsocks: "🌑"
        };

        const totalPage = Math.ceil(rows.length / perPage);

        if (page < 1) page = 1;
        if (page > totalPage) page = totalPage;

        const start = (page - 1) * perPage;
        const data = rows.slice(start, start + perPage);

        // ======================
        // GROUP BERDASARKAN TYPE
        // ======================
        const grouped = {};

        data.forEach(acc => {
            const type = acc.account_type.toLowerCase();

            if (!grouped[type]) grouped[type] = [];

            grouped[type].push(acc);
        });

        // ======================
        // TEXT
        // ======================
        let text = "";
        text += `📡 <b>DAFTAR AKUN SAYA</b>\n`;
        text += `━━━━━━━━━━━━━━━━━━\n`;
        text += `📄 Halaman : <b>${page}/${totalPage}</b>\n`;
        text += `📦 Total Akun : <b>${rows.length}</b>\n\n`;

        Object.keys(grouped).forEach(type => {

            const list = grouped[type];
            const icon = icons[type] || "📦";

            text += `${icon} <b>${type.toUpperCase()}</b> <i>(${list.length})</i>\n`;

            list.forEach((acc, index) => {

                const line = index === list.length - 1 ? "└" : "├";

                text += `${line} 👤 <code>${acc.username}</code>\n`;
                text += `  🌐 <code>${acc.server_name}</code>\n`;

            });

            text += `\n`;
        });

        // ======================
        // KEYBOARD
        // ======================
        const keyboard = [];

        Object.keys(grouped).forEach(type => {

            grouped[type].forEach(acc => {

                keyboard.push([
                    {
                        text: `${icons[type] || "📦"} ${acc.username}`,
                        callback_data: `akun_detail_${acc.id}`,
                        style: "primary"
                    }
                ]);

            });

        });

        // ======================
        // NAVIGATION
        // ======================
        const nav = [];

        if (page > 1) {
            nav.push({
                text: "⬅️ Sebelumnya",
                callback_data: `akun_page_${page - 1}`,
                style: "primary"
            });
        }

        nav.push({
            text: `📄 ${page}/${totalPage}`,
            callback_data: "noop",
            style: "primary"
        });

        if (page < totalPage) {
            nav.push({
                text: "➡️ Berikutnya",
                callback_data: `akun_page_${page + 1}`,
                style: "primary"
            });
        }

        keyboard.push(nav);

        // ======================
        // BACK
        // ======================
        keyboard.push([
            {
                text: "🔙 Kembali",
                callback_data: "send_main_menu",
                style: "danger"
            }
        ]);

        try {
            await ctx.editMessageText(text, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        } catch {
            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });
        }

    });
}
bot.action(/^akun_detail_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});

  const accountId = Number(ctx.match[1]);
  const userId = ctx.from.id;

  db.get(`
    SELECT *
    FROM user_accounts
    WHERE id = ? AND user_id = ?
  `, [accountId, userId], async (err, account) => {

    if (err) {
      logger.error(err.message);
      return ctx.reply("❌ Gagal mengambil detail akun.");
    }

    if (!account) {
      return ctx.reply("❌ Akun tidak ditemukan.");
    }

    let data = {};

    try {
      data = JSON.parse(account.config_json || "{}");
    } catch (e) {
      logger.error("Config JSON rusak: " + e.message);
      return ctx.reply("❌ Data akun rusak.");
    }
     // AMBIL DATA SERVER
    db.get(
      "SELECT * FROM Server WHERE id = ?",
      [account.server_id],
      (err, server) => {

        if (err || !server) {
          return ctx.reply("❌ Server tidak ditemukan.");
        }
        

    switch (String(account.account_type).toLowerCase()) {

case "ssh": {

    const sshData = data;
    const cloudfront = server.cloudfront || "-";

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
      🚀 *ꜱꜱʜ ᴀᴄᴄᴏᴜɴᴛ*
╰━━━━━━━━━━━━━━━━━━━━━━╯

┌〔 📄 *ᴀᴄᴄᴏᴜɴᴛ ɪɴꜰᴏ* 〕
├ 👤 ᴜꜱᴇʀɴᴀᴍᴇ : \`${sshData.username}\`
├ 🔑 ᴘᴀꜱꜱᴡᴏʀᴅ : \`${sshData.password}\`
├ 📅 ᴇxᴘɪʀᴇᴅ  : \`${sshData.expired || account.expired_at}\`
├ 🌐 ɪᴘ ʟɪᴍɪᴛ : \`${sshData.ip_limit}\`
└ 🟢 ꜱᴛᴀᴛᴜꜱ   : \`${account.status.toUpperCase()}\`

━━━━━━━━━━━━━━━━━━━━━━

┌〔 🌍 *ꜱᴇʀᴠᴇʀ* 〕
├ 🌐 ᴅᴏᴍᴀɪɴ      : \`${sshData.domain}\`
├ ☁️ ᴄʟᴏᴜᴅꜰʀᴏɴᴛ  : \`${server.cloudfront || "-"}\`
├ 🌍 ɴᴀᴍᴇꜱᴇʀᴠᴇʀ  : \`${sshData.ns_domain}\`
└ 🔑 ᴘᴜʙ ᴋᴇʏ     : \`${sshData.pubkey}\`

━━━━━━━━━━━━━━━━━━━━━━

┌〔 🔌 *ᴘᴏʀᴛ* 〕
├ 🔐 ᴛʟꜱ        : \`443,8443\`
├ 🌐 ʜᴛᴛᴘ       : \`80,8080,2086,8880\`
├ ⚡ ᴏᴘᴇɴꜱꜱʜ    : \`22\`
├ 🚀 ᴜᴅᴘꜱꜱʜ      : \`1-65535\`
├ 🌍 ᴅɴꜱ        : \`53,2222\`
├ 📡 ᴅʀᴏᴘʙᴇᴀʀ   : \`109,110\`
└ 🎮 ʙᴀᴅᴠᴘɴ      : \`7300\`

━━━━━━━━━━━━━━━━━━━━━━

📡 *ʜᴛᴛᴘ ᴄᴜꜱᴛᴏᴍ*

\`${sshData.domain}:80@${sshData.username}:${sshData.password}\`

━━━━━━━━━━━━━━━━━━━━━━

📄 *ᴘᴀʏʟᴏᴀᴅ*

\`GET /cdn-cgi/trace HTTP/1.1[crlf]Host: Bug_Kalian[crlf][crlf]GET-RAY / HTTP/1.1[crlf]Host: [host][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]\`

━━━━━━━━━━━━━━━━━━━━━━

💾 *ꜱᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ*

https://${sshData.domain}:81/ssh-${sshData.username}.txt
`;

    return ctx.reply(msg, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔙 Kembali",
                        callback_data: "menu_akun_saya"
                    }
                ]
            ]
        }
    });
}

case "vmess": {

    const vmessData = data;
    const cloudfront = server.cloudfront || "-";

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
     🚀 *ᴠᴍᴇꜱꜱ ᴀᴄᴄᴏᴜɴᴛ*
╰━━━━━━━━━━━━━━━━━━━━━━╯

┌〔 📄 *ᴀᴄᴄᴏᴜɴᴛ ɪɴꜰᴏ* 〕
├ 👤 ᴜꜱᴇʀɴᴀᴍᴇ : \`${vmessData.username}\`
├ 🆔 ᴜᴜɪᴅ      : \`${vmessData.uuid}\`
├ 📅 ᴇxᴘɪʀᴇᴅ   : \`${vmessData.expired || account.expired_at}\`
├ 📦 Qᴜᴏᴛᴀ     : \`${vmessData.quota === '0 GB' ? 'Unlimited' : vmessData.quota}\`
├ 🌐 ɪᴘ ʟɪᴍɪᴛ  : \`${vmessData.ip_limit === '0' ? 'Unlimited' : vmessData.ip_limit} IP\`
└ 🟢 ꜱᴛᴀᴛᴜꜱ    : \`${account.status.toUpperCase()}\`

━━━━━━━━━━━━━━━━━━━━━━

┌〔 🌍 *ꜱᴇʀᴠᴇʀ* 〕
├ 🌐 ᴅᴏᴍᴀɪɴ      : \`${vmessData.domain}\`
├ ☁️ ᴄʟᴏᴜᴅꜰʀᴏɴᴛ  : \`${server.cloudfront || "-"}\`
├ 🔐 ᴛʟꜱ ᴘᴏʀᴛ    : \`443,8443\`
├ 🌍 ʜᴛᴛᴘ ᴘᴏʀᴛ   : \`80,8080,2086,8880\`
├ 🔒 ꜱᴇᴄᴜʀɪᴛʏ    : \`Auto\`
├ 📂 ᴘᴀᴛʜ        : \`/vmess\`
└ 🚀 ɢʀᴘᴄ ᴘᴀᴛʜ   : \`vmess-grpc\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ᴛʟꜱ*

\`\`\`
${vmessData.vmess_tls_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ʜᴛᴛᴘ*

\`\`\`
${vmessData.vmess_nontls_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ɢʀᴘᴄ*

\`\`\`
${vmessData.vmess_grpc_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

💾 *ꜱᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ*

https://${vmessData.domain}:81/vmess-${vmessData.username}.txt
`;

    return ctx.reply(msg, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔙 Kembali",
                        callback_data: "menu_akun_saya"
                    }
                ]
            ]
        }
    });

}



case "vless": {

    const vlessData = data;
    const cloudfront = server.cloudfront || "-";

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
      🛡 *ᴠʟᴇꜱꜱ ᴀᴄᴄᴏᴜɴᴛ*
╰━━━━━━━━━━━━━━━━━━━━━━╯

┌〔 📄 *ᴀᴄᴄᴏᴜɴᴛ ɪɴꜰᴏ* 〕
├ 👤 ᴜꜱᴇʀɴᴀᴍᴇ : \`${vlessData.username}\`
├ 🆔 ᴜᴜɪᴅ      : \`${vlessData.uuid}\`
├ 📅 ᴇxᴘɪʀᴇᴅ   : \`${vlessData.expired || account.expired_at}\`
├ 📦 Qᴜᴏᴛᴀ     : \`${vlessData.quota === '0 GB' ? 'Unlimited' : vlessData.quota}\`
├ 🌐 ɪᴘ ʟɪᴍɪᴛ  : \`${vlessData.ip_limit === '0' ? 'Unlimited' : vlessData.ip_limit} IP\`
└ 🟢 ꜱᴛᴀᴛᴜꜱ    : \`${account.status.toUpperCase()}\`

━━━━━━━━━━━━━━━━━━━━━━

┌〔 🌍 *ꜱᴇʀᴠᴇʀ* 〕
├ 🌐 ᴅᴏᴍᴀɪɴ      : \`${vlessData.domain}\`
├ ☁️ ᴄʟᴏᴜᴅꜰʀᴏɴᴛ  : \`${server.cloudfront || "-"}\`
├ 🔐 ᴛʟꜱ ᴘᴏʀᴛ    : \`443,8443\`
├ 🌍 ʜᴛᴛᴘ ᴘᴏʀᴛ   : \`80,8080,2086,8880\`
├ 📂 ᴘᴀᴛʜ        : \`/vless\`
└ 🚀 ɢʀᴘᴄ ᴘᴀᴛʜ   : \`vless-grpc\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ᴛʟꜱ*

\`\`\`
${vlessData.vless_tls_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ʜᴛᴛᴘ*

\`\`\`
${vlessData.vless_nontls_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ɢʀᴘᴄ*

\`\`\`
${vlessData.vless_grpc_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

💾 *ꜱᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ*

https://${vlessData.domain}:81/vless-${vlessData.username}.txt
`;

    return ctx.reply(msg, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔙 Kembali",
                        callback_data: "menu_akun_saya"
                    }
                ]
            ]
        }
    });

}


case "trojan": {

    const trojanData = data;
    const cloudfront = server.cloudfront || "-";

    const msg = `
╭━━━━━━━━━━━━━━━━━━━━━━╮
     🐎 *ᴛʀᴏᴊᴀɴ ᴀᴄᴄᴏᴜɴᴛ*
╰━━━━━━━━━━━━━━━━━━━━━━╯

┌〔 📄 *ᴀᴄᴄᴏᴜɴᴛ ɪɴꜰᴏ* 〕
├ 👤 ᴜꜱᴇʀɴᴀᴍᴇ : \`${trojanData.username}\`
├ 🆔 ᴜᴜɪᴅ      : \`${trojanData.uuid}\`
├ 📅 ᴇxᴘɪʀᴇᴅ   : \`${trojanData.expired || account.expired_at}\`
├ 📦 Qᴜᴏᴛᴀ     : \`${trojanData.quota === '0 GB' ? 'Unlimited' : trojanData.quota}\`
├ 🌐 ɪᴘ ʟɪᴍɪᴛ  : \`${trojanData.ip_limit === '0' ? 'Unlimited' : trojanData.ip_limit} IP\`
└ 🟢 ꜱᴛᴀᴛᴜꜱ    : \`${account.status.toUpperCase()}\`

━━━━━━━━━━━━━━━━━━━━━━

┌〔 🌍 *ꜱᴇʀᴠᴇʀ* 〕
├ 🌐 ᴅᴏᴍᴀɪɴ      : \`${trojanData.domain}\`
├ ☁️ ᴄʟᴏᴜᴅꜰʀᴏɴᴛ  : \`${server.cloudfront || "-"}\`
├ 🔐 ᴛʟꜱ ᴘᴏʀᴛ    : \`443,8443\`
├ 🌍 ʜᴛᴛᴘ ᴘᴏʀᴛ   : \`80,8080,2086,8880\`
├ 📂 ᴘᴀᴛʜ        : \`/trojan-ws\`
└ 🚀 ɢʀᴘᴄ ᴘᴀᴛʜ   : \`trojan-grpc\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ᴛʟꜱ*

\`\`\`
${trojanData.trojan_tls_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

🔗 *ᴜʀʟ ɢʀᴘᴄ*

\`\`\`
${trojanData.trojan_grpc_link}
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━

💾 *ꜱᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ*

https://${trojanData.domain}:81/trojan-${trojanData.username}.txt
`;

    return ctx.reply(msg, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔙 Kembali",
                        callback_data: "menu_akun_saya"
                    }
                ]
            ]
        }
    });

}



case "shadowsocks": {

    const shadowsocksData = data;

    // Tempel template SHADOWSOCKS di sini
    return ctx.reply("🚧 Menu Shadowsocks belum dibuat.");

}

default:
    return ctx.reply("❌ Tipe akun tidak dikenali.");
        } // tutup switch

      } // tutup callback (err, server) => {

    ); // tutup db.get Server

  }); // tutup db.get user_accounts

}); // tutup bot.action
/// menu trial
bot.action('menu_trial', async (ctx) => {
  try {
    await ctx.answerCbQuery().catch(() => {});

    const text = `
<blockquote><b>💠 MENU TRIAL AKUN</b>
<code>Uji coba akun VPN sebelum membeli</code></blockquote>

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 🔐 <b>Pilih tipe trial yang tersedia</b>
┃ <code>Setiap tipe akun punya format trial berbeda</code>
┗━━━━━━━━━━━━━━━━━━━━━┛

⚡ <b>Daftar Trial:</b>
• SSH
• VMESS
• VLESS
• TROJAN
• SHADOWSOCKS
`;

const keyboard = [
  [
    {
      text: '🔐 SSH Trial',
      callback_data: 'trial_ssh',
      style: 'primary'
    },
    {
      text: '⚡ VMESS Trial',
      callback_data: 'trial_vmess',
      style: 'primary'
    }
  ],
  [
    {
      text: '🛡️ VLESS Trial',
      callback_data: 'trial_vless',
      style: 'primary'
    },
    {
      text: '🔥 TROJAN Trial',
      callback_data: 'trial_trojan',
      style: 'primary'
    }
  ],
  [
    {
      text: '🌙 SHADOWSOCKS Trial',
      callback_data: 'trial_shadowsocks',
      style: 'primary'
    }
  ],
  [
    {
      text: '🔙 Kembali ke Menu VPN',
      callback_data: 'menu_vpn',
      style: 'danger'
    }
  ]
];

    const msg = ctx.callbackQuery?.message;
    if (msg?.photo) {
      return await ctx.editMessageCaption(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    }

    return await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (err) {
    logger.error(`❌ Gagal tampilkan menu_trial: ${err.message}`);
    await ctx.reply('❌ Gagal membuka Menu Trial.');
  }
});
// menu create
bot.action('menu_create', async (ctx) => {
  try {
    await ctx.answerCbQuery().catch(() => {});

    const text = `
<blockquote><b>✏️ MENU BUAT AKUN</b>
<code>Buat akun VPN baru sesuai kebutuhanmu</code></blockquote>

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 📦 <b>Pilih tipe akun yang ingin dibuat</b>
┃ <code>Lanjut pilih server setelah memilih tipe akun</code>
┗━━━━━━━━━━━━━━━━━━━━━┛

🚀 <b>Tersedia:</b>
• SSH
• VMESS
• VLESS
• TROJAN
• SHADOWSOCKS
`;

const keyboard = [
  [
    {
      text: '🔐 SSH',
      callback_data: 'create_ssh',
      style: 'primary'
    },
    {
      text: '⚡ VMESS',
      callback_data: 'create_vmess',
      style: 'primary'
    }
  ],
  [
    {
      text: '🛡️ VLESS',
      callback_data: 'create_vless',
      style: 'primary'
    },
    {
      text: '🔥 TROJAN',
      callback_data: 'create_trojan',
      style: 'primary'
    }
  ],
  [
    {
      text: '🌙 SHADOWSOCKS',
      callback_data: 'create_shadowsocks',
      style: 'primary'
    }
  ],
  [
    {
      text: '🔙 Kembali ke Menu VPN',
      callback_data: 'menu_vpn',
      style: 'danger'
    }
  ]
];

    const msg = ctx.callbackQuery?.message;
    if (msg?.photo) {
      return await ctx.editMessageCaption(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    }

    return await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (err) {
    logger.error(`❌ Gagal tampilkan menu_create: ${err.message}`);
    await ctx.reply('❌ Gagal membuka Menu Create.');
  }
});
// menu renew
bot.action('menu_renew', async (ctx) => {
  try {
    await ctx.answerCbQuery().catch(() => {});

    const text = `
<blockquote><b>♻️ MENU RENEW AKUN</b>
<code>Perpanjang masa aktif akun VPN milikmu</code></blockquote>

┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 📅 <b>Pilih tipe akun yang ingin diperpanjang</b>
┃ <code>Pastikan username akun sudah benar</code>
┗━━━━━━━━━━━━━━━━━━━━━┛

🔄 <b>Tersedia:</b>
• SSH
• VMESS
• VLESS
• TROJAN
• SHADOWSOCKS
`;

const keyboard = [
  [
    {
      text: '🔐 SSH',
      callback_data: 'renew_ssh',
      style: 'primary'
    },
    {
      text: '⚡ VMESS',
      callback_data: 'renew_vmess',
      style: 'primary'
    }
  ],
  [
    {
      text: '🛡️ VLESS',
      callback_data: 'renew_vless',
      style: 'primary'
    },
    {
      text: '🔥 TROJAN',
      callback_data: 'renew_trojan',
      style: 'primary'
    }
  ],
  [
    {
      text: '🌙 SHADOWSOCKS',
      callback_data: 'renew_shadowsocks',
      style: 'primary'
    }
  ],
  [
    {
      text: '🔙 Kembali ke Menu VPN',
      callback_data: 'menu_vpn',
      style: 'danger'
    }
  ]
];

    const msg = ctx.callbackQuery?.message;
    if (msg?.photo) {
      return await ctx.editMessageCaption(text, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard }
      });
    }

    return await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (err) {
    logger.error(`❌ Gagal tampilkan menu_renew: ${err.message}`);
    await ctx.reply('❌ Gagal membuka Menu Renew.');
  }
});
// MENU RIWAYAT TRANSAKSI 

bot.action('menu_riwayat_transaksi', async (ctx) => {
  const userId = ctx.from?.id;

  try {
    await ctx.answerCbQuery().catch(() => {});

    if (!userId) {
      return ctx.reply('❌ User tidak valid.');
    }

    const penjualan = await new Promise((resolve) => {
      db.all(`
        SELECT tipe_akun, nama_server, harga, masa_aktif_hari, waktu_transaksi, action_type
        FROM log_penjualan
        WHERE user_id = ?
        ORDER BY datetime(waktu_transaksi) DESC
        LIMIT 10
      `, [userId], (err, rows) => {
        if (err) {
          logger.error('❌ Gagal ambil riwayat log_penjualan:', err.message);
          return resolve([]);
        }
        resolve(rows || []);
      });
    });

    const topup = await new Promise((resolve) => {
      db.all(`
        SELECT amount, method, waktu
        FROM topup_log
        WHERE user_id = ?
        ORDER BY datetime(waktu) DESC
        LIMIT 10
      `, [userId], (err, rows) => {
        if (err) {
          logger.error('❌ Gagal ambil riwayat topup_log:', err.message);
          return resolve([]);
        }
        resolve(rows || []);
      });
    });

    const gabung = [];

    for (const row of penjualan) {
      gabung.push({
        waktu: row.waktu_transaksi,
        text:
`🛒 <b>${row.action_type === 'renew' ? 'RENEW AKUN' : 'BUAT AKUN'}</b>
┣ 🌐 Server: <code>${row.nama_server || '-'}</code>
┣ 🔐 Tipe: <code>${(row.tipe_akun || '-').toUpperCase()}</code>
┣ 💰 Harga: <code>Rp${Number(row.harga || 0).toLocaleString('id-ID')}</code>
┣ ⏳ Masa Aktif: <code>${row.masa_aktif_hari || 0} hari</code>
┗ 🕒 Waktu: <code>${formatTanggalIndonesia(row.waktu_transaksi)}</code>`
      });
    }

    for (const row of topup) {
      gabung.push({
        waktu: row.waktu,
        text:
`💳 <b>TOP UP SALDO</b>
┣ 💰 Nominal: <code>Rp${Number(row.amount || 0).toLocaleString('id-ID')}</code>
┣ 🏦 Metode: <code>${row.method || '-'}</code>
┗ 🕒 Waktu: <code>${formatTanggalIndonesia(row.waktu)}</code>`
      });
    }

    gabung.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    const hasil = gabung.slice(0, 15);

if (hasil.length === 0) {
  return ctx.reply(
    '📜 <b>Riwayat Transaksi</b>\n\nBelum ada riwayat transaksi.',
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔙 Kembali ke Menu Utama',
              callback_data: 'send_main_menu',
              style: 'danger'
            }
          ]
        ]
      }
    }
  );
}

    const text = `
📜 <b>RIWAYAT TRANSAKSI ANDA</b>

${hasil.map((item, i) => `${i + 1}.\n${item.text}`).join('\n\n━━━━━━━━━━━━━━━━━━━━\n\n')}
`;

await ctx.reply(text, {
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '🔙 Kembali ke Menu Utama',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  }
});

} catch (error) {
  logger.error(
    `❌ Gagal menampilkan riwayat transaksi user ${userId}: ${error.message}`
  );

  await ctx.reply('❌ Gagal mengambil riwayat transaksi.');
}
});
// =======================
// Helper kirim menu statistik
// =======================

bot.action('menu_statistik', async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  try {
    await ctx.answerCbQuery().catch(() => {});

    if (!userId || !chatId) {
      return ctx.reply('❌ User tidak valid.');
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [userToday, userWeek, userMonth] = await Promise.all([
      new Promise((resolve) => {
        db.get(
          `SELECT COUNT(*) as count
           FROM log_penjualan
           WHERE user_id = ?
           AND waktu_transaksi >= ?
           AND action_type IN ("create","renew")`,
          [userId, todayStart],
          (err, row) => resolve(row?.count || 0)
        );
      }),
      new Promise((resolve) => {
        db.get(
          `SELECT COUNT(*) as count
           FROM log_penjualan
           WHERE user_id = ?
           AND waktu_transaksi >= ?
           AND action_type IN ("create","renew")`,
          [userId, weekStart],
          (err, row) => resolve(row?.count || 0)
        );
      }),
      new Promise((resolve) => {
        db.get(
          `SELECT COUNT(*) as count
           FROM log_penjualan
           WHERE user_id = ?
           AND waktu_transaksi >= ?
           AND action_type IN ("create","renew")`,
          [userId, monthStart],
          (err, row) => resolve(row?.count || 0)
        );
      })
    ]);

    const [globalToday, globalWeek, globalMonth] = await Promise.all([
      new Promise((resolve) => {
        db.get(
          `SELECT COUNT(*) as count
           FROM log_penjualan
           WHERE waktu_transaksi >= ?
           AND action_type IN ("create","renew")`,
          [todayStart],
          (err, row) => resolve(row?.count || 0)
        );
      }),
      new Promise((resolve) => {
        db.get(
          `SELECT COUNT(*) as count
           FROM log_penjualan
           WHERE waktu_transaksi >= ?
           AND action_type IN ("create","renew")`,
          [weekStart],
          (err, row) => resolve(row?.count || 0)
        );
      }),
      new Promise((resolve) => {
        db.get(
          `SELECT COUNT(*) as count
           FROM log_penjualan
           WHERE waktu_transaksi >= ?
           AND action_type IN ("create","renew")`,
          [monthStart],
          (err, row) => resolve(row?.count || 0)
        );
      })
    ]);

    const text = `
📊 <b>ꜱᴛᴀᴛɪꜱᴛɪᴋ ᴘᴇɴᴊᴜᴀʟᴀɴ</b>

🧑‍💼 <b>ꜱᴛᴀᴛɪꜱᴛɪᴋ ᴀɴᴅᴀ</b>
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 📆 ʜᴀʀɪ ɪɴɪ: <code>${userToday}</code> ᴀᴋᴜɴ
┃ 📅 ᴍɪɴɢɢᴜ ɪɴɪ: <code>${userWeek}</code> ᴀᴋᴜɴ
┃ 🗓️ ʙᴜʟᴀɴ ɪɴɪ: <code>${userMonth}</code> ᴀᴋᴜɴ
┗━━━━━━━━━━━━━━━━━━━━━┛

🌍 <b>ꜱᴛᴀᴛɪꜱᴛɪᴋ ɢʟᴏʙᴀʟ</b>
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ 📆 ʜᴀʀɪ ɪɴɪ: <code>${globalToday}</code> ᴀᴋᴜɴ
┃ 📅 ᴍɪɴɢɢᴜ ɪɴɪ: <code>${globalWeek}</code> ᴀᴋᴜɴ
┃ 🗓️ ʙᴜʟᴀɴ ɪɴɪ: <code>${globalMonth}</code> ᴀᴋᴜɴ
┗━━━━━━━━━━━━━━━━━━━━━┛
`;

await ctx.reply(text, {
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '🔙 Kembali ke Menu Utama',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  }
});

} catch (error) {
  logger.error(
    `❌ Gagal menampilkan statistik user ${userId}: ${error.message}`
  );

  await ctx.reply('❌ Gagal mengambil statistik.');
}
});
// helper notifikasi 
function addDaysToNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString();
}

async function saveOrUpdateUserAccount({
  userId,
  username,
  serverId,
  serverName,
  accountType,
  expDays,
  configJson = null
}) {
  return new Promise((resolve, reject) => {
    const expiredAt = addDaysToNow(expDays);

    console.log("📥 Menyimpan akun:", {
      userId,
      username,
      serverId,
      serverName,
      accountType,
      expDays,
      expiredAt
    });

    db.run(`
      INSERT INTO user_accounts (
        user_id,
        username,
        server_id,
        server_name,
        account_type,
        exp_days,
        expired_at,
        status,
        updated_at,
        config_json,
        last_notified_h1,
        last_notified_expired
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, ?, 0, 0)

      ON CONFLICT(username, server_id, account_type)
      DO UPDATE SET
        user_id = excluded.user_id,
        server_name = excluded.server_name,
        exp_days = excluded.exp_days,
        expired_at = excluded.expired_at,
        status = 'active',
        updated_at = CURRENT_TIMESTAMP,
        config_json = excluded.config_json,
        last_notified_h1 = 0,
        last_notified_expired = 0
    `, [
      userId,
      username,
      serverId,
      serverName,
      accountType,
      expDays,
      expiredAt,
      configJson
    ], function (err) {
      if (err) {
        console.error("❌ Gagal menyimpan user_accounts:", err.message);
        return reject(err);
      }

      console.log(
        `✅ user_accounts tersimpan. lastID=${this.lastID}, changes=${this.changes}`
      );

      resolve(true);
    });
  });
}
bot.command('hapuslog', async (ctx) => {
  if (!adminIds.includes(ctx.from.id)) return ctx.reply('Tidak ada izin!');
  try {
    if (fs.existsSync('bot-combined.log')) fs.unlinkSync('bot-combined.log');
    if (fs.existsSync('bot-error.log')) fs.unlinkSync('bot-error.log');
    ctx.reply('Log berhasil dihapus.');
    logger.info('Log file dihapus oleh admin.');
  } catch (e) {
    ctx.reply('Gagal menghapus log: ' + e.message);
    logger.error('Gagal menghapus log: ' + e.message);
  }
});

// [UPDATE: Perintah /helpadmin yang diperbarui]
bot.command('helpadmin', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }
  const helpMessage = `
*📋 Daftar Perintah:*

1. /start - Mengaktifkan bot.
2. /menu - Menampilkan daftar menu bot.
3. /admin - Menampilkan fitur-fitur admin.
4. /broadcast - Kirim pesan siaran ke semua pengguna.
5. /addserver - Menambahkan server baru.
6. /addsaldo - Menambahkan saldo ke akun pengguna.
7. /kurangisaldo - Mengurangi saldo user.
8. /resetsaldo - Mengatur ulang saldo user.
9. /listsaldo - Menampilkan daftar saldo user.
10. /ceksaldo - Melihat saldo user.
11. /editharga - Mengedit harga layanan.
12. /editnama - Mengedit nama server.
13. /editdomain - Mengedit domain server.
14. /editauth - Mengedit auth server.
15. /editlimitquota - Mengedit batas quota server.
16. /editlimitip - Mengedit batas IP server.
17. /editlimitcreate - Mengedit batas pembuatan akun server.
18. /edittotalcreate - Mengedit total pembuatan akun server.
19. /hapuslog - Menghapus log bot.
20. /unlimitedtrial - Memberikan akses trial unlimited ke user.
21. /removeunlimitedtrial - Mencabut akses trial unlimited dari user.
22. /listunlimitedtrial - Melihat daftar user yang memiliki trial unlimited.
23. /setreseller - Mengubah role user menjadi reseller.
24. /unsetreseller - Mengubah role reseller menjadi member biasa.
25. /listreseller - Melihat daftar semua reseller.
26. /setdiskonreseller - Mengatur persentase diskon untuk reseller.
27. /resetdiskonreseller - Mereset persentase diskon reseller ke 0%.
28. /helpadmin - Menampilkan daftar perintah admin.

📝 *Catatan:* Gunakan perintah ini dengan format yang benar untuk menghindari kesalahan.
`;
  ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});

// ============================================================
// 📣 BROADCAST TEMPLATE SYSTEM
// ============================================================

const broadcastState = {};

function getBroadcastTemplateKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '📢 Template Pengumuman',
          callback_data: 'broadcast_template_pengumuman',
          style: 'primary'
        }
      ],
      [
        {
          text: 'ℹ️ Template Information',
          callback_data: 'broadcast_template_information',
          style: 'primary'
        }
      ],
      [
        {
          text: '🎉 Template Promo',
          callback_data: 'broadcast_template_promo',
          style: 'success'
        }
      ],
      [
        {
          text: '❌ Batal',
          callback_data: 'broadcast_cancel',
          style: 'danger'
        }
      ]
    ]
  };
}

async function sendBroadcastTemplateMenu(ctx) {
  return ctx.reply(
`📣 <b>MENU BROADCAST</b>

Silakan pilih template broadcast yang ingin digunakan:

📢 <b>Pengumuman</b>
Untuk informasi penting atau pemberitahuan umum.

ℹ️ <b>Information</b>
Untuk informasi dan bantuan dari admin.

🎉 <b>Promo</b>
Untuk promosi dengan tombol langsung menuju menu Top Up.`,
    {
      parse_mode: 'HTML',
      reply_markup: getBroadcastTemplateKeyboard()
    }
  );
}

function getBroadcastTemplate(type, inputText) {
  const text = String(inputText || '').trim();

  if (type === 'pengumuman') {
    return `📢 <b>PENGUMUMAN</b>

${text}

━━━━━━━━━━━━━━━━━━━━
📌 ${NAMA_STORE}`;
  }

  if (type === 'information') {
    return `ℹ️ <b>INFORMATION</b>

${text}

━━━━━━━━━━━━━━━━━━━━
☎️ Silakan hubungi Admin jika membutuhkan bantuan.`;
  }

  if (type === 'promo') {
    return `🎉 <b>PROMO ${NAMA_STORE}</b>

${text}

━━━━━━━━━━━━━━━━━━━━
💳 Jangan lewatkan promonya!`;
  }

  return text;
}

function getBroadcastButtons(type) {

  // =========================
  // 🎉 BUTTON PROMO
  // =========================
  if (type === 'promo') {
    return [
      [
        {
          text: '💳 TOP UP SEKARANG',
          callback_data: 'topup_saldo',
          style: 'success'
        }
      ]
    ];
  }

  // =========================
  // ℹ️ BUTTON INFORMATION
  // =========================
  if (type === 'information') {
    const adminWa = String(ADMIN_WA || '').trim();

    if (adminWa) {
      return [
        [
          {
            text: '👨‍💼 HUBUNGI ADMIN',
            url: `https://wa.me/${adminWa.replace(/\D/g, '')}`,
            style: 'primary'
          }
        ]
      ];
    }

    return [];
  }

  // Pengumuman tidak menggunakan button
  return [];
}

async function executeBroadcast(ctx, type, inputText, replyMessage = null) {
  const reply = replyMessage || ctx.message?.reply_to_message;

  db.all("SELECT user_id FROM users", [], async (err, rows) => {
    if (err) {
      logger.error(
        '❌ DB Error saat ambil user untuk broadcast:',
        err
      );

      return ctx.reply(
        '⚠️ Gagal mengambil daftar pengguna.'
      );
    }

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        let sent;

        // ====================================================
        // 📎 BROADCAST MEDIA / REPLY MESSAGE
        // ====================================================
        if (reply && reply.message_id) {

          sent = await bot.telegram.copyMessage(
            row.user_id,
            ctx.chat.id,
            reply.message_id
          );

          // Tambahkan button jika template mempunyai button
          const buttons = getBroadcastButtons(type);

          if (buttons.length && sent?.message_id) {
            try {
              await bot.telegram.editMessageReplyMarkup(
                row.user_id,
                sent.message_id,
                undefined,
                {
                  inline_keyboard: buttons
                }
              );
            } catch (e) {
              logger.debug(
                `Tidak dapat menambahkan tombol ke media ${row.user_id}: ${e.message}`
              );
            }
          }

        } else {

          // ==================================================
          // 📝 BROADCAST TEXT
          // ==================================================

          const messageText = getBroadcastTemplate(
            type,
            inputText
          );

          const buttons = getBroadcastButtons(type);

          const options = {
            parse_mode: 'HTML'
          };

          if (buttons.length) {
            options.reply_markup = {
              inline_keyboard: buttons
            };
          }

          sent = await bot.telegram.sendMessage(
            row.user_id,
            messageText,
            options
          );
        }

        // ====================================================
        // 📌 PIN PESAN
        // ====================================================

        const messageIdToPin =
          sent?.message_id || sent;

        if (messageIdToPin) {
          try {
            await bot.telegram.pinChatMessage(
              row.user_id,
              messageIdToPin,
              {
                disable_notification: false
              }
            );
          } catch (e) {
            logger.debug(
              `Skip pin untuk ${row.user_id}: ${e.message}`
            );
          }
        }

        success++;

        logger.info(
          `✅ Broadcast ${type} sukses ke ${row.user_id}`
        );

      } catch (error) {

        failed++;

        if (error.response?.error_code === 403) {

          logger.warn(
            `🚫 User ${row.user_id} blokir bot / belum start`
          );

        } else if (error.response?.error_code === 429) {

          const retryAfter =
            error.response.parameters?.retry_after || 5;

          logger.warn(
            `⏳ Telegram rate limit: tunggu ${retryAfter} detik`
          );

          await new Promise(resolve =>
            setTimeout(
              resolve,
              (retryAfter + 1) * 1000
            )
          );

        } else {

          logger.warn(
            `❌ Gagal broadcast ke ${row.user_id}: ${error.message}`
          );
        }
      }

      // Delay agar tidak terlalu cepat
      await new Promise(resolve =>
        setTimeout(resolve, 500)
      );
    }

    delete broadcastState[ctx.from.id];

    // ======================================================
    // 📊 HASIL BROADCAST
    // ======================================================

    await ctx.reply(
      `📣 <b>Broadcast ${type.toUpperCase()} selesai!</b>\n\n` +
      `✅ Berhasil: ${success}\n` +
      `❌ Gagal: ${failed}`,
      {
        parse_mode: 'HTML'
      }
    );
  });
}


// ============================================================
// 📣 COMMAND /BROADCAST
// ============================================================

bot.command('broadcast', async (ctx) => {

  const userId = ctx.message.from.id;

  // Cek admin
  if (!adminIds.includes(userId)) {
    return ctx.reply(
      '⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.',
      {
        parse_mode: 'Markdown'
      }
    );
  }

  const reply =
    ctx.message.reply_to_message;

  const inputText =
    ctx.message.text
      .split(' ')
      .slice(1)
      .join(' ')
      .trim();


  // ==========================================================
  // /broadcast
  // Buka menu template
  // ==========================================================

  if (!reply && !inputText) {
    return sendBroadcastTemplateMenu(ctx);
  }


  // ==========================================================
  // /broadcast + reply media
  // ==========================================================

  if (!inputText && reply) {
    return executeBroadcast(
      ctx,
      'pengumuman',
      '',
      reply
    );
  }


  // ==========================================================
  // FORMAT:
  //
  // /broadcast promo Isi pesan
  // /broadcast information Isi pesan
  // /broadcast pengumuman Isi pesan
  // ==========================================================

  const parts =
    inputText.split(/\s+/);

  const first =
    String(parts.shift() || '')
      .toLowerCase();

  const aliases = {

    pengumuman:
      'pengumuman',

    announcement:
      'pengumuman',

    information:
      'information',

    info:
      'information',

    promo:
      'promo'
  };

  const type =
    aliases[first];


  if (type) {

    const body =
      parts.join(' ').trim();


    // Kalau hanya mengetik:
    // /broadcast promo
    //
    // bot menunggu isi pesan

    if (!body && !reply) {

      broadcastState[userId] = {
        type
      };

      return ctx.reply(
        `📝 <b>Template ${type.toUpperCase()}</b>\n\n` +
        `Silakan kirim isi pesan yang ingin dibroadcast.`,
        {
          parse_mode: 'HTML'
        }
      );
    }

    return executeBroadcast(
      ctx,
      type,
      body,
      reply
    );
  }


  // ==========================================================
  // FORMAT LAMA
  //
  // /broadcast Pesan saya
  //
  // otomatis dianggap sebagai pengumuman
  // ==========================================================

  return executeBroadcast(
    ctx,
    'pengumuman',
    inputText,
    reply
  );
});


// ============================================================
// 📢 PILIH TEMPLATE DARI MENU
// ============================================================

bot.action(
  /^broadcast_template_(pengumuman|information|promo)$/,
  async (ctx) => {

    const userId =
      ctx.from.id;

    if (!adminIds.includes(userId)) {
      return ctx.answerCbQuery(
        'Ditolak!'
      );
    }

    const type =
      ctx.match[1];

    broadcastState[userId] = {
      type
    };

    await ctx.answerCbQuery(
      `Template ${type} dipilih`
    );

    return ctx.reply(
      `📝 <b>Template ${type.toUpperCase()}</b>\n\n` +
      `Kirim isi pesan sekarang.\n\n` +

      (
        type === 'promo'
          ? '🎉 Setelah terkirim, user akan mendapat tombol <b>TOP UP SEKARANG</b> yang langsung membuka menu top up.'

          : type === 'information'
            ? 'ℹ️ User akan mendapat tombol <b>HUBUNGI ADMIN</b>.'

            : '📢 Template pengumuman akan dikirim tanpa tombol.'
      ),

      {
        parse_mode: 'HTML'
      }
    );
  }
);


// ============================================================
// ❌ BATAL BROADCAST
// ============================================================

bot.action(
  'broadcast_cancel',
  async (ctx) => {

    if (!adminIds.includes(ctx.from.id)) {
      return ctx.answerCbQuery(
        'Ditolak!'
      );
    }

    delete broadcastState[
      ctx.from.id
    ];

    await ctx.answerCbQuery(
      'Broadcast dibatalkan'
    );

    return ctx.reply(
      '❌ Broadcast dibatalkan.'
    );
  }
);


bot.on('text', async (ctx, next) => {

  const userId = ctx.from.id;
  const text = ctx.message?.text?.trim();

  // ============================================================
  // 📣 HANDLE INPUT BROADCAST
  // ============================================================

  const state = broadcastState[userId];

  // Tidak sedang menunggu input broadcast
  if (!state || !state.type) {
    return next();
  }

  // Jangan tangkap command
  if (!text || text.startsWith('/')) {
    return next();
  }

  // Simpan tipe broadcast
  const broadcastType = state.type;

  // ============================================================
  // ⚠️ PENTING:
  // HAPUS STATE SEBELUM EXECUTE BROADCAST
  // Supaya pesan berikutnya TIDAK ikut dianggap broadcast
  // ============================================================

  delete broadcastState[userId];

  logger.info(
    `📣 Admin ${userId} mengirim isi broadcast ${broadcastType}`
  );

  try {

    await executeBroadcast(
      ctx,
      broadcastType,
      text
    );

  } catch (error) {

    logger.error(
      `❌ Error broadcast ${broadcastType}: ${error.message}`
    );

    await ctx.reply(
      '❌ Terjadi kesalahan saat menjalankan broadcast.'
    );
  }

  return;
});

function formatRupiah(angka) {
  return `Rp${(angka || 0).toLocaleString('id-ID')}`;
}
// === Handler tombol kembali ke menu utama ===
// === Handler tombol kembali ke menu utama (fix delete + reply) ===

bot.action(/^batal_topup_(.+)$/, async (ctx) => {
  const uniqueCode = ctx.match[1];
  const deposit = global.pendingDeposits[uniqueCode];

  if (!deposit) {
    return ctx.answerCbQuery('Transaksi sudah tidak aktif atau telah dibatalkan.', { show_alert: true });
  }

  try {
    // Hapus pesan QR
    if (deposit.qrMessageId) {
      try {
        await bot.telegram.deleteMessage(deposit.userId, deposit.qrMessageId);
      } catch (e) {}
    }

    // Hapus dari pending
    delete global.pendingDeposits[uniqueCode];
    await deletePendingDeposit(uniqueCode);

    await ctx.answerCbQuery('Topup dibatalkan.');

    // ===== Kirim pesan dengan tombol kembali =====
    await ctx.reply('❌ Topup QRIS Orkut telah dibatalkan. Silahkan topup ulang jika ingin mencoba lagi.', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Kembali ke Menu Top-up', callback_data: 'menu_topup' }]
        ]
      }
    });
    // =============================================

    // Tambahan: hapus pesan command user (jika diperlukan)
    try {
      const chatId = ctx.chat.id;
      const userId = ctx.from.id;
      // Pastikan ctx.message ada (atau gunakan ctx.update.callback_query.message jika akses via callback)
      const messageId = ctx.update.callback_query.message?.message_id;
      if (messageId) {
        await ctx.telegram.deleteMessage(chatId, messageId);
        logger.info(`🧹 Pesan command user ${userId} berhasil dihapus`);
      }
    } catch (e) {
      const userId = ctx.from.id;
      console.warn(`⚠️ Tidak bisa hapus pesan command user ${userId}:`, e.message);
    }

  } catch (e) {
    logger.error('Gagal batal topup:', e);
    await ctx.answerCbQuery('Gagal batal topup.', { show_alert: true });
  }
});

bot.action('statistik_penjualan', async (ctx) => {
  await ctx.answerCbQuery();

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const startOfWeek = new Date(new Date().setDate(today.getDate() - today.getDay())).toISOString(); // Minggu
  const startOf7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  db.all(`
    SELECT tipe_akun, COUNT(*) AS jumlah, SUM(harga) AS total_harga
    FROM log_penjualan
    GROUP BY tipe_akun
  `, [], (err, rows) => {
    if (err || rows.length === 0) {
      return ctx.reply('⚠️ Belum ada data penjualan.');
    }

    let totalAkun = 0;
    let totalUang = 0;
    const hasil = rows.map(r => {
      totalAkun += r.jumlah;
      totalUang += r.total_harga;
      return `📦 *${r.tipe_akun.toUpperCase()}*\nJumlah Terjual: ${r.jumlah}\nTotal: ${formatRupiah(r.total_harga)}`;
    }).join('\n\n');

    db.get(`SELECT SUM(harga) AS total FROM log_penjualan WHERE waktu_transaksi >= ?`, [startOfToday], (err1, todayRow) => {
    db.get(`SELECT SUM(harga) AS total FROM log_penjualan WHERE waktu_transaksi >= ?`, [startOf7Days], (err2, week7Row) => {
    db.get(`SELECT SUM(harga) AS total FROM log_penjualan WHERE waktu_transaksi >= ?`, [startOfWeek], (err3, weekRow) => {
    db.get(`SELECT SUM(harga) AS total FROM log_penjualan WHERE waktu_transaksi >= ?`, [startOfMonth], (err4, monthRow) => {

      const totalToday = todayRow?.total || 0;
      const total7Days = week7Row?.total || 0;
      const totalWeek = weekRow?.total || 0;
      const totalMonth = monthRow?.total || 0;

      const message =
        `📊 *Statistik Penjualan per Tipe Akun:*\n\n${hasil}\n\n` +
        `🧾 *Total Semua Akun Terjual:* ${totalAkun}\n` +
        `💰 *Total Uang Masuk:* ${formatRupiah(totalUang)}\n\n` +
        `📅 *Hari Ini:* ${formatRupiah(totalToday)}\n` +
        `📈 *7 Hari Terakhir:* ${formatRupiah(total7Days)}\n` +
        `🗓️ *Minggu Ini:* ${formatRupiah(totalWeek)}\n` +
        `📆 *Bulan Ini:* ${formatRupiah(totalMonth)}`;

      ctx.reply(message, { parse_mode: 'Markdown' });

    }); }); }); });
  });
});
bot.command('addsaldo', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/addsaldo <user_id> <jumlah>`', { parse_mode: 'Markdown' });
  }

  const targetUserId = parseInt(args[1]);
  const amount = parseInt(args[2]);

  if (isNaN(targetUserId) || isNaN(amount)) {
      return ctx.reply('⚠️ `user_id` dan `jumlah` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  if (/\s/.test(args[1]) || /\./.test(args[1]) || /\s/.test(args[2]) || /\./.test(args[2])) {
      return ctx.reply('⚠️ `user_id` dan `jumlah` tidak boleh mengandung spasi atau titik.', { parse_mode: 'Markdown' });
  }

  db.get("SELECT * FROM users WHERE user_id = ?", [targetUserId], (err, row) => {
      if (err) {
          logger.error('⚠️ Kesalahan saat memeriksa `user_id`:', err.message);
          return ctx.reply('⚠️ Kesalahan saat memeriksa `user_id`.', { parse_mode: 'Markdown' });
      }

      if (!row) {
          return ctx.reply('⚠️ `user_id` tidak terdaftar.', { parse_mode: 'Markdown' });
      }

      db.run("UPDATE users SET saldo = saldo + ? WHERE user_id = ?", [amount, targetUserId], function(err) {
          if (err) {
              logger.error('⚠️ Kesalahan saat menambahkan saldo:', err.message);
              return ctx.reply('⚠️ Kesalahan saat menambahkan saldo.', { parse_mode: 'Markdown' });
          }

          if (this.changes === 0) {
              return ctx.reply('⚠️ Pengguna tidak ditemukan.', { parse_mode: 'Markdown' });
          }

          ctx.reply(`✅ Saldo sebesar \`${amount}\` berhasil ditambahkan untuk \`user_id\` \`${targetUserId}\`.`, { parse_mode: 'Markdown' });
      });
  });
});
//gopay
bot.action('topup_gopay', async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    await ctx.answerCbQuery();
    logger.info(`🔍 User ${userId} memulai proses top-up saldo (QRIS Gopay).`);

    // 🧹 Hapus menu lama
    if (lastMenus[userId]) {
      try {
        await bot.telegram.deleteMessage(chatId, lastMenus[userId]);
        logger.info(`🧹 Menu lama milik ${userId} berhasil dihapus`);
        delete lastMenus[userId];
      } catch (e) {
        console.warn(`⚠️ Gagal menghapus menu sebelumnya untuk ${userId}:`, e?.message);
      }
    }

    // 🧼 Bersihkan state sebelumnya
    delete userState[chatId];
    if (global.depositState?.[userId]) {
      delete global.depositState[userId];
    }

    // ✅ Set state input nominal
    if (!global.depositState) global.depositState = {};
    global.depositState[userId] = {
      action: 'request_amount_gopay',
      amount: ''
    };

    logger.info(`📝 Menunggu input nominal dari user ${userId} untuk QRIS Gopay`);

// 💬 Kirim instruksi
const sent = await ctx.reply(
`💳━━━━━━━━━━━━━━━━━━━━💳
        *Qʀɪꜱ Gᴏᴘᴀʏ Tᴏᴘ-ᴜᴘ*
💳━━━━━━━━━━━━━━━━━━━━💳

⚡ *ꜱɪʟᴀʜᴋᴀɴ ᴋᴇᴛɪᴋ ɴᴏᴍɪɴᴀʟ ᴛᴏᴘ-ᴜᴘ*
ʏᴀɴɢ ɪɴɢɪɴ ᴀɴᴅᴀ ʙᴀʏᴀʀᴋᴀɴ ᴍᴇʟᴀʟᴜɪ ᴍᴇᴛᴏᴅᴇ Qʀɪꜱ Gᴏᴘᴀʏ.

💰 ᴍɪɴɪᴍᴀʟ ᴛᴏᴘ-ᴜᴘ: *Rp 100*
🧾 ᴄᴏɴᴛᴏʜ: \`10000\`

━━━━━━━━━━━━━━━━━━━━━━━
⌛ ᴋᴇᴍᴜᴅɪᴀɴ ᴛᴜɴɢɢᴜ ᴘʀᴏꜱᴇꜱ ᴏᴛᴏᴍᴀᴛɪꜱ.
ᴀᴘᴀʙɪʟᴀ ꜱᴀʟᴅᴏ ʙᴇʟᴜᴍ ᴍᴀꜱᴜᴋ,
ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ ᴅᴇɴɢᴀɴ ʙᴜᴋᴛɪ ᴛʀᴀɴꜱᴀᴋꜱɪ.
━━━━━━━━━━━━━━━━━━━━━━━`,
{
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '❌ Batal',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  }
}); // ✅ ctx.reply ditutup

// ✅ Simpan message_id untuk tracking
if (sent?.message_id) {
  lastMenus[userId] = sent.message_id;
}

return sent;

} catch (error) {
  logger.error(
    '❌ Kesalahan saat memulai top-up saldo (QRIS Gopay):',
    error
  );

  try {
    await ctx.reply(
      '❌ *GAGAL! Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.*',
      {
        parse_mode: 'Markdown'
      }
    );
  } catch (e) {
    logger.error(
      'Gagal kirim pesan error:',
      e.message
    );
  }
}
});
bot.action('topup_pakasir', async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    await ctx.answerCbQuery();
    logger.info(`🔍 User ${userId} memulai proses top-up saldo (QRIS Pakasir).`);

    // 🧹 Hapus menu lama
    if (lastMenus[userId]) {
      try {
        await bot.telegram.deleteMessage(chatId, lastMenus[userId]);
        logger.info(`🧹 Menu lama milik ${userId} berhasil dihapus`);
        delete lastMenus[userId];
      } catch (e) {
        console.warn(`⚠️ Gagal menghapus menu sebelumnya untuk ${userId}:`, e?.message);
      }
    }

    // 🧼 Bersihkan state sebelumnya
    delete userState[chatId];

    if (global.depositState?.[userId]) {
      delete global.depositState[userId];
    }

    // ✅ Set state input nominal
    if (!global.depositState) global.depositState = {};

    global.depositState[userId] = {
      action: 'request_amount_pakasir',
      amount: ''
    };

    logger.info(`📝 Menunggu input nominal dari user ${userId} untuk QRIS Pakasir`);

// 💬 Kirim instruksi
const sent = await ctx.reply(
`💳━━━━━━━━━━━━━━━━━━━━💳
       *Qʀɪꜱ Pᴀᴋᴀꜱɪʀ Tᴏᴘ-ᴜᴘ*
💳━━━━━━━━━━━━━━━━━━━━💳

⚡ *ꜱɪʟᴀʜᴋᴀɴ ᴋᴇᴛɪᴋ ɴᴏᴍɪɴᴀʟ ᴛᴏᴘ-ᴜᴘ*
ʏᴀɴɢ ɪɴɢɪɴ ᴀɴᴅᴀ ʙᴀʏᴀʀᴋᴀɴ ᴍᴇʟᴀʟᴜɪ ᴍᴇᴛᴏᴅᴇ Qʀɪꜱ Pᴀᴋᴀꜱɪʀ.

💰 ᴍɪɴɪᴍᴀʟ ᴛᴏᴘ-ᴜᴘ: *Rp 1000*
🧾 ᴄᴏɴᴛᴏʜ: \`10000\`

━━━━━━━━━━━━━━━━━━━━━━━
⌛ ᴋᴇᴍᴜᴅɪᴀɴ ᴛᴜɴɢɢᴜ ᴘʀᴏꜱᴇꜱ ᴏᴛᴏᴍᴀᴛɪꜱ.
ᴀᴘᴀʙɪʟᴀ ꜱᴀʟᴅᴏ ʙᴇʟᴜᴍ ᴍᴀꜱᴜᴋ,
ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ ᴅᴇɴɢᴀɴ ʙᴜᴋᴛɪ ᴛʀᴀɴꜱᴀᴋꜱɪ.
━━━━━━━━━━━━━━━━━━━━━━━`,
{
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '❌ Batal',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  }
}); // ← INI PENUTUP YANG KURANG

// ✅ Simpan message_id untuk tracking
if (sent?.message_id) {
  lastMenus[userId] = sent.message_id;
}

return sent;

} catch (error) {
  logger.error(
    '❌ Kesalahan saat memulai top-up saldo (QRIS Pakasir):',
    error
  );

  try {
    await ctx.reply(
      '❌ *GAGAL! Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.*',
      {
        parse_mode: 'Markdown'
      }
    );
  } catch (e) {
    logger.error(
      'Gagal kirim pesan error:',
      e.message
    );
  }
}
});
// TOPUP PAKASIR YOOOOO

async function generateQrisTemplate(payment) {
  const qrData = payment.payment_number || payment.qrString;

  const qrBuffer = await QRCode.toBuffer(qrData, {
    width: 550,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
  const expiredz = new Date(payment.expired_at).toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

  const amount = Number(payment.amount).toLocaleString('id-ID');
  const fee = Number(payment.fee || 0).toLocaleString('id-ID');
  const total = Number(payment.total_payment || payment.amount).toLocaleString('id-ID');

  const textOverlay = Buffer.from(`
  <svg width="1122" height="1402">
    <style>
      .normal {
        fill: white;
        font-size: 25px;
        font-family: Arial;
      }

      .total {
        fill: #00FFFF;
        font-size: 25px;
        font-family: Arial;
        font-weight: bold;
      }
    </style>

    <!-- Nominal -->
    <text x="530" y="940" class="normal">
      Rp ${amount}
    </text>

    <!-- Fee -->
    <text x="530" y="1000" class="normal">
      Rp ${fee}
    </text>

    <!-- Total -->
    <text x="530" y="1060" class="total">
      Rp ${total}
    </text>

    <!-- Ref -->
    <text x="530" y="1140" class="normal">
      ${payment.order_id}
    </text>

    <!-- Expired -->
    <text x="530" y="1200" class="normal">
      ${expiredz}
    </text>

  </svg>
  `);

  const outputPath = path.join(
    tempDir,
    `qris_${payment.order_id}.png`
  );

  await sharp('./assets/qris.png')
    .composite([
      {
        input: qrBuffer,
        top: 250,
        left: 300
      },
      {
        input: textOverlay,
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}

async function generateTopupSuccessTemplate(data) {
  const waktu = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const textOverlay = Buffer.from(`
<svg width="1024" height="1280">
<style>
.value{
fill:#18F6FF;
font-size:28px;
font-family:Arial;
font-weight:bold;
}

.time{
fill:white;
font-size:24px;
font-family:Arial;
}
</style>

<!-- Username -->
<text x="500" y="470" class="value">
@${data.username}
</text>

<!-- User ID -->
<text x="500" y="563" class="value">
${data.userId}
</text>

<!-- Nominal -->
<text x="500" y="650" class="value">
Rp ${Number(data.amount).toLocaleString("id-ID")}
</text>

<!-- Bonus -->
<text x="500" y="740" class="value">
Rp ${Number(data.bonus || 0).toLocaleString("id-ID")}
</text>

<!-- Saldo -->
<text x="500" y="825" class="value">
Rp ${Number(data.balance).toLocaleString("id-ID")}
</text>

<!-- ID Transaksi -->
<text x="500" y="908" class="value">
${data.transactionId}
</text>

<!-- Waktu -->
<text x="500" y="1000" class="time">
${waktu}
</text>

</svg>
`);

  const outputPath = path.join(
    tempDir,
    `topup_${data.userId}_${Date.now()}.png`
  );

  await sharp("./assets/topup_success.png")
    .composite([
      {
        input: textOverlay,
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

  return outputPath;
}
async function processDepositPakasir(ctx, amount) {
  try {
    const orderId = `PKS-${Date.now()}-${ctx.from.id}`;

    const { data } = await axios.post(
      `${PAY_BASE}/api/transactioncreate/qris`,
      {
        project: PAKASIR_PROJECT,
        order_id: orderId,
        amount,
        api_key: PAKASIR_API_KEY
      }
    );

    const payment = data.payment;

    if (!payment) {
      throw new Error('Payment tidak ditemukan');
    }

    const uniqueCode = orderId;

    logger.info(
      `PAKASIR RESPONSE ${uniqueCode}: ${JSON.stringify(data)}`
    );
    const expiredz = new Date(payment.expired_at).toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

    const qrisImage = await generateQrisTemplate(payment);

const qrMessage = await ctx.replyWithPhoto(
  { source: qrisImage },
      {
        caption: `
┏━━━━━━━━━━━━━━━━━━━━━┓
      🏷️ *ᴅᴇᴛᴀɪʟ ᴘᴇᴍʙᴀʏᴀʀᴀɴ*
┗━━━━━━━━━━━━━━━━━━━━━┛

💰 ɴᴏᴍɪɴᴀʟ ᴛᴏᴘᴜᴘ : *Rp ${Number(payment.amount).toLocaleString('id-ID')}*
💸 ꜰᴇᴇ QRIS       : *Rp ${Number(payment.fee || 0).toLocaleString('id-ID')}*
💵 ᴛᴏᴛᴀʟ ʙᴀʏᴀʀ    : *Rp ${Number(payment.total_payment || payment.amount).toLocaleString('id-ID')}*

🆔 ʀᴇꜰꜰ : \`${payment.order_id}\`
⏳ ᴇxᴘɪʀᴇᴅ : *${expiredz}*

⚠️ ᴛʀᴀɴꜱꜰᴇʀ ʜᴀʀᴜꜱ ꜱᴇꜱᴜᴀɪ *TOTAL BAYAR*
        `,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '❌ Batal',
                callback_data: `batal_topup_${uniqueCode}`,
                style: 'danger'
              }
            ]
          ]
        }
      }
    );

    if (!global.pendingDeposits) {
      global.pendingDeposits = {};
    }

    global.pendingDeposits[uniqueCode] = {
      userId: ctx.from.id,
      username: ctx.from.username || `user_${ctx.from.id}`,

      // Saldo & bonus tetap berdasarkan nominal topup
      originalAmount: Number(payment.amount),
      amount: Number(payment.amount),

      transaction_id: payment.order_id,
      qrMessageId: qrMessage.message_id,
      timestamp: Date.now(),
      status: 'pending',
      method: 'Pakasir QRIS'
    };

    logger.info(
      `✅ Pending Pakasir dibuat | user=${ctx.from.id} | amount=${payment.amount} | fee=${payment.fee} | total=${payment.total_payment}`
    );

  } catch (err) {
    logger.error('PAKASIR CREATE ERROR:', err);
    await ctx.reply('❌ Gagal membuat pembayaran Pakasir.');
  }
}
// ========================= MENU TOPUP PILIHAN ==========================
bot.action('menu_topup', async (ctx) => {
  try {
    await ctx.answerCbQuery().catch(() => {});

    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      return ctx.reply('⚠️ User tidak valid.');
    }

    // Hapus pesan callback sebelumnya biar bersih
    try {
      if (ctx.callbackQuery?.message?.message_id) {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      }
    } catch (err) {
      console.warn("⚠️ Gagal hapus pesan lama:", err.message);
    }

    // Hapus menu lama kalau ada
    if (lastMenus[userId]) {
      try {
        await ctx.telegram.deleteMessage(chatId, lastMenus[userId]);
        logger.info(`🧹 Menu topup lama user ${userId} dihapus`);
      } catch (e) {
        if (!String(e.message).includes('message to delete not found')) {
          logger.warn(`⚠️ Gagal hapus last menu topup ${userId}: ${e.message}`);
        }
      }
      delete lastMenus[userId];
    }

    // Ambil username admin
    let adminUsername = 'Admin';
    try {
      const adminChat = await bot.telegram.getChat(ADMIN);
      if (adminChat.username) adminUsername = adminChat.username;
    } catch (e) {
      logger.warn(`⚠️ Gagal ambil username admin: ${e.message}`);
    }

    const namaStore = vars?.NAMA_STORE || 'XWANSTORE';
    const config = typeof loadButtonConfig === 'function'
      ? loadButtonConfig()
      : {
          topup_saldo: true,
          topup_saweria: true,
          topup_gopay: true,
          topup_pakasir: true
        };

const keyboard = [];

if (config.topup_saldo) {
  keyboard.push([
    {
      text: "💸 Topup QRIS Orkut",
      callback_data: "topup_saldo",
      style: "primary"
    }
  ]);
}

if (config.topup_saweria) {
  keyboard.push([
    {
      text: "💸 Topup QRIS Saweria",
      callback_data: "topup_saweria",
      style: "primary"
    }
  ]);
}

if (config.topup_gopay) {
  keyboard.push([
    {
      text: "💸 Topup QRIS Gopay",
      callback_data: "topup_gopay",
      style: "primary"
    }
  ]);
}

if (config.topup_pakasir) {
  keyboard.push([
    {
      text: "💸 Topup QRIS Pakasir",
      callback_data: "topup_pakasir",
      style: "primary"
    }
  ]);
}

keyboard.push([
  {
    text: "🔙 Kembali ke Menu Utama",
    callback_data: "send_main_menu",
    style: "danger"
  }
]);
    const messageText = `
💳 <b>ᴍᴇɴᴜ ᴛᴏᴘ-ᴜᴘ ꜱᴀʟᴅᴏ</b>
ᴘɪʟɪʜ ᴍᴇᴛᴏᴅᴇ ᴛᴏᴘ-ᴜᴘ ʏᴀɴɢ ᴋᴀᴍᴜ ɪɴɢɪɴᴋᴀɴ ᴅɪ ʙᴀᴡᴀʜ ɪɴɪ ⤵️

┏━━━━━━━━━━━━━━━━━━━┓
┃ 💸 <b>Qʀɪꜱ Oʀᴋᴜᴛ</b> — ᴘʀᴏꜱᴇꜱ ᴀᴜᴛᴏᴍᴀᴛɪꜱ
┃ 💸 <b>Qʀɪꜱ Sᴀᴡᴇʀɪᴀ</b> — ᴠᴇʀɪꜰɪᴋᴀꜱɪ ᴄᴇᴘᴀᴛ
┃ 💸 <b>Qʀɪꜱ Gᴏᴘᴀʏ</b> — ᴘʀᴏꜱᴇꜱ ᴄᴇᴘᴀᴛ
┃ 💸 <b>Qʀɪꜱ Pᴀᴋᴀꜱɪʀ</b> — ᴘʀᴏꜱᴇꜱ ᴄᴇᴘᴀᴛ
┗━━━━━━━━━━━━━━━━━━━┛

📘 <b>ᴛᴀᴛᴀ ᴄᴀʀᴀ ᴛᴏᴘ-ᴜᴘ</b>
1️⃣ ᴋʟɪᴋ ᴛᴏᴍʙᴏʟ ᴍᴇᴛᴏᴅᴇ ᴘᴇᴍʙᴀʏᴀʀᴀɴ ᴅɪ ʙᴀᴡᴀʜ.
2️⃣ ꜱᴄᴀɴ ᴋᴏᴅᴇ Qʀ ᴀᴛᴀᴜ ꜱᴀʟɪɴ ʟɪɴᴋ ᴘᴇᴍʙᴀʏᴀʀᴀɴ.
3️⃣ ʟᴀᴋᴜᴋᴀɴ ᴘᴇᴍʙᴀʏᴀʀᴀɴ ꜱᴇꜱᴜᴀɪ ɴᴏᴍɪɴᴀʟ.
4️⃣ ᴛᴜɴɢɢᴜ ±1 ᴍᴇɴɪᴛ, ꜱᴀʟᴅᴏ ᴀᴋᴀɴ ᴍᴀꜱᴜᴋ ᴀᴜᴛᴏᴍᴀᴛɪꜱ.
5️⃣ ᴊɪᴋᴀ ʙᴇʟᴜᴍ ᴍᴀꜱᴜᴋ, ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ ᴅᴇɴɢᴀɴ ʙᴜᴋᴛɪ ᴛʀᴀɴꜱᴀᴋꜱɪ.

☎️ <b>ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ:</b>
╰<a href="https://t.me/${adminUsername}">@${adminUsername}</a>

📦━━━━━━━━━━━━━━━━━━━━📦
     <code>🌐 ᴅɪᴋᴇʟᴏʟᴀ ᴏʟᴇʜ ${namaStore} ɴᴇᴛᴡᴏʀᴋ</code>
📦━━━━━━━━━━━━━━━━━━━━📦
`;

    let sentMessage;

    try {
      const response = await axios.get(GAMBAR_TOPUP, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const imageBuffer = Buffer.from(response.data);

      sentMessage = await ctx.replyWithPhoto(
        { source: imageBuffer, filename: 'menu_topup.jpg' },
        {
          caption: messageText,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboard }
        }
      );
    } catch (imgErr) {
      logger.warn(`⚠️ Gagal ambil/kirim gambar topup langsung, fallback ke URL: ${imgErr.message}`);

      sentMessage = await ctx.replyWithPhoto(
        GAMBAR_TOPUP,
        {
          caption: messageText,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: keyboard }
        }
      );
    }

    if (sentMessage?.message_id) {
      lastMenus[userId] = sentMessage.message_id;
      logger.info(`✅ Menu topup dengan gambar dikirim untuk user ${userId}`);
      return sentMessage;
    }

    logger.warn(`⚠️ Menu topup tidak mengembalikan message_id untuk user ${userId}`);
    return null;

  } catch (err) {
    logger.error(`❌ Error di menu_topup untuk user ${ctx.from?.id}: ${err.message}`);

    try {
      const fallback = await ctx.reply(
        "⚠️ Gagal menampilkan menu TopUp bergambar. Menampilkan versi teks...",
        { parse_mode: "HTML" }
      );
      return fallback;
    } catch (e) {
      logger.error(`❌ Fallback menu_topup juga gagal: ${e.message}`);
      return null;
    }
  }
});





async function processDepositSaweria(ctx, amount) {
  try {
    const SAWERIA_USERNAME = process.env.SAWERIA_USERNAME || vars.SAWERIA_USERNAME;
    const SAWERIA_EMAIL = process.env.SAWERIA_EMAIL || vars.SAWERIA_EMAIL;

    if (!SAWERIA_USERNAME || !SAWERIA_EMAIL) {
      return ctx.reply('❌ *Konfigurasi Saweria belum lengkap.*', { parse_mode: 'Markdown' });
    }

    const amountInt = parseInt(amount);
    const apiUrl = `https://saweria.autsc.my.id/api/create?username=${encodeURIComponent(SAWERIA_USERNAME)}&amount=${amountInt}&email=${encodeURIComponent(SAWERIA_EMAIL)}`;

    const res = await axios.get(apiUrl);
    const result = res.data;

    if (!result.success || !result.data?.qrImageUrl || !result.data?.transactionId) {
      return ctx.reply('❌ *Gagal membuat QR Saweria.*', { parse_mode: 'Markdown' });
    }

    const { qrImageUrl, transactionId, checkPaymentUrl, timestamp } = result.data;

    // Ambil bonus dari DB
    let bonus = 0;
    let bonus_percent = 0;

    await new Promise((resolve) => {
      db.get('SELECT * FROM bonus_config WHERE id = 1', (err, config) => {
        if (!err && config && config.enabled && amountInt >= config.min_topup) {
          bonus_percent = config.bonus_percent;
          bonus = Math.floor(amountInt * bonus_percent / 100);
        }
        resolve(); // lanjut proses meskipun gagal ambil bonus
      });
    });

    // Simpan ke global
    if (!global.pendingDepositsSaweria) global.pendingDepositsSaweria = {};
    global.pendingDepositsSaweria[transactionId] = {
      userId: ctx.from.id,
      username: ctx.from.username ? `@${ctx.from.username}` : 'Tidak tersedia',
      amount: amountInt,
      bonus,
      bonus_percent,
      created_at: Date.now(),
      checked: false
    };

    const qrMessage = await ctx.replyWithPhoto(qrImageUrl, {
      caption: `❇️ *Informasi Deposit Anda* ❇️

🏷️ *» Kode Transaksi:* \`${transactionId}\`
🏷️ *» Jumlah:* Rp${amountInt.toLocaleString('id-ID')}
🏷️ *» Waktu:* ${timestamp}

🏷️ *» Silahkan scan QR berikut untuk membayar melalui QRIS.*
🏷️ *» Expired:* 5 menit dari sekarang`,
      parse_mode: 'Markdown',
    });

    // Simpan ID pesan
    global.pendingDepositsSaweria[transactionId].qrMessageId = qrMessage.message_id;

  } catch (err) {
    logger.error('❌ Gagal proses QRIS Saweria:', err.stack || err);
    await ctx.reply('❌ *Gagal membuat QRIS Saweria.* Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
}

setInterval(async () => {
  try {
    const pending = global.pendingDepositsSaweria || {};
    const transactions = Object.entries(pending);

    if (transactions.length === 0) return;

    for (const [idtrx, dep] of transactions) {
      if (dep.checked) continue;

      const depositAge = Date.now() - dep.created_at;

      // ⏳ Jika sudah lebih dari 5 menit = expired
      if (depositAge > 5 * 60 * 1000) {
        try {
          if (dep.qrMessageId) {
            await bot.telegram.deleteMessage(dep.userId, dep.qrMessageId).catch(e =>
              logger.warn(`Gagal hapus pesan QR expired untuk user ${dep.userId}: ${e.message}`)
            );
          }

          await bot.telegram.sendMessage(dep.userId,
            '❌ *Pembayaran Saweria Expired*\n\nWaktu pembayaran telah habis. Silahkan klik Top Up lagi untuk mendapatkan QR baru.',
            { parse_mode: 'Markdown' }
          );

          logger.info(`Transaksi Saweria ${idtrx} expired untuk user ${dep.userId}`);
        } catch (error) {
          logger.error(`Error saat menangani expired ${idtrx}: ${error.message}`);
        } finally {
          delete global.pendingDepositsSaweria[idtrx];
        }
        continue;
      }

      // ✅ Cek status pembayaran
      try {
        const res = await axios.get(`https://saweria.autsc.my.id/check-payment?idtransaksi=${idtrx}`);
        const data = res.data;

        logger.info(`Respons Saweria check-payment untuk ${idtrx}: ${JSON.stringify(data)}`);

        if (data?.success && data.data?.isPaid) {
          dep.checked = true;

          await updateUserBalance(dep.userId, dep.amount);
          logger.info(`SAWERIA QRIS SUKSES user ${dep.userId} nominal Rp${dep.amount}. Saldo diupdate.`);

          await prosesBonusTopUp(dep.userId, dep.username, dep.amount); // ✅ tunggu bonus masuk
          logTopup(dep.userId, dep.username, dep.amount, 'Saweria');

          const saldoTerbaru = await getUserSaldo(dep.userId);

          const depositData = {
            amount: dep.amount,
            originalAmount: dep.amount,
            bonus: dep.bonus || 0,
            bonus_percent: dep.bonus_percent || 0,
            qrMessageId: dep.qrMessageId
          };

          const success = await sendPaymentSuccessNotificationByUserId(
            dep.userId,
            depositData,
            saldoTerbaru,
            dep.username
          );

          if (success && dep.qrMessageId) {
            await bot.telegram.deleteMessage(dep.userId, dep.qrMessageId).catch(e =>
              logger.warn(`Gagal hapus pesan QR berhasil untuk user ${dep.userId}: ${e.message}`)
            );
          }

          delete global.pendingDepositsSaweria[idtrx];
        }

      } catch (e) {
        logger.error(`Cek pembayaran Saweria error untuk ${idtrx}: ${e.message}`);
      }
    }
  } catch (err) {
    logger.error("❌ ERROR FATAL di polling Saweria:", err);
  }
}, 10000);

bot.command('addserver', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 7) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/addserver <domain> <auth> <harga> <nama_server> <quota> <iplimit> <batas_create_account>`', { parse_mode: 'Markdown' });
  }

  const [domain, auth, harga, nama_server, quota, iplimit, batas_create_akun] = args.slice(1);

  const numberOnlyRegex = /^\d+$/;
  if (!numberOnlyRegex.test(harga) || !numberOnlyRegex.test(quota) || !numberOnlyRegex.test(iplimit) || !numberOnlyRegex.test(batas_create_akun)) {
      return ctx.reply('⚠️ `harga`, `quota`, `iplimit`, dan `batas_create_akun` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  db.run("INSERT INTO Server (domain, auth, harga, nama_server, quota, iplimit, batas_create_akun) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [domain, auth, parseInt(harga), nama_server, parseInt(quota), parseInt(iplimit), parseInt(batas_create_akun)], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat menambahkan server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat menambahkan server.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Server \`${nama_server}\` berhasil ditambahkan.`, { parse_mode: 'Markdown' });
  });
});
bot.command('editharga', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editharga <domain> <harga>`', { parse_mode: 'Markdown' });
  }

  const [domain, harga] = args.slice(1);

  if (!/^\d+$/.test(harga)) {
      return ctx.reply('⚠️ `harga` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE Server SET harga = ? WHERE domain = ?", [parseInt(harga), domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit harga server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit harga server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Harga server \`${domain}\` berhasil diubah menjadi \`${harga}\`.`, { parse_mode: 'Markdown' });
  });
});

bot.command('editnama', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editnama <domain> <nama_server>`', { parse_mode: 'Markdown' });
  }

  const [domain, nama_server] = args.slice(1);

  db.run("UPDATE Server SET nama_server = ? WHERE domain = ?", [nama_server, domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit nama server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit nama server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Nama server \`${domain}\` berhasil diubah menjadi \`${nama_server}\`.`, { parse_mode: 'Markdown' });
  });
});

bot.command('editdomain', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editdomain <old_domain> <new_domain>`', { parse_mode: 'Markdown' });
  }

  const [old_domain, new_domain] = args.slice(1);

  db.run("UPDATE Server SET domain = ? WHERE domain = ?", [new_domain, old_domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit domain server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit domain server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Domain server \`${old_domain}\` berhasil diubah menjadi \`${new_domain}\`.`, { parse_mode: 'Markdown' });
  });
});

bot.command('editauth', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editauth <domain> <auth>`', { parse_mode: 'Markdown' });
  }

  const [domain, auth] = args.slice(1);

  db.run("UPDATE Server SET auth = ? WHERE domain = ?", [auth, domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit auth server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit auth server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Auth server \`${domain}\` berhasil diubah menjadi \`${auth}\`.`, { parse_mode: 'Markdown' });
  });
});

bot.command('editlimitquota', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editlimitquota <domain> <quota>`', { parse_mode: 'Markdown' });
  }

  const [domain, quota] = args.slice(1);

  if (!/^\d+$/.test(quota)) {
      return ctx.reply('⚠️ `quota` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE Server SET quota = ? WHERE domain = ?", [parseInt(quota), domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit quota server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit quota server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Quota server \`${domain}\` berhasil diubah menjadi \`${quota}\`.`, { parse_mode: 'Markdown' });
  });
});

bot.command('editlimitip', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editlimitip <domain> <iplimit>`', { parse_mode: 'Markdown' });
  }

  const [domain, iplimit] = args.slice(1);

  if (!/^\d+$/.test(iplimit)) {
      return ctx.reply('⚠️ `iplimit` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE Server SET iplimit = ? WHERE domain = ?", [parseInt(iplimit), domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit iplimit server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit iplimit server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Iplimit server \`${domain}\` berhasil diubah menjadi \`${iplimit}\`.`, { parse_mode: 'Markdown' });
  });
});

bot.command('editlimitcreate', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/editlimitcreate <domain> <batas_create_akun>`', { parse_mode: 'Markdown' });
  }

  const [domain, batas_create_akun] = args.slice(1);

  if (!/^\d+$/.test(batas_create_akun)) {
      return ctx.reply('⚠️ `batas_create_akun` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE Server SET batas_create_akun = ? WHERE domain = ?", [parseInt(batas_create_akun), domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit batas_create_akun server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit batas_create_akun server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Batas create akun server \`${domain}\` berhasil diubah menjadi \`${batas_create_akun}\`.`, { parse_mode: 'Markdown' });
  });
});
bot.command('edittotalcreate', async (ctx) => {
  const userId = ctx.message.from.id;
  if (!adminIds.includes(userId)) {
      return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 3) {
      return ctx.reply('⚠️ Format salah. Gunakan: `/edittotalcreate <domain> <total_create_akun>`', { parse_mode: 'Markdown' });
  }

  const [domain, total_create_akun] = args.slice(1);

  if (!/^\d+$/.test(total_create_akun)) {
      return ctx.reply('⚠️ `total_create_akun` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE Server SET total_create_akun = ? WHERE domain = ?", [parseInt(total_create_akun), domain], function(err) {
      if (err) {
          logger.error('⚠️ Kesalahan saat mengedit total_create_akun server:', err.message);
          return ctx.reply('⚠️ Kesalahan saat mengedit total_create_akun server.', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
          return ctx.reply('⚠️ Server tidak ditemukan.', { parse_mode: 'Markdown' });
      }

      ctx.reply(`✅ Total create akun server \`${domain}\` berhasil diubah menjadi \`${total_create_akun}\`.`, { parse_mode: 'Markdown' });
  });
});
async function handleServiceAction(ctx, action) {
  let keyboard;

  if (action === 'trial') {
    keyboard = [
      [
        {
          text: '💠 SSH',
          callback_data: 'trial_ssh',
          style: 'primary'
        }
      ],
      [
        {
          text: '💠 Vmess',
          callback_data: 'trial_vmess',
          style: 'primary'
        },
        {
          text: '💠 Vless',
          callback_data: 'trial_vless',
          style: 'primary'
        }
      ],
      [
        {
          text: '💠 Trojan',
          callback_data: 'trial_trojan',
          style: 'primary'
        },
        {
          text: '💠 Shadowsocks',
          callback_data: 'trial_shadowsocks',
          style: 'primary'
        }
      ],
      [
        {
          text: '🔙 Kembali',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ];

  } else if (action === 'create') {
    keyboard = [
      [
        {
          text: '✨ SSH',
          callback_data: 'create_ssh',
          style: 'primary'
        }
      ],
      [
        {
          text: '✨ Vmess',
          callback_data: 'create_vmess',
          style: 'primary'
        },
        {
          text: '✨ Vless',
          callback_data: 'create_vless',
          style: 'primary'
        }
      ],
      [
        {
          text: '✨ Trojan',
          callback_data: 'create_trojan',
          style: 'primary'
        },
        {
          text: '✨ Shadowsocks',
          callback_data: 'create_shadowsocks',
          style: 'primary'
        }
      ],
      [
        {
          text: '🔙 Kembali',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ];

  } else if (action === 'sewascript') {
    keyboard = [
      [
        {
          text: '🥇 Regist IP',
          callback_data: 'sewascript_daftar',
          style: 'primary'
        },
        {
          text: '🥈 Renew IP',
          callback_data: 'sewascript_perpanjang',
          style: 'success'
        }
      ],
      [
        {
          text: '🔙 Kembali',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ];

  } else if (action === 'renew') {
    keyboard = [
      [
        {
          text: '♻️ SSH',
          callback_data: 'renew_ssh',
          style: 'success'
        }
      ],
      [
        {
          text: '♻️ Vmess',
          callback_data: 'renew_vmess',
          style: 'success'
        },
        {
          text: '♻️ Vless',
          callback_data: 'renew_vless',
          style: 'success'
        }
      ],
      [
        {
          text: '♻️ Trojan',
          callback_data: 'renew_trojan',
          style: 'success'
        },
        {
          text: '♻️ Shadowsocks',
          callback_data: 'renew_shadowsocks',
          style: 'success'
        }
      ],
      [
        {
          text: '🔙 Kembali',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ];
  }
  try {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboard
    });
    logger.info(`${action} service menu sent`);
  } catch (error) {
    if (error.response && error.response.error_code === 400) {
      await ctx.reply(`Pilih jenis layanan yang ingin Anda ${action}:`, {
        reply_markup: {
          inline_keyboard: keyboard
        }
      });
      logger.info(`${action} service menu sent as new message`);
    } else {
      logger.error(`Error saat mengirim menu ${action}:`, error);
    }
  }
}

const BUTTON_CONFIG_FILE = './button_config.json';

function loadButtonConfig() {
  try {
    return JSON.parse(fs.readFileSync(BUTTON_CONFIG_FILE, 'utf8'));
  } catch (e) {
    return { topup_saldo: true, topup_saweria: true };
  }
}

function saveButtonConfig(config) {
  fs.writeFileSync(BUTTON_CONFIG_FILE, JSON.stringify(config, null, 2));
}

bot.action('toggle_topup_saldo', async (ctx) => {
    await ctx.answerCbQuery();
    const config = loadButtonConfig();
    config.topup_saldo = !config.topup_saldo;
    saveButtonConfig(config);
    await sendAdminMenu(ctx);
});

bot.action('toggle_topup_pakasir', async (ctx) => {
    await ctx.answerCbQuery();
    const config = loadButtonConfig();
    config.topup_pakasir = !config.topup_pakasir;
    saveButtonConfig(config);
    await sendAdminMenu(ctx);
});

bot.action('toggle_topup_saweria', async (ctx) => {
    await ctx.answerCbQuery();
    const config = loadButtonConfig();
    config.topup_saweria = !config.topup_saweria;
    saveButtonConfig(config);
    await sendAdminMenu(ctx);
});

bot.action(/^toggle_trial_btn_(on|off)$/, async (ctx) => {
  try {
    const match = ctx.match || [];
    const mode = match[1];

    // Log saat tombol diklik
    console.log(`Toggle tombol trial: ${ctx.from.id} ingin ${mode}`);

    if (!adminIds.includes(ctx.from.id)) return;

    const newStatus = mode === 'on' ? 1 : 0;

    db.run('UPDATE ui_config SET show_trial_button = ? WHERE id = 1', [newStatus], async (err) => {
      if (err) {
        logger.error('❌ Gagal update tombol trial:', err.message);
        return await ctx.answerCbQuery('❌ Gagal mengubah status.');
      }

      await ctx.answerCbQuery('✅ Status tombol trial diperbarui.');

      // Hapus pesan admin lama
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
      } catch (e) {}

      // Kirim ulang menu admin
      await sendAdminMenu(ctx);
    });
  } catch (error) {
    logger.error('❌ ERROR toggle_trial_btn:', error.message);
    await ctx.answerCbQuery('❌ Terjadi kesalahan.');
  }
});

bot.action(/toggle_sewascript_btn_(on|off)/, async (ctx) => {
    const action = ctx.match[1]; // "on" atau "off"
    const newValue = action === 'on' ? 1 : 0;

    db.run(`UPDATE ui_config SET show_sewa_script_button = ? WHERE id = 1`, [newValue], function (err) {
        if (err) {
            logger.error('❌ Gagal update show_sewa_script_button:', err.message);
            return ctx.answerCbQuery('Gagal mengubah status tombol.');
        }

        logger.info(`✅ Tombol Sewa Script diubah ke ${newValue === 1 ? 'ON' : 'OFF'}`);
        ctx.answerCbQuery(`Tombol Sewa Script ${newValue === 1 ? 'diaktifkan ✅' : 'dinonaktifkan ❌'}`);
        return sendAdminMenu(ctx); // Refresh tampilan menu admin
    });
});

async function sendAdminMenu(ctx) {
    const config = loadButtonConfig();
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;


    const showTrial = await new Promise((resolve) => {
    db.get('SELECT show_trial_button FROM ui_config WHERE id = 1', (err, row) => {
        if (err) {
            logger.error('❌ Gagal ambil show_trial_button:', err.message);
            return resolve(1);
        }
        if (!row) {
            logger.warn('⚠️ Row kosong untuk show_trial_button!');
            return resolve(1);
        }
        logger.debug(`✅ show_trial_button: ${row.show_trial_button}`);
        resolve(row.show_trial_button === 1 ? 1 : 0);
    });
});

const showSewaScript = await new Promise((resolve) => {
    db.get('SELECT show_sewa_script_button FROM ui_config WHERE id = 1', (err, row) => {
        if (err) {
            logger.error('❌ Gagal ambil show_sewa_script_button:', err.message);
            return resolve(1);
        }
        if (!row) {
            logger.warn('⚠️ Row kosong untuk show_sewa_script_button!');
            return resolve(1);
        }
        logger.debug(`✅ show_sewa_script_button: ${row.show_sewa_script_button}`);
        resolve(row.show_sewa_script_button === 1 ? 1 : 0);
    });
});

const adminKeyboard = [
  [
    {
      text: '✏️ Tambah Server',
      callback_data: 'addserver',
      style: 'primary'
    },
    {
      text: '❌ Hapus Server',
      callback_data: 'deleteserver',
      style: 'danger'
    }
  ],

  [
    {
      text: '💲 Edit Harga',
      callback_data: 'editserver_harga',
      style: 'primary'
    },
    {
      text: '📝 Edit Nama',
      callback_data: 'nama_server_edit',
      style: 'primary'
    }
  ],

  [
    {
      text: '🌐 Edit Domain',
      callback_data: 'editserver_domain',
      style: 'primary'
    },
    {
      text: '🔑 Edit Auth',
      callback_data: 'editserver_auth',
      style: 'primary'
    }
  ],

  [
    {
      text: '📊 Edit Quota',
      callback_data: 'editserver_quota',
      style: 'primary'
    },
    {
      text: '📶 Edit Limit IP',
      callback_data: 'editserver_limit_ip',
      style: 'primary'
    }
  ],

  [
    {
      text: '🔢 Edit Batas Create',
      callback_data: 'editserver_batas_create_akun',
      style: 'primary'
    },
    {
      text: '🔢 Edit Total Create',
      callback_data: 'editserver_total_create_akun',
      style: 'primary'
    }
  ],

  [
    {
      text: '💵 Tambah Saldo',
      callback_data: 'addsaldo_user',
      style: 'success'
    },
    {
      text: '📋 List Server',
      callback_data: 'listserver',
      style: 'primary'
    }
  ],

  [
    {
      text: '♻️ Reset Server',
      callback_data: 'resetdb',
      style: 'danger'
    },
    {
      text: 'ℹ️ Detail Server',
      callback_data: 'detailserver',
      style: 'primary'
    }
  ],

  [
    {
      text: '🎁 Set Bonus TopUp',
      callback_data: 'bonus_topup_setting',
      style: 'success'
    },
    {
      text: '📜 Log Bonus TopUp',
      callback_data: 'log_bonus_topup',
      style: 'primary'
    }
  ],

  [
    {
      text: `${config.topup_saldo ? '✅' : '❌'} Topup QRIS Orkut`,
      callback_data: 'toggle_topup_saldo',
      style: config.topup_saldo ? 'success' : 'danger'
    },
    {
      text: `${config.topup_saweria ? '✅' : '❌'} Topup QRIS Saweria`,
      callback_data: 'toggle_topup_saweria',
      style: config.topup_saweria ? 'success' : 'danger'
    }
  ],

  [
    {
      text: `${showTrial ? '✅' : '❌'} Tombol Trial`,
      callback_data: `toggle_trial_btn_${showTrial ? 'off' : 'on'}`,
      style: showTrial ? 'success' : 'danger'
    },
    {
      text: `${showSewaScript ? '✅' : '❌'} Tombol Sewa Script`,
      callback_data: `toggle_sewascript_btn_${showSewaScript ? 'off' : 'on'}`,
      style: showSewaScript ? 'success' : 'danger'
    }
  ],

  [
    {
      text: '📈 Hasil Penjualan',
      callback_data: 'statistik_penjualan',
      style: 'success'
    },
    {
      text: '📑 Log Topup',
      callback_data: 'log_topup',
      style: 'primary'
    }
  ],

  [
    {
      text: `${config.topup_gopay ? '✅' : '❌'} Topup GoPay`,
      callback_data: 'toggle_topup_gopay',
      style: config.topup_gopay ? 'success' : 'danger'
    },
    {
      text: `💸 Topup Pakasir ${config.topup_pakasir ? '✅' : '❌'}`,
      callback_data: 'toggle_topup_pakasir',
      style: config.topup_pakasir ? 'success' : 'danger'
    }
  ],

  [
    {
      text: '👥 List Reseller',
      callback_data: 'listreseller',
      style: 'primary'
    },
    {
      text: '☁️ Edit CloudFront',
      callback_data: 'edit_cloudfront',
      style: 'primary'
    }
  ],

  [
    {
      text: '📦 Backup Database',
      callback_data: 'backup_database',
      style: 'success'
    },
    {
      text: '♻️ Restore Database',
      callback_data: 'restore_database',
      style: 'danger'
    }
  ],

  [
    {
      text: '🔙 Kembali',
      callback_data: 'send_main_menu',
      style: 'danger'
    }
  ]
];

    const messageText = `
╔════════════════════════╗
║           🏷️ *≡ MENU ADMIN VPN ≡* 🏷️                        ║
╚════════════════════════╝
💸 *» PILIH MENU ADMIN DIBAWAH INI:*  
━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️ TAMBAH SERVER        ❌ HAPUS SERVER
💲 EDIT HARGA               📝 EDIT NAMA
🌐 EDIT DOMAIN             🔑 EDIT AUTH
📊 EDIT QUOTA               📶 EDIT LIMIT IP
🔢 BATAS CREATE           🔢 TOTAL CREATE
💵 TAMBAH SALDO         📋 LIST SERVER
♻️ RESET SERVER           ℹ️ DETAIL SERVER
🎁 BONUS TOPUP           📜 LOG BONUS TOPUP
${config.topup_saldo ? '✅' : '❌'} TOPUP ORKUT           ${config.topup_saweria ? '✅' : '❌'} TOPUP SAWERIA
${showTrial ? '✅' : '❌'} TOMBOL TRIAL          ${showSewaScript ? '✅' : '❌'} TOMBOL SEWA SCRIPT
📈 HASIL PENJUALAN     📑 LOG TOPUP
👥 LIST RESELLER       ${config.topup_gopay ? '✅' : '❌'} TOPUP GOPAY
${config.topup_pakasir ? '✅' : '❌'} TOPUP PAKASIR
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔙 KEMBALI
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;



    // Hapus pesan admin sebelumnya (opsional, jika ingin clean)
    if (typeof lastMenus !== 'undefined' && lastMenus[userId]) {
        try { await ctx.telegram.deleteMessage(chatId, lastMenus[userId]); } catch (e) {}
        delete lastMenus[userId];
    }

    // Jika callback, edit pesan, jika gagal kirim baru
    if (ctx.updateType === 'callback_query') {
        try {
            const sent = await ctx.editMessageText(messageText, {
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: adminKeyboard }
            });
            if (sent?.message_id && typeof lastMenus !== 'undefined') lastMenus[userId] = sent.message_id;
            return sent;
        } catch (error) {
            // Kalau gagal edit, lanjut kirim pesan baru
        }
    }

    // Kirim pesan baru jika bukan callback atau edit gagal
    const sent = await ctx.reply(messageText, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: adminKeyboard }
    });
    if (sent?.message_id && typeof lastMenus !== 'undefined') lastMenus[userId] = sent.message_id;
    return sent;
}
bot.action('toggle_topup_gopay', async (ctx) => {
  await ctx.answerCbQuery();

  const config = loadButtonConfig();

  config.topup_gopay = !config.topup_gopay;

  fs.writeFileSync('./button_config.json', JSON.stringify(config, null, 2));

  await ctx.answerCbQuery(
    `Topup GoPay ${config.topup_gopay ? 'diaktifkan ✅' : 'dimatikan ❌'}`,
    { show_alert: true }
  );

  return sendAdminMenu(ctx);
});
bot.action("edit_cloudfront", async (ctx) => {
  await ctx.answerCbQuery();

  db.all(
    "SELECT id, nama_server FROM Server ORDER BY id ASC",
    async (err, rows) => {
      if (err || !rows.length) {
        return ctx.reply("❌ Server tidak ditemukan.");
      }

      const keyboard = rows.map(server => [
        {
          text: server.nama_server,
          callback_data: `edit_cloudfront_${server.id}`,
          style: "primary"
        }
      ]);

      keyboard.push([
        {
          text: "🔙 Kembali",
          callback_data: "admin_server",
          style: "danger"
        }
      ]);

      await ctx.reply(
        "☁️ Pilih server yang ingin diubah CloudFront-nya:",
        {
          reply_markup: {
            inline_keyboard: keyboard
          }
        }
      );
    }
  );
});
bot.action(/^edit_cloudfront_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const serverId = Number(ctx.match[1]);

  userState[ctx.from.id] = {
    action: "edit_cloudfront",
    serverId
  };

  await ctx.reply(
    "🌐 Kirim domain CloudFront baru.\n\nContoh:\n`d3abc123.cloudfront.net`",
    {
      parse_mode: "Markdown"
    }
  );
});
bot.action('sewascript_daftar', async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
        console.warn("Gagal menghapus pesan sebelumnya:", e.message);
    }

    userState[ctx.from.id] = {
        step: 'sewascript_daftar_pilih_bulan'
    };

    await ctx.reply('📅 Pilih Durasi Sewa Script:', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '1 Bulan 10K',
                        callback_data: 'daftar_1bln',
                        style: 'primary'
                    },
                    {
                        text: '2 Bulan 20K',
                        callback_data: 'daftar_2bln',
                        style: 'primary'
                    },
                    {
                        text: '3 Bulan 30K',
                        callback_data: 'daftar_3bln',
                        style: 'primary'
                    }
                ],
                [
                    {
                        text: '🔙 Kembali',
                        callback_data: 'service_sewascript',
                        style: 'danger'
                    }
                ]
            ]
        }
    });
});
bot.action('sewascript_perpanjang', async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
        console.warn("Gagal menghapus pesan sebelumnya:", e.message);
    }

    userState[ctx.from.id] = {
        step: 'sewascript_perpanjang_pilih_bulan'
    };

    await ctx.reply('📅 Pilih Durasi Perpanjangan Script:', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '1 Bulan 10K',
                        callback_data: 'perpanjang_1bln',
                        style: 'primary'
                    },
                    {
                        text: '2 Bulan 20K',
                        callback_data: 'perpanjang_2bln',
                        style: 'primary'
                    },
                    {
                        text: '3 Bulan 30K',
                        callback_data: 'perpanjang_3bln',
                        style: 'primary'
                    }
                ],
                [
                    {
                        text: '🔙 Kembali',
                        callback_data: 'service_sewascript',
                        style: 'danger'
                    }
                ]
            ]
        }
    });
});
bot.action(/^daftar_(\d+)bln$/, async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.warn('Gagal hapus pesan tombol:', e.message);
  }

  const bulan = parseInt(ctx.match[1]);
  userState[ctx.from.id] = {
    step: 'sewascript_create_input',
    bulan
  };
  await ctx.reply('♂️ *Masukkan username:*', { parse_mode: 'Markdown' });
});

bot.action(/^perpanjang_(\d+)bln$/, async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.warn('Gagal hapus pesan tombol:', e.message);
  }

  const bulan = parseInt(ctx.match[1]);
  userState[ctx.from.id] = {
    step: 'sewascript_perpanjang_ip_manual',
    bulan
  };
  await ctx.reply('🌀 *Masukkan IP yang ingin diperpanjang:*', { parse_mode: 'Markdown' });
});
bot.action('service_sewascript', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (e) {
    logger.warn('answerCbQuery error:', e.message);
  }

  if (!ctx) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }

  await handleServiceAction(ctx, 'sewascript');
});

bot.action('toggle_sewascript_button', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.answerCbQuery('❌ Tidak diizinkan', { show_alert: true });
  }

  db.get('SELECT show_sewa_script_button FROM ui_config WHERE id = 1', (err, row) => {
    if (err) {
      logger.error('❌ Gagal baca tombol sewa script:', err.message);
      return ctx.answerCbQuery('⚠️ Gagal membaca status', { show_alert: true });
    }

    const current = row?.show_sewa_script_button === 1;
    const newStatus = current ? 0 : 1;

    db.run('UPDATE ui_config SET show_sewa_script_button = ? WHERE id = 1', [newStatus], (err) => {
      if (err) {
        logger.error('❌ Gagal update tombol sewa script:', err.message);
        return ctx.answerCbQuery('⚠️ Gagal mengubah status', { show_alert: true });
      }

      const statusText = newStatus === 1 ? '✅ Diaktifkan' : '🚫 Dinonaktifkan';
      ctx.answerCbQuery(`📜 Tombol Sewa Script ${statusText}`, { show_alert: true });

    });
  });
});
bot.action('service_create', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return ctx.reply('Gunakan menu baru.', {
    reply_markup: {
      inline_keyboard: [[{ text: '✏️ Buka Menu Create', callback_data: 'menu_create' }]]
    }
  });
});
bot.action('trial_ssh', async (ctx) => {
  if (!ctx || !ctx.match) { return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' }); }
  await startSelectServer(ctx, 'trial', 'ssh');
});

bot.action('trial_vmess', async (ctx) => {
  if (!ctx || !ctx.match) { return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' }); }
  await startSelectServer(ctx, 'trial', 'vmess');
});

bot.action('trial_vless', async (ctx) => {
  if (!ctx || !ctx.match) { return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' }); }
  await startSelectServer(ctx, 'trial', 'vless');
});

bot.action('trial_trojan', async (ctx) => {
  if (!ctx || !ctx.match) { return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' }); }
  await startSelectServer(ctx, 'trial', 'trojan');
});

bot.action('trial_shadowsocks', async (ctx) => {
  if (!ctx || !ctx.match) { return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' }); }
  await startSelectServer(ctx, 'trial', 'shadowsocks');
});

bot.action('service_trial', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return ctx.reply('Gunakan menu baru.', {
    reply_markup: {
      inline_keyboard: [[{ text: '💠 Buka Menu Trial', callback_data: 'menu_trial' }]]
    }
  });
});

bot.action('service_renew', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return ctx.reply('Gunakan menu baru.', {
    reply_markup: {
      inline_keyboard: [[{ text: '♻️ Buka Menu Renew', callback_data: 'menu_renew' }]]
    }
  });
});

// ==============================================
// 🔙 Handler tombol "Kembali ke Menu Utama"
// ==============================================
bot.action('send_main_menu', async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    await ctx.answerCbQuery();

    // Hapus menu lama kalau ada (biar bersih)
    if (lastMenus[userId]) {
      try {
        await ctx.telegram.deleteMessage(chatId, lastMenus[userId]);
        logger.info(`🧹 Menu lama user ${userId} dihapus (kembali ke menu utama)`);
      } catch (e) {
        // Abaikan error jika pesan sudah hilang
        if (!e.message.includes('message to delete not found')) {
          console.warn(`⚠️ Gagal hapus menu lama user ${userId}:`, e.message);
        }
      }
    }

    // Panggil fungsi menu utama
    const sent = await sendMainMenu(ctx);

    // Simpan ID pesan terakhir biar bisa dihapus di klik berikutnya
    if (sent?.message_id) {
      lastMenus[userId] = sent.message_id;
      logger.info(`✅ Menu utama baru dikirim ke user ${userId}`);
    } else {
      logger.warn(`⚠️ sendMainMenu tidak mengembalikan message_id untuk user ${userId}`);
      await ctx.reply('⚠️ Gagal menampilkan menu utama, coba /menu.');
    }

  } catch (error) {
    logger.error(`❌ Gagal handle tombol send_main_menu untuk user ${userId}:`, error.message);
    await ctx.reply('❌ Terjadi kesalahan saat memuat menu utama.\nSilakan ketik /menu untuk kembali.');
  }
});


bot.action('create_vmess', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'create', 'vmess');
});

bot.action('create_vless', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'create', 'vless');
});

bot.action('create_trojan', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'create', 'trojan');
});

bot.action('create_shadowsocks', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'create', 'shadowsocks');
});

bot.action('create_ssh', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'create', 'ssh');
});

bot.action('renew_vmess', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'renew', 'vmess');
});

bot.action('renew_vless', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'renew', 'vless');
});

bot.action('renew_trojan', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'renew', 'trojan');
});

bot.action('renew_shadowsocks', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'renew', 'shadowsocks');
});

bot.action('renew_ssh', async (ctx) => {
  if (!ctx || !ctx.match) {
    return ctx.reply('❌ *GAGAL!* Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.', { parse_mode: 'Markdown' });
  }
  await startSelectServer(ctx, 'renew', 'ssh');
});
async function startSelectServer(ctx, action, type, page = 0) {
  try {
    logger.info(`Memulai proses ${action} untuk ${type} di halaman ${page + 1}`);

    const userId = ctx.from.id;

    const userRole = await new Promise((resolve, reject) => {
      db.get('SELECT role FROM users WHERE user_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.role : 'member');
      });
    });

    let resellerDiscount = 0;
    if (userRole === 'reseller') {
      resellerDiscount = await new Promise((resolve, reject) => {
        db.get('SELECT discount_percent FROM reseller_config WHERE id = 1', (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.discount_percent : 0);
        });
      });
    }

    db.all('SELECT * FROM Server', [], async (err, servers) => {
      if (err) {
        logger.error('⚠️ Error fetching servers:', err.message);
        return ctx.reply(
          '⚠️ <b>PERHATIAN!</b>\nServer tidak tersedia saat ini. Coba lagi nanti.',
          { parse_mode: 'HTML' }
        );
      }

      if (!servers || servers.length === 0) {
        logger.info('Tidak ada server yang tersedia');
        return ctx.reply(
          '⚠️ <b>PERHATIAN!</b>\nBelum ada server yang tersedia saat ini.',
          { parse_mode: 'HTML' }
        );
      }

      const serversPerPage = 4;
      const totalPages = Math.ceil(servers.length / serversPerPage);
      const currentPage = Math.min(Math.max(page, 0), totalPages - 1);
      const start = currentPage * serversPerPage;
      const end = start + serversPerPage;
      const currentServers = servers.slice(start, end);

const keyboard = [];

for (const server of currentServers) {
  const totalCreate = Number(server.total_create_akun || 0);
  const batasCreate = Number(server.batas_create_akun || 0);
  const percent = batasCreate > 0
    ? (totalCreate / batasCreate) * 100
    : 0;

  let statusBadge = '🟢';

  if (totalCreate >= batasCreate) {
    statusBadge = '🔴';
  } else if (percent >= 80) {
    statusBadge = '🟡';
  }

  keyboard.push([
    {
      text: `${statusBadge} ${server.nama_server}`,
      callback_data: `${action}_username_${type}_${server.id}`,
      style: 'primary'
    }
  ]);
}

const navButtons = [];

if (totalPages > 1) {

  if (currentPage > 0) {
    navButtons.push({
      text: '⬅️ Prev',
      callback_data: `navigate_${action}_${type}_${currentPage - 1}`,
      style: 'primary'
    });
  }

  navButtons.push({
    text: `📄 ${currentPage + 1}/${totalPages}`,
    callback_data: 'noop',
    style: 'primary'
  });

  if (currentPage < totalPages - 1) {
    navButtons.push({
      text: '➡️ Next',
      callback_data: `navigate_${action}_${type}_${currentPage + 1}`,
      style: 'primary'
    });
  }
}

if (navButtons.length > 0) {
  keyboard.push(navButtons);
}

let backMenu = 'menu_vpn';

if (action === 'trial') {
  backMenu = 'menu_trial';
}

if (action === 'create') {
  backMenu = 'menu_create';
}

if (action === 'renew') {
  backMenu = 'menu_renew';
}

keyboard.push([
  {
    text: '🔙 Kembali',
    callback_data: backMenu,
    style: 'danger'
  }
]);

const actionTitle =
  action === 'trial'
    ? '💠 PILIH SERVER TRIAL'
    : action === 'create'
    ? '✏️ PILIH SERVER CREATE'
    : '♻️ PILIH SERVER RENEW';

const actionDesc =
  action === 'trial'
    ? 'Pilih server untuk uji coba akun'
    : action === 'create'
    ? 'Pilih server untuk membuat akun baru'
    : 'Pilih server untuk memperpanjang akun';

      const typeTitle = String(type || '').toUpperCase();

      const serverList = currentServers.map((server, index) => {
        let hargaPerHariTampilan = Number(server.harga || 0);

        if (userRole === 'reseller' && resellerDiscount > 0) {
          hargaPerHariTampilan = Math.floor(
            hargaPerHariTampilan * (100 - resellerDiscount) / 100
          );
        }

        const hargaPer30HariTampilan = hargaPerHariTampilan * 30;
        const quota = Number(server.quota || 0);
        const iplimit = Number(server.iplimit || 0);
        const totalCreate = Number(server.total_create_akun || 0);
        const batasCreate = Number(server.batas_create_akun || 0);
        const percent = batasCreate > 0 ? (totalCreate / batasCreate) * 100 : 0;

        let statusText = '<b>🟢 READY</b>';
        if (totalCreate >= batasCreate) {
          statusText = '<b>🔴 FULL</b>';
        } else if (percent >= 80) {
          statusText = '<b>🟡 HAMPIR PENUH</b>';
        }

        return `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃ <b>${start + index + 1}. ${server.nama_server}</b>
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🔐 Tipe       : <code>${typeTitle}</code>
┃ 💰 Harga/Hari : <code>Rp${hargaPerHariTampilan.toLocaleString('id-ID')}</code>
┃ 📅 Harga/30Hr : <code>Rp${hargaPer30HariTampilan.toLocaleString('id-ID')}</code>
┃ 🌤️ Quota      : <code>${quota} GB</code>
┃ 🚀 Limit IP   : <code>${iplimit} IP</code>
┃ 👥 Slot       : <code>${totalCreate}/${batasCreate}</code>
┃ 📦 Status     : ${statusText}
┗━━━━━━━━━━━━━━━━━━━━━┛`;
      }).join('\n\n');

      const roleInfo =
        userRole === 'reseller'
          ? `🏆 <b>Role:</b> <code>Reseller</code>\n💸 <b>Diskon:</b> <code>${resellerDiscount}%</code>`
          : `👤 <b>Role:</b> <code>Member</code>`;

      const messageText = `
<blockquote><b>${actionTitle}</b>
<code>${actionDesc}</code></blockquote>

🧾 <b>Informasi Pengguna</b>
${roleInfo}

📄 <b>Halaman:</b> <code>${currentPage + 1} / ${totalPages}</code>
🔎 <b>Tipe Akun:</b> <code>${typeTitle}</code>

${serverList}

<blockquote><code>Tap tombol server di bawah untuk lanjut ke proses berikutnya.</code></blockquote>
`;

      userState[ctx.chat.id] = {
        step: `${action}_username_${type}`,
        page: currentPage
      };

      if (ctx.updateType === 'callback_query') {
        try {
          const msg = ctx.callbackQuery?.message;

          if (msg?.photo) {
  try {
    if (messageText.length > 1000) {
      await ctx.deleteMessage().catch(() => {});

      return await ctx.reply(messageText, {
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: 'HTML'
      });
    }

    await ctx.editMessageCaption(messageText, {
      reply_markup: { inline_keyboard: keyboard },
      parse_mode: 'HTML'
    });
  } catch (err) {
    logger.error(`❌ Edit caption gagal: ${err.message}`);

    return await ctx.reply(messageText, {
      reply_markup: { inline_keyboard: keyboard },
      parse_mode: 'HTML'
    });
  }

} else if (msg?.text) {
  await ctx.editMessageText(messageText, {
    reply_markup: { inline_keyboard: keyboard },
    parse_mode: 'HTML'
  });

} else {
  await ctx.reply(messageText, {
    reply_markup: { inline_keyboard: keyboard },
    parse_mode: 'HTML'
  });
}

        } catch (editError) {
          logger.error(`❌ Gagal edit list server ${action}-${type}: ${editError.message}`);

          await ctx.reply(messageText, {
            reply_markup: { inline_keyboard: keyboard },
            parse_mode: 'HTML'
          });
        }
      } else {
        await ctx.reply(messageText, {
          reply_markup: { inline_keyboard: keyboard },
          parse_mode: 'HTML'
        });
      }
    });
  } catch (error) {
    logger.error(`❌ Error saat memulai proses ${action} untuk ${type}: ${error.message}`);
    await ctx.reply(
      '❌ <b>GAGAL!</b>\nTerjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.',
      { parse_mode: 'HTML' }
    );
  }
}
bot.action('noop', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
});
bot.command('unlimitedtrial', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.reply('❌ Anda tidak memiliki izin.');
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2 || isNaN(args[1])) {
    return ctx.reply('⚠️ Format salah. Gunakan: /unlimitedtrial <user_id>');
  }

  const targetUserId = parseInt(args[1]);

  if (adminIds.includes(targetUserId)) {
    return;
  }

  db.run('INSERT OR IGNORE INTO unlimited_trial_users (user_id) VALUES (?)', [targetUserId], function(err) {
    if (err) {
      logger.error('Gagal menambahkan user unlimited trial:', err.message);
      return ctx.reply('❌ Gagal menambahkan user unlimited trial.');
    }

    ctx.reply(`✅ User \`${targetUserId}\` sekarang bisa trial tanpa batas.`, { parse_mode: 'Markdown' });
  });
});

bot.command('listunlimitedtrial', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) return;

  const page = 1;
  showUnlimitedTrialPage(ctx, page);
});

bot.action(/^unlimitedtrial_(next|prev)_(\d+)$/, async (ctx) => {
  const direction = ctx.match[1];
  let page = parseInt(ctx.match[2]);

  page = direction === 'next' ? page + 1 : page - 1;
  if (page < 1) page = 1;

  await ctx.answerCbQuery();
  showUnlimitedTrialPage(ctx, page, ctx.callbackQuery.message.message_id);
});

// PENTING: GANTI SELURUH FUNGSI showUnlimitedTrialPage() dengan kode di bawah ini.

function showUnlimitedTrialPage(ctx, page = 1, messageId = null) {
  const limit = 10;
  const offset = (page - 1) * limit;

  // Make the callback async to use await
  db.all(`SELECT user_id FROM unlimited_trial_users ORDER BY user_id LIMIT ? OFFSET ?`, [limit, offset], async (err, rows) => {
    if (err) {
      logger.error('❌ Gagal mengambil daftar unlimited trial:', err.message);
      return ctx.reply('❌ Terjadi kesalahan.');
    }

    if (rows.length === 0) {
      return ctx.reply('📭 Tidak ada data pengguna unlimited trial.');
    }

    let text = `📋 *Daftar User Unlimited Trial (Halaman ${page}):*\n\n`;

    for (const [i, row] of rows.entries()) {
      const username = await getUsernameById(row.user_id);
      text += `${offset + i + 1}. 👤 \`@${username}\`\n🆔 \`${row.user_id}\`\n\n`;
    }

    db.get(`SELECT COUNT(*) AS total FROM unlimited_trial_users`, (err, countRow) => {
      const total = countRow?.total || 0;
      const totalPages = Math.ceil(total / limit);

      const buttons = [];
      if (page > 1) buttons.push({ text: '⏮️ Prev', callback_data: `unlimitedtrial_prev_${page}` });
      if (page < totalPages) buttons.push({ text: 'Next ⏭️', callback_data: `unlimitedtrial_next_${page}` });

      const replyOptions = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttons.length ? [buttons] : []
        }
      };

      if (messageId) {
        ctx.telegram.editMessageText(ctx.chat.id, messageId, null, text, replyOptions).catch(() => {});
      } else {
        ctx.reply(text, replyOptions);
      }
    });
  });
}

bot.command('removeunlimitedtrial', (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) return;

  const args = ctx.message.text.split(' ');
  if (args.length !== 2 || isNaN(args[1])) {
    return ctx.reply('⚠️ Format salah. Gunakan: /removeunlimitedtrial <user_id>');
  }

  const targetId = parseInt(args[1]);

  db.run('DELETE FROM unlimited_trial_users WHERE user_id = ?', [targetId], function (err) {
    if (err) {
      logger.error('❌ Gagal menghapus user dari unlimited trial:', err.message);
      return ctx.reply('❌ Gagal menghapus user.');
    }

    if (this.changes === 0) {
      return ctx.reply(`ℹ️ User \`${targetId}\` tidak ditemukan di daftar unlimited.`, { parse_mode: 'Markdown' });
    }

    ctx.reply(`✅ Izin trial unlimited untuk user \`${targetId}\` telah dicabut.`, { parse_mode: 'Markdown' });
  });
});

// [UPDATE: Perintah /setreseller]
bot.command('setreseller', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('⚠️ Format salah. Gunakan: `/setreseller <user_id>`', { parse_mode: 'Markdown' });
  }

  const targetUserId = parseInt(args[1]);
  if (isNaN(targetUserId)) {
    return ctx.reply('⚠️ `user_id` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  if (adminIds.includes(targetUserId)) {
      return ctx.reply('⚠️ Tidak dapat mengubah role admin lain.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE users SET role = 'reseller' WHERE user_id = ?", [targetUserId], function(err) {
    if (err) {
      logger.error('❌ Kesalahan saat mengatur role reseller:', err.message);
      return ctx.reply('❌ Kesalahan saat mengatur role reseller.', { parse_mode: 'Markdown' });
    }
    if (this.changes === 0) {
      return ctx.reply('⚠️ Pengguna tidak ditemukan atau sudah menjadi reseller.', { parse_mode: 'Markdown' });
    }
    ctx.reply(`✅ Pengguna \`${targetUserId}\` berhasil diatur sebagai *Reseller*.`, { parse_mode: 'Markdown' });
    bot.telegram.sendMessage(targetUserId, '🎉 Selamat! Akun Anda telah diupgrade menjadi *Reseller*! Nikmati harga khusus dan fitur reseller.', { parse_mode: 'Markdown' }).catch(e => logger.warn(`Gagal kirim notif reseller ke ${targetUserId}: ${e.message}`));
  });
});

// [UPDATE: Perintah /unsetreseller]
bot.command('unsetreseller', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2) {
    return ctx.reply('⚠️ Format salah. Gunakan: `/unsetreseller <user_id>`', { parse_mode: 'Markdown' });
  }

  const targetUserId = parseInt(args[1]);
  if (isNaN(targetUserId)) {
    return ctx.reply('⚠️ `user_id` harus berupa angka.', { parse_mode: 'Markdown' });
  }

  if (adminIds.includes(targetUserId)) {
      return ctx.reply('⚠️ Tidak dapat mengubah role admin lain.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE users SET role = 'member' WHERE user_id = ?", [targetUserId], function(err) {
    if (err) {
      logger.error('❌ Kesalahan saat mengatur role member:', err.message);
      return ctx.reply('❌ Kesalahan saat mengatur role member.', { parse_mode: 'Markdown' });
    }
    if (this.changes === 0) {
      return ctx.reply('⚠️ Pengguna tidak ditemukan atau sudah menjadi member.', { parse_mode: 'Markdown' });
    }
    ctx.reply(`✅ Pengguna \`${targetUserId}\` berhasil diubah menjadi *Member Biasa*.`, { parse_mode: 'Markdown' });
    bot.telegram.sendMessage(targetUserId, '😔 Informasi: Role akun Anda telah diubah menjadi *Member Biasa*. Jika Anda merasa ini adalah kesalahan, silakan hubungi admin.', { parse_mode: 'Markdown' }).catch(e => logger.warn(`Gagal kirim notif member ke ${targetUserId}: ${e.message}`));
  });
});

// [UPDATE: Perintah /listreseller]
bot.action('listreseller', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    await ctx.answerCbQuery('❌ Anda tidak memiliki izin untuk melihat daftar reseller.', { show_alert: true });
    return;
  }
  await ctx.answerCbQuery();
  await sendPaginatedResellerList(ctx, 1);
});

bot.action(/^listreseller_(next|prev)_(\d+)$/, async (ctx) => {
  const direction = ctx.match[1];
  let page = parseInt(ctx.match[2]);

  page = direction === 'next' ? page + 1 : page - 1;
  if (page < 1) page = 1;

  await ctx.answerCbQuery();
  await sendPaginatedResellerList(ctx, page, ctx.callbackQuery.message.message_id);
});

// COMMAND: /listreseller
// ✅ Command utama: hanya 1 versi
bot.command('listreseller', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.reply('❌ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  logger.info(`[LISTRESELLER] Admin ${userId} meminta daftar reseller halaman 1`);
  await sendPaginatedResellerList(ctx, 1);
});

// ✅ Navigasi tombol next/prev
bot.action(/^listreseller_(next|prev)_(\d+)$/, async (ctx) => {
  const direction = ctx.match[1];
  let page = parseInt(ctx.match[2]);

  page = direction === 'next' ? page + 1 : page - 1;
  if (page < 1) page = 1;

  await ctx.answerCbQuery();
  logger.info(`[LISTRESELLER] Navigasi ke halaman ${page}`);
  await sendPaginatedResellerList(ctx, page, ctx.callbackQuery.message.message_id);
});

async function sendPaginatedResellerList(ctx, page = 1, messageId = null) {
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const resellers = await new Promise((resolve, reject) => {
      db.all(
        `SELECT user_id, saldo FROM users WHERE role = 'reseller' ORDER BY user_id LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    const totalResellers = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) AS count FROM users WHERE role = 'reseller'`,
        (err, row) => (err ? reject(err) : resolve(row.count))
      );
    });

    if (resellers.length === 0) {
      const msg = '📭 Belum ada reseller terdaftar.';
      return messageId
        ? ctx.telegram.editMessageText(ctx.chat.id, messageId, null, msg)
        : ctx.reply(msg);
    }

    let message = `👥 *Daftar Reseller (Halaman ${page}):*\n\n`;
    for (const reseller of resellers) {
      // Panggil fungsi untuk mendapatkan username Telegram
      const username = await getUsernameById(reseller.user_id);
      
      message += `👤 \`@${username}\`\n🆔 \`${reseller.user_id}\`\n💰 Saldo: Rp${(reseller.saldo || 0).toLocaleString('id-ID')}\n\n`;
    }

    const totalPages = Math.ceil(totalResellers / limit);
    const navButtons = [];

if (page > 1) {
  navButtons.push({
    text: '⬅️ Prev',
    callback_data: `listreseller_prev_${page}`,
    style: 'primary'
  });
}

if (page < totalPages) {
  navButtons.push({
    text: 'Next ➡️',
    callback_data: `listreseller_next_${page}`,
    style: 'primary'
  });
}

    const replyOptions = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: navButtons.length > 0 ? [navButtons] : []
      }
    };

    if (messageId) {
      try {
        await ctx.telegram.editMessageText(ctx.chat.id, messageId, null, message, replyOptions);
      } catch (e) {
        logger.error('❌ Gagal editMessageText:', e.stack || e.message || e);
        await ctx.reply(message, replyOptions);
      }
    } else {
      await ctx.reply(message, replyOptions);
    }

  } catch (err) {
    logger.error('❌ Gagal menampilkan daftar reseller:', err.stack || err.message || err);
    await ctx.reply('❌ Terjadi kesalahan saat mengambil daftar reseller.');
  }
}

// [UPDATE: Perintah /setdiskonreseller]
bot.command('setdiskonreseller', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  const args = ctx.message.text.split(' ');
  if (args.length !== 2 || isNaN(args[1]) || parseInt(args[1]) < 0 || parseInt(args[1]) > 100) {
    return ctx.reply('⚠️ Format salah. Gunakan: `/setdiskonreseller <persen>` (angka antara 0-100)', { parse_mode: 'Markdown' });
  }

  const discountPercent = parseInt(args[1]);

  db.run("UPDATE reseller_config SET discount_percent = ? WHERE id = 1", [discountPercent], function(err) {
    if (err) {
      logger.error('❌ Kesalahan saat mengatur diskon reseller:', err.message);
      return ctx.reply('❌ Kesalahan saat mengatur diskon reseller.', { parse_mode: 'Markdown' });
    }
    ctx.reply(`✅ Diskon reseller berhasil diatur menjadi *${discountPercent}%*.`, { parse_mode: 'Markdown' });
  });
});

// [UPDATE: Perintah /resetdiskonreseller]
bot.command('resetdiskonreseller', async (ctx) => {
  const userId = ctx.from.id;
  if (!adminIds.includes(userId)) {
    return ctx.reply('⚠️ Anda tidak memiliki izin untuk menggunakan perintah ini.', { parse_mode: 'Markdown' });
  }

  db.run("UPDATE reseller_config SET discount_percent = 0 WHERE id = 1", function(err) {
    if (err) {
      logger.error('❌ Kesalahan saat mereset diskon reseller:', err.message);
      return ctx.reply('❌ Kesalahan saat mereset diskon reseller.', { parse_mode: 'Markdown' });
    }
    ctx.reply('✅ Diskon reseller berhasil direset menjadi *0%*.', { parse_mode: 'Markdown' });
  });
});


bot.action(/navigate_(\w+)_(\w+)_(\d+)/, async (ctx) => {
  const [, action, type, page] = ctx.match;
  await startSelectServer(ctx, action, type, parseInt(page, 10));
});

bot.action(/^(create|renew|trial)_username_(vmess|vless|trojan|shadowsocks|ssh)_(.+)$/, async (ctx) => {
  await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

  const match = ctx.match || [];
  const action = match[1];
  const type = match[2];
  const serverId = match[3];

  if (!action || !type || !serverId) {
    return ctx.reply('❌ *Perintah tidak dikenali.*', { parse_mode: 'Markdown' });
  }

  if (action === 'trial') {
  const userId = ctx.from.id;
  const today = new Date().toISOString().split('T')[0];

  if (userId == ADMIN) {
    return await handleTrial(ctx, type, serverId);
  }

  db.get('SELECT batas_create_akun, total_create_akun FROM Server WHERE id = ?', [serverId], (err, server) => {
    if (err) {
      logger.error('❌ Error fetching server details:', err.message);
      return ctx.reply('❌ *Terjadi kesalahan saat mengambil detail server.*', { parse_mode: 'Markdown' });
    }

    if (!server) {
      return ctx.reply('❌ *Server tidak ditemukan.*', { parse_mode: 'Markdown' });
    }

    const { batas_create_akun, total_create_akun } = server;

    if (total_create_akun >= batas_create_akun) {
      return ctx.reply('❌ *Server penuh. Trial tidak dapat dibuat di server ini.*', { parse_mode: 'Markdown' });
    }

    db.get('SELECT count FROM TrialLog WHERE user_id = ? AND date = ?', [userId, today], async (err, row) => {
      if (err) {
        logger.error('❌ Error saat cek log trial:', err);
        return ctx.reply('❌ *Terjadi kesalahan saat memproses trial. Silahkan coba lagi nanti.*', { parse_mode: 'Markdown' });
      }

      const trialCount = row?.count || 0;

      db.get('SELECT * FROM unlimited_trial_users WHERE user_id = ?', [userId], async (err, result) => {
        if (err) {
          logger.error('❌ Error cek unlimited trial:', err.message);
          return ctx.reply('❌ Terjadi kesalahan saat memeriksa hak trial.', { parse_mode: 'Markdown' });
        }

        const isUnlimited = result != null;

        if (!isUnlimited && trialCount >= 2) {
          return ctx.reply('⚠️ *Kamu sudah trial hari ini, Gass Order* 😖', { parse_mode: 'Markdown' });
        }

        await handleTrial(ctx, type, serverId);

        if (!isUnlimited) {
          const newCount = trialCount + 1;
          db.run(`
            INSERT INTO TrialLog (user_id, date, count)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET count = ?
          `, [userId, today, newCount, newCount]);
        }
      });
    });
  });

  } else {

    userState[ctx.chat.id] = { step: `username_${action}_${type}`, serverId, type, action };

    db.get('SELECT batas_create_akun, total_create_akun FROM Server WHERE id = ?', [serverId], async (err, server) => {
      if (err) {
        logger.error('⚠️ Error fetching server details:', err.message);
        return ctx.reply('❌ *Terjadi kesalahan saat mengambil detail server.*', { parse_mode: 'Markdown' });
      }

      if (!server) {
        return ctx.reply('❌ *Server tidak ditemukan.*', { parse_mode: 'Markdown' });
      }

      const { batas_create_akun, total_create_akun } = server;

      if (total_create_akun >= batas_create_akun) {
        return ctx.reply('❌ *Server penuh. Tidak dapat membuat akun baru di server ini.*', { parse_mode: 'Markdown' });
      }

      await ctx.reply('👤 *Masukkan username:*', { parse_mode: 'Markdown' });
    });
  }
});

function getUserConfig(userId) {
  return global.userConfigs?.[userId] || null;
}

function removeUserConfig(userId) {
  if (global.userConfigs?.[userId]) {
    delete global.userConfigs[userId];
  }
}
async function handleTrial(ctx, type, serverId) {
  try {
    const username = `trial${Math.floor(Math.random() * 10000)}`;
    const password = Math.random().toString(36).slice(-6);
    const exp = 1;
    const quota = 1;
    const iplimit = 1;

    let result;

    switch (type) {
      case 'vmess':
        result = await trialvmess(username, exp, quota, iplimit, serverId);
        break;

      case 'vless':
        result = await trialvless(username, exp, quota, iplimit, serverId);
        break;

      case 'trojan':
        result = await trialtrojan(username, exp, quota, iplimit, serverId);
        break;

      case 'shadowsocks':
        result = await trialshadowsocks(username, exp, quota, iplimit, serverId);
        break;

      case 'ssh':
        result = await trialssh(username, password, exp, iplimit, serverId);
        break;

      default:
        result = {
          success: false,
          message: '❌ *Tipe layanan tidak dikenali.*'
        };
    }

    if (result.success && result.config) {
      global.userConfigs ??= {};

      global.userConfigs[ctx.from.id] = {
        userId: ctx.from.id,
        username,
        type,
        createdAt: Date.now(),
        ...result.config
      };

      console.log("CONFIG TERSIMPAN:");
      console.log(global.userConfigs[ctx.from.id]);
    }

await ctx.reply(result.message, {
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '📲 HTTP Custom',
          callback_data: 'convert_hc',
          style: 'primary'
        },
        {
          text: '🌐 NetMod',
          callback_data: 'convert_nm',
          style: 'primary'
        }
      ],
      [
        {
          text: '📦 Clash',
          callback_data: 'convert_clash',
          style: 'primary'
        },
        {
          text: '⚡ V2Ray',
          callback_data: 'convert_yaml',
          style: 'primary'
        }
      ],
      [
        {
          text: '❌ Tutup',
          callback_data: 'close_convert',
          style: 'danger'
        }
      ]
    ]
  }
});

  } catch (error) {
    logger.error(`❌ Error trial ${type}:`, error);

    await ctx.reply(
      '❌ *Gagal membuat akun trial. Silahkan coba lagi nanti.*',
      { parse_mode: 'Markdown' }
    );

  } finally {
    delete userState[ctx.chat.id];
  }
}
function kaburMark(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

async function showLoading(ctx) {
  const waitMsg = await ctx.reply("⏳ Mohon menunggu.");

  const dots = [".", "..", "...", " "];
  let i = 0;

  const intervalId = setInterval(async () => {
    i = (i + 1) % dots.length;
    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        waitMsg.message_id,
        null,
        `⏳ Mohon menunggu${dots[i]}`
      );
    } catch (e) {
      clearInterval(intervalId);
    }
  }, 1000);

  return { messageId: waitMsg.message_id, intervalId: intervalId };
}
bot.on("document", async (ctx) => {

    const userId = ctx.from.id;

    if (!adminIds.includes(userId)) return;

    if (!restoreState[userId]) return;

    const file = ctx.message.document;

    if (!file.file_name.endsWith(".db")) {

        restoreState[userId] = false;

        return ctx.reply("❌ File harus .db");

    }

    try {

        await ctx.reply("📥 Mengunduh database...");

        const link = await ctx.telegram.getFileLink(file.file_id);

        const tempFile = path.join(
            BACKUP_DIR,
            "restore.db"
        );

        const writer = fs.createWriteStream(tempFile);

        await new Promise((resolve, reject) => {

            https.get(link, res => {

                res.pipe(writer);

                writer.on("finish", resolve);

                writer.on("error", reject);

            });

        });

        await createDatabaseBackup();

        db.close();

        fs.copyFileSync(
            tempFile,
            FOLDER_TEMPATDB
        );

        restoreState[userId] = false;

        await ctx.reply(
`✅ Database berhasil direstore.

🔄 Restart bot...`
        );

        setTimeout(() => {

            process.exit(0);

        }, 2000);

    } catch (err) {

        restoreState[userId] = false;

        logger.error(err);

        ctx.reply("❌ Restore gagal.");

    }

});
bot.on('text', async (ctx, next) => {
    const userId = ctx.from.id;
    const teks = ctx.message?.text?.trim();
    const state = userState[userId];

    if (typeof teks !== 'string' || teks.length === 0) {
        return;
    }

    if (teks.startsWith('/')) {
        return next();
    }

    console.log(`📩 Input dari ${userId}: ${ctx.message.text}`);
    logger.info(`📩 Input teks dari ${userId}: ${ctx.message.text}`);

if (global.depositState && (
  global.depositState[userId]?.action === 'request_amount_saweria' || 
  global.depositState[userId]?.action === 'request_amount_orkut' ||
  global.depositState[userId]?.action === 'request_amount_gopay' ||
  global.depositState[userId]?.action === 'request_amount_pakasir'
)) {
        const input = ctx.message.text.trim();
        const nominal = parseInt(input.replace(/[^\d]/g, ''), 10);

        if (isNaN(nominal) || nominal < 100) {
            return ctx.reply('❌ *Nominal tidak valid. Minimal Rp100.*', { parse_mode: 'Markdown' });
        }

        const topupAction = global.depositState[userId].action;
        delete global.depositState[userId];

        try {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
        } catch (e) {
            logger.warn(`Gagal menghapus pesan input nominal dari user ${userId}: ${e.message}`);
        }

        if (lastMenus[userId]) {
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, lastMenus[userId]);
            delete lastMenus[userId];
          } catch (e) {
            logger.warn(`Gagal menghapus pesan permintaan nominal awal bot untuk user ${userId}: ${e.message}`);
          }
        }

        if (topupAction === 'request_amount_saweria') {
        await processDepositSaweria(ctx, nominal);

        } else if (topupAction === 'request_amount_orkut') {
         await processDeposit(ctx, nominal);

        } else if (topupAction === 'request_amount_gopay') {
         await processDepositGopay(ctx, nominal);

        } else if (topupAction === 'request_amount_pakasir') {
         await processDepositPakasir(ctx, nominal);
        }
        return;
    }
      // ================================
// SIMPAN CLOUDFRONT
// ================================
if (
  userState[ctx.from.id] &&
  userState[ctx.from.id].action === "edit_cloudfront"
) {
  const cloudfront = ctx.message.text.trim();
  const serverId = userState[ctx.from.id].serverId;

  db.run(
    "UPDATE Server SET cloudfront = ? WHERE id = ?",
    [cloudfront, serverId],
    async (err) => {
      if (err) {
        logger.error("Gagal update CloudFront: " + err.message);
        await ctx.reply("❌ Gagal menyimpan CloudFront.");
      } else {
        await ctx.reply(
          `✅ CloudFront berhasil diperbarui.\n\n☁️ ${cloudfront}`
        );
      }

      delete userState[ctx.from.id];
    }
  );

  return;
}

    if (state && state.step === 'sewascript_create_input') {
        const username = ctx.message.text.trim();

        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            return ctx.reply('❌ *Username tidak valid. Harus 3-20 karakter alfanumerik.*', { parse_mode: 'Markdown' });
        }

        userState[userId] = {
            step: 'sewascript_create_input_ip',
            username,
            bulan: state.bulan
        };

        await ctx.reply('🏷️ *Masukkan IP Address:*', { parse_mode: 'Markdown' });
        return;
    }

    if (state && state.step === 'sewascript_create_input_ip') {
        const ip = ctx.message.text.trim();
        const { username, bulan } = state;

        if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
            return ctx.reply('❌ *Format IP tidak valid.* Masukkan IP seperti 123.45.67.89', { parse_mode: 'Markdown' });
        }

        const priceharga = 10000 * bulan;

        db.get('SELECT saldo FROM users WHERE user_id = ?', [userId], async (err, user) => {
            if (err || !user) {
                logger.error(`Error mengambil saldo user ${userId} untuk sewa script:`, err?.message);
                return ctx.reply('❌ Terjadi kesalahan mengambil saldo pengguna.', { parse_mode: 'Markdown' });
            }

            if (user.saldo < priceharga) {
                logger.warn(`Saldo user ${userId} tidak cukup (Rp${user.saldo}) untuk sewa script Rp${priceharga}`);
                return ctx.reply('❌ *Saldo Anda tidak cukup.*', { parse_mode: 'Markdown' });
            }

            const { exec } = require('child_process');
            const cmd = `/usr/local/sbin/literegis ${username} ${bulan} ${ip}`;
            logger.info(`Menjalankan perintah sewa script untuk user ${userId}: ${cmd}`);
            const loadingState = await showLoading(ctx);
            const waitMsgId = loadingState.messageId;
            const intervalId = loadingState.intervalId;

            let outputMessage;
            let successScriptAction = false;

            try {
                const { error, stdout, stderr } = await new Promise((resolve) => {
                    exec(cmd, (error, stdout, stderr) => {
                        resolve({ error, stdout, stderr });
                    });
                });

                if (error) {
                    logger.error(`Error saat eksekusi literegis untuk user ${userId}:`, error.message);
                    outputMessage = `❌ Gagal daftar script:\n\n${stderr || error.message}`;
                } else if (/gagal|error/i.test(stdout)) {
                    logger.warn(`Literegis mengembalikan pesan gagal untuk user ${userId}:\n${stdout}`);
                    outputMessage = `❌ Gagal daftar script:\n\n${stdout}`;
                } else {
                    successScriptAction = true;
                    outputMessage = `✅ Pendaftaran IP Berhasil:\n${stdout}`;
                    logger.info(`✅ Literegis berhasil untuk user ${userId}`);
                }
            } catch (e) {
                logger.error(`Exception saat menjalankan literegis untuk user ${userId}:`, e.message);
                outputMessage = `❌ Terjadi kesalahan internal saat memproses pendaftaran script. Silakan coba lagi nanti.`;
            } finally {
                clearInterval(intervalId);
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, waitMsgId);
                } catch (e) {
                    logger.warn(`Gagal menghapus pesan loading untuk user ${userId}: ${e.message}`);
                }
            }

            try {
                await ctx.reply(outputMessage, { parse_mode: 'HTML' });
            } catch (e) {
                logger.error(`Gagal mengirim pesan hasil sewa script untuk user ${userId}:`, e.message);
            }

            if (successScriptAction) {
                db.run('UPDATE users SET saldo = saldo - ? WHERE user_id = ?', [priceharga, userId], (errUpdateSaldo) => {
                    if (errUpdateSaldo) {
                        logger.error('⚠️ Kesalahan saat mengurangi saldo pengguna untuk sewa script (setelah sukses):', errUpdateSaldo.message);
                        bot.telegram.sendMessage(ADMIN, `🚨 *PERHATIAN: SALDO GAGAL DIKURANGI SETELAH SEWA SCRIPT SUKSES!*
User ID: \`${userId}\`
Username TG: \`@${ctx.from.username || 'N/A'}\`
Jenis: Sewa Script
Jumlah: Rp${priceharga.toLocaleString('id-ID')}
Pesan Error: ${errUpdateSaldo.message}
*SCRIPT MUNGKIN SUDAH TERDAFTAR TAPI SALDO BELUM TERPOTONG!*`, { parse_mode: 'Markdown' }).catch(e => logger.error("Gagal kirim notif darurat:", e.message));
                    } else {
                        logger.info(`✅ Saldo Rp${priceharga} berhasil dikurangi untuk user ${userId} (Sewa Script berhasil)`);
                    }
                });
            } else {
                logger.info(`⚠️ Saldo user ${userId} TIDAK dikurangi karena sewa script gagal.`);
            }
        });

        delete userState[userId];
        return;
    }

    if (state && state.step === 'sewascript_perpanjang_ip_manual') {
        const ip = ctx.message.text.trim();
        const bulan = state.bulan;

        if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
            return ctx.reply('❌ *Format IP tidak valid.* Masukkan IP seperti 123.45.67.89', { parse_mode: 'Markdown' });
        }

        const priceharga = 10000 * bulan;

        db.get('SELECT saldo FROM users WHERE user_id = ?', [userId], async (err, user) => {
            if (err || !user) {
                logger.error(`Error mengambil saldo user ${userId} untuk perpanjang script:`, err?.message);
                return ctx.reply('❌ Terjadi kesalahan mengambil saldo pengguna.', { parse_mode: 'Markdown' });
            }

            if (user.saldo < priceharga) {
                logger.warn(`Saldo user ${userId} tidak cukup (Rp${user.saldo}) untuk perpanjang script Rp${priceharga}`);
                return ctx.reply('❌ *Saldo Anda tidak cukup untuk memperpanjang.*', { parse_mode: 'Markdown' });
            }

            const { exec } = require('child_process');
            const jumlahHari = bulan * 30;
            const cmd = `/usr/local/sbin/liteextend ${ip} ${jumlahHari}`;
            logger.info(`Menjalankan perintah perpanjang script untuk user ${userId}: ${cmd}`);
            const loadingState = await showLoading(ctx);
            const waitMsgId = loadingState.messageId;
            const intervalId = loadingState.intervalId;

            let outputMessage;
            let successScriptAction = false;

            try {
                const { error, stdout, stderr } = await new Promise((resolve) => {
                    exec(cmd, (error, stdout, stderr) => {
                        resolve({ error, stdout, stderr });
                    });
                });

                if (error) {
                    logger.error(`Error saat eksekusi liteextend untuk user ${userId}:`, error.message);
                    outputMessage = `❌ Gagal memperpanjang script:\n\n${stderr || error.message}`;
                } else if (/gagal|error/i.test(stdout)) {
                    logger.warn(`Liteextend mengembalikan pesan gagal untuk user ${userId}:\n${stdout}`);
                    outputMessage = `❌ Gagal memperpanjang script:\n\n${stdout}`;
                } else {
                    successScriptAction = true;
                    outputMessage = `✅ Perpanjangan IP Berhasil:\n${stdout}`;
                    logger.info(`✅ Liteextend berhasil untuk user ${userId}`);
                }
            } catch (e) {
                logger.error(`Exception saat menjalankan liteextend untuk user ${userId}:`, e.message);
                outputMessage = `❌ Terjadi kesalahan internal saat memproses perpanjangan script. Silakan coba lagi nanti.`;
            } finally {
                clearInterval(intervalId);
                try {
                    await ctx.telegram.deleteMessage(ctx.chat.id, waitMsgId);
                } catch (e) {
                    logger.warn(`Gagal menghapus pesan loading untuk user ${userId}: ${e.message}`);
                }
            }

            try {
                await ctx.reply(outputMessage, { parse_mode: 'HTML' });
            } catch (e) {
                logger.error(`Gagal mengirim pesan hasil perpanjang script untuk user ${userId}:`, e.message);
            }

            if (successScriptAction) {
                db.run('UPDATE users SET saldo = saldo - ? WHERE user_id = ?', [priceharga, userId], (errUpdateSaldo) => {
                    if (errUpdateSaldo) {
                        logger.error('⚠️ Kesalahan saat mengurangi saldo pengguna untuk perpanjang script (setelah sukses):', errUpdateSaldo.message);
                        bot.telegram.sendMessage(ADMIN, `🚨 *PERHATIAN: SALDO GAGAL DIKURANGI SETELAH PERPANJANG SCRIPT SUKSES!*
User ID: \`${userId}\`
Username TG: \`@${ctx.from.username || 'N/A'}\`
Jenis: Perpanjang Script
Jumlah: Rp${priceharga.toLocaleString('id-ID')}
Pesan Error: ${errUpdateSaldo.message}
*SCRIPT MUNGKIN SUDAH DIPERPANJANG TAPI SALDO BELUM TERPOTONG!*`, { parse_mode: 'Markdown' }).catch(e => logger.error("Gagal kirim notif darurat:", e.message));
                    } else {
                        logger.info(`✅ Saldo Rp${priceharga} berhasil dikurangi untuk user ${userId} (Perpanjang Script berhasil)`);
                    }
                });
            } else {
                logger.info(`⚠️ Saldo user ${userId} TIDAK dikurangi karena perpanjang script gagal.`);
            }
        });

        delete userState[userId];
        return;
    }

if (state && state.step === 'atur_bonus_input') {
    const [status, minStr, persenStr, durasiStr] = ctx.message.text.trim().split(/\s+/);

    const min = parseInt(minStr, 10);
    const persen = parseInt(persenStr, 10);

    if (!status || isNaN(min) || isNaN(persen) || !durasiStr) {
        return ctx.reply(
            '⚠️ Format salah.\n\nGunakan:\n`on|off <minimal_topup> <persen_bonus> <durasi>`\n\nContoh:\n`on 10000 25 7d`\n`on 5000 10 12h`\n`off 0 0 0`',
            { parse_mode: 'Markdown' }
        );
    }

    const enabled = status.toLowerCase() === 'on' ? 1 : 0;

    let duration = 0;

    if (enabled) {
        const match = durasiStr.match(/^(\d+)([mhd])$/i);

        if (!match) {
            return ctx.reply(
                '❌ Format durasi salah.\n\nContoh:\n30m\n12h\n7d'
            );
        }

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 'm':
                duration = value * 60 * 1000;
                break;
            case 'h':
                duration = value * 60 * 60 * 1000;
                break;
            case 'd':
                duration = value * 24 * 60 * 60 * 1000;
                break;
        }
    }

    const startAt = enabled ? Date.now() : 0;
    const endAt = enabled ? startAt + duration : 0;

    db.run(
        `UPDATE bonus_config
         SET enabled = ?,
             min_topup = ?,
             bonus_percent = ?,
             start_at = ?,
             end_at = ?
         WHERE id = 1`,
        [
            enabled,
            min,
            persen,
            startAt,
            endAt
        ],
        (err) => {
            if (err) {
                logger.error('❌ Gagal update bonus config:', err.message);
                return ctx.reply('❌ Gagal menyimpan pengaturan bonus.');
            }

            const selesai = enabled
                ? new Date(endAt).toLocaleString('id-ID')
                : '-';

            ctx.reply(
                `✅ Bonus Top Up *${enabled ? 'Aktif' : 'Nonaktif'}*\n\n` +
                `📌 Minimal Top Up: Rp${min.toLocaleString('id-ID')}\n` +
                `🎁 Bonus: ${persen}%\n` +
                `⏰ Berakhir: ${selesai}`,
                {
                    parse_mode: 'Markdown'
                }
            );

            delete userState[userId];
        }
    );

    return;
}

    if (state && state.step.startsWith('username_')) {
        state.username = ctx.message.text.trim();
        if (!state.username) {
            return ctx.reply('❌ *Username tidak valid. Masukkan username yang valid.*', { parse_mode: 'Markdown' });
        }
        if (state.username.length < 3 || state.username.length > 20) {
            return ctx.reply('❌ *Username harus terdiri dari 3 hingga 20 karakter.*', { parse_mode: 'Markdown' });
        }
        if (/[^a-zA-Z0-9]/.test(state.username)) {
            return ctx.reply('❌ *Username tidak boleh mengandung karakter khusus atau spasi.*', { parse_mode: 'Markdown' });
        }
        const { username, serverId, type, action } = state;
        if (action === 'create') {
            if (type === 'ssh') {
                userState[userId].step = `password_${state.action}_${state.type}`;
                await ctx.reply('🔑 *Masukkan password:*', { parse_mode: 'Markdown' });
            } else {
                userState[userId].step = `exp_${state.action}_${state.type}`;
                await ctx.reply('⏳ *Masukkan masa aktif (hari):*', { parse_mode: 'Markdown' });
            }
        } else if (action === 'renew') {
            userState[userId].step = `exp_${state.action}_${state.type}`;
            await ctx.reply('⏳ *Masukkan masa aktif (hari):*', { parse_mode: 'Markdown' });
        }
        return;
    }

    if (state && state.step.startsWith('password_')) {
        state.password = ctx.message.text.trim();
        if (!state.password) {
            return ctx.reply('❌ *Password tidak valid. Masukkan password yang valid.*', { parse_mode: 'Markdown' });
        }
        if (state.password.length < 1) {
            return ctx.reply('❌ *Password harus terdiri dari minimal 1 karakter.*', { parse_mode: 'Markdown' });
        }
        if (/[^a-zA-Z0-9]/.test(state.password)) {
            return ctx.reply('❌ *Password tidak boleh mengandung karakter khusus atau spasi.*', { parse_mode: 'Markdown' });
        }
        userState[userId].step = `exp_${state.action}_${state.type}`;
        await ctx.reply('⏳ *Masukkan masa aktif (hari):*', { parse_mode: 'Markdown' });
        return;
    }

    if (state && state.step.startsWith('exp_')) {
        const expInput = ctx.message.text.trim();
        if (!/^\d+$/.test(expInput)) {
            return ctx.reply('❌ *Masa aktif tidak valid. Masukkan angka yang valid.*', { parse_mode: 'Markdown' });
        }
        const exp = parseInt(expInput, 10);
        if (isNaN(exp) || exp <= 0) {
            return ctx.reply('❌ *Masa aktif tidak valid. Masukkan angka yang valid.*', { parse_mode: 'Markdown' });
        }
        if (exp > 365) {
            return ctx.reply('❌ *Masa aktif tidak boleh lebih dari 365 hari.*', { parse_mode: 'Markdown' });
        }
        state.exp = exp;

        db.get('SELECT quota, iplimit, harga, nama_server, domain FROM Server WHERE id = ?', [state.serverId], async (err, server) => {
            if (err) {
                logger.error('⚠️ Error fetching server details:', err.message);
                return ctx.reply('❌ *Terjadi kesalahan saat mengambil detail server.*', { parse_mode: 'Markdown' });
            }

            if (!server) {
                return ctx.reply('❌ *Server tidak ditemukan.*', { parse_mode: 'Markdown' });
            }

            const harga = server.harga;
            let totalHarga = harga * state.exp;

            const userRole = await new Promise((resolve) => {
                db.get('SELECT role FROM users WHERE user_id = ?', [userId], (err, row) => {
                    resolve(row ? row.role : 'member');
                });
            });

            let resellerDiscount = 0;
            if (userRole === 'reseller') {
                resellerDiscount = await new Promise((resolve) => {
                    db.get('SELECT discount_percent FROM reseller_config WHERE id = 1', (err, row) => {
                        if (err) reject(err);
                        else resolve(row ? row.discount_percent : 0);
                    });
                });
                totalHarga = Math.floor(totalHarga * (100 - resellerDiscount) / 100);
            }
            //confirm order
      
            db.get('SELECT saldo FROM users WHERE user_id = ?', [userId], async (err, user) => {
                if (err) {
                    logger.error('⚠️ Kesalahan saat mengambil saldo pengguna:', err.message);
                    return ctx.reply('❌ *Terjadi kesalahan saat mengambil saldo pengguna.*', { parse_mode: 'Markdown' });
                }

                if (!user) {
                    return ctx.reply('❌ *Pengguna tidak ditemukan.*', { parse_mode: 'Markdown' });
                }

                const saldo = user.saldo;

                if (saldo < totalHarga) {
                    delete userState[userId];
                    return ctx.reply(`❌ *Saldo Anda tidak mencukupi untuk melakukan transaksi ini. Saldo Anda: Rp${saldo.toLocaleString('id-ID')}, Harga: Rp${totalHarga.toLocaleString('id-ID')}*`, { parse_mode: 'Markdown' });
                }

let result;
let msg;
let successAction = false;
let actionTypeLabel = '';

const loadingState = await showLoading(ctx);
const waitMsgId = loadingState.messageId;
const intervalId = loadingState.intervalId;

try {
    logger.info(`Mencoba ${state.action} ${state.type} untuk user ${userId} di server ${server.nama_server}`);

    if (state.action === 'create') {

        actionTypeLabel = 'Buat Akun';

        switch (state.type) {

            case 'vmess':
                result = await createvmess(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'vless':
                result = await createvless(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'trojan':
                result = await createtrojan(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'shadowsocks':
                result = await createshadowsocks(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'ssh':
                result = await createssh(state.username, state.password, exp, server.iplimit, state.serverId);
                break;

            default:
                result = {
                    success: false,
                    message: '❌ *Tipe layanan tidak dikenali.*'
                };
        }

        msg = typeof result === "string" ? result : result.message;
console.log("RESULT =", result);
console.log("RESULT.DATA =", result?.data);
console.log("CONFIG JSON =", JSON.stringify(result?.data || {}));

if (state.action === "create" && result?.config) {
    global.userConfigs ??= {};

    global.userConfigs[userId] = {
        userId,
        username: state.username,
        type: state.type,
        createdAt: Date.now(),
        ...result.config
    };
}
        console.log("RESULT =", JSON.stringify(result, null, 2));

    } else if (state.action === 'renew') {

        actionTypeLabel = 'Perpanjang Akun';

        switch (state.type) {

            case 'vmess':
                msg = await renewvmess(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'vless':
                msg = await renewvless(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'trojan':
                msg = await renewtrojan(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'shadowsocks':
                msg = await renewshadowsocks(state.username, exp, server.quota, server.iplimit, state.serverId);
                break;

            case 'ssh':
                msg = await renewssh(state.username, exp, server.iplimit, state.serverId);
                break;

            default:
                msg = '❌ *Tipe layanan tidak dikenali.*';
        }
    }

    if (
        (result && result.success) ||
        (typeof msg === 'string' &&
            !msg.toLowerCase().includes('gagal') &&
            !msg.toLowerCase().includes('error'))
    ) {

        successAction = true;

        logger.info(`✅ Aksi ${actionTypeLabel} ${state.type} berhasil untuk user ${userId}.`);

    } else {

        logger.warn(`Aksi ${actionTypeLabel} ${state.type} mengembalikan pesan gagal/error untuk user ${userId}: ${msg}`);

        msg = msg || `❌ Gagal ${actionTypeLabel} akun. Mohon coba lagi atau hubungi admin.`;
    }

} catch (e) {

    logger.error(`Error saat memanggil fungsi ${actionTypeLabel} akun ${state.type} untuk user ${userId}:`, e.message);

    msg = '❌ Terjadi kesalahan internal saat memproses akun Anda. Mohon coba lagi nanti.';
    successAction = false;

} finally {

    clearInterval(intervalId);

    try {
        await ctx.telegram.deleteMessage(ctx.chat.id, waitMsgId);
    } catch (e) {
        logger.warn(`Gagal menghapus pesan loading untuk user ${userId}: ${e.message}`);
    }
}

if (msg && !String(msg).includes('❌')) {

    let configData = result?.data || {};

    if (typeof msg === "string") {

        const username = msg.match(/ᴜꜱᴇʀɴᴀᴍᴇ\s*: `([^`]+)`/i)?.[1];
        const password = msg.match(/ᴘᴀꜱꜱᴡᴏʀᴅ\s*: `([^`]+)`/i)?.[1];
        const domain   = msg.match(/ᴅᴏᴍᴀɪɴ\s*: `([^`]+)`/i)?.[1];

        const uuid   = msg.match(/UUID\s*: `([^`]+)`/i)?.[1];
        const id     = msg.match(/ID\s*: `([^`]+)`/i)?.[1];
        const host   = msg.match(/Host\s*: `([^`]+)`/i)?.[1];
        const path   = msg.match(/Path\s*: `([^`]+)`/i)?.[1];

        const vmess  = msg.match(/vmess:\/\/[^\s`]+/)?.[0];
        const vless  = msg.match(/vless:\/\/[^\s`]+/)?.[0];
        const trojan = msg.match(/trojan:\/\/[^\s`]+/)?.[0];
        const ss     = msg.match(/ss:\/\/[^\s`]+/)?.[0];

        configData = {
            username,
            password,
            domain,
            uuid,
            id,
            host,
            path,
            vmess,
            vless,
            trojan,
            shadowsocks: ss
        };

        if (username) {
            state.username = username;
        }
    }

    await saveOrUpdateUserAccount({
        userId,
        username: state.username,
        serverId: state.serverId,
        serverName: server.nama_server,
        accountType: state.type,
        expDays: state.exp,
        configJson: JSON.stringify(configData)
    });

}

                if (!successAction) {
                    delete userState[userId];
                    return ctx.reply(msg, { parse_mode: 'Markdown' });
                }

                db.run('UPDATE users SET saldo = saldo - ? WHERE user_id = ?', [totalHarga, userId], (err) => {
                    if (err) {
                        logger.error('⚠️ Kesalahan saat mengurangi saldo pengguna (setelah sukses API):', err.message);
                        bot.telegram.sendMessage(ADMIN, `🚨 *PERHATIAN: SALDO GAGAL DIKURANGI!*
User ID: \`${userId}\`
Username TG: \`@${ctx.from.username || 'N/A'}\`
Produk: ${state.type.toUpperCase()}
Jenis: ${actionTypeLabel}
Jumlah: Rp${totalHarga.toLocaleString('id-ID')}
Pesan Error: ${err.message}
*AKUN MUNGKIN SUDAH TERBUAT TAPI SALDO BELUM TERPOTONG!*`, { parse_mode: 'Markdown' }).catch(e => logger.error("Gagal kirim notif darurat:", e.message));

                    } else {
                        logger.info(`✅ Saldo Rp${totalHarga} berhasil dikurangi untuk user ${userId} (${actionTypeLabel} ${state.type})`);
                    }
                });

                db.run('UPDATE Server SET total_create_akun = total_create_akun + 1 WHERE id = ?', [state.serverId], (err) => {
                    if (err) {
                        logger.error('⚠️ Kesalahan saat menambahkan total_create_akun (setelah sukses API):', err.message);
                    }
                });

                const userRoleForLog = await new Promise((resolve) => {
                    db.get('SELECT role FROM users WHERE user_id = ?', [userId], (err, row) => {
                        resolve(row ? row.role : 'member');
                    });
                });

                db.run(`INSERT INTO log_penjualan (
                    user_id,
                    username,
                    nama_server,
                    tipe_akun,
                    harga,
                    masa_aktif_hari,
                    waktu_transaksi,
                    action_type,
                    user_role
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    ctx.from.id,
                    ctx.from.username || '',
                    server.nama_server || 'Unknown',
                    state.type,
                    totalHarga,
                    state.exp,
                    new Date().toISOString(),
                    state.action,
                    userRoleForLog
                ], (err) => {
                    if (err) {
                        logger.warn('⚠️ Gagal mencatat log penjualan (setelah sukses API):', err.message);
                    } else {
                        logger.info(`✅ Log penjualan dicatat: ${ctx.from.id} - ${state.type} - ${state.action} - Rp${totalHarga} - Role: ${userRoleForLog}`);
                    }
                });

await afterAccountTransaction({
    userId: userId,
    username: ctx.from.username,
    produk: state.type.toUpperCase(),
    serverId: state.serverId,
    jenis: actionTypeLabel,
    durasi: state.exp,
    accountUsername: state.username
});

await ctx.reply(msg, {
    parse_mode: 'Markdown',
    reply_markup:
        state.action === "create" && result?.config
            ? {
                inline_keyboard: [
                    [
                        {
                            text: "📲 HTTP Custom",
                            callback_data: "convert_hc",
                            style: "primary"
                        },
                        {
                            text: "🌐 NetMod",
                            callback_data: "convert_nm",
                            style: "primary"
                        }
                    ],
                    [
                        {
                            text: "📦 Clash",
                            callback_data: "convert_clash",
                            style: "primary"
                        },
                        {
                            text: "⚡ V2Ray",
                            callback_data: "convert_yaml",
                            style: "primary"
                        }
                    ],
                    [
                        {
                            text: "❌ Tutup",
                            callback_data: "close_convert",
                            style: "danger"
                        }
                    ]
                ]
            }
            : undefined
});

delete userState[userId];
            });
        });
        return;
    }

    if (state && state.step === 'addserver') {
        const domain = ctx.message.text.trim();
        if (!domain) {
            return ctx.reply('⚠️ *Domain tidak boleh kosong.* Silahkan masukkan domain server yang valid.', { parse_mode: 'Markdown' });
        }
        userState[userId].step = 'addserver_auth';
        userState[userId].domain = domain;
        await ctx.reply('🔑 *Silahkan masukkan auth server:*', { parse_mode: 'Markdown' });
        return;
    } else if (state && state.step === 'addserver_auth') {
        const auth = ctx.message.text.trim();
        if (!auth) {
            return ctx.reply('⚠️ *Auth tidak boleh kosong.* Silahkan masukkan auth server yang valid.', { parse_mode: 'Markdown' });
        }
        userState[userId].step = 'addserver_nama_server';
        userState[userId].auth = auth;
        await ctx.reply('🏷️ *Silahkan masukkan nama server:*', { parse_mode: 'Markdown' });
        return;
    } else if (state && state.step === 'addserver_nama_server') {
        const nama_server = ctx.message.text.trim();
        if (!nama_server) {
            return ctx.reply('⚠️ *Nama server tidak boleh kosong.* Silahkan masukkan nama server yang valid.', { parse_mode: 'Markdown' });
        }
        userState[userId].step = 'addserver_quota';
        userState[userId].nama_server = nama_server;
        await ctx.reply('📊 *Silahkan masukkan quota server:*', { parse_mode: 'Markdown' });
        return;
    } else if (state && state.step === 'addserver_quota') {
        const quota = parseInt(ctx.message.text.trim(), 10);
        if (isNaN(quota)) {
            return ctx.reply('⚠️ *Quota tidak valid.* Silahkan masukkan quota server yang valid.', { parse_mode: 'Markdown' });
        }
        userState[userId].step = 'addserver_iplimit';
        userState[userId].quota = quota;
        await ctx.reply('🔢 *Silahkan masukkan limit IP server:*', { parse_mode: 'Markdown' });
        return;
    } else if (state && state.step === 'addserver_iplimit') {
        const iplimit = parseInt(ctx.message.text.trim(), 10);
        if (isNaN(iplimit)) {
            return ctx.reply('⚠️ *Limit IP tidak valid.* Silahkan masukkan limit IP server yang valid.', { parse_mode: 'Markdown' });
        }
        userState[userId].step = 'addserver_batas_create_akun';
        userState[userId].iplimit = iplimit;
        await ctx.reply('🔢 *Silahkan masukkan batas create akun server:*', { parse_mode: 'Markdown' });
        return;
    } else if (state && state.step === 'addserver_batas_create_akun') {
        const batas_create_akun = parseInt(ctx.message.text.trim(), 10);
        if (isNaN(batas_create_akun)) {
            return ctx.reply('⚠️ *Batas create akun tidak valid.* Silahkan masukkan batas create akun server yang valid.', { parse_mode: 'Markdown' });
        }
        userState[userId].step = 'addserver_harga';
        userState[userId].batas_create_akun = batas_create_akun;
        await ctx.reply('💰 *Silahkan masukkan harga server:*', { parse_mode: 'Markdown' });
        return;
    } else if (state && state.step === 'addserver_harga') {
        const harga = parseFloat(ctx.message.text.trim());
        if (isNaN(harga) || harga <= 0) {
            return ctx.reply('⚠️ *Harga tidak valid.* Silahkan masukkan harga server yang valid.', { parse_mode: 'Markdown' });
        }
        const { domain, auth, nama_server, quota, iplimit, batas_create_akun } = state;

        try {
            db.run('INSERT INTO Server (domain, auth, nama_server, quota, iplimit, batas_create_akun, harga, total_create_akun) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [domain, auth, nama_server, quota, iplimit, batas_create_akun, harga, 0], function(err) {
                    if (err) {
                        logger.error('Error saat menambahkan server:', err.message);
                        ctx.reply('❌ *Terjadi kesalahan saat menambahkan server baru.*', { parse_mode: 'Markdown' });
                    } else {
                        ctx.reply(`✅ *Server baru dengan domain ${domain} telah berhasil ditambahkan.*\n\n📄 *Detail Server:*\n- Domain: ${domain}\n- Auth: ${auth}\n- Nama Server: ${nama_server}\n- Quota: ${quota}\n- Limit IP: ${iplimit}\n- Batas Create Akun: ${batas_create_akun}\n- Harga: Rp ${harga}`, { parse_mode: 'Markdown' });
                    }
                });
        } catch (error) {
            logger.error('Error saat menambahkan server:', error);
            await ctx.reply('❌ *Terjadi kesalahan saat menambahkan server baru.*', { parse_mode: 'Markdown' });
        }
        delete userState[userId];
        return;
    }

    if (state && state.step === 'add_saldo') {
        const amountStr = ctx.message.text.trim();
        const amount = parseInt(amountStr, 10);

        if (isNaN(amount) || amount <= 0) {
            return ctx.reply('⚠️ *Jumlah saldo tidak valid. Masukkan angka positif.*', { parse_mode: 'Markdown' });
        }

        try {

            const targetUserId = state.userId;
            const changes = await new Promise((resolve, reject) => {
                db.run('UPDATE users SET saldo = saldo + ? WHERE user_id = ?', [amount, targetUserId], function(err) {
                    if (err) {
                        logger.error('⚠️ Kesalahan saat menambahkan saldo user:', err.message);
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
            });

            if (changes > 0) {
                ctx.reply(`✅ *Saldo sebesar \`${amount}\` berhasil ditambahkan ke user ID \`${targetUserId}\`.*`, { parse_mode: 'Markdown' });
            } else {
                ctx.reply('⚠️ *Pengguna tidak ditemukan atau saldo tidak berubah.*', { parse_mode: 'Markdown' });
            }
        } catch (err) {
            logger.error('❌ Terjadi kesalahan saat menambahkan saldo user:', err.message);
            ctx.reply('❌ *Terjadi kesalahan saat menambahkan saldo user.*', { parse_mode: 'Markdown' });
        }
        delete userState[userId];
        return;
    }

    const editSteps = ['edit_batas_create_akun', 'edit_limit_ip', 'edit_quota', 'edit_auth', 'edit_domain', 'edit_nama', 'edit_total_create_akun'];
    if (state && editSteps.includes(state.step)) {
        const newValue = ctx.message.text.trim();
        let query;
        let fieldName;
        let isNumeric = false;

        switch (state.step) {
            case 'edit_batas_create_akun':
                query = 'UPDATE Server SET batas_create_akun = ? WHERE id = ?';
                fieldName = 'batas create akun';
                isNumeric = true;
                break;
            case 'edit_limit_ip':
                query = 'UPDATE Server SET iplimit = ? WHERE id = ?';
                fieldName = 'limit IP';
                isNumeric = true;
                break;
            case 'edit_quota':
                query = 'UPDATE Server SET quota = ? WHERE id = ?';
                fieldName = 'quota';
                isNumeric = true;
                break;
            case 'edit_auth':
                query = 'UPDATE Server SET auth = ? WHERE id = ?';
                fieldName = 'auth';
                break;
            case 'edit_domain':
                query = 'UPDATE Server SET domain = ? WHERE id = ?';
                fieldName = 'domain';
                break;
            case 'edit_nama':
                query = 'UPDATE Server SET nama_server = ? WHERE id = ?';
                fieldName = 'nama server';
                break;
            case 'edit_total_create_akun':
                query = 'UPDATE Server SET total_create_akun = ? WHERE id = ?';
                fieldName = 'total create akun';
                isNumeric = true;
                break;
        }

        if (isNumeric && (isNaN(parseInt(newValue, 10)) || parseInt(newValue, 10) < 0)) {
            return ctx.reply(`⚠️ *${fieldName} tidak valid.* Masukkan angka positif yang valid.`, { parse_mode: 'Markdown' });
        }
        if (!newValue) {
            return ctx.reply(`⚠️ *${fieldName} tidak boleh kosong.*`, { parse_mode: 'Markdown' });
        }

        try {
            const valueToStore = isNumeric ? parseInt(newValue, 10) : newValue;
            const changes = await new Promise((resolve, reject) => {
                db.run(query, [valueToStore, state.serverId], function(err) {
                    if (err) {
                        logger.error(`⚠️ Kesalahan saat mengedit ${fieldName} server:`, err.message);
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
            });

            if (changes > 0) {
                ctx.reply(`✅ *${fieldName} server berhasil diubah menjadi \`${newValue}\`.*`, { parse_mode: 'Markdown' });
            } else {
                ctx.reply(`⚠️ *Server tidak ditemukan atau ${fieldName} tidak berubah.*`, { parse_mode: 'Markdown' });
            }
        } catch (error) {
            logger.error(`❌ Error saat mengedit ${fieldName} server:`, error.message);
            ctx.reply(`❌ *Terjadi kesalahan saat mengedit ${fieldName} server.*`, { parse_mode: 'Markdown' });
        }
        delete userState[userId];
        return;
    }

    if (state && state.step === 'edit_harga') {
        const hargaStr = ctx.message.text.trim();
        const hargaBaru = parseFloat(hargaStr);

        if (isNaN(hargaBaru) || hargaBaru <= 0) {
            return ctx.reply('⚠️ *Harga tidak valid. Masukkan angka positif yang valid.*', { parse_mode: 'Markdown' });
        }

        try {
            const changes = await new Promise((resolve, reject) => {
                db.run('UPDATE Server SET harga = ? WHERE id = ?', [hargaBaru, state.serverId], function(err) {
                    if (err) {
                        logger.error('⚠️ Kesalahan saat mengedit harga server:', err.message);
                        reject(err);
                    } else {
                        resolve(this.changes);
                    }
                });
            });

            if (changes > 0) {
                ctx.reply(`✅ *Harga server berhasil diubah menjadi \`Rp${hargaBaru}\`.*`, { parse_mode: 'Markdown' });
            } else {
                ctx.reply('⚠️ *Server tidak ditemukan atau harga tidak berubah.*', { parse_mode: 'Markdown' });
            }
        } catch (error) {
            logger.error('❌ Error saat mengedit harga server:', error.message);
            ctx.reply('❌ *Terjadi kesalahan saat mengedit harga server.*', { parse_mode: 'Markdown' });
        }
        delete userState[userId];
        return;
    }
});
bot.action("close_convert", async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {
    await ctx.answerCbQuery();
  }
});
// ============================================================
// 📲 CONVERT HTTP CUSTOM
// ============================================================

bot.action("convert_hc", async (ctx) => {

    const userId = ctx.from.id;

    try {

        console.log(
            `📲 HC CONVERTER REQUEST | user=${userId}`
        );

        // ----------------------------------------------------
        // CALLBACK RESPONSE
        // ----------------------------------------------------

        await ctx.answerCbQuery(
            "⏳ Membuat file HTTP Custom..."
        );

        // ----------------------------------------------------
        // GET CONFIG
        // ----------------------------------------------------

        const config =
            global.userConfigs?.[userId];

        if (!config) {

            return ctx.reply(
                "❌ *Config akun tidak ditemukan.*\n\n" +
                "Silakan buat akun terlebih dahulu.",
                {
                    parse_mode: "Markdown"
                }
            );

        }

        console.log(
            "📦 HC SOURCE CONFIG:",
            JSON.stringify(
                config,
                null,
                2
            )
        );

        // ----------------------------------------------------
        // VALIDATE
        // ----------------------------------------------------

        if (!config.type) {

            return ctx.reply(
                "❌ Tipe akun tidak ditemukan."
            );

        }

        if (!config.username) {

            return ctx.reply(
                "❌ Username akun tidak ditemukan."
            );

        }

        // ----------------------------------------------------
        // LOADING MESSAGE
        // ----------------------------------------------------

        const loading =
            await ctx.reply(
                "⏳ *Membuat HTTP Custom...*\n\n" +
                `👤 User: \`${config.username}\`\n` +
                `📡 Type: \`${String(config.type).toUpperCase()}\`\n\n` +
                "Mohon tunggu...",
                {
                    parse_mode: "Markdown"
                }
            );

        // ----------------------------------------------------
        // GENERATE HC
        // ----------------------------------------------------

        const result =
            await createHcFile(config);

        console.log(
            "📦 HC RESULT:",
            result
        );

        // ----------------------------------------------------
        // GENERATOR FAILED
        // ----------------------------------------------------

        if (
            !result ||
            !result.success
        ) {

            try {
                await ctx.telegram.deleteMessage(
                    ctx.chat.id,
                    loading.message_id
                );
            } catch {}

            return ctx.reply(
                "❌ *Gagal membuat file HTTP Custom.*\n\n" +
                `📌 ${result?.message || "Unknown error"}`,
                {
                    parse_mode: "Markdown"
                }
            );

        }

        // ----------------------------------------------------
        // CHECK OUTPUT
        // ----------------------------------------------------

        if (
            !result.outputPath ||
            !fs.existsSync(result.outputPath)
        ) {

            try {
                await ctx.telegram.deleteMessage(
                    ctx.chat.id,
                    loading.message_id
                );
            } catch {}

            return ctx.reply(
                "❌ File HC berhasil diproses tetapi file output tidak ditemukan."
            );

        }

        // ----------------------------------------------------
        // DELETE LOADING
        // ----------------------------------------------------

        try {

            await ctx.telegram.deleteMessage(
                ctx.chat.id,
                loading.message_id
            );

        } catch {}

        // ----------------------------------------------------
        // SEND HC
        // ----------------------------------------------------

        await ctx.replyWithDocument(
            {
                source: result.outputPath,
                filename: result.filename
            },
            {
                caption:
                    "╭━━━━━━━━━━━━━━━━━━━━━━╮\n" +
                    "┃ 📲 *HTTP CUSTOM*\n" +
                    "╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n" +

                    `👤 Username : \`${config.username}\`\n` +
                    `📡 Type     : \`${String(config.type).toUpperCase()}\`\n` +
                    `📁 File     : \`${result.filename}\`\n\n` +

                    "✅ *Config HC berhasil dibuat.*\n" +
                    "📲 Silakan import file ini ke HTTP Custom.",
                parse_mode: "Markdown"
            }
        );

        console.log(
            `✅ HC SENT | user=${userId} | file=${result.filename}`
        );

        // ----------------------------------------------------
        // CLEANUP
        // ----------------------------------------------------

        setTimeout(() => {

            deleteHcFile(
                result.outputPath
            );

        }, 5000);

    } catch (error) {

        console.error(
            "❌ HC CONVERTER ERROR:",
            error
        );

        try {

            await ctx.reply(
                "❌ *Terjadi kesalahan saat membuat file HC.*\n\n" +
                `\`${error.message || error}\``,
                {
                    parse_mode: "Markdown"
                }
            );

        } catch {}

    }

});
bot.action("convert_nm", async (ctx) => {

  const config = global.userConfigs?.[ctx.from.id];

  if (!config)
    return ctx.answerCbQuery("Config tidak ditemukan!", {
      show_alert: true
    });

  await ctx.answerCbQuery();

  await ctx.reply("🚧 Convert ke NetMod masih akan kita sambungkan.");
});

bot.action("convert_clash", async (ctx) => {

  const config = global.userConfigs?.[ctx.from.id];

  if (!config)
    return ctx.answerCbQuery("Config tidak ditemukan!", {
      show_alert: true
    });

  await ctx.answerCbQuery();

  const yaml = convertToYaml(config.tls);

  await ctx.replyWithDocument({
    source: Buffer.from(yaml),
    filename: `${config.username}.yaml`
  });

});

bot.action('addserver', async (ctx) => {
  try {
    logger.info('📥 Proses tambah server dimulai');
    await ctx.answerCbQuery();
    await ctx.reply('🌐 *Silahkan masukkan domain/ip server:*', { parse_mode: 'Markdown' });
    userState[ctx.chat.id] = { step: 'addserver' };
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses tambah server:', error);
    await ctx.reply('❌ *GAGAL! Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.*', { parse_mode: 'Markdown' });
  }
});
bot.action('detailserver', async (ctx) => {
  try {
    logger.info('📋 Proses detail server dimulai');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('⚠️ Kesalahan saat mengambil detail server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil detail server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      logger.info('⚠️ Tidak ada server yang tersedia');
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia saat ini.*', { parse_mode: 'Markdown' });
    }

    const buttons = [];
    for (let i = 0; i < servers.length; i += 2) {
      const row = [];
      row.push({
        text: `${servers[i].nama_server}`,
        callback_data: `server_detail_${servers[i].id}`
      });
      if (i + 1 < servers.length) {
        row.push({
          text: `${servers[i + 1].nama_server}`,
          callback_data: `server_detail_${servers[i + 1].id}`
        });
      }
      buttons.push(row);
    }

    await ctx.reply('📋 *Silahkan pilih server untuk melihat detail:*', {
      reply_markup: { inline_keyboard: buttons },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('⚠️ Kesalahan saat mengambil detail server:', error);
    await ctx.reply('⚠️ *Terjadi kesalahan saat mengambil detail server.*', { parse_mode: 'Markdown' });
  }
});

bot.action('listserver', async (ctx) => {
  try {
    logger.info('📜 Proses daftar server dimulai');
    await ctx.answerCbQuery();

    // Ambil role user dan diskon reseller
    const userId = ctx.from.id;
    const userRole = await new Promise((resolve, reject) => {
        db.get('SELECT role FROM users WHERE user_id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.role : 'member');
        });
    });

    let resellerDiscount = 0;
    if (userRole === 'reseller') {
        resellerDiscount = await new Promise((resolve, reject) => {
            db.get('SELECT discount_percent FROM reseller_config WHERE id = 1', (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.discount_percent : 0);
            });
        });
    }
    // End of reseller discount fetch

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('⚠️ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      logger.info('⚠️ Tidak ada server yang tersedia');
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia saat ini.*', { parse_mode: 'Markdown' });
    }

    let serverList = '📜 *Daftar Server* 📜\n\n';
    servers.forEach((server, index) => {
      let hargaPerHariTampilan = server.harga;
      // Terapkan diskon untuk tampilan jika user adalah reseller
      if (userRole === 'reseller' && resellerDiscount > 0) {
          hargaPerHariTampilan = Math.floor(server.harga * (100 - resellerDiscount) / 100);
      }
      const hargaPer30HariTampilan = hargaPerHariTampilan * 30;

      serverList += `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🌏 *${server.nama_server}*\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🏷️ Harga per hari: Rp${hargaPerHariTampilan}\n` + // Menggunakan harga yang disesuaikan
                    `📅 Harga per 30 hari: Rp${hargaPer30HariTampilan}\n` + // Menggunakan harga yang disesuaikan
                    `🌤 Quota: ${server.quota}GB\n` +
                    `🚀 Limit IP: ${server.iplimit} IP\n` +
                    `👥 Total Create Akun: ${server.total_create_akun}/${server.batas_create_akun}\n\n`;
    });

    serverList += `\nTotal Jumlah Server: ${servers.length}`;

    await ctx.reply(serverList, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('⚠️ Kesalahan saat mengambil daftar server:', error);
    await ctx.reply('⚠️ *Terjadi kesalahan saat mengambil daftar server.*', { parse_mode: 'Markdown' });
  }
});
bot.action('resetdb', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('🚨 *PERHATIAN! Anda akan menghapus semua server yang tersedia. Apakah Anda yakin?*', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Ya', callback_data: 'confirm_resetdb' }],
          [{ text: '❌ Tidak', callback_data: 'cancel_resetdb' }]
        ]
      },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Error saat memulai proses reset database:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action('confirm_resetdb', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM Server', (err) => {
        if (err) {
          logger.error('❌ Error saat mereset tabel Server:', err.message);
          return reject('❗️ *PERHATIAN! Terjadi KESALAHAN SERIUS saat mereset database. Harap segera hubungi administrator!*');
        }
        resolve();
      });
    });
    await ctx.reply('🚨 *PERHATIAN! Database telah DIRESET SEPENUHNYA. Semua server telah DIHAPUS TOTAL.*', { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('❌ Error saat mereset database:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action('cancel_resetdb', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('❌ *Proses reset database dibatalkan.*', { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('❌ Error saat membatalkan reset database:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action('deleteserver', async (ctx) => {
  try {
    logger.info('🗑️ Proses hapus server dimulai');
    await ctx.answerCbQuery();

    db.all('SELECT * FROM Server', [], (err, servers) => {
      if (err) {
        logger.error('⚠️ Kesalahan saat mengambil daftar server:', err.message);
        return ctx.reply('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*', { parse_mode: 'Markdown' });
      }

      if (servers.length === 0) {
        logger.info('⚠️ Tidak ada server yang tersedia');
        return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia saat ini.*', { parse_mode: 'Markdown' });
      }

      const keyboard = servers.map(server => {
        return [{ text: server.nama_server, callback_data: `confirm_delete_server_${server.id}` }];
      });
      keyboard.push([{ text: '🔙 Kembali ke Menu Utama', callback_data: 'kembali_ke_menu' }]);

      ctx.reply('🗑️ *Pilih server yang ingin dihapus:*', {
        reply_markup: {
          inline_keyboard: keyboard
        },
        parse_mode: 'Markdown'
      });
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses hapus server:', error);
    await ctx.reply('❌ *GAGAL! Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.*', { parse_mode: 'Markdown' });
  }
});

bot.action('cek_saldo', async (ctx) => {
  try {
    const userId = ctx.from.id;

    const row = await new Promise((resolve, reject) => {
      db.get(
        'SELECT saldo FROM users WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) {
            logger.error(
              '❌ Kesalahan saat memeriksa saldo:',
              err.message
            );

            return reject(
              '❌ *Terjadi kesalahan saat memeriksa saldo Anda. Silahkan coba lagi nanti.*'
            );
          }

          resolve(row);
        }
      );
    });

    if (row) {
      await ctx.reply(
        `📊 *Cek Saldo*\n\n🆔 ID Telegram: ${userId}\n💰 Sisa Saldo: Rp${row.saldo}`,
        {
          parse_mode: 'Markdown',

          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '💸 Top Up',
                  callback_data: 'menu_topup',
                  style: 'success'
                },
                {
                  text: '📝 Menu Utama',
                  callback_data: 'send_main_menu',
                  style: 'primary'
                }
              ]
            ]
          }
        }
      );
    } else {
      await ctx.reply(
        '⚠️ *Anda belum memiliki saldo. Silahkan tambahkan saldo terlebih dahulu.*',
        {
          parse_mode: 'Markdown'
        }
      );
    }

  } catch (error) {
    logger.error(
      '❌ Kesalahan saat memeriksa saldo:',
      error
    );

    await ctx.reply(
      `❌ *${error.message}*`,
      {
        parse_mode: 'Markdown'
      }
    );
  }
});

const getUsernameById = async (userId) => {
  try {
    const telegramUser = await bot.telegram.getChat(userId);
    // Menggunakan template literal untuk mengembalikan '@username' jika ada, atau nama depan
    if (telegramUser.username) {
      return `${telegramUser.username}`;
    } else if (telegramUser.first_name) {
      return telegramUser.first_name;
    } else {
      // Jika tidak ada username maupun nama depan, kembalikan string default
      return 'N/A';
    }
  } catch (err) {
    logger.error(`❌ Kesalahan saat mengambil username dari Telegram untuk ID ${userId}:`, err.message);
    // Kembalikan nilai yang aman (non-error) saat terjadi kesalahan,
    // agar program tidak berhenti.
    return 'N/A';
  }
};

bot.action('addsaldo_user', async (ctx) => {
  try {
    logger.info('Add saldo user process started');
    await ctx.answerCbQuery();

    const users = await new Promise((resolve, reject) => {
      db.all('SELECT id, user_id FROM Users LIMIT 20', [], (err, users) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar user:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar user.*');
        }
        resolve(users);
      });
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Users', [], (err, row) => {
        if (err) {
          logger.error('❌ Kesalahan saat menghitung total user:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat menghitung total user.*');
        }
        resolve(row.count);
      });
    });

    const buttons = [];
    for (let i = 0; i < users.length; i += 2) {
      const row = [];
      const username1 = await getUsernameById(users[i].user_id);
      row.push({
        text: username1 || users[i].user_id,
        callback_data: `add_saldo_${users[i].id}`
      });
      if (i + 1 < users.length) {
        const username2 = await getUsernameById(users[i + 1].user_id);
        row.push({
          text: username2 || users[i + 1].user_id,
          callback_data: `add_saldo_${users[i + 1].id}`
        });
      }
      buttons.push(row);
    }

    const currentPage = 0;
    const replyMarkup = {
      inline_keyboard: [...buttons]
    };

if (totalUsers > 20) {
  replyMarkup.inline_keyboard.push([
    {
      text: '➡️ Next',
      callback_data: `next_users_${currentPage + 1}`,
      style: 'primary'
    }
  ]);
}

    await ctx.reply('📊 *Silahkan pilih user untuk menambahkan saldo:*', {
      reply_markup: replyMarkup,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses tambah saldo user:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action(/next_users_(\d+)/, async (ctx) => {
  const currentPage = parseInt(ctx.match[1]);
  const offset = currentPage * 20;

  try {
    logger.info(`Next users process started for page ${currentPage + 1}`);
    await ctx.answerCbQuery();

    const users = await new Promise((resolve, reject) => {
      db.all(`SELECT id, user_id FROM Users LIMIT 20 OFFSET ${offset}`, [], (err, users) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar user:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar user.*');
        }
        resolve(users);
      });
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Users', [], (err, row) => {
        if (err) {
          logger.error('❌ Kesalahan saat menghitung total user:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat menghitung total user.*');
        }
        resolve(row.count);
      });
    });

    const buttons = [];
    for (let i = 0; i < users.length; i += 2) {
      const row = [];
      const username1 = await getUsernameById(users[i].user_id);
      row.push({
        text: username1 || users[i].user_id,
        callback_data: `add_saldo_${users[i].id}`
      });
      if (i + 1 < users.length) {
        const username2 = await getUsernameById(users[i + 1].user_id);
        row.push({
          text: username2 || users[i + 1].user_id,
          callback_data: `add_saldo_${users[i + 1].id}`
        });
      }
      buttons.push(row);
    }

    const replyMarkup = {
      inline_keyboard: [...buttons]
    };

    const navigationButtons = [];
    if (currentPage > 0) {
      navigationButtons.push([{
        text: '⬅️ Back',
        callback_data: `prev_users_${currentPage - 1}`
      }]);
    }
if (offset + 20 < totalUsers) {
  navigationButtons.push([
    {
      text: '➡️ Next',
      callback_data: `next_users_${currentPage + 1}`,
      style: 'primary'
    }
  ]);
}

    replyMarkup.inline_keyboard.push(...navigationButtons);

    await ctx.editMessageReplyMarkup(replyMarkup);
  } catch (error) {
    logger.error('❌ Kesalahan saat memproses next users:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action(/prev_users_(\d+)/, async (ctx) => {
  const currentPage = parseInt(ctx.match[1]);
  const offset = (currentPage - 1) * 20;

  try {
    logger.info(`Previous users process started for page ${currentPage}`);
    await ctx.answerCbQuery();

    const users = await new Promise((resolve, reject) => {
      db.all(`SELECT id, user_id FROM Users LIMIT 20 OFFSET ${offset}`, [], (err, users) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar user:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar user.*');
        }
        resolve(users);
      });
    });

    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM Users', [], (err, row) => {
        if (err) {
          logger.error('❌ Kesalahan saat menghitung total user:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat menghitung total user.*');
        }
        resolve(row.count);
      });
    });

    const buttons = [];
    for (let i = 0; i < users.length; i += 2) {
      const row = [];
      const username1 = await getUsernameById(users[i].user_id);
      row.push({
        text: username1 || users[i].user_id,
        callback_data: `add_saldo_${users[i].id}`
      });
      if (i + 1 < users.length) {
        const username2 = await getUsernameById(users[i + 1].user_id);
        row.push({
          text: username2 || users[i + 1].user_id,
          callback_data: `add_saldo_${users[i + 1].id}`
        });
      }
      buttons.push(row);
    }

    const replyMarkup = {
      inline_keyboard: [...buttons]
    };

    const navigationButtons = [];
    if (currentPage > 0) {
      navigationButtons.push([{
        text: '⬅️ Back',
        callback_data: `prev_users_${currentPage - 1}`
      }]);
    }
    if (offset + 20 < totalUsers) {
      navigationButtons.push([{
        text: '➡️ Next',
        callback_data: `next_users_${currentPage}`
      }]);
    }

    replyMarkup.inline_keyboard.push(...navigationButtons);

    await ctx.editMessageReplyMarkup(replyMarkup);
  } catch (error) {
    logger.error('❌ Kesalahan saat memproses previous users:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action('editserver_limit_ip', async (ctx) => {
  try {
    logger.info('Edit server limit IP process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_limit_ip_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('📊 *Silahkan pilih server untuk mengedit limit IP:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit limit IP server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action('editserver_batas_create_akun', async (ctx) => {
  try {
    logger.info('Edit server batas create akun process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_batas_create_akun_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('📊 *Silahkan pilih server untuk mengedit batas create akun:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit batas create akun server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action('editserver_total_create_akun', async (ctx) => {
  try {
    logger.info('Edit server total create akun process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_total_create_akun_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('📊 *Silahkan pilih server untuk mengedit total create akun:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit total create akun server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action('editserver_quota', async (ctx) => {
  try {
    logger.info('Edit server quota process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_quota_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('📊 *Silahkan pilih server untuk mengedit quota:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit quota server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});
bot.action('editserver_auth', async (ctx) => {
  try {
    logger.info('Edit server auth process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_auth_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('🌐 *Silahkan pilih server untuk mengedit auth:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit auth server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action('editserver_harga', async (ctx) => {
  try {
    logger.info('Edit server harga process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_harga_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('💰 *Silahkan pilih server untuk mengedit harga:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit harga server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action('editserver_domain', async (ctx) => {
  try {
    logger.info('Edit server domain process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_domain_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('🌐 *Silahkan pilih server untuk mengedit domain:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit domain server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action('nama_server_edit', async (ctx) => {
  try {
    logger.info('Edit server nama process started');
    await ctx.answerCbQuery();

    const servers = await new Promise((resolve, reject) => {
      db.all('SELECT id, nama_server FROM Server', [], (err, servers) => {
        if (err) {
          logger.error('❌ Kesalahan saat mengambil daftar server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil daftar server.*');
        }
        resolve(servers);
      });
    });

    if (servers.length === 0) {
      return ctx.reply('⚠️ *PERHATIAN! Tidak ada server yang tersedia untuk diedit.*', { parse_mode: 'Markdown' });
    }

    const buttons = servers.map(server => ({
      text: server.nama_server,
      callback_data: `edit_nama_${server.id}`
    }));

    const inlineKeyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
      inlineKeyboard.push(buttons.slice(i, i + 2));
    }

    await ctx.reply('🏷️ *Silahkan pilih server untuk mengedit nama:*', {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses edit nama server:', error);
    await ctx.reply(`❌ *${error}*`, { parse_mode: 'Markdown' });
  }
});

bot.action('topup_saldo', async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    await ctx.answerCbQuery();
    logger.info(`🔍 User ${userId} memulai proses top-up saldo (QRIS Orkut).`);

    if (lastMenus[userId]) {
      try {
        await bot.telegram.deleteMessage(chatId, lastMenus[userId]);
        logger.info(`🧹 Menu lama milik ${userId} berhasil dihapus`);
        delete lastMenus[userId];
      } catch (e) {
        console.warn(`⚠️ Gagal menghapus menu sebelumnya untuk ${userId}:`, e.message);
      }
    }

    // ✅ Simpan state bahwa user diminta masukkan nominal untuk QRIS Orkut
    if (!global.depositState) global.depositState = {};
    global.depositState[userId] = { action: 'request_amount_orkut', amount: '' }; // Perubahan di sini

    logger.info(`📝 Menunggu input nominal dari user ${userId} untuk QRIS Orkut`);

// Kirim instruksi ke user untuk mengetik nominal
const sent = await ctx.reply(
`
💳━━━━━━━━━━━━━━━━━━━━💳
        *Qʀɪꜱ Oʀᴋᴜᴛ ᴛᴏᴘ-ᴜᴘ*
💳━━━━━━━━━━━━━━━━━━━━💳

⚡ *ꜱɪʟᴀʜᴋᴀɴ ᴋᴇᴛɪᴋ ɴᴏᴍɪɴᴀʟ ᴛᴏᴘ-ᴜᴘ*  
ʏᴀɴɢ ɪɴɢɪɴ ᴀɴᴅᴀ ʙᴀʏᴀʀᴋᴀɴ ᴍᴇʟᴀʟᴜɪ ᴍᴇᴛᴏᴅᴇ Qʀɪꜱ Oʀᴋᴜᴛ.  

💰 ᴍɪɴɪᴍᴀʟ ᴛᴏᴘ-ᴜᴘ: *Rp 100*  
🧾 ᴄᴏɴᴛᴏʜ: \`10000\`

━━━━━━━━━━━━━━━━━━━━━━━
⌛ ᴋᴇᴍᴜᴅɪᴀɴ ᴛᴜɴɢɢᴜ ᴘʀᴏꜱᴇꜱ ᴏᴛᴏᴍᴀᴛɪꜱ.  
ᴀᴘᴀʙɪʟᴀ ꜱᴀʟᴅᴏ ʙᴇʟᴜᴍ ᴍᴀꜱᴜᴋ,  
ʜᴜʙᴜɴɢɪ ᴀᴅᴍɪɴ ᴅᴇɴɢᴀɴ ʙᴜᴋᴛɪ ᴛʀᴀɴꜱᴀᴋꜱɪ.  
━━━━━━━━━━━━━━━━━━━━━━━
`,
{
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '❌ Batal',
          callback_data: 'send_main_menu',
          style: 'danger'
        }
      ]
    ]
  }
}); // ✅ WAJIB

// ✅ Simpan message_id untuk tracking
if (sent?.message_id) {
  lastMenus[userId] = sent.message_id;
}

return sent;

} catch (error) {
  logger.error(
    '❌ Kesalahan saat memulai top-up saldo (QRIS Orkut):',
    error
  );

  try {
    await ctx.reply(
      '❌ *GAGAL! Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.*',
      {
        parse_mode: 'Markdown'
      }
    );
  } catch (e) {
    logger.error(
      'Gagal kirim pesan error:',
      e.message
    );
  }
}
});
// =========== TOPUP QRIS SAWERIA ===========
bot.action('topup_saweria', async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    await ctx.answerCbQuery();
    logger.info(`🔍 User ${userId} memulai proses top-up saldo.`);

    if (lastMenus[userId]) {
      try {
        await bot.telegram.deleteMessage(chatId, lastMenus[userId]);
        logger.info(`🧹 Menu lama milik ${userId} berhasil dihapus`);
        delete lastMenus[userId];
      } catch (e) {
        console.warn(`⚠️ Gagal menghapus menu sebelumnya untuk ${userId}:`, e.message);
      }
    }

    // ✅ Simpan state bahwa user diminta masukkan nominal
    if (!global.depositState) global.depositState = {};
    global.depositState[userId] = {
      action: 'request_amount_saweria',
      amount: ''
    };

    logger.info(`📝 Menunggu input nominal dari user ${userId}`);

    // Kirim instruksi ke user
    const sent = await ctx.reply(
      '💰 *Silahkan ketik nominal top-up yang ingin Anda bayarkan melalui QRIS Saweria.*\n\nContoh: `1000`',
      { parse_mode: 'Markdown' }
    );

    // Simpan ID pesan agar bisa dihapus nantinya
    if (sent && sent.message_id) {
      lastMenus[userId] = sent.message_id;
    }

  } catch (error) {
    logger.error('❌ Kesalahan saat memulai proses top-up Saweria:', error);
    try {
      await ctx.reply(
        '❌ *GAGAL!* Terjadi kesalahan saat memproses top-up Saweria Anda. Silahkan coba lagi nanti.',
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      logger.error('Gagal kirim pesan error:', e.message);
    }
  }
});


bot.action(/^saweria_nominal_(\d+)$/, async (ctx) => {
  const userId = ctx.from.id;
  const amount = parseInt(ctx.match[1]);

  delete global.depositState[userId];

  await ctx.answerCbQuery();
  await ctx.reply(`🔄 Memproses QRIS Saweria untuk Rp${amount}...`);

  await processDepositSaweria(ctx, amount);
});




bot.action('bonus_topup_setting', async (ctx) => {
    await ctx.answerCbQuery();

    db.get('SELECT * FROM bonus_config WHERE id = 1', (err, row) => {
        if (err || !row) {
            return ctx.reply('❌ Gagal mengambil pengaturan bonus.');
        }

        const mulai = row.start_at
            ? new Date(row.start_at).toLocaleString('id-ID')
            : '-';

        const selesai = row.end_at
            ? new Date(row.end_at).toLocaleString('id-ID')
            : '-';

        ctx.reply(
            `⚙️ *Pengaturan Bonus Top Up*\n\n` +
            `Status: *${row.enabled ? 'Aktif ✅' : 'Nonaktif ❌'}*\n` +
            `Minimal TopUp: *Rp${row.min_topup}*\n` +
            `Bonus: *${row.bonus_percent}%*\n` +
            `Mulai: *${mulai}*\n` +
            `Berakhir: *${selesai}*\n\n` +
            `Klik tombol di bawah ini untuk mengatur:`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔧 Atur Bonus TopUp',
                                callback_data: 'atur_bonus_topup',
                                style: 'success'
                            }
                        ]
                    ]
                }
            }
        );
    });
});


bot.action('atur_bonus_topup', async (ctx) => {
    await ctx.answerCbQuery();

    userState[ctx.chat.id] = {
        step: 'atur_bonus_input'
    };

    await ctx.reply(
`✍️ Kirim format berikut:

on|off minimal bonus durasi

Contoh:
on 10000 25 7d
on 5000 10 12h
off 0 0 0

Keterangan:
m = menit
h = jam
d = hari`,
        {
            parse_mode: 'Markdown'
        }
    );
});

bot.action('log_bonus_topup', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from.id;

  db.all('SELECT * FROM bonus_log ORDER BY id DESC LIMIT 10', [], (err, rows) => {
    if (err || rows.length === 0) {
      return ctx.reply('⚠️ Belum ada data bonus');
    }

    let isi = rows.map((row, i) => {
      const username = row.username ? `\`${row.username}\`` : `\`${row.user_id}\``;
      const formattedTimestamp = new Date(row.timestamp).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      return `━━━━━━━━━━━━━━\n🔹 *${i + 1}*\n👤 User: ${username}\n🆔 ID: \`${row.user_id}\`\n💰 TopUp: *Rp${row.amount}*\n🎁 Bonus: *Rp${row.bonus}*\n⏰ ${formattedTimestamp}`;
    }).join('\n\n');

    // Tambahin garis terakhir di paling bawah
    isi += `\n━━━━━━━━━━━━━━`;

    ctx.reply(`✨ *Riwayat Bonus Top Up*\n_10 Data Terbaru_\n\n${isi}`, {
      parse_mode: 'Markdown'
    });
  });
});

bot.action('log_topup', async (ctx) => {
  await ctx.answerCbQuery();

  db.all('SELECT * FROM topup_log ORDER BY id DESC LIMIT 10', [], (err, rows) => {
    if (err || rows.length === 0) {
      return ctx.reply('⚠️ Belum ada data topup');
    }

    let isi = rows.map((row, i) => {
      const username = row.username ? `\`${row.username}\`` : `\`${row.user_id}\``;
      const formattedTimestamp = new Date(row.waktu).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      return `━━━━━━━━━━━━━━\n🔹 *${i + 1}*\n👤 User: ${username}\n🆔 ID: \`${row.user_id}\`\n💰 TopUp: *Rp${row.amount}*\n⏰ ${formattedTimestamp}`;
    }).join('\n\n');

    // Tambahin garis terakhir di paling bawah
    isi += `\n━━━━━━━━━━━━━━`;

    ctx.reply(`💳 *Riwayat Top Up*\n_10 Data Terbaru_\n\n${isi}`, {
      parse_mode: 'Markdown'
    });
  });
});


function prosesBonusTopUp(user_id, username, original_amount) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM bonus_config WHERE id = 1', (err, config) => {
      if (err || !config) return resolve(); // lanjut aja walaupun gagal

      if (config.enabled && original_amount >= config.min_topup) {
        const bonus = Math.floor(original_amount * config.bonus_percent / 100);

        db.run('UPDATE users SET saldo = saldo + ? WHERE user_id = ?', [bonus, user_id], (err2) => {
          if (err2) return resolve(); // tetap resolve supaya lanjut

          db.run('INSERT INTO bonus_log (user_id, username, amount, bonus, timestamp) VALUES (?, ?, ?, ?, ?)', [
            user_id,
            username || '',
            original_amount,
            bonus,
            new Date().toISOString()
          ], () => {
            // Kirim pesan setelah log bonus
            bot.telegram.sendMessage(user_id, `🎁 *Bonus Top Up!* Kamu dapat saldo tambahan *Rp${bonus}* (${config.bonus_percent}%)`, {
              parse_mode: 'Markdown'
            });
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  });
}

function logTopup(user_id, username, amount, method) {
  db.run(
    'INSERT INTO topup_log (user_id, username, amount, method, waktu) VALUES (?, ?, ?, ?, ?)',
    [
      user_id,
      username || '',
      amount,
      method,
      new Date().toISOString()
    ],
    (err) => {
      if (err) {
        logger.error('❌ Gagal insert ke topup_log:', err.message);
      } else {
        logger.info(`✅ Log Topup: ${user_id} - ${username} - Rp${amount} - ${method}`);
      }
    }
  );
}

bot.action(/edit_harga_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit harga server dengan ID: ${serverId}`);
  userState[ctx.chat.id] = { step: 'edit_harga', serverId: serverId };

  await ctx.reply('💰 *Silahkan masukkan harga server baru:*', {
    reply_markup: { inline_keyboard: keyboard_nomor() },
    parse_mode: 'Markdown'
  });
});
bot.action(/add_saldo_(\d+)/, async (ctx) => {
  const userId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk menambahkan saldo user dengan ID: ${userId}`);
  userState[ctx.chat.id] = { step: 'add_saldo', userId: userId };

  await ctx.reply('📊 *Silahkan masukkan jumlah saldo yang ingin ditambahkan:*', {
    reply_markup: { inline_keyboard: keyboard_nomor() },
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_batas_create_akun_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit batas create akun server dengan ID: ${serverId}`);
  userState[ctx.chat.id] = { step: 'edit_batas_create_akun', serverId: serverId };

  await ctx.reply('📊 *Silahkan masukkan batas create akun server baru:*', {
    reply_markup: { inline_keyboard: keyboard_nomor() },
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_total_create_akun_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit total create akun server dengan ID: ${serverId}`);
  userState[ctx.chat.id] = { step: 'edit_total_create_akun', serverId: serverId };

  await ctx.reply('📊 *Silahkan masukkan total create akun server baru:*', {
    reply_markup: { inline_keyboard: keyboard_nomor() },
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_limit_ip_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit limit IP server dengan ID: ${serverId}`);
  userState[ctx.chat.id] = { step: 'edit_limit_ip', serverId: serverId };

  await ctx.reply('📊 *Silahkan masukkan limit IP server baru:*', {
    reply_markup: { inline_keyboard: keyboard_nomor() },
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_quota_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit quota server dengan ID: ${serverId}`);
  userState[ctx.chat.id] = { step: 'edit_quota', serverId: serverId };

  await ctx.reply('📊 *Silahkan masukkan quota server baru:*', {
    reply_markup: { inline_keyboard: keyboard_nomor() },
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_auth_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit auth server dengan ID: ${serverId}`);

  userState[ctx.chat.id] = {
    step: 'edit_auth',
    serverId: serverId
  };

  await ctx.reply('✏️ *Silahkan kirim auth server baru sekarang:*', {
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_domain_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit domain server dengan ID: ${serverId}`);

  userState[ctx.chat.id] = {
    step: 'edit_domain',
    serverId: serverId
  };

  await ctx.reply('🌐 *Silahkan kirim domain server baru sekarang:*', {
    parse_mode: 'Markdown'
  });
});
bot.action(/edit_nama_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  logger.info(`User ${ctx.from.id} memilih untuk mengedit nama server dengan ID: ${serverId}`);

  userState[ctx.chat.id] = {
    step: 'edit_nama',
    serverId: serverId
  };

  await ctx.reply('🏷️ *Silahkan kirim nama server baru sekarang:*', {
    parse_mode: 'Markdown'
  });
});
bot.action(/confirm_delete_server_(\d+)/, async (ctx) => {
  try {
    db.run('DELETE FROM Server WHERE id = ?', [ctx.match[1]], function(err) {
      if (err) {
        logger.error('Error deleting server:', err.message);
        return ctx.reply('⚠️ *PERHATIAN! Terjadi kesalahan saat menghapus server.*', { parse_mode: 'Markdown' });
      }

      if (this.changes === 0) {
        logger.info('Server tidak ditemukan');
        return ctx.reply('⚠️ *PERHATIAN! Server tidak ditemukan.*', { parse_mode: 'Markdown' });
      }

      logger.info(`Server dengan ID ${ctx.match[1]} berhasil dihapus`);
      ctx.reply('✅ *Server berhasil dihapus.*', { parse_mode: 'Markdown' });
    });
  } catch (error) {
    logger.error('Kesalahan saat menghapus server:', error);
    await ctx.reply('❌ *GAGAL! Terjadi kesalahan saat memproses permintaan Anda. Silahkan coba lagi nanti.*', { parse_mode: 'Markdown' });
  }
});
bot.action(/server_detail_(\d+)/, async (ctx) => {
  const serverId = ctx.match[1];
  try {
    const server = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Server WHERE id = ?', [serverId], (err, server) => {
        if (err) {
          logger.error('⚠️ Kesalahan saat mengambil detail server:', err.message);
          return reject('⚠️ *PERHATIAN! Terjadi kesalahan saat mengambil detail server.*');
        }
        resolve(server);
      });
    });

    if (!server) {
      logger.info('⚠️ Server tidak ditemukan');
      return ctx.reply('⚠️ *PERHATIAN! Server tidak ditemukan.*', { parse_mode: 'Markdown' });
    }

    const serverDetails = `📋 *Detail Server* 📋\n\n` +
      `🌏 *Domain:* \`${server.domain}\`\n` +
      `🔑 *Auth:* \`${server.auth}\`\n` +
      `🏷️ *Nama Server:* \`${server.nama_server}\`\n` +
      `🌤 *Quota:* \`${server.quota}\`\n` +
      `🚀 *Limit IP:* \`${server.iplimit}\`\n` +
      `🔢 *Batas Create Akun:* \`${server.batas_create_akun}\`\n` +
      `📋 *Total Create Akun:* \`${server.total_create_akun}\`\n` +
      `💵 *Harga:* \`Rp ${server.harga}\`\n\n`;

    await ctx.reply(serverDetails, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error('⚠️ Kesalahan saat mengambil detail server:', error);
    await ctx.reply('⚠️ *Terjadi kesalahan saat mengambil detail server.*', { parse_mode: 'Markdown' });
  }
});

bot.on('callback_query', async (ctx) => {
  const userId = ctx.from.id;
  const data = ctx.callbackQuery.data;
  const userStateData = userState[ctx.chat.id];

  await ctx.answerCbQuery();

  console.log("Callback diterima:", data);


  // ===============================
  // 📋 LIST SALDO
  // ===============================
  if (data.startsWith('listsaldo_')) {
    const page = parseInt(data.split('_')[1], 10);
    await sendPaginatedUserSaldo(ctx, page, true);
    return;
  }
  //gopay merchant

  // ===============================
  // 💼 LIST RESELLER
  // ===============================
  if (data.startsWith('listreseller_')) {
    const parts = data.split('_');
    const direction = parts[1];
    let page = parseInt(parts[2]);
    page = direction === 'next' ? page + 1 : page - 1;
    if (page < 1) page = 1;
    await sendPaginatedResellerList(ctx, page, ctx.callbackQuery.message.message_id);
    return;
  }
  


  // ===============================
  // 🧪 LIST UNLIMITED TRIAL
  // ===============================
  if (data.startsWith('listunlimitedtrial_')) {
    const parts = data.split('_');
    const direction = parts[1];
    let page = parseInt(parts[2]);
    page = direction === 'next' ? page + 1 : page - 1;
    if (page < 1) page = 1;
    await showUnlimitedTrialPage(ctx, page, ctx.callbackQuery.message.message_id);
    return;
  }

  // ===============================
  // ⚙️ HANDLER STATE USER
  // ===============================
  if (userStateData) {
    const isNumericInput = !isNaN(parseInt(data, 10)) || data === 'delete' || data === 'confirm';
    const isAlphaNumericInput = /^[a-zA-Z0-9.-]+$/.test(data) || data === 'delete' || data === 'confirm';

    if (
      global.depositState?.[userId] &&
      global.depositState[userId].action === 'request_amount' &&
      isNumericInput
    ) {
      await handleDepositState(ctx, userId, data);
    } else {
      switch (userStateData.step) {
        case 'add_saldo':
          if (isNumericInput) await handleAddSaldo(ctx, userStateData, data);
          break;
        case 'edit_batas_create_akun':
          if (isNumericInput) await handleEditBatasCreateAkun(ctx, userStateData, data);
          break;
        case 'edit_limit_ip':
          if (isNumericInput) await handleEditiplimit(ctx, userStateData, data);
          break;
        case 'edit_quota':
          if (isNumericInput) await handleEditQuota(ctx, userStateData, data);
          break;
        case 'edit_auth':
          if (isAlphaNumericInput) await handleEditAuth(ctx, userStateData, data);
          break;
        case 'edit_domain':
          if (isAlphaNumericInput) await handleEditDomain(ctx, userStateData, data);
          break;
        case 'edit_harga':
          if (isNumericInput) await handleEditHarga(ctx, userStateData, data);
          break;
        case 'edit_nama':
          if (isAlphaNumericInput) await handleEditNama(ctx, userStateData, data);
          break;
        case 'edit_total_create_akun':
          if (isNumericInput) await handleEditTotalCreateAkun(ctx, userStateData, data);
          break;
        default:
          logger.warn(`Unhandled callback_query: ${data} for userState.step: ${userStateData.step}`);
          break;
      }
    }
  }
});



async function handleDepositState(ctx, userId, data) {
  let state = global.depositState[userId];
  if (!state) return;

  let currentAmount = state.amount || '';
  const action = state.action;

  if (data === 'delete') {
    currentAmount = currentAmount.slice(0, -1);
  } else if (data === 'confirm') {
    if (!currentAmount || currentAmount.length === 0) {
      return await ctx.answerCbQuery('⚠️ Jumlah tidak boleh kosong!', { show_alert: true });
    }

    if (parseInt(currentAmount) < 100) {
      return await ctx.answerCbQuery('⚠️ Jumlah minimal top-up adalah 100 Ya Kak...!!!', { show_alert: true });
    }

    // Hapus pesan input nominal
    try {
      await ctx.deleteMessage();
    } catch (e) {
      logger.warn(`⚠️ Gagal menghapus pesan top-up konfirmasi: ${e.message}`);
    }

    // Jalankan proses sesuai jenis topup
    if (action === 'request_amount_saweria') {
      await processDepositSaweria(ctx, currentAmount);
    } else {
      global.depositState[userId].action = 'confirm_amount';
      await processDeposit(ctx, currentAmount);
    }

    // Hapus state
    delete global.depositState[userId];
    return;
  } else {
    const maxDigits = action === 'request_amount_saweria' ? 8 : 12;
    if (currentAmount.length < maxDigits) {
      currentAmount += data;
    } else {
      return await ctx.answerCbQuery(`⚠️ Jumlah maksimal adalah ${maxDigits} digit!`, { show_alert: true });
    }
  }

  global.depositState[userId].amount = currentAmount;

  const newMessage =
    action === 'request_amount_saweria'
      ? `💰 Masukkan nominal topup Saweria QRIS:\n\nNominal saat ini: *Rp${currentAmount}*`
      : `💳 Topup Saldo Otomatis QRIS\n━━━━━━━━━━━━━━━━━━━━━━\nMasukkan nominal topup:\n\nRp ${currentAmount}\n\nMinimal topup Rp 100\n━━━━━━━━━━━━━━━━━━━━━━\nGunakan tombol di bawah untuk input nominal.`;

  try {
    await ctx.editMessageText(newMessage, {
      reply_markup: { inline_keyboard: keyboard_nomor() },
      parse_mode: 'Markdown'
    });
  } catch (error) {
    if (error.description && error.description.includes('message is not modified')) {
      return;
    }
    logger.error('❌ Gagal update pesan nominal top-up:', error);
  }
}



async function handleAddSaldo(ctx, userStateData, data) {
  let currentSaldo = userStateData.saldo || '';

  if (data === 'delete') {
    currentSaldo = currentSaldo.slice(0, -1);
  } else if (data === 'confirm') {
    if (currentSaldo.length === 0) {
      return await ctx.answerCbQuery('⚠️ *Jumlah saldo tidak boleh kosong!*', { show_alert: true });
    }

    try {
      await updateUserSaldo(userStateData.userId, currentSaldo);
      ctx.reply(`✅ *Saldo user berhasil ditambahkan.*\n\n📄 *Detail Saldo:*\n- Jumlah Saldo: *Rp ${currentSaldo}*`, { parse_mode: 'Markdown' });
    } catch (err) {
      ctx.reply('❌ *Terjadi kesalahan saat menambahkan saldo user.*', { parse_mode: 'Markdown' });
    }
    delete userState[ctx.chat.id];
    return;
  } else {
    if (!/^[0-9]+$/.test(data)) {
      return await ctx.answerCbQuery('⚠️ *Jumlah saldo tidak valid!*', { show_alert: true });
    }
    if (currentSaldo.length < 10) {
      currentSaldo += data;
    } else {
      return await ctx.answerCbQuery('⚠️ *Jumlah saldo maksimal adalah 10 karakter!*', { show_alert: true });
    }
  }

  userStateData.saldo = currentSaldo;
  const newMessage = `📊 *Silahkan masukkan jumlah saldo yang ingin ditambahkan:*\n\nJumlah saldo saat ini: *${currentSaldo}*`;
  if (newMessage !== ctx.callbackQuery.message.text) {
    await ctx.editMessageText(newMessage, {
      reply_markup: { inline_keyboard: keyboard_nomor() },
      parse_mode: 'Markdown'
    });
  }
}

async function handleEditBatasCreateAkun(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'batasCreateAkun', 'batas create akun', 'UPDATE Server SET batas_create_akun = ? WHERE id = ?');
}

async function handleEditTotalCreateAkun(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'totalCreateAkun', 'total create akun', 'UPDATE Server SET total_create_akun = ? WHERE id = ?');
}

async function handleEditiplimit(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'iplimit', 'limit IP', 'UPDATE Server SET iplimit = ? WHERE id = ?');
}

async function handleEditQuota(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'quota', 'quota', 'UPDATE Server SET quota = ? WHERE id = ?');
}

async function handleEditAuth(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'auth', 'auth', 'UPDATE Server SET auth = ? WHERE id = ?');
}

async function handleEditDomain(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'domain', 'domain', 'UPDATE Server SET domain = ? WHERE id = ?');
}

async function handleEditHarga(ctx, userStateData, data) {
  let currentAmount = userStateData.amount || '';

  if (data === 'delete') {
    currentAmount = currentAmount.slice(0, -1);
  } else if (data === 'confirm') {
    if (currentAmount.length === 0) {
      return await ctx.answerCbQuery('⚠️ *Jumlah tidak boleh kosong!*', { show_alert: true });
    }
    const hargaBaru = parseFloat(currentAmount);
    if (isNaN(hargaBaru) || hargaBaru <= 0) {
      return ctx.reply('❌ *Harga tidak valid. Masukkan angka yang valid.*', { parse_mode: 'Markdown' });
    }
    try {
      await updateServerField(userStateData.serverId, hargaBaru, 'UPDATE Server SET harga = ? WHERE id = ?');
      ctx.reply(`✅ *Harga server berhasil diupdate.*\n\n📄 *Detail Server:*\n- Harga Baru: *Rp ${hargaBaru}*`, { parse_mode: 'Markdown' });
    } catch (err) {
      ctx.reply('❌ *Terjadi kesalahan saat mengupdate harga server.*', { parse_mode: 'Markdown' });
    }
    delete userState[ctx.chat.id];
    return;
  } else {
    if (!/^\d+$/.test(data)) {
      return await ctx.answerCbQuery('⚠️ *Hanya angka yang diperbolehkan!*', { show_alert: true });
    }
    if (currentAmount.length < 12) {
      currentAmount += data;
    } else {
      return await ctx.answerCbQuery('⚠️ *Jumlah maksimal adalah 12 digit!*', { show_alert: true });
    }
  }

  userStateData.amount = currentAmount;
  const newMessage = `💰 *Silahkan masukkan harga server baru:*\n\nJumlah saat ini: *Rp ${currentAmount}*`;
  if (newMessage !== ctx.callbackQuery.message.text) {
    await ctx.editMessageText(newMessage, {
      reply_markup: { inline_keyboard: keyboard_nomor() },
      parse_mode: 'Markdown'
    });
  }
}

async function handleEditNama(ctx, userStateData, data) {
  await handleEditField(ctx, userStateData, data, 'name', 'nama server', 'UPDATE Server SET nama_server = ? WHERE id = ?');
}

async function handleEditField(ctx, userStateData, data, field, fieldName, query) {
  let currentValue = userStateData[field] || '';

  if (data === 'delete') {
    currentValue = currentValue.slice(0, -1);
  } else if (data === 'confirm') {
    if (currentValue.length === 0) {
      return await ctx.answerCbQuery(`⚠️ *${fieldName} tidak boleh kosong!*`, { show_alert: true });
    }
    try {
      await updateServerField(userStateData.serverId, currentValue, query);
      ctx.reply(`✅ *${fieldName} server berhasil diupdate.*\n\n📄 *Detail Server:*\n- ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}: *${currentValue}*`, { parse_mode: 'Markdown' });
    } catch (err) {
      ctx.reply(`❌ *Terjadi kesalahan saat mengupdate ${fieldName} server.*`, { parse_mode: 'Markdown' });
    }
    delete userState[ctx.chat.id];
    return;
  } else {
    if (!/^[a-zA-Z0-9.-]+$/.test(data)) {
      return await ctx.answerCbQuery(`⚠️ *${fieldName} tidak valid!*`, { show_alert: true });
    }
    if (currentValue.length < 253) {
      currentValue += data;
    } else {
      return await ctx.answerCbQuery(`⚠️ *${fieldName} maksimal adalah 253 karakter!*`, { show_alert: true });
    }
  }

  userStateData[field] = currentValue;
  const newMessage = `📊 *Silahkan masukkan ${fieldName} server baru:*\n\n${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} saat ini: *${currentValue}*`;
  if (newMessage !== ctx.callbackQuery.message.text) {
    await ctx.editMessageText(newMessage, {
      reply_markup: { inline_keyboard: keyboard_nomor() },
      parse_mode: 'Markdown'
    });
  }
}
async function updateUserSaldo(userId, saldo) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE Users SET saldo = saldo + ? WHERE id = ?', [saldo, userId], function (err) {
      if (err) {
        logger.error('⚠️ Kesalahan saat menambahkan saldo user:', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function updateServerField(serverId, value, query) {
  return new Promise((resolve, reject) => {
    db.run(query, [value, serverId], function (err) {
      if (err) {
        logger.error(`⚠️ Kesalahan saat mengupdate server field:`, err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function generateRandomAmount(baseAmount) {
  const random = Math.floor(Math.random() * 99) + 1;
  return baseAmount + random;
}

global.depositState = {};
global.pendingDeposits = {};
let lastRequestTime = 0;
const requestInterval = 1000;

db.all('SELECT * FROM pending_deposits WHERE status = "pending"', [], (err, rows) => {
  if (err) {
    logger.error('Gagal load pending_deposits:', err.message);
    return;
  }
  rows.forEach(row => {
    global.pendingDeposits[row.unique_code] = {
      amount: row.amount,
      originalAmount: row.original_amount,
      userId: row.user_id,
      username: row.username,
      timestamp: row.timestamp,
      status: row.status,
      qrMessageId: row.qr_message_id
    };
  });
  logger.info('Pending deposit loaded:', Object.keys(global.pendingDeposits).length);
});

const config = {
    storeName: NAMA_STORE,
    auth_username: MERCHANT_ID,
    auth_token: API_KEY,
    baseQrString: DATA_QRIS,
    logoPath: 'logo.png'
};

const qris = new QRISGenerator(config, 'theme1');
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function processDepositGopay(ctx, amount) {
  const currentTime = Date.now();
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery().catch(() => {});
    }

    amount = Number(amount);
    if (isNaN(amount) || amount < 100) {
      return ctx.reply('❌ Nominal tidak valid. Minimal Rp 100');
    }

    if (ctx.callbackQuery?.message?.message_id) {
      try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
      } catch (err) {
        console.warn("⚠️ Gagal hapus pesan lama:", err?.message);
      }
    }

    delete userState[chatId];
    if (global.depositState?.[userId]) {
      delete global.depositState[userId];
    }

    if (!global.userRequestTime) global.userRequestTime = {};
    const lastTime = global.userRequestTime[userId] || 0;

    if (currentTime - lastTime < requestInterval) {
      return ctx.reply(
        '⚠️ *Terlalu banyak permintaan. Silakan tunggu sebentar.*',
        { parse_mode: 'Markdown' }
      );
    }

    global.userRequestTime[userId] = currentTime;

    const finalAmount = Number(amount);

    const res = await axios.post(
      GOPAY_GENERATE_API,
      {
        merchant_id: GOPAY_ID,
        amount: finalAmount
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GOPAY_KEY}`
        },
        timeout: 15000
      }
    );

    logger.info(`📦 CREATE GOPAY RAW RESPONSE: ${JSON.stringify(res.data)}`);

    // ✅ lebih fleksibel: kalau API return data di root atau di data
    const payload = res.data?.data || res.data || {};

    const qrImageUrl =
      payload.qr_image ||
      payload.qr_url ||
      payload.qris_url ||
      payload.image ||
      payload.qr ||
      payload.qris;

    const reff =
      payload.issuer_reff ||
      payload.trx_id ||
      payload.reference_id ||
      payload.transaction_id ||
      payload.id ||
      payload.transaction?.id;

    if (!qrImageUrl) {
      throw new Error(`QR image tidak ditemukan dari API GOPAY | response=${JSON.stringify(res.data)}`);
    }

    if (!reff) {
      throw new Error(`Transaction ID / reff tidak ditemukan dari API GOPAY | response=${JSON.stringify(res.data)}`);
    }

    const uniqueCode = `GOPAY-${Date.now()}-${userId}`;
    const safeQrUrl = encodeURI(String(qrImageUrl).trim());

    const caption = [
      `┏━━━━━━━━━━━━━━━━━━━━━┓`,
      `          🏷️*ᴅᴇᴛᴀɪʟ ᴘᴇᴍʙᴀʏᴀʀᴀɴ*🏷️`,
      `┗━━━━━━━━━━━━━━━━━━━━━┛`,
      ``,
      `💵 ɴᴏᴍɪɴᴀʟ: *Rp ${finalAmount}*`,
      `🆔 ʀᴇꜰꜰ: \`${String(reff)}\``,
      `⏳ ʙᴀᴛᴀꜱ ᴡᴀᴋᴛᴜ: *5 ᴍᴇɴɪᴛ*`,
      `⚠️ ᴛʀᴀɴꜱꜰᴇʀ *ʜᴀʀᴜꜱ ꜱᴇꜱᴜᴀɪ ɴᴏᴍɪɴᴀʟ*`,
      ``,
      `✅ ᴘᴇᴍʙᴀʏᴀʀᴀɴ ᴏᴛᴏᴍᴀᴛɪꜱ`,
      `📌 ᴊᴀɴɢᴀɴ ᴛᴜᴛᴜᴘ ʜᴀʟᴀᴍᴀɴ ɪɴɪ`,
      `🔗 [Buka QRIS](${safeQrUrl})`,
      ``,
      `┏━━━━━━━━━━━━━━━━━━━━━┓`,
      `    🌐 ᴅɪᴋᴇʟᴏʟᴀ ᴏʟᴇʜ *ᴀɴꜱᴇɴᴅᴀɴᴛ ɴᴇᴛᴡᴏʀᴋ*`,
      `┗━━━━━━━━━━━━━━━━━━━━━┛`
    ].join('\n');

const qrMessage = await ctx.replyWithPhoto(safeQrUrl, {
  caption,
  parse_mode: 'Markdown',
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: '❌ Batal',
          callback_data: `batal_topup_${uniqueCode}`,
          style: 'danger'
        }
      ]
    ]
  }
});

    if (!global.pendingDeposits) global.pendingDeposits = {};

    global.pendingDeposits[uniqueCode] = {
      userId,
      username: ctx.from.username || `user_${userId}`,
      amount: Number(finalAmount),
      originalAmount: Number(amount),
      timestamp: Date.now(),
      status: 'pending',
      method: 'Qris Gopay',
      reff: String(reff),
      qrMessageId: qrMessage.message_id
    };

    db.run(
      `INSERT INTO pending_deposits
      (unique_code, user_id, username, amount, original_amount, timestamp, status, qr_message_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uniqueCode,
        userId,
        ctx.from.username || `user_${userId}`,
        Number(finalAmount),
        Number(amount),
        Date.now(),
        'pending',
        qrMessage.message_id
      ],
      (err) => {
        if (err) {
          logger.error('❌ Gagal insert pending_deposits GOPAY:', err.message);
        } else {
          logger.info(`✅ Pending GOPAY tersimpan | ${uniqueCode} | reff=${reff}`);
        }
      }
    );

  } catch (error) {
    logger.error('❌ ERROR CREATE GOPAY QRIS:', JSON.stringify(error.response?.data || error.message));

    await ctx.reply(
      `❌ Gagal membuat pembayaran GOPAY.\n\n${error.response?.data?.message || error.message}`,
      { parse_mode: 'Markdown' }
    );
  }
}

async function processDeposit(ctx, amount) {
  const currentTime = Date.now();
  const userId = ctx.from.id;

  // Anti-spam request
  if (global.depositState?.[userId]) {
    return ctx.reply("⚠️ Kamu masih punya transaksi deposit yang belum selesai!");
  }

  if (currentTime - lastRequestTime < requestInterval) {
    return ctx.reply(
      '⚠️ *Terlalu banyak permintaan. Silahkan tunggu sebentar sebelum mencoba lagi.*',
      { parse_mode: 'Markdown' }
    );
  }
  lastRequestTime = currentTime;

  const uniqueCode = `ORKUT-${userId}-✅`;
  const finalAmount = generateRandomAmount(parseInt(amount));
  global.pendingDeposits ??= {};
  global.depositState[userId] = true;

  // Fungsi timeout universal
  const withTimeout = (promise, ms, message = "Waktu tunggu habis") =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
    ]);

  // Fungsi reset aman
  async function resetDepositState() {
    try {
      delete global.depositState?.[userId];
      delete global.pendingDeposits?.[uniqueCode];
      await deletePendingDeposit(uniqueCode).catch(() => {});
    } catch (e) {
      console.error("Gagal reset deposit:", e);
    }
  }

  let waitMsg;
  const start = Date.now();

  try {
    // Pesan loading
    waitMsg = await ctx.reply("⏳ Mohon menunggu...");
    let dots = 0;
    const loading = setInterval(async () => {
      dots = (dots + 1) % 4;
      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          waitMsg.message_id,
          null,
          "⏳ Mohon menunggu" + ".".repeat(dots)
        );
      } catch {
        clearInterval(loading);
      }
    }, 700);

const inlineKeyboard = [
  [
    {
      text: "📢 Join Channel",
      url: `https://t.me/${GROUP_USERNAME}`,
      style: "primary"
    }
  ],
  [
    {
      text: "❌ Batal Topup",
      callback_data: `batal_topup_${uniqueCode}`,
      style: "danger"
    }
  ]
];
// === Generate QRIS ===
let qrString;

try {
  qrString = qris.generateQrString(finalAmount);

  // Tetap generate untuk memastikan QR valid
  await withTimeout(
    qris.generateQRWithLogo(qrString),
    10000,
    "Timeout generate QR"
  );
} catch (err) {
  console.warn("QRIS gagal:", err);
  clearInterval(loading);
  await ctx.reply("❌ Gagal membuat QRIS. Silakan coba lagi nanti.");
  await resetDepositState();
  return;
}

clearInterval(loading);
const nominal = parseInt(amount);
const fee = finalAmount - nominal;

const payment = {
  payment_number: qrString,
  qrString,
  amount: nominal,
  fee,
  total_payment: finalAmount,
  order_id: uniqueCode,
  expired_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
};

const qrisImage = await generateQrisTemplate(payment);

const expiredz = new Date(payment.expired_at).toLocaleString("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const qrMessage = await ctx.replyWithPhoto(
  { source: qrisImage },
  {
    caption: `
┏━━━━━━━━━━━━━━━━━━━━━┓
      🏷️ *ᴅᴇᴛᴀɪʟ ᴘᴇᴍʙᴀʏᴀʀᴀɴ*
┗━━━━━━━━━━━━━━━━━━━━━┛

💰 ɴᴏᴍɪɴᴀʟ ᴛᴏᴘᴜᴘ : *Rp ${Number(payment.amount).toLocaleString("id-ID")}*
💸 ꜰᴇᴇ QRIS       : *Rp ${Number(payment.fee).toLocaleString("id-ID")}*
💵 ᴛᴏᴛᴀʟ ʙᴀʏᴀʀ    : *Rp ${Number(payment.total_payment).toLocaleString("id-ID")}*

🆔 ʀᴇꜰꜰ : \`${payment.order_id}\`
⏳ ᴇxᴘɪʀᴇᴅ : *${expiredz}*

⚠️ ᴛʀᴀɴꜱꜰᴇʀ ʜᴀʀᴜꜱ ꜱᴇꜱᴜᴀɪ *TOTAL BAYAR*
    `,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: inlineKeyboard
    }
  }
);

    try { await ctx.deleteMessage(waitMsg.message_id); } catch {}

    // === Simpan data deposit ke memori & database ===
    global.pendingDeposits[uniqueCode] = {
  transaction_id: uniqueCode,

  amount: nominal,              // Saldo yang masuk
  originalAmount: nominal,
  fee: fee,                     // Kode unik
  total_payment: finalAmount,   // Yang dibayar user

  userId,
  username: ctx.from.username || `user_${userId}`,
  timestamp: Date.now(),
  status: "pending",
  method: "QRIS Orkut",
  qrMessageId: qrMessage.message_id
};

    await insertPendingDeposit(
      uniqueCode,
      userId,
      ctx.from.username || `user_${userId}`,
      nominal,
      nominal,
      qrMessage.message_id
    );

    delete global.depositState[userId];
    console.log(`[DEPOSIT] ${userId} berhasil, durasi: ${Date.now() - start}ms`);

  } catch (error) {
    console.error("❌ Kesalahan saat memproses deposit:", error);
    await resetDepositState();
    await ctx.reply(
      '❌ *GAGAL!* Terjadi kesalahan saat memproses pembayaran. Silahkan coba lagi nanti.',
      { parse_mode: 'Markdown' }
    );
  }
}


function insertPendingDeposit(uniqueCode, userId, username, finalAmount, originalAmount, qrMessageId) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO pending_deposits (unique_code, user_id, username, amount, original_amount, timestamp, status, qr_message_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uniqueCode, userId, username, finalAmount, originalAmount, Date.now(), 'pending', qrMessageId],
      (err) => {
        if (err) {
          logger.error('Gagal insert pending_deposits:', err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function deletePendingDeposit(uniqueCode) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM pending_deposits WHERE unique_code = ?', [uniqueCode], (err) => {
      if (err) {
        logger.error('Gagal hapus pending_deposits (error):', err.message);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
//notifikasi
async function checkExpiredAccounts() {
  try {
    const now = new Date();
    const h1Start = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const h1End   = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // H-1
    db.all(`
      SELECT *
      FROM user_accounts
      WHERE status = 'active'
        AND last_notified_h1 = 0
        AND datetime(expired_at) BETWEEN datetime(?) AND datetime(?)
    `, [h1Start.toISOString(), h1End.toISOString()], async (err, rows) => {
      if (err) {
        logger.error('❌ Gagal cek notif H-1 expired: ' + err.message);
        return;
      }

      for (const acc of rows || []) {
        try {
          await bot.telegram.sendMessage(
            acc.user_id,
            `⚠️ <b>Akun VPN Akan Expired</b>\n\n` +
            `👤 Username: <code>${acc.username}</code>\n` +
            `🌐 Server: <code>${acc.server_name}</code>\n` +
            `🔐 Tipe: <code>${String(acc.account_type).toUpperCase()}</code>\n` +
            `📅 Expired: <code>${formatTanggalIndonesia(acc.expired_at)}</code>\n\n` +
            `Segera renew akun kamu agar tetap aktif 🔥`,
            { parse_mode: 'HTML' }
          );

          db.run(
            `UPDATE user_accounts SET last_notified_h1 = 1 WHERE id = ?`,
            [acc.id]
          );
        } catch (e) {
          logger.warn(`⚠️ Gagal kirim notif H-1 ke ${acc.user_id}: ${e.message}`);
        }
      }
    });

    // Sudah expired
    db.all(`
      SELECT *
      FROM user_accounts
      WHERE status = 'active'
        AND last_notified_expired = 0
        AND datetime(expired_at) <= datetime(?)
    `, [now.toISOString()], async (err, rows) => {
      if (err) {
        logger.error('❌ Gagal cek akun expired: ' + err.message);
        return;
      }

      for (const acc of rows || []) {
        try {
          await bot.telegram.sendMessage(
            acc.user_id,
            `❌ <b>Akun VPN Expired</b>\n\n` +
            `👤 Username: <code>${acc.username}</code>\n` +
            `🌐 Server: <code>${acc.server_name}</code>\n` +
            `🔐 Tipe: <code>${String(acc.account_type).toUpperCase()}</code>\n` +
            `📅 Expired: <code>${formatTanggalIndonesia(acc.expired_at)}</code>\n\n` +
            `Silakan renew akun untuk mengaktifkannya kembali.`,
            { parse_mode: 'HTML' }
          );

          db.run(`
            UPDATE user_accounts
            SET status = 'expired',
                last_notified_expired = 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [acc.id]);
        } catch (e) {
          logger.warn(`⚠️ Gagal kirim notif expired ke ${acc.user_id}: ${e.message}`);
        }
      }
    });

  } catch (error) {
    logger.error('❌ Error checkExpiredAccounts: ' + error.message);
  }
}
//pengatur waktu cek akun
setInterval(() => {
  logger.info('🔁 Menjalankan pengecekan akun expired...');
  checkExpiredAccounts();
}, 30 * 60 * 1000); // tiap 30 menit

async function checkQRISStatusGopay() {
  try {
    const pendingDeposits = Object.entries(global.pendingDeposits || {});
    const now = Date.now();

    for (const [uniqueCode, deposit] of pendingDeposits) {
      if (!deposit || deposit.status !== 'pending') continue;

      const depositAge = now - deposit.timestamp;

      // EXPIRED 5 MENIT
      if (depositAge > 5 * 60 * 1000) {
        logger.info(`⌛ EXPIRED GOPAY | ${uniqueCode}`);

        deposit.status = 'expired';

        try {
          await bot.telegram.editMessageCaption(
            deposit.userId,
            deposit.qrMessageId,
            null,
            '❌ *QRIS GOPAY sudah expired (5 menit)*',
            { parse_mode: 'Markdown' }
          );
        } catch (e) {
          logger.warn(`⚠️ Gagal edit caption expired GOPAY ${uniqueCode}: ${e.message}`);
        }

        delete global.pendingDeposits[uniqueCode];
        db.run('DELETE FROM pending_deposits WHERE unique_code = ?', [uniqueCode]);
        continue;
      }

      // hanya untuk GOPAY
      if (deposit.method !== 'Qris Gopay') continue;

      if (!deposit.reff) {
        logger.warn(`⚠️ Deposit GOPAY ${uniqueCode} tidak punya reff`);
        continue;
      }

      logger.info(`🔍 CEK GOPAY | ${uniqueCode}`);
      logger.info(`🆔 Transaction ID : ${deposit.reff}`);
      logger.info(`🔑 GOPAY_KEY      : ${GOPAY_KEY}`);
      logger.info(`📏 KEY Length     : ${String(GOPAY_KEY).length}`);

      let res;

      try {
        res = await axios.post(
          'https://v1-gateway.autogopay.site/qris/status',
          {
            transaction_id: String(deposit.reff)
          },
          {
            headers: {
              'Authorization': `Bearer ${String(GOPAY_KEY).trim()}`,
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        );
      } catch (err) {
        logger.error(`❌ ERROR REQUEST STATUS GOPAY | ${uniqueCode}`);
        logger.error(`STATUS  : ${err.response?.status}`);
        logger.error(`BODY    : ${JSON.stringify(err.response?.data)}`);
        logger.error(`HEADERS : ${JSON.stringify(err.config?.headers)}`);
        logger.error(`MESSAGE : ${err.message}`);
        continue;
      }

      logger.info(`📦 STATUS GOPAY RAW RESPONSE ${uniqueCode}: ${JSON.stringify(res.data)}`);

      const data = res.data?.data || {};

      const transactionId =
        data.transaction_id ||
        data.reference_id ||
        data.trx_id ||
        data.id;

      const txStatus = String(
        data.transaction_status ||
        data.status ||
        data.payment_status ||
        ''
      ).toLowerCase();

      if (!transactionId) {
        logger.warn(`⚠️ Status GOPAY tidak mengandung transaction_id | ${uniqueCode}`);
        continue;
      }

      if (!['settlement', 'success', 'paid'].includes(txStatus)) {
        logger.info(`⏳ Pending GOPAY | ${uniqueCode} | status=${txStatus}`);
        continue;
      }

      if (!global.processedTransactions) {
        global.processedTransactions = new Set();
      }

      const transactionKey = `${transactionId}_${deposit.originalAmount}`;

      if (global.processedTransactions.has(transactionKey)) {
        logger.info(`⚠️ GOPAY transaction ${transactionKey} already processed`);
        continue;
      }

      logger.info(`💰 MATCH GOPAY | ${uniqueCode} | transaction_id=${transactionId} | status=${txStatus}`);

      deposit.status = 'processing';

      const success = await processMatchingPayment(
        deposit,
        {
          transaction_id: transactionId,
          transaction_status: txStatus,
          amount: deposit.originalAmount
        },
        uniqueCode
      );

      if (success) {
        deposit.status = 'success';

        delete global.pendingDeposits[uniqueCode];
        db.run('DELETE FROM pending_deposits WHERE unique_code = ?', [uniqueCode]);

        logger.info(`✅ Deposit GOPAY sukses | ${uniqueCode} | transaction_id=${transactionId}`);
      } else {
        deposit.status = 'pending';
        logger.warn(`❌ Gagal proses deposit GOPAY | ${uniqueCode}`);
      }
    }
  } catch (error) {
    logger.error('❌ ERROR CHECK GOPAY:', error.response?.data || error.message);
  }
}
async function checkPakasirPayment(uniqueCode) {
  const deposit = global.pendingDeposits?.[uniqueCode];
  if (!deposit) return false;

  logger.info(`🔍 CEK PAKASIR ${uniqueCode}`);

  try {
    const { data } = await axios.get(
      `${PAY_BASE}/api/transactiondetail`,
      {
        params: {
          project: PAKASIR_PROJECT,
          order_id: deposit.transaction_id,
          amount: deposit.amount,
          api_key: PAKASIR_API_KEY
        }
      }
    );

    const status = data?.transaction?.status;

    logger.info(`PAKASIR STATUS ${uniqueCode}: ${status}`);

    // ❌ belum completed
    if (status !== 'completed') {
      return false;
    }

    // anti double
    if (deposit.status === 'success') return true;

    deposit.status = 'processing';

    const success = await processMatchingPayment(
      deposit,
      {
        transaction_id: deposit.transaction_id,
        amount: deposit.amount,
        status
      },
      uniqueCode
    );

    if (success) {
      deposit.status = 'success';

      delete global.pendingDeposits[uniqueCode];
      db.run(
        'DELETE FROM pending_deposits WHERE unique_code = ?',
        [uniqueCode]
      );

      logger.info(`✅ Deposit Pakasir sukses | ${uniqueCode}`);
      return true;
    }

    deposit.status = 'pending';
    return false;

  } catch (err) {
    logger.error('PAKASIR CHECK ERROR:', err);
    return false;
  }
}

async function checkQRISStatus() {
  try {
    const pendingDeposits = Object.entries(global.pendingDeposits || {});

    for (const [uniqueCode, deposit] of pendingDeposits) {

      if (!deposit) continue;

      // Jangan proses lagi kalau sedang diproses / sudah sukses
      if (deposit.status !== "pending") continue;

      // QRIS GoPay diproses checker lain
      if (deposit.method === "Qris Gopay") continue;

      const depositAge = Date.now() - deposit.timestamp;

      // Expired 5 menit
      if (depositAge > 5 * 60 * 1000) {
        try {
          if (deposit.qrMessageId) {
            await bot.telegram.deleteMessage(
              deposit.userId,
              deposit.qrMessageId
            );
          }

          await bot.telegram.sendMessage(
            deposit.userId,
            "❌ *Pembayaran Kedaluwarsa*\n\nWaktu pembayaran telah habis. Silakan klik Top Up lagi untuk mendapatkan QR baru.",
            {
              parse_mode: "Markdown"
            }
          );
        } catch (err) {
          logger.error(
            "Error saat menghapus pembayaran expired: " + err.message
          );
        } finally {
          delete global.pendingDeposits[uniqueCode];

          db.run(
            "DELETE FROM pending_deposits WHERE unique_code = ?",
            [uniqueCode]
          );
        }

        continue;
      }

      try {

        const checkPaymentUrl =
          `https://bat.aroma.web.id/mutasi?token=${API_KEY}`;

        const { data } = await axios.get(checkPaymentUrl);

        // Support API lama & baru
        const transactions = Array.isArray(data.data)
          ? data.data
          : data.data?.data;

        if (
          !(data.status === true || data.status === "success") ||
          !Array.isArray(transactions)
        ) {
          logger.warn("[QRIS] Format response API tidak valid");
          continue;
        }

        for (const transaction of transactions) {

          // Hanya transaksi sukses
          if (
            transaction.transaction_status &&
            transaction.transaction_status !== 2
          ) {
            continue;
          }

          const paidAmount = Number(
            transaction.total || transaction.amount
          );

          const expectedAmount = Number(
            deposit.total_payment || deposit.amount
          );

          logger.info(
            `[QRIS MATCH] ${uniqueCode} | API=${paidAmount} | EXPECT=${expectedAmount}`
          );

          if (paidAmount !== expectedAmount) {
            continue;
          }

          const transactionKey = `${
            transaction.transaction_id ||
            transaction.reference_id ||
            transaction.issuer_reff ||
            transaction.id
          }_${paidAmount}`;

          if (global.processedTransactions.has(transactionKey)) {
            logger.info(
              `⚠️ Transaksi ${transactionKey} sudah diproses`
            );
            continue;
          }

          logger.info(
            `[QRIS MATCH] Match ditemukan ${uniqueCode}`
          );

          // Lock agar tidak diproses dua kali
          deposit.status = "processing";

          const success = await processMatchingPayment(
            deposit,
            transaction,
            uniqueCode
          );

          if (success) {

            logger.info(
              `✅ Pembayaran berhasil diproses | ${uniqueCode}`
            );

            global.processedTransactions.add(transactionKey);

            deposit.status = "success";

            delete global.pendingDeposits[uniqueCode];

            db.run(
              "DELETE FROM pending_deposits WHERE unique_code = ?",
              [uniqueCode]
            );

            break;

          } else {

            logger.warn(
              `❌ processMatchingPayment gagal | ${uniqueCode}`
            );

            deposit.status = "pending";
          }
        }

      } catch (err) {

        deposit.status = "pending";

        logger.error(
          `Error cek pembayaran ${uniqueCode}: ${
            err.response?.data
              ? JSON.stringify(err.response.data)
              : err.message
          }`
        );
      }
    }

  } catch (err) {

    logger.error(
      "Error di checkQRISStatus: " +
      (err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message)
    );

  }
}

function keyboard_abc() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const buttons = [];

  for (let i = 0; i < alphabet.length; i += 3) {
    const row = alphabet.slice(i, i + 3).split('').map(char => ({
      text: char,
      callback_data: char,
      style: 'primary'
    }));

    buttons.push(row);
  }

  buttons.push([
    {
      text: '🔙 Hapus',
      callback_data: 'delete',
      style: 'danger'
    },
    {
      text: '✅ Konfirmasi',
      callback_data: 'confirm',
      style: 'success'
    }
  ]);

  buttons.push([
    {
      text: '🔙 Kembali ke Menu Utama',
      callback_data: 'send_main_menu',
      style: 'danger'
    }
  ]);

  return buttons;
}

function keyboard_nomor() {
  const alphabet = '1234567890';
  const buttons = [];

  for (let i = 0; i < alphabet.length; i += 3) {
    const row = alphabet.slice(i, i + 3).split('').map(char => ({
      text: char,
      callback_data: char,
      style: 'primary'
    }));

    buttons.push(row);
  }

  buttons.push([
    {
      text: '🔙 Hapus',
      callback_data: 'delete',
      style: 'danger'
    },
    {
      text: '✅ Konfirmasi',
      callback_data: 'confirm',
      style: 'success'
    }
  ]);

  buttons.push([
    {
      text: '🔙 Kembali ke Menu Utama',
      callback_data: 'send_main_menu',
      style: 'danger'
    }
  ]);

  return buttons;
}

function keyboard_full() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const buttons = [];

  for (let i = 0; i < alphabet.length; i += 3) {
    const row = alphabet.slice(i, i + 3).split('').map(char => ({
      text: char,
      callback_data: char,
      style: 'primary'
    }));

    buttons.push(row);
  }

  buttons.push([
    {
      text: '🔙 Hapus',
      callback_data: 'delete',
      style: 'danger'
    },
    {
      text: '✅ Konfirmasi',
      callback_data: 'confirm',
      style: 'success'
    }
  ]);

  buttons.push([
    {
      text: '🔙 Kembali ke Menu Utama',
      callback_data: 'send_main_menu',
      style: 'danger'
    }
  ]);

  return buttons;
}
global.processedTransactions = new Set();
async function updateUserBalance(userId, amount) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET saldo = COALESCE(saldo, 0) + ? WHERE user_id = ?",
      [amount, userId],
      function(err) {
        if (err) {
          logger.error(
            'Kesalahan saat mengupdate saldo pengguna:',
            err.message
          );
          reject(err);
          return;
        }

        resolve(this.changes);
      }
    );
  });
}

async function getUserBalance(userId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT saldo FROM users WHERE user_id = ?", [userId],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      }
    );
  });
}

function getBotGroupData() {
  try {
    if (!groupId || !BOT_TOKEN) {
      logger.warn('❌ Konfigurasi grup tidak lengkap di .vars.json (GROUP_CHAT_ID atau BOT_TOKEN kosong). Notifikasi grup mungkin tidak berfungsi.');
      return null;
    }

    return { keyGroup: BOT_TOKEN, chatId: groupId };

  } catch (err) {
    logger.error('❌ Terjadi kesalahan saat mendapatkan data grup:', err.message);
    return null;
  }
}

async function getIspNameFromExternalSource(domainOrIp) {
  if (!domainOrIp || domainOrIp === '-') {
    return 'N/A'; // Jika domain/IP tidak valid, kembalikan N/A
  }
  try {
    // Menggunakan ip-api.com untuk lookup ISP
    const response = await axios.get(`http://ip-api.com/json/${domainOrIp}?fields=isp`);
    if (response.data && response.data.isp) {
      return response.data.isp;
    }
    return 'Unknown ISP';
  } catch (error) {
    logger.error(`❌ Gagal mengambil ISP untuk ${domainOrIp}:`, error.message);
    return 'Failed to get ISP'; 
  }
}

function censorAccountUsername(username) {
  if (!username || typeof username !== 'string') {
    return 'N/A'; 
  }
  if (username.length <= 3) {
    return username + 'xxx'; 
  }
 
  return username.substring(0, 3) + 'xxx';
}


async function sendTransactionLogToGroup({
  trxNumber,
  userRole,
  tgUsername,
  tgUserId,
  serverName,
  ispName,
  domainName,
  accountUsername,
  serviceName,
  limitQuota,
  limitLogin,
  trxType,
  activeDays,
  costValue,
  hargaNormalPerHari,
  saldoDikurangi,
  userSaldoNow,
  dateLabel,
  timeLabel
}) {
  const groupData = getBotGroupData();
  if (!groupData || !groupData.chatId || !groupData.keyGroup) {
    logger.warn('❌ Data grup tidak lengkap (chatId atau keyGroup), notifikasi tidak dikirim.');
    return;
  }

  // Status by role
  let statusEmoji = '👤';
  let statusText = 'Member';
  if (userRole === 'admin') { statusEmoji = '👑'; statusText = 'Admin'; }
  else if (userRole === 'reseller') { statusEmoji = '🏆'; statusText = 'Reseller'; }

  const censoredAccountUsername = censorAccountUsername(accountUsername);

  // Bangun pesan full di dalam fence Markdown (triple backticks harus di-escape dalam template literal)
  const message = 
`╭──────────────╮
   📦 TRANSAKSI BERHASIL 📦
╰──────────────╯

\`\`\`
📒 No Trx       : #${trxNumber}
🌀 Status       : ${statusText} ${statusEmoji}
👤 Username     : ${tgUsername}
🆔 ID           : ${tgUserId}

🌐 Server       : ${serverName}
📡 ISP          : ${ispName}
🔗 Domain/IP    : ${domainName}
🙍 Nama         : ${censoredAccountUsername}

📦 Produk       : ${serviceName}
📊 Limit Quota  : ${limitQuota} GB
📱 Limit Login  : ${limitLogin} HP
⚙️ Tipe         : ${trxType}
⏳ Durasi Akun  : ${activeDays} Hari — Rp.${costValue.toLocaleString('id-ID')}
💲 Normal/Hari  : Rp.${hargaNormalPerHari.toLocaleString('id-ID')}

💳 Saldo Keluar : Rp.${saldoDikurangi.toLocaleString('id-ID')}
💰 Saldo Now    : Rp.${userSaldoNow.toLocaleString('id-ID')}

📅 Tanggal      : ${dateLabel}
⏰ Waktu        : ${timeLabel}
\`\`\`

━━━━━━━━━━━━━━
📝 Catatan: Simpan nomor transaksi untuk support
━━━━━━━━━━━━━━`;


  try {
    await axios.post(`https://api.telegram.org/bot${groupData.keyGroup}/sendMessage`, {
      chat_id: groupData.chatId,
      text: message,
      parse_mode: 'MarkdownV2'
    });
    logger.info(`✅ Log transaksi #${trxNumber} dikirim ke grup ${groupData.chatId}`);
  } catch (err) {
    logger.error(`❌ Gagal kirim log transaksi ke grup: ${err.response?.data?.description || err.message}`);
  }
}

// --- AKHIR FUNGSI sendTransactionLogToGroup ---

// --- AKHIR FUNGSI sendTransactionLogToGroup ---


// --- BAGIAN FUNGSI afterAccountTransaction (GANTI SELURUHNYA) ---
async function afterAccountTransaction({
  userId,
  username,
  produk,
  serverId,
  jenis,
  durasi,
  accountUsername // Ini adalah username akun VPN yang sebenarnya dari state.username
}) {
  try {
    const now = new Date();

    // Ambil informasi server dari DB
    const serverDetails = await new Promise((resolve, reject) => {
      db.get('SELECT nama_server, harga, domain, quota, iplimit FROM Server WHERE id = ?', [serverId], (err, row) => {
        if (err) {
          logger.error('❌ Gagal mengambil data server:', err.message);
          return reject(err);
        }
        resolve(row || {});
      });
    });

    const serverNamaTampilan = serverDetails.nama_server || '-';
    const hargaPerHari = serverDetails.harga || 0;
    const domainServer = serverDetails.domain || '-';
    const quotaServer = serverDetails.quota || 0;
    const iplimitServer = serverDetails.iplimit || 0;

    // Panggil fungsi untuk mendapatkan ISP Name dari sumber eksternal
    const ispServer = await getIspNameFromExternalSource(domainServer);

    let totalHarga = hargaPerHari * durasi;

    // Ambil role user saat ini
    const userRole = await new Promise((resolve) => {
        db.get('SELECT role FROM users WHERE user_id = ?', [userId], (err, row) => {
            resolve(row ? row.role : 'member');
        });
    });

    // Terapkan diskon reseller jika role adalah 'reseller'
    if (userRole === 'reseller') {
        const resellerDiscount = await new Promise((resolve) => {
            db.get('SELECT discount_percent FROM reseller_config WHERE id = 1', (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.discount_percent : 0);
            });
        });
        totalHarga = Math.floor(totalHarga * (100 - resellerDiscount) / 100);
    }

    // Ambil nomor transaksi terakhir
    const trxNumber = await getLastTransactionNumber();

    // Ambil saldo terbaru user
    const saldo = await getUserSaldo(userId);

    // Format tanggal dan waktu
    const tanggal = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');

    const waktu = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, ':') + ' WIB';

    // Kirim log transaksi ke grup
    await sendTransactionLogToGroup({
      trxNumber,
      userRole: adminIds.includes(userId) ? 'admin' : userRole,
      tgUsername: username ? (username.startsWith('@') ? username : `@${username}`) : 'Tidak tersedia',
      tgUserId: userId,
      serverName: serverNamaTampilan,
      ispName: ispServer,
      domainName: domainServer,
      accountUsername: accountUsername, // Pastikan ini meneruskan username yang sebenarnya
      serviceName: produk || 'Tidak diketahui',
      limitQuota: quotaServer,
      limitLogin: iplimitServer,
      trxType: jenis || 'Create',
      activeDays: durasi || 0,
      costValue: totalHarga || 0,
      hargaNormalPerHari: hargaPerHari || 0,
      saldoDikurangi: totalHarga || 0,
      userSaldoNow: saldo || 0,
      dateLabel: tanggal,
      timeLabel: waktu
    });

    logger.info(`✅ afterAccountTransaction selesai untuk user ${userId}, transaksi #${trxNumber}`);
  } catch (error) {
    logger.error(`❌ Error afterAccountTransaction user ${userId}:`, error?.stack || error?.message || error);
  }
}


// Dapatkan nomor transaksi terakhir
function getLastTransactionNumber() {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM log_penjualan ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.id + 1 : 1000);
    });
  });
}

// Ambil saldo user dari database
function getUserSaldo(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT saldo FROM users WHERE user_id = ?', [userId], (err, row) => {
      if (err) return reject(err);
      resolve(row ? row.saldo : 0);
    });
  });
}

async function sendPaymentSuccessNotificationByUserId(
  userId,
  deposit,
  currentBalance,
  username = 'Tidak tersedia'
) {
  try {
    const saldo = await new Promise((resolve, reject) => {
      db.get(
        'SELECT saldo FROM users WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.saldo : 0);
        }
      );
    });

    const topupAmount = Number(
      deposit?.amount ||
      deposit?.originalAmount ||
      0
    );

    const bonusAmount = Number(
      deposit?.bonus || 0
    );

    const bonusPercent = Number(
      deposit?.bonus_percent || 0
    );

    const balanceAmount = Number(
      currentBalance ||
      saldo ||
      0
    );

    const hasBonus =
      bonusAmount > 0 &&
      bonusPercent > 0;

    const bonusLine = hasBonus
      ? `🎁 Bonus           : Rp${bonusAmount.toLocaleString('id-ID')} (${bonusPercent}%)\n`
      : '';

const messageText =
`╭──────────────╮
   📦 TOP UP BERHASIL 📦
╰──────────────╯
\`\`\`
🏷️ Username        : @${username}
🆔 ID              : ${userId}
💰 Nominal Top Up  : Rp${topupAmount.toLocaleString('id-ID')}
${bonusLine}💳 Saldo Sekarang  : Rp${balanceAmount.toLocaleString('id-ID')}
\`\`\`

━━━━━━━━━━━━━━
✨ Terima kasih sudah melakukan Top Up ✨
━━━━━━━━━━━━━━`;

console.log("[NOTIF] generate image mulai");

let image;

try {
  image = await generateTopupSuccessTemplate({
    username,
    userId,
    amount: topupAmount,
    bonus: bonusAmount,
    balance: balanceAmount,
    transactionId: deposit?.transaction_id ?? "-"
  });
} catch (err) {
  logger.error("❌ Generate template gagal:", err);
  throw err;
}

try {
  await bot.telegram.sendPhoto(
    userId,
    {
      source: image
    },
    {
      caption: messageText,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "💸 Top Up",
              callback_data: "menu_topup",
              style: "success"
            },
            {
              text: "📝 Menu Utama",
              callback_data: "send_main_menu",
              style: "primary"
            }
          ]
        ]
      }
    }
  );

  console.log("[NOTIF] kirim foto user selesai");

} catch (err) {
  console.error("[NOTIF] SEND PHOTO ERROR");
  console.error(err.response?.data || err);
  throw err;
}

if (deposit.qrMessageId) {
  try {
    await bot.telegram.deleteMessage(
      userId,
      deposit.qrMessageId
    );
  } catch (e) {
    logger.warn(
      `Gagal hapus pesan QRIS user ${userId}: ${e.message}`
    );
  }
}

    const group = getBotGroupData();

    if (group) {
  const { keyGroup, chatId } = group;

  const messageToGroup =
`╭──────────────╮
   📦 TOP UP BERHASIL 📦
╰──────────────╯
\`\`\`
🏷️ Username        : @${username}
🆔 ID              : ${userId}
💰 Nominal Top Up  : Rp${topupAmount.toLocaleString('id-ID')}
${bonusLine}💳 Saldo Sekarang  : Rp${balanceAmount.toLocaleString('id-ID')}
\`\`\`

━━━━━━━━━━━━━━
✨ Terima kasih sudah melakukan Top Up ✨
━━━━━━━━━━━━━━`;

  try {
    const image = await generateTopupSuccessTemplate({
      username,
      userId,
      amount: topupAmount,
      bonus: bonusAmount,
      balance: balanceAmount,
      transactionId: deposit?.transaction_id ?? "-"
    });

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", fs.createReadStream(image));
    form.append("caption", messageToGroup);
    form.append("parse_mode", "Markdown");

    await axios.post(
      `https://api.telegram.org/bot${keyGroup}/sendPhoto`,
      form,
      {
        headers: form.getHeaders()
      }
    );

  } catch (err) {
    logger.warn(
      `❗ Gagal kirim ke grup: ${
        err.response?.data?.description ||
        err.message
      }`
    );
  }
}
    return true;

  } catch (error) {
    logger.error(
      '❌ Error sending payment notification (by userId):',
      error
    );
    return false;
  }
}
// Anda mungkin perlu menyesuaikan fungsi ini sesuai dengan data yang Anda butuhkan
async function processMatchingPayment(deposit, matchingTransaction, uniqueCode) {
  const transactionId =
    matchingTransaction.transaction_id ||
    matchingTransaction.issuer_reff ||
    matchingTransaction.reference_id ||
    matchingTransaction.trx_id ||
    matchingTransaction.id;

  const paidAmount = Number(
    matchingTransaction.amount || 0
  );

  const amount = Number(
    deposit.originalAmount ||
    deposit.amount ||
    0
  );

  deposit.originalAmount = amount;

  const paymentMethod =
    deposit.method ||
    deposit.paymentMethod ||
    'QRIS Orkut';

  if (!deposit.username) {
    try {
      const telegramUser = await bot.telegram.getChat(deposit.userId);
      deposit.username = telegramUser.username || 'Tidak tersedia';
    } catch (e) {
      deposit.username = 'Tidak tersedia';
    }
  }

  const transactionKey = `${transactionId}_${amount}`;

  global.processedTransactions ??= new Set();

  if (global.processedTransactions.has(transactionKey)) {
    logger.info(`Transaction ${transactionKey} already processed, skipping...`);
    return false;
  }

  // LOCK AGAR TIDAK DIPROSES DUA KALI
  global.processedTransactions.add(transactionKey);
  deposit.status = "processing";

  try {
    logger.info(
      `Update saldo untuk user ${deposit.userId}, amount: ${amount}`
    );

    await updateUserBalance(deposit.userId, amount);

    const config = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM bonus_config WHERE id = 1',
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    const now = Date.now();

    if (config) {
      if (
        config.enabled &&
        config.end_at > 0 &&
        now > config.end_at
      ) {
        await new Promise((resolve) => {
          db.run(
            'UPDATE bonus_config SET enabled = 0 WHERE id = 1',
            resolve
          );
        });

        config.enabled = 0;
      }

      if (
        config.enabled &&
        config.start_at > 0 &&
        now < config.start_at
      ) {
        config.enabled = 0;
      }
    }

    let bonus = 0;
    let bonusPercent = 0;

    if (config?.enabled && amount >= config.min_topup) {
      bonus = Math.floor(
        amount * config.bonus_percent / 100
      );

      bonusPercent = config.bonus_percent;

      deposit.bonus = bonus;
      deposit.bonus_percent = bonusPercent;

      await prosesBonusTopUp(
        deposit.userId,
        deposit.username,
        amount
      );
    } else {
      deposit.bonus = 0;
      deposit.bonus_percent = 0;
    }

    await logTopup(
      deposit.userId,
      deposit.username,
      amount,
      paymentMethod
    );

    logger.info(
      `✅ Topup ${paymentMethod} berhasil dicatat | user=${deposit.userId} | nominal=${amount}`
    );

    const userBalance = await new Promise((resolve, reject) => {
      db.get(
        'SELECT saldo FROM users WHERE user_id = ?',
        [deposit.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!userBalance) {
      throw new Error('User balance not found after update');
    }

    logger.info(
      '[PAKASIR NOTIF DATA] ' +
      JSON.stringify({
        amount,
        bonus: deposit.bonus,
        bonus_percent: deposit.bonus_percent,
        saldo: userBalance.saldo
      })
    );

    logger.info("[MATCH] masuk processMatchingPayment");

    logger.info(
      "[MATCH] sebelum send notif " +
      JSON.stringify({
        transaction_id: deposit.transaction_id,
        amount,
        userId: deposit.userId,
        username: deposit.username
      })
    );

    const notificationSent =
      await sendPaymentSuccessNotificationByUserId(
        deposit.userId,
        {
          transaction_id: deposit.transaction_id,
          amount,
          originalAmount: amount,
          bonus: deposit.bonus || 0,
          bonus_percent: deposit.bonus_percent || 0,
          qrMessageId: deposit.qrMessageId,
          method: deposit.method,
          username: deposit.username
        },
        userBalance.saldo,
        deposit.username
      );

    logger.info("[MATCH] notificationSent = " + notificationSent);

    if (notificationSent) {
      deposit.status = "success";
      return true;
    }

    deposit.status = "pending";
    global.processedTransactions.delete(transactionKey);

    return false;

  } catch (error) {
    deposit.status = "pending";
    global.processedTransactions.delete(transactionKey);

    logger.error('❌ Error processing payment:', error);
    return false;
  }
}

setInterval(async () => {
  try {
    await checkQRISStatus();
  } catch (err) {
    logger.error("❌ Gagal cek status QRIS:", err.message);
  }
}, 5000);
setInterval(checkQRISStatusGopay, 15000); // cek tiap 15 detik
function resetUserSaldo(userId) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET saldo = 0 WHERE user_id = ? AND saldo > 0',
      [userId],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}
async function checkAllPakasirPayments() {
  if (!global.pendingDeposits) return;

  for (const [uniqueCode, deposit] of Object.entries(global.pendingDeposits)) {
    if (deposit.method !== 'Pakasir QRIS') continue;

    await checkPakasirPayment(uniqueCode);
  }
}

setInterval(checkAllPakasirPayments, 15000);
function getUserSaldoById(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT user_id, saldo FROM users WHERE user_id = ?',
      [userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      }
    );
  });
}

function getUsersWithSaldo(limit, offset) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT user_id, saldo FROM users WHERE saldo > 0 ORDER BY saldo DESC LIMIT ? OFFSET ?',
      [limit, offset],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

bot.command('ceksaldo', async (ctx) => {
  const adminOnly = true;
  const userId = ctx.from.id;

  if (adminOnly && !adminIds.includes(userId)) {
    return ctx.reply('❌ Anda tidak memiliki izin untuk menggunakan perintah ini.');
  }

  const input = ctx.message.text.split(' ')[1];
  if (!input) return ctx.reply('⚠️ Contoh: /ceksaldo 123456789');

  const targetId = parseInt(input);
  if (isNaN(targetId)) {
    return ctx.reply('❌ Hanya mendukung ID, bukan username. Contoh: /ceksaldo 123456789');
  }

  try {
    const user = await getUserSaldoById(targetId);
    if (!user) return ctx.reply('❌ User tidak ditemukan.');

    const saldo = `Rp${user.saldo.toLocaleString('id-ID')}`;

    ctx.reply(`📋 *Saldo User:*\n🆔 \`${user.user_id}\`\n💰 ${saldo}`, {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    logger.error('❌ Gagal cek saldo:', err);
    ctx.reply('❌ Terjadi kesalahan saat memeriksa saldo.');
  }
});

function reduceUserSaldoByInput(userId, amount) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET saldo = saldo - ? WHERE user_id = ? AND saldo >= ?',
      [amount, userId, amount],
      function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      }
    );
  });
}

bot.command('kurangisaldo', async (ctx) => {
  const adminId = ctx.from.id;
  if (!adminIds.includes(adminId)) {
    return ctx.reply('❌ Anda tidak memiliki izin untuk menggunakan perintah ini.');
  }

  const args = ctx.message.text.trim().split(' ');
  if (args.length !== 3) {
    return ctx.reply('⚠️ Format salah. Contoh: /kurangisaldo 123456789 5000');
  }

  const targetId = parseInt(args[1]);
  const amount = parseInt(args[2]);

  if (isNaN(targetId) || isNaN(amount) || amount <= 0) {
    return ctx.reply('❌ Format salah. Gunakan ID dan nominal angka yang valid.');
  }

  try {
    const user = await getUserSaldoById(targetId);
    if (!user) {
      return ctx.reply('❌ User tidak ditemukan.');
    }

    if (user.saldo < amount) {
      return ctx.reply(`❌ Saldo user hanya Rp${user.saldo.toLocaleString('id-ID')}, tidak cukup.`);
    }

    const success = await reduceUserSaldoByInput(targetId, amount);
    if (!success) {
      return ctx.reply('❌ Gagal mengurangi saldo. Mungkin saldo tidak cukup.');
    }

    const newUser = await getUserSaldoById(targetId);
    const newSaldo = `Rp${newUser.saldo.toLocaleString('id-ID')}`;

    return ctx.reply(`✅ Saldo berhasil dikurangi.\n\n🆔 \`${newUser.user_id}\`\n💰 Saldo Sekarang: *${newSaldo}*`, {
      parse_mode: 'Markdown'
    });
  } catch (err) {
    logger.error('❌ Gagal mengurangi saldo user:', err);
    return ctx.reply('❌ Terjadi kesalahan saat mengurangi saldo.');
  }
});

bot.command('resetsaldo', async (ctx) => {
  const adminOnly = true;
  const userId = ctx.from.id;

  if (adminOnly && !adminIds.includes(userId)) {
    return ctx.reply('❌ Anda tidak memiliki izin untuk menggunakan perintah ini.');
  }

  const input = ctx.message.text.split(' ')[1];
  if (!input) return ctx.reply('⚠️ Contoh: /resetsaldo 123456789 atau /resetsaldo @user');

  try {
    const success = await resetUserSaldo(input);
    if (success) {
      ctx.reply(`✅ Saldo untuk user *${input}* telah direset ke 0.`, { parse_mode: 'Markdown' });
    } else {
      ctx.reply(`❌ Gagal reset saldo. Mungkin user tidak ditemukan atau saldonya sudah 0.`);
    }
  } catch (err) {
    logger.error('❌ Gagal reset saldo:', err);
    ctx.reply('❌ Terjadi kesalahan saat mereset saldo.');
  }
});



function getTotalUserWithSaldo() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users WHERE saldo > 0', (err, row) => {
      if (err) return reject(err);
      resolve(row.count);
    });
  });
}

async function sendPaginatedUserSaldo(ctx, page = 1, isEdit = false) {
  const perPage = 10;
  const offset = (page - 1) * perPage;

  try {
    const [users, total] = await Promise.all([
      getUsersWithSaldo(perPage, offset),
      getTotalUserWithSaldo()
    ]);

    if (users.length === 0) {
      return ctx.reply('📭 Tidak ada data saldo untuk ditampilkan.');
    }

    let message = `<b>📋 Daftar Saldo User (Halaman ${page})</b>\n\n`;

    for (const user of users) {
      // Panggil fungsi untuk mendapatkan username Telegram
      const username = await getUsernameById(user.user_id);

      message += `🏷️ @${username}\n` +
                 `🆔 <code>${user.user_id}</code>\n` +
                 `💰 Rp.${user.saldo.toLocaleString('id-ID')}\n\n`;
    }

    const hasNext = offset + perPage < total;

    const keyboard = {
      inline_keyboard: [[
        ...(page > 1
          ? [{
              text: '⬅️ Prev',
              callback_data: `listsaldo_${page - 1}`,
              style: 'primary'
            }]
          : []),

        ...(hasNext
          ? [{
              text: '➡️ Next',
              callback_data: `listsaldo_${page + 1}`,
              style: 'primary'
            }]
          : [])
      ]]
    };

    if (isEdit && ctx.callbackQuery?.message) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery.message.message_id,
        null,
        message,
        {
          parse_mode: 'HTML',
          reply_markup: keyboard
        }
      );
    } else {
      return ctx.reply(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }

  } catch (err) {
    logger.error('❌ Gagal mengambil daftar saldo:', err);
    return ctx.reply(
      '❌ Terjadi kesalahan saat mengambil daftar saldo.'
    );
  }
}

bot.command('listsaldo', async (ctx) => {
  if (!adminIds.includes(ctx.from.id)) {
    return ctx.reply('❌ Anda tidak memiliki izin untuk melihat daftar saldo.');
  }

  await sendPaginatedUserSaldo(ctx, 1);
});

// [UPDATE: Fungsi downgradeInactiveResellers]
async function downgradeInactiveResellers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    db.all(`SELECT user_id, username FROM users WHERE role = 'reseller'`, [], async (err, resellers) => {
        if (err) {
            logger.error('❌ Error mengambil daftar reseller untuk downgrade:', err.message);
            return;
        }

        for (const reseller of resellers) {
            // Jangan downgrade admin jika mereka juga reseller
            if (adminIds.includes(reseller.user_id)) {
                continue;
            }

            db.get(`
                SELECT COUNT(*) AS total_transactions
                FROM log_penjualan
                WHERE user_id = ? AND waktu_transaksi >= ? AND action_type IN ('create', 'renew')
            `, [reseller.user_id, thirtyDaysAgo], (err, row) => {
                if (err) {
                    logger.error(`❌ Error cek transaksi reseller ${reseller.user_id}:`, err.message);
                    return;
                }

                const totalTransactions = row?.total_transactions || 0;

                if (totalTransactions < 3) {
                    db.run(`UPDATE users SET role = 'member' WHERE user_id = ?`, [reseller.user_id], (err) => {
                        if (err) {
                            logger.error(`❌ Gagal downgrade reseller ${reseller.user_id}:`, err.message);
                        } else {
                            logger.info(`📉 Reseller ${reseller.user_id} didowngrade ke member (transaksi: ${totalTransactions})`);
                            bot.telegram.sendMessage(reseller.user_id,
                                '⚠️ *Pemberitahuan Penting: Role Reseller Anda telah dinonaktifkan.*\n\n' +
                                'Anda telah didowngrade menjadi *Member Biasa* karena jumlah transaksi Anda dalam 30 hari terakhir kurang dari 3 transaksi. ' +
                                'Jika Anda ingin menjadi Reseller kembali, silakan hubungi administrator.',
                                { parse_mode: 'Markdown' }
                            ).catch(e => logger.warn(`Gagal kirim notif downgrade ke ${reseller.user_id}: ${e.message}`));
                        }
                    });
                } else {
                    logger.info(`✅ Reseller ${reseller.user_id} aktif (transaksi: ${totalTransactions})`);
                }
            });
        }
    });
}
// [END UPDATE]


process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection:', reason);
});

app.listen(port)
  .on('listening', () => {
    logger.info(`Express server listening on port ${port}`);
    
// =======================
// GLOBAL SAFETY WRAPPERS (Auto-inserted)
// =======================
// This section adds global error handlers and automatically wraps bot handlers
// so the bot will not crash on uncaught errors. It also adds safer wrappers
// for setInterval/setTimeout and axios to log errors without exiting.
const util = require('util');

// Wrap async handlers to catch errors and reply gracefully when possible
function wrapHandler(fnName, fn) {
  if (!fn) return fn;
  return async function wrapped(...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {
      try {
        logger.error(`❌ Unhandled error in handler (${fnName}): ${err && (err.stack || err.message)}`);
      } catch(e) {
        console.error('Logger failed:', e);
        console.error(err && (err.stack || err));
      }
      // Attempt to notify user if ctx-like object present
      const maybeCtx = args[0];
      try {
        if (maybeCtx && typeof maybeCtx.reply === 'function') {
          await maybeCtx.reply('⚠️ Terjadi kesalahan internal, silakan coba lagi nanti.');
        } else if (maybeCtx && maybeCtx.answerCbQuery) {
          // best-effort for callback queries
          await maybeCtx.answerCbQuery('⚠️ Terjadi kesalahan internal.');
        }
      } catch (e2) {
        // ignore notification failures
      }
      // swallow error to prevent process exit
      return null;
    }
  };
}

// Monkey-patch Telegraf registration helpers to auto-wrap handlers
try {
  const _origCommand = bot.command.bind(bot);
  bot.command = function (cmd, ...fns) {
    const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`command:${cmd}`, fn) : fn));
    return _origCommand(cmd, ...wrapped);
  };

  const _origAction = bot.action.bind(bot);
  bot.action = function (pattern, ...fns) {
    const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`action:${pattern}`, fn) : fn));
    return _origAction(pattern, ...wrapped);
  };

  const _origHears = bot.hears ? bot.hears.bind(bot) : null;
  if (_origHears) {
    bot.hears = function (pattern, ...fns) {
      const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`hears:${pattern}`, fn) : fn));
      return _origHears(pattern, ...wrapped);
    };
  }

  const _origOn = bot.on ? bot.on.bind(bot) : null;
  if (_origOn) {
    bot.on = function (event, ...fns) {
      const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`on:${event}`, fn) : fn));
      return _origOn(event, ...wrapped);
    };
  }
} catch (e) {
  logger.error('❌ Gagal pasang wrapper Telegraf: ' + (e && e.stack || e));
}

// Safe wrappers for setInterval and setTimeout
const _setInterval = global.setInterval;
global.setInterval = function (fn, ms, ...args) {
  return _setInterval(() => {
    try {
      fn(...args);
    } catch (err) {
      logger.error('❌ Error di setInterval callback: ' + (err && (err.stack || err.message)));
    }
  }, ms);
};
const _setTimeout = global.setTimeout;
global.setTimeout = function (fn, ms, ...args) {
  return _setTimeout(() => {
    try {
      fn(...args);
    } catch (err) {
      logger.error('❌ Error di setTimeout callback: ' + (err && (err.stack || err.message)));
    }
  }, ms);
};

// Wrap axios methods to log errors before rethrowing
if (typeof axios !== 'undefined') {
  try {
    const _axiosGet = axios.get.bind(axios);
    axios.get = async function (...args) {
      try {
        return await _axiosGet(...args);
      } catch (err) {
        logger.error('❌ Axios.get error: ' + (err && (err.stack || err.message)));
        throw err;
      }
    };
    const _axiosPost = axios.post.bind(axios);
    axios.post = async function (...args) {
      try {
        return await _axiosPost(...args);
      } catch (err) {
        logger.error('❌ Axios.post error: ' + (err && (err.stack || err.message)));
        throw err;
      }
    };
  } catch (e) {
    logger.error('❌ Gagal pasang wrapper axios: ' + (e && (e.stack || e)));
  }
}

// Global process-level handlers to prevent crashes
process.on('uncaughtException', (err) => {
  try {
    logger.error('🚨 uncaughtException: ' + (err && (err.stack || err.message)));
  } catch (e) {
    console.error('uncaughtException logger failed', e);
    console.error(err && (err.stack || err));
  }
});
process.on('unhandledRejection', (reason, p) => {
  try {
    logger.error('🚨 unhandledRejection: ' + (reason && (reason.stack || reason)));
  } catch (e) {
    console.error('unhandledRejection logger failed', e);
    console.error(reason && (reason.stack || reason));
  }
});


bot.launch().then(() => {
      logger.info("Bot launched");
      // [UPDATE: Menjalankan pengecekan downgrade reseller secara berkala]
      setInterval(() => {
        logger.info('🔁 Menjalankan pengecekan downgrade reseller...');
        downgradeInactiveResellers();
      }, 6 * 60 * 60 * 1000); // Tiap 6 jam
      // [END UPDATE]
    }).catch((err) => {
      logger.error("Bot failed to launch:", err);
    });
  })
  .on('error', (err) => {
    logger.error("Express failed to start:", err.message);
    
// =======================
// GLOBAL SAFETY WRAPPERS (Auto-inserted)
// =======================
// This section adds global error handlers and automatically wraps bot handlers
// so the bot will not crash on uncaught errors. It also adds safer wrappers
// for setInterval/setTimeout and axios to log errors without exiting.
const util = require('util');

// Wrap async handlers to catch errors and reply gracefully when possible
function wrapHandler(fnName, fn) {
  if (!fn) return fn;
  return async function wrapped(...args) {
    try {
      return await fn.apply(this, args);
    } catch (err) {
      try {
        logger.error(`❌ Unhandled error in handler (${fnName}): ${err && (err.stack || err.message)}`);
      } catch(e) {
        console.error('Logger failed:', e);
        console.error(err && (err.stack || err));
      }
      // Attempt to notify user if ctx-like object present
      const maybeCtx = args[0];
      try {
        if (maybeCtx && typeof maybeCtx.reply === 'function') {
          await maybeCtx.reply('⚠️ Terjadi kesalahan internal, silakan coba lagi nanti.');
        } else if (maybeCtx && maybeCtx.answerCbQuery) {
          // best-effort for callback queries
          await maybeCtx.answerCbQuery('⚠️ Terjadi kesalahan internal.');
        }
      } catch (e2) {
        // ignore notification failures
      }
      // swallow error to prevent process exit
      return null;
    }
  };
}

// Monkey-patch Telegraf registration helpers to auto-wrap handlers
try {
  const _origCommand = bot.command.bind(bot);
  bot.command = function (cmd, ...fns) {
    const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`command:${cmd}`, fn) : fn));
    return _origCommand(cmd, ...wrapped);
  };

  const _origAction = bot.action.bind(bot);
  bot.action = function (pattern, ...fns) {
    const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`action:${pattern}`, fn) : fn));
    return _origAction(pattern, ...wrapped);
  };

  const _origHears = bot.hears ? bot.hears.bind(bot) : null;
  if (_origHears) {
    bot.hears = function (pattern, ...fns) {
      const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`hears:${pattern}`, fn) : fn));
      return _origHears(pattern, ...wrapped);
    };
  }

  const _origOn = bot.on ? bot.on.bind(bot) : null;
  if (_origOn) {
    bot.on = function (event, ...fns) {
      const wrapped = fns.map(fn => (typeof fn === 'function' ? wrapHandler(`on:${event}`, fn) : fn));
      return _origOn(event, ...wrapped);
    };
  }
} catch (e) {
  logger.error('❌ Gagal pasang wrapper Telegraf: ' + (e && e.stack || e));
}

// Safe wrappers for setInterval and setTimeout
const _setInterval = global.setInterval;
global.setInterval = function (fn, ms, ...args) {
  return _setInterval(() => {
    try {
      fn(...args);
    } catch (err) {
      logger.error('❌ Error di setInterval callback: ' + (err && (err.stack || err.message)));
    }
  }, ms);
};
const _setTimeout = global.setTimeout;
global.setTimeout = function (fn, ms, ...args) {
  return _setTimeout(() => {
    try {
      fn(...args);
    } catch (err) {
      logger.error('❌ Error di setTimeout callback: ' + (err && (err.stack || err.message)));
    }
  }, ms);
};

// Wrap axios methods to log errors before rethrowing
if (typeof axios !== 'undefined') {
  try {
    const _axiosGet = axios.get.bind(axios);
    axios.get = async function (...args) {
      try {
        return await _axiosGet(...args);
      } catch (err) {
        logger.error('❌ Axios.get error: ' + (err && (err.stack || err.message)));
        throw err;
      }
    };
    const _axiosPost = axios.post.bind(axios);
    axios.post = async function (...args) {
      try {
        return await _axiosPost(...args);
      } catch (err) {
        logger.error('❌ Axios.post error: ' + (err && (err.stack || err.message)));
        throw err;
      }
    };
  } catch (e) {
    logger.error('❌ Gagal pasang wrapper axios: ' + (e && (e.stack || e)));
  }
}

// Global process-level handlers to prevent crashes
process.on('uncaughtException', (err) => {
  try {
    logger.error('🚨 uncaughtException: ' + (err && (err.stack || err.message)));
  } catch (e) {
    console.error('uncaughtException logger failed', e);
    console.error(err && (err.stack || err));
  }
});
process.on('unhandledRejection', (reason, p) => {
  try {
    logger.error('🚨 unhandledRejection: ' + (reason && (reason.stack || reason)));
  } catch (e) {
    console.error('unhandledRejection logger failed', e);
    console.error(reason && (reason.stack || reason));
  }
});
// backup otomatis sellvpn.db
function startAutoBackup() {

    setInterval(async () => {

        const now = new Date();

        if (
            now.getHours() === 0 &&
            now.getMinutes() === 0
        ) {

            try {

                const backup = await createDatabaseBackup();

                await sendBackupToAdmin(
                    backup.path,
                    backup.name
                );

            } catch (err) {

                logger.error(err);

            }

        }

    }, 60000);

}

startAutoBackup();

bot.launch().catch(err => {
      logger.error("Bot fallback launch error:", err.message);
    });
  });

// server.js — 零依赖版（只用 Node.js 内置模块）
const http = require("http");
const https = require("https");
const { URL } = require("url");

// ================= 配置区 =================
const PORT = 3235;
const OPENLIST_BASE_URL = "http://localhost:5244"; // OpenList 地址
const ADMIN_USERNAME = "admin";                     // 管理员账号
const ADMIN_PASSWORD = "";       // 管理员密码
const REGISTRATION_INVITE_CODE = ""; // 设置邀请码后才允许注册
// ==========================================

// 通用 HTTP 请求封装
function request(urlStr, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlStr);
        const lib = url.protocol === "https:" ? https : http;
        const data = body ? JSON.stringify(body) : null;

        const req = lib.request(
            {
                hostname: url.hostname,
                port: url.port || (url.protocol === "https:" ? 443 : 80),
                path: url.pathname + url.search,
                method: options.method || "GET",
                headers: {
                    ...(options.headers || {}),
                    ...(data
                        ? {
                              "Content-Type": "application/json",
                              "Content-Length": Buffer.byteLength(data),
                          }
                        : {}),
                },
            },
            (res) => {
                let chunks = "";
                res.on("data", (c) => (chunks += c));
                res.on("end", () => {
                    let parsed = chunks;
                    try {
                        parsed = JSON.parse(chunks);
                    } catch (e) {}
                    resolve({ status: res.statusCode, data: parsed });
                });
            }
        );

        req.on("error", reject);
        if (data) req.write(data);
        req.end();
    });
}

// 读取请求体
function readBody(req) {
    return new Promise((resolve, reject) => {
        let chunks = "";
        req.on("data", (c) => (chunks += c));
        req.on("end", () => {
            try {
                resolve(chunks ? JSON.parse(chunks) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on("error", reject);
    });
}

// 统一响应头（含 CORS）
function setCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
}

const server = http.createServer(async (req, res) => {
    setCors(res);

    // 预检
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // 健康检查
    if (req.method === "GET" && req.url === "/api/register") {
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true, message: "Register API is running" }));
        return;
    }

    // 注册接口
    if (req.method === "POST" && req.url === "/api/register") {
        let body;
        try {
            body = await readBody(req);
        } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: "请求体格式错误" }));
            return;
        }

        const username = (body.username || "").trim();
        const password = body.password || "";
        const inviteCode =
            typeof body.inviteCode === "string" ? body.inviteCode : "";

        if (!REGISTRATION_INVITE_CODE) {
            res.writeHead(500);
            res.end(JSON.stringify({ message: "服务端未配置邀请码，请联系管理员" }));
            return;
        }

        if (inviteCode !== REGISTRATION_INVITE_CODE) {
            res.writeHead(403);
            res.end(JSON.stringify({ message: "请联系管理员获取邀请码" }));
            return;
        }

        if (!username || !password) {
            res.writeHead(400);
            res.end(JSON.stringify({ message: "用户名和密码不能为空" }));
            return;
        }

        try {
            // 1. 管理员登录获取 token
            const login = await request(`${OPENLIST_BASE_URL}/api/auth/login`, { method: "POST" }, {
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD,
            });

            if (
                !login.data ||
                login.data.code !== 200 ||
                !login.data.data ||
                !login.data.data.token
            ) {
                console.error("[Register] 管理员登录失败:", login.data);
                res.writeHead(500);
                res.end(JSON.stringify({ message: "服务端配置错误，请联系管理员" }));
                return;
            }

            const adminToken = login.data.data.token;

            // 2. 创建普通用户（role: 0 = GENERAL）
            const create = await request(
                `${OPENLIST_BASE_URL}/api/admin/user/create`,
                {
                    method: "POST",
                    headers: { Authorization: adminToken },
                },
                {
                    username,
                    password,
                    role: 0,
                }
            );

            if (create.data && create.data.code === 200) {
                console.log("[Register] 成功:", username);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, message: "注册成功" }));
                return;
            }

            console.error("[Register] 创建用户失败:", create.data);
            res.writeHead(400);
            res.end(
                JSON.stringify({
                    message: (create.data && create.data.message) || "注册失败",
                })
            );
        } catch (err) {
            console.error("[Register] 异常:", err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ message: "注册失败，请稍后重试" }));
        }
        return;
    }

    // 其他路径
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Not Found" }));
});

server.listen(PORT, () => {
    console.log(` Register API running: http://localhost:${PORT}/api/register`);
    console.log(`   OpenList: ${OPENLIST_BASE_URL}`);
});
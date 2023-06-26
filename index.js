"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const util = require("util");
const KEY = `account1/balance`;
const DEFAULT_BALANCE = 100;

// Create a reusable Redis client
const redisClient = new redis.RedisClient({
    host: process.env.ENDPOINT,
    port: parseInt(process.env.PORT || "6379"),
});

redisClient.on("error", function(error) {
    console.error("Redis error: ", error);
});

exports.chargeRequestRedis = async function (input) {
    //console.time('chargeRequestRedis');
    var remainingBalance = await getBalanceRedis(redisClient, KEY);
    var charges = getCharges();
    const isAuthorized = authorizeRequest(remainingBalance, charges);
    if (!isAuthorized) {
        return {
            remainingBalance,
            isAuthorized,
            charges: 0,
        };
    }
    remainingBalance = await chargeRedis(redisClient, KEY, charges);
    //console.timeEnd('chargeRequestRedis');
    return {
        remainingBalance,
        charges,
        isAuthorized,
    };
};

function authorizeRequest(remainingBalance, charges) {
    return remainingBalance >= charges;
}

function getCharges() {
    return DEFAULT_BALANCE / 20;
}

async function getBalanceRedis(redisClient, key) {
    const res = await util.promisify(redisClient.get).bind(redisClient).call(redisClient, key);
    return parseInt(res || "0");
}

async function chargeRedis(redisClient, key, charges) {
    return util.promisify(redisClient.decrby).bind(redisClient).call(redisClient, key, charges);
}

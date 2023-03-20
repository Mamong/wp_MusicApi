const { default: axios } = require("axios");
const { mid } = require("../../../util/kugou_mid");
const { kugou_app_request, kugou_request } = require("../../../util/kugou_request");
const APIError = require("../../../middlewares/rest").APIError;
const cryptoJs = require('crypto-js');


let song = async (ctx) => {

    if (ctx.request.method === 'GET') {
        var aid = ctx.request.query.aid || '978031';
        var hash = ctx.request.query.hash || '6b20b79b951cbd33b7db57a4c3abc3c6';
        var audioid = ctx.request.query.audioid || '64531905';
    } else if (ctx.request.method === 'POST') {
        var aid = ctx.request.body.aid || '978031';
        var hash = ctx.request.body.hash || '6b20b79b951cbd33b7db57a4c3abc3c6';
        var audioid = ctx.request.body.audioid || '64531905';
    }

    const cacheData = global.cache.get(ctx.request.url);
    if (cacheData) {
        ctx.rest(cacheData);
        return;
    }

    params = {
        hash: hash.trim(),
        mtype: "0",
        album_id: aid.trim(),
        album_audio_id: audioid.trim(),
        module: "",
        behavior: "play",
        cmd: "26",
        pid: "2",
        vipType: "6",
        ptype: "1",
        pidversion: "3001",
        page_id: "910038176",
        ppage_id: "463467626,661004247",
        //"isFreePart":"1",
    }

    Object.assign(params,{
        clienttime: parseInt(Date.now() / 1000) + "",
        area_code: "1",
        clientver: "10659",
        appid: "1005",
        version: "10659",
        userid: global.kugou_cookie.userid ? global.kugou_cookie.userid : "0",
        token: global.kugou_cookie.token ? global.kugou_cookie.token : "",
        mid: global.kugou_cookie.mid ? global.kugou_cookie.mid : mid(),
        dfid: global.kugou_cookie.dfid ? global.kugou_cookie.dfid : "4Wy4GA4Zhelm3KWVHP0Jorgh",
        uuid: "2811d5582c58459ec629a9a956a58923",
    })
    //计算key
    const pidVersionSecret = "57ae12eb6890223e355ccfcb74edf70d"
    params.key = cryptoJs.MD5(hash + pidVersionSecret + params.appid + params.mid + params.userid).toString()

    //计算signature
    const appkey = "OIlwieks28dk2k092lksi2UIkp"
    let sig = ""
    Object.keys(params).sort().forEach((key) => {
        sig += key + "=" + params[key]
    })
    sig = appkey + sig + appkey
    params.signature = cryptoJs.MD5(sig).toString()

    let result = await axios.get('https://gateway.kugou.com/v3/url', {
        params, 
        headers: {
            'User-Agent': 'Android712-AndroidPhone-10659-14-0-NetMusic-wifi',
            'x-router': 'tracker.kugou.com'
        },
    });

    //成功才缓存
    if (result.data.status == 1) {
        global.cache.set(ctx.request.url, result.data);
    }
    // if (result.data.url.length == 0) {
    //throw new APIError("ERROR", result.data.errmsg)
    //     throw new APIError("Song:url_notfound", "Song url is not found")
    // }
    ctx.rest(result.data);
}


let websong = async (ctx) => {

    if (ctx.request.method === 'GET') {
        var aid = ctx.request.query.aid || '978031';
        var hash = ctx.request.query.hash || '6b20b79b951cbd33b7db57a4c3abc3c6';
        var album_audio_id = ctx.request.query.album_audio_id || '64531905';
    } else if (ctx.request.method === 'POST') {
        var aid = ctx.request.body.aid || '978031';
        var hash = ctx.request.body.hash || '6b20b79b951cbd33b7db57a4c3abc3c6';
        // var br = ctx.request.body.br || '320';
    }

    const cacheData = global.cache.get(ctx.request.url);
    if (cacheData) {
        ctx.rest(cacheData);
        return;
    }


    // https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=070248CD678149DDDFE5388A43BF1690&mid=0e80d32d772ad376377c68a2708ac92d&album_id=56495618
    // https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=7E9BDD9E6F442397942B5E7B7916BAB7&mid=0e80d32d772ad376377c68a2708ac92d&album_id=56495618
    //新的url https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=7E9BDD9E6F442397942B5E7B7916BAB7&mid=0e80d32d772ad376377c68a2708ac92d&album_id=56495618
    let result = await kugou_request('https://wwwapi.kugou.com/yy/index.php', {
        r: 'play/getdata',
        hash: hash.trim(),
        mid: global.kugou_cookie.mid ? global.kugou_cookie.mid : mid(),
        album_id: aid.trim()
        // album_audio_id: album_audio_id.trim(),
        // appid: 1014,
        // platid: 4,
        // '_': Date.now(),
        // dfid: global.kugou_cookie.dfid ? global.kugou_cookie.dfid : global.kugou_cookie.kg_dfid
    }, 1);

    if (result.data.err_code.toString() == '30020' || result.data.err_code.toString() == '20010') {
        // global.kugou_cookie = '';
        throw new APIError("Cookie:ERROR", "Please set cookie")
    }
    // console.log(result);
    // 捕获序列化json出错，防止程序异常退出
    if (result.data === 'failed') {
        throw new APIError("Song:url_notfound", "Song url is not found")
    }

    global.cache.set(ctx.request.url, result.data);

    ctx.rest(result.data);
}




let getsong = async (ctx) => {

    if (ctx.request.method === 'GET') {
        var aid = ctx.request.query.aid || '973251';
        var hash = ctx.request.query.hash || 'E0D2FE9DB754150BBA3CB042C5E8A498';
        var album_audio_id = ctx.request.query.album_audio_id || '64531905';
    } else if (ctx.request.method === 'POST') {
        var aid = ctx.request.body.aid || '978031';
        var hash = ctx.request.body.hash || '6b20b79b951cbd33b7db57a4c3abc3c6';
        // var br = ctx.request.body.br || '320';
    }

    const cacheData = global.cache.get(ctx.request.url);
    if (cacheData) {
        ctx.rest(cacheData);
        return;
    }


    // https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=070248CD678149DDDFE5388A43BF1690&mid=0e80d32d772ad376377c68a2708ac92d&album_id=56495618
    // https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=7E9BDD9E6F442397942B5E7B7916BAB7&mid=0e80d32d772ad376377c68a2708ac92d&album_id=56495618
    //新的url https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=7E9BDD9E6F442397942B5E7B7916BAB7&mid=0e80d32d772ad376377c68a2708ac92d&album_id=56495618
    let result = await axios.get('https://wwwapi.kugou.com/yy/index.php', {
        params: {
            r: 'play/getdata',
            hash: hash.trim(),
            mid: mid(),
            album_id: aid.trim()
            // album_audio_id: album_audio_id.trim(),
            // appid: 1014,
            // platid: 4,
            // '_': Date.now(),
            // dfid: global.kugou_cookie.dfid ? global.kugou_cookie.dfid : global.kugou_cookie.kg_dfid
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0',
            Referer: 'https://www.kugou.com/'
        }
    });

    // if(result.data.err_code.toString() == '30020' || result.data.err_code.toString() == '20010') {
    //     // global.kugou_cookie = '';
    //     throw new APIError("Cookie:ERROR", "Please set cookie")
    // }
    // console.log(result);
    // 捕获序列化json出错，防止程序异常退出
    // if (result.data === 'failed') {
    //     throw new APIError("Song:url_notfound", "Song url is not found")
    // }

    global.cache.set(ctx.request.url, result.data);

    ctx.rest(result.data);
}


// let songInfo = async (ctx) => {

//     if (ctx.request.method === 'GET') {
//         var rid = ctx.request.query.rid || '156483846';
//     } else if (ctx.request.method === 'POST') {
//         var rid = ctx.request.body.rid || '156483846';
//     }

//     let result = await kuwo_request('http://kuwo.cn/api/www/music/musicInfo', {
//         mid: rid.trim(),
//         httpsStatus: 1,
//         reqId: 'e3f36a20-4c05-11eb-b0b7-8b03aa7e4b0d'
//     });

//     ctx.rest(result.data);
// }

module.exports = {
    song,
    websong,
    // songInfo
    getsong,
}
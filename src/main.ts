import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appId, appSecret} from './private';

type ErrorMap = {
	[key: string]: string
}

const errorMap: ErrorMap = {
	52001: '请求超时，请稍后再试',
	52002: '系统错误，请稍后再试',
	52003: '未授权用户',
};

export const translate = (word: string) => {
	const salt = Math.random();
	const sign = md5(appId + word + salt + appSecret);
	let from, to;
	
	if (/[a-zA-Z]/.test(word[0])) {
		// 英译中
		from = 'en';
		to = 'zh';
	} else {
		// 中译英
		from = 'zh';
		to = 'en';
	}
	
	const query: string = querystring.stringify({
		q: word,
		appid: appId,
		from, to, salt, sign
	});
	
	const options = {
		hostname: 'api.fanyi.baidu.com',
		port: 443,
		path: `/api/trans/vip/translate?${query}`,
		method: 'GET'
	};
	
	const request = https.request(options, (response) => {
		let chunks: Buffer[] = [];
		response.on('data', (chunk: Buffer) => {
			chunks.push(chunk);
		});
		response.on('end', () => {
			const string = Buffer.concat(chunks).toString();
			type BaiduResult = {
				error_code?: string;
				error_msg?: string;
				from: string;
				to: string;
				trans_result: {
					src: string
					dst: string;
				}[]
			}
			const object: BaiduResult = JSON.parse(string);
			if (object.error_code) {
				console.error(errorMap[object.error_code] || object.error_msg);
				process.exit(2);
			} else {
				const result: string = object.trans_result[0].dst;
				console.log(`${word} ==> ${result}`);
				process.exit(0);
			}
		});
	});
	request.on('error', (error) => {
		console.error(error);
	});
	request.end();
};

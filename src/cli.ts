#!/usr/bin/env node
import * as commander from 'commander';
import {translate} from './main';

const program = new commander.Command();

program.version('0.0.1')
	.name('tt')
	.usage('<english>')
	.arguments('<english>')
	.action(function (english) {
		translate(english)
	});

program.parse(process.argv);
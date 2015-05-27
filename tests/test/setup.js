import jsdom from 'jsdom';
import fs from 'fs';
const jquery = fs.readFileSync(__dirname + "/../node_modules/jquery/dist/jquery.js", "utf-8");

global.document = jsdom.jsdom('<!doctype html><html><head></head><body></body></html>');
global.window = global.document.parentWindow;

let scriptEl = window.document.createElement("script");
scriptEl.setAttribute('type', 'text/javascript');
scriptEl.innerHTML = jquery;
window.document.head.appendChild(scriptEl);
global.$ = window.$;

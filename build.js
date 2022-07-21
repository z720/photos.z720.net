import mustache from 'mustache';
import {readFile, writeFile} from 'node:fs/promises';
import config from './config.js';

const THEME = 'minimal';
const NOW = new Date(), build = `${NOW.toLocaleDateString('fr')} ${NOW.toLocaleTimeString('fr')}`;

write().then(() => {
    console.log('Build...', build)
});

function write() {
    return new Promise((resolve, reject) => {
        Promise.all([
            getData(),
            getTemplate(THEME,'index')
        ]).then(result => {
            let [data, tpl] = result;
            writeFile('_site/index.html', mustache.render(tpl.toString(),data))
            .then(()=> {
                resolve();
            });
        });
    });
}

function getData() {
    return new Promise((resolve, reject) => {
        readFile('_site/data.json').then(d => {
            let data = { ...config, ...JSON.parse(d), build };
            data.album = data.albums[0];
            // console.log('data', data);
            resolve(data);
        });
    });
}

function getTemplate(theme, template) {
    return readFile(`templates/${theme}/${template}.html`);
}

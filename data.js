import { get }  from 'https';
import { writeFile } from 'node:fs/promises';

import config from "./config.js";

// run for all albums
console.log('Collect', config.flickr);
if(Array.isArray(config.flickr)) {
	Promise.all(config.flickr.map((id) => getAlbum(id)))
	.then(r => {
		return writeFile('src/_data/photos.json', JSON.stringify({ albums: r }, undefined, "\t"));
	}).then(() => {
		console.log('Extract', (new Date()).toString());
	}).catch(e => {
		console.log(e);
	});
} else if (typeof config.flickr == 'string') {
	getAlbum(config.flickr).then(r => {
		return writeFile('src/_data/album.json', JSON.stringify(r, undefined, "\t"));
	}).then(() => {
		console.log('Extract', (new Date()).toString());
	}).catch(e => {
		console.log(e);
	});
}

// extract data for 1 photo
function getPhoto(id) {
	return new Promise((resolve, reject) => {
		Promise.all(
			[
				call('flickr.photos.getInfo', { photo_id: id }),
				call('flickr.photos.getSizes', { photo_id: id })
			]
		).then((results) => {
			let [i, s] = results, sizes = ['Square', 'Small', 'Medium', 'Original'], urls, urlmap = {};
			urls = s.sizes.size.filter((e) => sizes.indexOf(e.label) > -1);
			urls.forEach(e => {
				urlmap[e.label] = e.source;
			});
			resolve({
				title: i.photo.title['_content'],
				description: i.photo.title['_content'],
				date: i.photo.dates.posted,
				sizes: urls,
				urls: urlmap
			});
		}
		);
	});
}

// extract data for 1 album with all its photos
function getAlbum(id) {
	return new Promise((resolve, reject) => {
		Promise.all([
			call('flickr.photosets.getInfo', { 'photoset_id': id }),
			call('flickr.photosets.getPhotos', { 'photoset_id': id })
		]).then(results => {
			let [i, p] = results, photoset;
			if(i.stat !== 'ok') {
				console.log('Missing photoset', i)
				reject(i.message);
			} else {
				photoset = {
					title: i.photoset ? i.photoset.title['_content'] : null,
					description: i.photoset ? i.photoset.description['_content'] : null,
				}
				Promise.all(p.photoset.photo.map(p => getPhoto(p.id))).then(photos => {
					photoset.photos = photos.sort((a,b) => {a.date - b.date});
					resolve(photoset);
				});
			}
		})
	})
}

// parametrized url for API
function buildurl(method, p) {
	const url = new URL(`https://www.flickr.com/services/rest/?api_key=${process.env.FLICKR_API_KEY}&format=json&nojsoncallback=1`);
	url.searchParams.set('method', method);
	const params = Object.entries(p);
	if (params) {
		for (const [key, value] of params) {
			url.searchParams.set(key, value);
		}
	}
	return url;
}

// Simple get to an api method
function call(method, params) {
	return new Promise((resolve, reject) => {
		var u = buildurl(method, params);
		console.log('call', u.toString());
		get(u, function (response) {
			let body = "";

			response.on("data", function (data) {
				body += data.toString();
			});

			response.on("end", function () {
				var data = JSON.parse(body.toString());
				resolve(data);
			});

		});
	});
}


import { get }  from 'https';
import { writeFile, mkdir } from 'node:fs/promises';
import {config} from 'dotenv';

config();

mkdir('_data', {recursive: true}).then(() => {
	listSets(process.env.FLICKR_COLLECTION, process.env.FLICKR_USER).then(sets => {
		Promise.all(sets.map(id => getAlbum(id)))
		.then(r => {
			return writeFile('_data/photos.json', JSON.stringify({ albums: r }, undefined, "\t"));
		}).then(() => {
			console.log('Extract', (new Date()).toString());
		}).catch(e => {
			console.log(e);
		});
	})
});

function listSets(collection, user) {
	return new Promise((resolve) => {
		getCollection(collection, user).then(resolve);
	})
}

function getCollection(id, user) {
	return new Promise((resolve, reject) => {
		call('flickr.collections.getTree', { 'collection_id': id, 'user_id': user}).then(data => {
			if(data.collections) {
				resolve(data.collections.collection.reduce((p,c) => {
					return p.concat(c.set.map(s => s.id));
				},[]));
			} else {
				reject("Collection call failed...")
			}
		})
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
				id: i.photo.id,
				title: i.photo.title['_content'],
				description: i.photo.title['_content'],
				date: i.photo.dates.posted,
				// sizes: urls,
				urls: urlmap,
			});
		});
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
					id: i.photoset.id,
					title: i.photoset ? i.photoset.title['_content'] : null,
					description: i.photoset ? i.photoset.description['_content'] : null
				}
				Promise.all(p.photoset.photo.map(p => getPhoto(p.id))).then(photos => {
					photoset.photos = photos.sort((a,b) => {return b.date - a.date});
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


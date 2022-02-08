import { createServer } from 'http';
import fs from 'fs';
import mime from 'mime';
import { loadApp } from 'astro/app/node';

const clientRoot = new URL('../dist/client/', import.meta.url);
const serverRoot = new URL('../dist/server/', import.meta.url);
const app = await loadApp(serverRoot);

async function handle(req, res) {
	const url = new URL(`http://${req.headers.host}${req.url}`);
	const route = app.match(url);

	if(route) {
		const html = await app.render(url, route);

		res.writeHead(200, {
			'Content-Type': 'text/html'
		});
		res.end(html)
	} else {
		let local = new URL('.' + req.url, clientRoot);
		try {
			const data = await fs.promises.readFile(local);
			res.writeHead(200, {
				'Content-Type': mime.getType(req.url)
			});
			res.end(data);
		} catch {
			res.writeHead(404);
			res.end();
		}


	}
}

const server = createServer((req, res) => {
	handle(req, res).catch(err => {
		console.error(err);
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});
		res.end(err.toString());
	})
});

server.listen(8080);
console.log('Serving at http://localhost:8080');

// Silence weird <time> warning
console.error = () => {};

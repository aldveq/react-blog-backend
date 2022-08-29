import express from 'express';
import bodyParser from 'body-parser';

const postsData = {
	'learn-react': {
		upvotes: 0,
	},
	'learn-node': {
		upvotes: 0,
	},
	'learn-javascript': {
		upvotes: 0,
	}
};

const app = express();

app.use(bodyParser.json());

app.post('/api/posts/:name/upvote', (req, res) => {
	const postName = req.params.name;
	
	postsData[postName].upvotes += 1;
	res.status(200).send(`Post ${postName} now has ${postsData[postName].upvotes} votes!`);
});

app.listen(8000, () => console.log('Listening on port 8000'));
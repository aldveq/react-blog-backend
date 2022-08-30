import express from 'express';
import bodyParser from 'body-parser';

const postsData = {
	'learn-react': {
		upvotes: 0,
		comments: [],
	},
	'learn-node': {
		upvotes: 0,
		comments: [],
	},
	'learn-javascript': {
		upvotes: 0,
		comments: [],
	}
};

const app = express();

app.use(bodyParser.json());

// Upvote endpoint
app.post('/api/posts/:name/upvote', (req, res) => {
	const postName = req.params.name;
	
	postsData[postName].upvotes += 1;
	res.status(200).send(`Post ${postName} now has ${postsData[postName].upvotes} votes!`);
});

// Add comment endpoint
app.post('/api/posts/:name/add-comment', (req, res) => {
	const postName = req.params.name;
	const { user, comment } = req.body;

	postsData[postName].comments.push({user, comment});

	res.status(200).send(postsData[postName]);

});

app.listen(8000, () => console.log('Listening on port 8000'));
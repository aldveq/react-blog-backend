import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(bodyParser.json());

// Get post data by name
app.get('/api/posts/:name', async (req, res) => {
	try {
		const postName = req.params.name;

		const mongoClient = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
		const db = mongoClient.db('blog-db');
		const postData = await db.collection('posts').findOne({ name: postName });

		//Sending response back
		res.status(200).json(postData);

		mongoClient.close();
	} catch (error) {
		res.status(500).json({ message: 'Erros connecting to db', error });
	}
});

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
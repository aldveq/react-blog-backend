import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(bodyParser.json());

const dbHandler = async (businessLogic, res) => {
	try {
		const mongoClient = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
		const db = mongoClient.db('blog-db');

		await businessLogic(db);

		mongoClient.close();
	} catch (error) {
		res.status(500).json({ message: 'Error connecting to db', error });
	}
};

// Get post data by name
app.get('/api/posts/:name', async (req, res) => {
	dbHandler(async (db) => {
		const postName = req.params.name;
		const postData = await db.collection('posts').findOne({ name: postName });
		res.status(200).json(postData);
	}, res);
});

// Upvote endpoint
app.post('/api/posts/:name/upvote', async (req, res) => {
	dbHandler( async (db) => {
		const postName = req.params.name;
		const postData = await db.collection('posts').findOne({ name: postName });
		await db.collection('posts').updateOne({ name: postName }, {
			'$set': {
				upvotes: postData.upvotes + 1,
			},
		});
		const postDataUpt = await db.collection('posts').findOne({ name: postName });

		res.status(200).json(postDataUpt);
	}, res);
});

// Add comment endpoint
app.post('/api/posts/:name/add-comment', (req, res) => {
	const postName = req.params.name;
	const { user, comment } = req.body;

	postsData[postName].comments.push({user, comment});

	res.status(200).send(postsData[postName]);

});

app.listen(8000, () => console.log('Listening on port 8000'));
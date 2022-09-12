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

const getPostName = postStr => {
	if (postStr.includes(' ')) {
		return postStr.split(' ').join('-').toLowerCase();
	} else {
		return postStr.toLowerCase();
	}
}

//Insert new post
app.post('/api/posts/new', async (req, res) => {
	const { title, content } = req.body;
	const postName = getPostName(title);
	const postDataToStore = {
		name: postName,
		upvotes: 0,
		comments: [],
		title,
		content
	}

	dbHandler(async (db) => {
		const postIdResult = await db.collection('posts').insertOne(postDataToStore);
		res.status(200).json(postIdResult);
	});

});

// Get all post
app.get('/api/posts', async (req, res) => {
	dbHandler(async (db) => {
		const postsData = await db.collection('posts').find();
		const postsDataArray = [];
		let postDataObj = {};

		await postsData.forEach(pData => {
			postDataObj = {
				'id': pData?._id,
				'name': pData?.name,
				'upvotes': pData?.upvotes,
				'comments': pData?.comments,
				'title': pData?.title,
				'content': pData?.content
			}

			postsDataArray.push(postDataObj);
		});

		res.status(200).json(postsDataArray);

	}, res);
});

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

	dbHandler(async (db) => {
		const postData = await db.collection('posts').findOne({ name: postName });
		await db.collection('posts').updateOne({ name: postName }, {
			'$set': {
				comments: postData.comments.concat({ user, comment }),
			},	
		});
		const postDataUpt = await db.collection('posts').findOne({ name: postName });

		res.status(200).json(postDataUpt);
	}, res);

});

app.listen(8000, () => console.log('Listening on port 8000'));
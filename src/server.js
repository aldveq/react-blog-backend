import express from 'express';
import dbHandler from './db.js';
import { getPostName } from './tools.js';

const app = express();

app.use(express.json());

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
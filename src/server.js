import express from 'express';
import { db, connectToMongoDB } from './db.js';
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

	const postIdResult = await db.collection('posts').insertOne(postDataToStore);
	res.status(200).json(postIdResult);

});

// Get all post
app.get('/api/posts', async (req, res) => {
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
});

// Get post data by name
app.get('/api/posts/:name', async (req, res) => {
	const postName = req.params.name;
	const postData = await db.collection('posts').findOne({ name: postName });
	res.status(200).json(postData);
});

// Upvote endpoint
app.put('/api/posts/:name/upvote', async (req, res) => {
	const postName = req.params.name;

	await db.collection('posts').updateOne({ name: postName }, {
		'$inc': { upvotes: 1 },
	});
	const postDataUpt = await db.collection('posts').findOne({ name: postName });

	if (postDataUpt) {
		res.status(200).json(postDataUpt);
	} else {
		res.status(404).send('The post was not found.');
	}

});

// Add comment endpoint
app.post('/api/posts/:name/add-comment', async (req, res) => {
	const postName = req.params.name;
	const { user, comment } = req.body;

	const postData = await db.collection('posts').findOne({ name: postName });
	await db.collection('posts').updateOne({ name: postName }, {
		'$set': {
			comments: postData.comments.concat({ user, comment }),
		},	
	});
	const postDataUpt = await db.collection('posts').findOne({ name: postName });

	res.status(200).json(postDataUpt);
});

connectToMongoDB(() => {
	console.log('Successfully connected to databse!');
	app.listen(8000, () => console.log('Listening on port 8000'));
});

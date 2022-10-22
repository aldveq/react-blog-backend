import express from 'express';
import { db, connectToMongoDB } from './db.js';
import { getPostName } from './tools.js';
import fs from 'fs';
import admin from 'firebase-admin';

const credentialsFile = JSON.parse(fs.readFileSync( './credentials.json' ));
admin.initializeApp({
	credential: admin.credential.cert(credentialsFile),
});

const app = express();
app.use(express.json());

app.use(async (req, res, next) => {
	const { authtoken } = req.headers;

	if (authtoken) {
		try {
			req.user = await admin.auth().verifyIdToken(authtoken);
		} catch (e) {
			return res.sendStatus(400);
		}
	}

	req.user = req.user || {};

	next();
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
	
	if (postData) {
		res.status(200).json(postData);
	} else {
		res.status(404).send('The post was not found.');
	}
	
});

app.use((req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.sendStatus(401);
	}
});

//Insert new post
app.post('/api/posts/new', async (req, res) => {
	const { title, content } = req.body;
	const postName = getPostName(title);
	const postDataToStore = {
		name: postName,
		upvotes: 0,
		comments: [],
		title,
		content,
		upvoteUsers: []
	}

	const postIdResult = await db.collection('posts').insertOne(postDataToStore);
	res.status(200).json(postIdResult);

});

// Upvote endpoint
app.put('/api/posts/:name/upvote', async (req, res) => {
	const postName = req.params.name;
	const { email } = req.body;

	const postData = await db.collection('posts').findOne({name: postName});

	if (postData) {
		const upvoteUsers = postData.upvoteUsers;
		const canUpvote = email && !upvoteUsers.includes(email);

		if (canUpvote) {
			await db.collection('posts').updateOne({ name: postName }, {
				$inc: { upvotes: 1 },
				$push: { upvoteUsers: email },
			});
		}

		const postDataUpt = await db.collection('posts').findOne({ name: postName });
		res.status(200).json(postDataUpt);
	} else {
		res.status(404).send('The post was not found.');
	}
});

// Add comment endpoint
app.post('/api/posts/:name/add-comment', async (req, res) => {
	const postName = req.params.name;
	const { comment } = req.body;
	const { email } = req.user;

	await db.collection('posts').updateOne({ name: postName }, {
		'$push': { comments: { user: email, comment } },	
	});
	const postDataUpt = await db.collection('posts').findOne({ name: postName });

	if(postDataUpt) {
		res.status(200).json(postDataUpt);
	} else {
		res.status(404).send('The post was not found.');
	}

});

connectToMongoDB(() => {
	console.log('Successfully connected to databse!');
	app.listen(8000, () => console.log('Listening on port 8000'));
});

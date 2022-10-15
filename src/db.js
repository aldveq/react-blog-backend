import { MongoClient } from 'mongodb';

let db;

const connectToMongoDB = async (cb) => {
	const mongoClient = await MongoClient.connect('mongodb://localhost:27017');
	await mongoClient.connect();
	db = mongoClient.db('blog-db');
	await cb();
};

export {
	db,
	connectToMongoDB
};
import { MongoClient } from 'mongodb';

const dbHandler = async (businessLogic, res) => {
	try {
		const mongoClient = await MongoClient.connect('mongodb://localhost:27017');
		await mongoClient.connect();

		const db = mongoClient.db('blog-db');

		await businessLogic(db);

		mongoClient.close();
	} catch (error) {
		res.status(500).json({ message: 'Error connecting to db', error });
	}
};

export default dbHandler;
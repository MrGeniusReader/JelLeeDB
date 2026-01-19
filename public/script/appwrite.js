import { Client, Account, Databases, Storage } from 'appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.PROJECT_ENDPOINT)
    .setProject(process.env.PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
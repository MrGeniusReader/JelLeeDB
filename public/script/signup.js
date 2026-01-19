import { Client, Account, ID } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const client = new Client()
    .setProject(process.env.PROJECT_ID); // Your project ID
    .setEndpoint(process.env.PROJECT_ENDPOINT);

const account = new Account(client);

try {
    const user = await account.create({
        userId: 'MrGeniusReader',
        email: 'mrgeniusreader@gmail.com',
        password: 'denzkiExtreme_071603'
    });
    console.log(user)
} catch (e){
    console.error(e)
}
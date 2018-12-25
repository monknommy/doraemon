import { Message } from 'wechaty'
import * as fs from 'fs'

const STORAGE_PATH = './storage/cooCooAction/';

async function canResolve(message: Message):Promise<boolean> {
    const room = message.room();
    if (room == null) {
        return false;
    }
    if (!message.text().includes('咕咕')) {
        return false;
    }

    const names = await getMentionNames(message);
    if (names.length <= 0) {
        return false;
    }

    return true;
}

async function getMentionNames(message: Message): Promise<Array<string>> {
    const users = await message.mention();
    if (users.length <= 0) {
        return [];
        //return [message.from().name()];
    } else {
        return users.filter(user => !user.self()).map(user => user.name());
    }
}

export async function resolveCooCooAction(message: Message): Promise<Array<string>> {
    if (!await canResolve(message)) {
        return [];
    }
    
    if (!fs.existsSync(STORAGE_PATH)){
        fs.mkdirSync(STORAGE_PATH);
    }

    const room = message.room();
    if (room == null) return [];
    let topic = await room.topic();
    let path = STORAGE_PATH + topic;

    let data:{[index: string]: number} = {};
     if (fs.existsSync(path)){
         data = JSON.parse(fs.readFileSync(path, 'utf8'));
     }

    const names = await getMentionNames(message);
    let responses: Array<string> = [];
    names.forEach(name => {
        data[name] = name in data ? data[name] + 1 : 1;
        responses.push(name + ' 咕咕 x ' + data[name]);
    })

    fs.writeFileSync(path, JSON.stringify(data), 'utf8');
    console.log("CooCooAction", responses);
    return responses;
}

export async function resolveSelfCooCooAction(message: Message): Promise<Array<string>> {
    const room = message.room();
    if (room == null) {
        return [];
    }
    if (!message.text().includes('咕咕')) {
        return [];
    }

    let topic = await room.topic();
    let path = STORAGE_PATH + topic;
    if (!fs.existsSync(path)){
        return [];
    }

    const data:{[index: string]: number} = JSON.parse(fs.readFileSync(path, 'utf8'));
    let responses: Array<string> = [];
    Object.entries(data).forEach(([key, value]) => responses.push(key + ' 咕咕 x ' + value));
    return responses;
}

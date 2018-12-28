import { Message } from 'wechaty'
// import * as fs from 'fs'

// const STORAGE_PATH = './storage/cooCooAction/';

// async function canResolve(message: Message):Promise<boolean> {
//     const room = message.room();
//     if (room == null) {
//         return false;
//     }
//     if (!message.text().includes('charge')) {
//         return false;
//     }

//     const names = await getMentionNames(message);
//     if (names.length <= 0) {
//         return false;
//     }

//     return true;
// }

async function getMentionNames(message: Message): Promise<Array<string>> {
    const room = message.room();
    if (room == null) {
        console.error('room is empty.');
        return [];
    }

    let users = [];
    if (message.text().includes('@all') || message.text().includes('@所有人') ) {
        users = await room.memberAll();
    } else {
        users = await message.mention();
    }

    if (users.length <= 0) {
        return [];
    } else {
        return users.filter(user => !user.self()).map(user => user.name());
    }
}

 function getAmount(message: Message): number {
    const regrex = /[0-9]+(\.[0-9]+)?/;
    const match_result = regrex.exec(message.text());
    if (match_result == null) {
        return 0;
    }
    return Math.ceil(parseFloat(match_result[0]) * 100);
}

/*
 * accepted formats:
 * "charge @lexi 100.5"
 * "charge @lexi @jimmy 100.5"
 * "charge @all 100.5"
 */
export async function resolveChargeAction(message: Message): Promise<Array<string>> {
    const room = message.room();
    if (room == null) {
        return [];
    }
    
    if (!message.text().includes('charge') && !message.text().includes('Charge')) {
        return [];
    }

    const from_user = message.from();
    if (from_user == null) {
        return [];
    }
    const lender = from_user.name();

    const target_users = await getMentionNames(message);
    if (target_users.length <= 0) {
        return [];
    }
    const amount = getAmount(message);
    const each_amount = Math.ceil(amount/target_users.length);
    response = lender + " charge " + target_users.join(",") + " " + each_amount/100 + " each, total: " + amount/100;
    console.log("[chargeAction Response]" + response);
    return [response];
    
    // if (!fs.existsSync(STORAGE_PATH)){
    //     fs.mkdirSync(STORAGE_PATH);
    // }

    // const room = message.room();
    // if (room == null) return [];
    // let topic = await room.topic();
    // let path = STORAGE_PATH + topic;

    // let data:{[index: string]: number} = {};
    //  if (fs.existsSync(path)){
    //      data = JSON.parse(fs.readFileSync(path, 'utf8'));
    //  }

    // const names = await getMentionNames(message);
    // let responses: Array<string> = [];
    // names.forEach(name => {
    //     data[name] = name in data ? data[name] + 1 : 1;
    //     responses.push(name + ' 咕咕 x ' + data[name]);
    // })

    // fs.writeFileSync(path, JSON.stringify(data), 'utf8');
    // console.log("CooCooAction", responses);
    // return responses;
}

// export async function resolveSelfCooCooAction(message: Message): Promise<Array<string>> {
//     const room = message.room();
//     if (room == null) {
//         return [];
//     }
//     if (!message.text().includes('咕咕')) {
//         return [];
//     }

//     let topic = await room.topic();
//     let path = STORAGE_PATH + topic;
//     if (!fs.existsSync(path)){
//         return [];
//     }

//     const data:{[index: string]: number} = JSON.parse(fs.readFileSync(path, 'utf8'));
//     let responses: Array<string> = [];
//     Object.entries(data).forEach(([key, value]) => responses.push(key + ' 咕咕 x ' + value));
//     return responses;
// }

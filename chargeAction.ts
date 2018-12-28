import { Message } from 'wechaty'
import * as fs from 'fs'

const STORAGE_PATH = './storage/chargeAction/';

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
    const regrex = /-?[0-9]+(\.[0-9]+)?/;
    const match_result = regrex.exec(message.text());
    if (match_result == null) {
        return 0;
    }
    return Math.ceil(parseFloat(match_result[0]) * 100);
}

function syncToStorage(group_name: string, lender: string, borrowers: Array<string>, amount: number): void {
     if (!fs.existsSync(STORAGE_PATH)){
        fs.mkdirSync(STORAGE_PATH);
    }

    let path = STORAGE_PATH + group_name;

    let data:{[index: string]: {[index: string]: number}} = {};
     if (fs.existsSync(path)){
         data = JSON.parse(fs.readFileSync(path, 'utf8'));
     }

     borrowers.forEach(name => {
        let debt_map = name in data ? data[name] : {};
        let debt = lender in debt_map ? debt_map[lender] : 0; // How much borrower already owns lender.
        debt_map[lender] = debt + amount;
        data[name] = debt_map;
    });

     fs.writeFileSync(path, JSON.stringify(data), 'utf8');
    console.log("[chargeAction Storage]", data);
}

function getReport(group_name: string): Array<string> {
    const path = STORAGE_PATH + group_name;
    if (!fs.existsSync(path)){
        return [];
    }
    let data:{[index: string]: {[index: string]: number}} = {};
    data = JSON.parse(fs.readFileSync(path, 'utf8'));
    const result = Object.entries(data).map(pair => {
        const borrower = pair[0];
        const debt_map = pair[1];
        const debt = Object.entries(debt_map).reduce((prev, pair) => prev + pair[0] + ": " + pair[1]/100 + ", ", "");
        return borrower + " owns " + debt;
    });
    return ["Charge Report:"].concat(result);
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
    const group_name = await room.topic();
    
    if (!message.text().includes('charge') && !message.text().includes('Charge')) {
        return [];
    }

    const from_user = message.from();
    if (from_user == null) {
        return [];
    }
    const lender = from_user.name();

    const borrowers = await getMentionNames(message);
    if (borrowers.length <= 0) {
        return [];
    }
    const amount = getAmount(message);
    if (amount == 0) {
        return [];
    }

    const each_amount = Math.ceil(amount/borrowers.length);
    const response = lender + " charge each of [" + borrowers.join(",") + "] " + each_amount/100 + "; Total: " + amount/100 + ";\n";
    syncToStorage(group_name, lender, borrowers, each_amount);
    const report = getReport(group_name);
    console.log("[chargeAction Response]", response);
    console.log("[chargeAction report]", report);
    return [response].concat(report);
}

export async function resolveChargeReportAction(message: Message): Promise<Array<string>> {
    const room = message.room();
    if (room == null) {
        return [];
    }
    const group_name = await room.topic();
    
    if (!message.text().includes('charge') && !message.text().includes('Charge')) {
        return [];
    }

    return getReport(group_name);
}

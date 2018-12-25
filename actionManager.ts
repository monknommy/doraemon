
import { Message } from 'wechaty'
import { resolveMeowAction } from './meowAction'
import { resolveCooCooAction, resolveSelfCooCooAction } from './cooCooAction'

interface ActionResolver {
    (message: Message): Promise<Array<string>>;
}

function mentionActionResolvers(): Array<ActionResolver> {
    // Priority sensitive here. Once an action is resolved, other action is ignored.
    return [resolveSelfCooCooAction, resolveMeowAction];
}

function commonActionResolvers(): Array<ActionResolver> {
    // All actions will be resolved.
    return [resolveCooCooAction];
}

async function onCommonMessage(message: Message): Promise<Array<string>> {
    let response: Array<string> = [];
    const resolvers = commonActionResolvers();
    await Promise.all(resolvers.map(async (resolver) => {
        response = response.concat(await resolver(message));
    }));
    return response;
}

async function onMentionSelf(message: Message): Promise<Array<string>> {
    const resolvers = mentionActionResolvers();
    let i = 0;
    
    for (i = 0; i < resolvers.length; i ++) {
        const resolver = resolvers[i];
        const response = await resolver(message);
        if (response.length > 0) {
            return response;
        }
    }
    return [];
}

export async function resolve(message: Message): Promise<Array<string>> {
    let response = Array<string>();
    response = response.concat(await onCommonMessage(message));
    if (await message.mentionSelf()) {
        response = response.concat(await onMentionSelf(message));
    }
    return response;
}

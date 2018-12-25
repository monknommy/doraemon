import {
    Message,
} from 'wechaty'

export async function resolveMeowAction(_: Message): Promise<Array<string>> {
    return ['喵'];
}

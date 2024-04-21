import { create, remove, updateState, updateFix, updateRisk, updateRR } from './notion.js'
import Auth from './auth.js'

String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const numbers = [8, 13, 18, 23]

const getReplyToMessageId = (captionEntities) => {
    let itemLink = captionEntities.find((item) => item.type == 'text_link')

    if (itemLink) {
        let uuid = itemLink.url.replace(/.*\//, '')
            .replace(/^\d+\-\s*/, '')

        for (const i of numbers) {
            uuid = uuid.splice(i, 0, '-')
        }

        return uuid;
    }
}

export async function deleteMessage(ctx) {
    const { message_id, caption_entities } = ctx.message.reply_to_message
    const notion = await Auth.notion(ctx.message.chat.username);
    await ctx.deleteMessage(message_id)

    if (!caption_entities) return

    const replyToMessageId = getReplyToMessageId(caption_entities)
    let msg = ctx.reply(replyToMessageId)
    if (replyToMessageId)
        remove(notion, replyToMessageId)
}

export async function updateStateMessage(msg, state) {
    const replyToMessageId = getReplyToMessageId(msg.caption_entities)
    const notion = await Auth.notion(msg.chat.username);
    //ctx.reply('reply ' + replyToMessageId)

    if (replyToMessageId)
        return updateState(notion, replyToMessageId, state)
}

export async function updateFixMessage(msg, rr, proc) {
    const replyToMessageId = getReplyToMessageId(msg.caption_entities)
    const notion = await Auth.notion(msg.chat.username);

    if (replyToMessageId)
        return await updateFix(notion, replyToMessageId, rr, proc)
}

export async function updateRiskMessage(msg, value) {
    const replyToMessageId = getReplyToMessageId(msg.caption_entities)
    const notion = await Auth.notion(msg.chat.username);

    if (replyToMessageId)
        return await updateRisk(notion, replyToMessageId, value)
}

export async function updateRRMessage(msg, value) {
    const replyToMessageId = getReplyToMessageId(msg.caption_entities)
    const notion = await Auth.notion(msg.chat.username);

    if (replyToMessageId)
        return await updateRR(notion, replyToMessageId, value)
}

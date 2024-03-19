import { create, remove, updateState, updateFix, updateRisk, updateRR } from './notion.js'

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
    await ctx.deleteMessage(message_id)

    if (!caption_entities) return

    const replyToMessageId = getReplyToMessageId(caption_entities)
    let msg = ctx.reply(replyToMessageId)
    if (replyToMessageId)
        remove(replyToMessageId)
}

export async function updateStateMessage(captionEntities, state) {
    const replyToMessageId = getReplyToMessageId(captionEntities)

    //ctx.reply('reply ' + replyToMessageId)

    if (replyToMessageId)
        return updateState(replyToMessageId, state)
}

export async function updateFixMessage(captionEntities, rr, proc) {
    const replyToMessageId = getReplyToMessageId(captionEntities)

    if (replyToMessageId)
        return await updateFix(replyToMessageId, rr, proc)
}

export async function updateRiskMessage(captionEntities, value) {
    const replyToMessageId = getReplyToMessageId(captionEntities)

    if (replyToMessageId)
        return await updateRisk(replyToMessageId, value)
}

export async function updateRRMessage(captionEntities, value) {
    const replyToMessageId = getReplyToMessageId(captionEntities)

    if (replyToMessageId)
        return await updateRR(replyToMessageId, value)
}

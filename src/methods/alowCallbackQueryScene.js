import strMessage from '../ClearMessage.js'
import callbackQuery from '../callbackQuery.js'
import buttons from '../message/options.js'

async function cancelChanged(ctx) {
    await ctx.telegram.editMessageReplyMarkup(
        ctx.update.callback_query.message.chat.id,
        ctx.scene.state.messageId,
        null,
        buttons.getReply(['edit'])
    )

    await strMessage.clear(ctx, false)
    await ctx.scene.leave()
}

export default async function (ctx, callback) {
    const { callback_query } = ctx.update

    if (callback_query.data == 'exit') {
        await cancelChanged(ctx)

        return
    }

    if (ctx.scene.state.messageId && ctx.scene.scenes.has(callback_query.data)) {
        await cancelChanged(ctx)
        await callbackQuery(ctx)

        return
    }

    ctx.scene.state.messageId = callback_query.message.message_id
    await callback()
}

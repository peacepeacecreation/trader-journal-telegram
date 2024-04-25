import strMessage from '../ClearMessage.js'
import callbackQuery from '../callbackQuery.js'
import buttons from '../message/options.js'

async function cancelChanged(ctx) {
    await ctx.telegram.editMessageReplyMarkup(
        ctx.update.callback_query.message.chat.id,
        ctx.scene.state.messageId,
        null,
        buttons.getReply(['edit', 'fix', 'remove'])
    )

    await strMessage.clear(ctx, false)
    await ctx.scene.leave()
}

export default async function (ctx, callback) {
    const { message } = ctx.update?.callback_query || ctx.update
    const commandKey = ctx.update?.callback_query?.data || ctx.command

    if (commandKey == 'exit') {
        await cancelChanged(ctx)

        return
    }

    if (commandKey == 'cancel') {
        await strMessage.clear(ctx, false)
        await ctx.scene.leave()

        return
    }



    if (ctx.scene.state.messageId && ctx.scene.scenes.has(commandKey)) {
        await cancelChanged(ctx)
        await callbackQuery(ctx)

        return
    }

    ctx.scene.state.messageId = message.message_id
    await callback()
}

import { removeRow, createRow, updatePair, updatePosition, updateRR, updateRisk } from '../../notion/index.js'

import alowCallbackQueryScene from '../../methods/alowCallbackQueryScene.js'
import strMessage from '../../ClearMessage.js'
import { editMessage, createMessage } from '../../methods/message.js'
import buttons from '../../message/options.js'

const callback = (method) => {
    return {
        callback: async (done) => await method(done)
    }
}

export default {
    async initCreatePosition(ctx) {
        const response = await createRow(ctx, ctx.state)

        const btns = JSON.stringify({
            inline_keyboard: [
                ...buttons.pairs(ctx),
                buttons.getButtons(['add_new_pair'])
            ],
        })

        await createMessage(ctx, ctx.state.href, response, btns)
        await ctx.deleteMessage(ctx.message.message_id)
        await ctx.wizard.next()
    },
    async pairCreatePosition(ctx) {
        const { data } = ctx.update.callback_query

        if (ctx.session.pairs.includes(data)) {
            const response = await updatePair(ctx, data)
            await editMessage(ctx, response, ['long', 'short'])

            await ctx.wizard.next()
        }

        // if (data == 'add_new_pair') {
        //     ctx.editMessageReplyMarkup(buttons.getReply(['edit', 'fix', 'remove']))
        //     ctx.scene.leave()
        //     ctx.scene.enter('addNewPair', ctx.scene.state)
        // }
    },
    async positionCreatePosition(ctx) {
        const { data } = ctx.update.callback_query

        if (data) {
            const response = await updatePosition(ctx, data)
            await editMessage(ctx, response, [])

            await ctx.scene.leave()
            await ctx.scene.enter('editRR', callback(async (done) => {
                if (done) {
                    const response = await updateRR(ctx, ctx.scene.state.rr)
                    await editMessage(ctx, response, [])

                    setTimeout(async () => {
                        await ctx.scene.enter('editRisk', callback(async (done) => {
                            if (done) {
                                const response = await updateRisk(ctx, ctx.scene.state.risk)
                                return await editMessage(ctx, response, ['edit', 'fix', 'remove'])
                            }
                        }))
                    }, 1000)
                }
            }))
        }
    },

    async enterRemovePosition(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            strMessage.set(ctx)

            await strMessage.set(
                ctx,
                'Ви дійсно бажаєте видалити цю позицію?',
                {
                    reply_to_message_id: ctx.msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [
                                {
                                    text: 'Так',
                                    callback_data: 'yes',
                                },
                                {
                                    text: 'Ні',
                                    callback_data: 'cancel',
                                },
                            ]
                        ]
                    })
                }
            )
        })
    },
    async callbackQueryRemovePosition(ctx) {
        const { data } = ctx.update.callback_query

        if (data === 'yes') {
            removeRow(ctx)
            ctx.scene.state.messages.push(ctx.msg.reply_to_message)

            await strMessage.clear(ctx)
            ctx.scene.leave()
        } else {
            await strMessage.clear(ctx, false)
            ctx.scene.leave()
        }
    },
}

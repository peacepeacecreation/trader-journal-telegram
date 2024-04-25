import strMessage from '../../ClearMessage.js'
import alowCallbackQueryScene from '../../methods/alowCallbackQueryScene.js'
import buttons from '../../message/options.js'

import { updatePairs } from '../../notion/index.js'

export default {
    async enter(ctx) {
        console.log('enter', ctx.scene.state)
        await alowCallbackQueryScene(ctx, async () => {
            strMessage.set(ctx)

            const btns = JSON.stringify({
                inline_keyboard: [
                    ...buttons.pairs(ctx),
                    buttons.getButtons(['add_new_pair', 'exit'])
                ],
            })

            await ctx.editMessageReplyMarkup(btns)
        })
    },
    async callbackQuery(ctx) {
        console.log('callbackQuery', ctx.scene.state)
        await alowCallbackQueryScene(ctx, async () => {
            const { data } = ctx.update.callback_query

            if (ctx.session.pairs.includes(data)) {
                ctx.scene.state.pair = data
                strMessage.set(ctx, 'Пару відредаговано')
                await strMessage.clear(ctx)
                ctx.scene.leave()
            }

            if (data == 'add_new_pair') {
                ctx.editMessageReplyMarkup(buttons.getReply(['edit', 'fix', 'remove']))
                ctx.scene.leave()
                ctx.scene.enter('addNewPair', ctx.scene.state)
            }

            if (data == 'edit_existing_pair') {
                ctx.editMessageReplyMarkup(buttons.getReply(['cancel']))
                ctx.scene.leave()
                ctx.scene.enter('editExistingPair', ctx.scene.state)
            }
        })
    },


    async enterAddNewPair(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            strMessage.set(ctx)
            await strMessage.set(ctx, 'Введіть назву пари', {
                reply_to_message_id: ctx.scene.state.messageId,
                parse_mode: 'Markdown',
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                        buttons.getButtons(['cancel'])
                    ]
                })
            })
        })
    },
    async textAddNewPair(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            const { text: pair } = ctx.message

            ctx.scene.state.pair = pair
            ctx.state.pair = pair

            strMessage.set(ctx)
            ctx.session.pairs = [...ctx.session.pairs, pair]

            await updatePairs(ctx, ctx.session.pairs)
            strMessage.set(ctx, 'Нову пару створено')

            await strMessage.clear(ctx)
            ctx.scene.leave()
        })
    },


    async enterEditExistingPair(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            strMessage.set(ctx)

            await strMessage.set(
                ctx,
                'Оберіть пару яку бажаєте відредагувати',
                {
                    parse_mode: 'Markdown',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            ...buttons.pairs(ctx),
                            buttons.getButtons(['cancel'])
                        ]
                    })
                }
            )
        })
    },
    async textEditExistingPair(ctx) {
        const { state } = ctx.scene

        strMessage.set(ctx)
        const pair = ctx.message.text
        const pairs = ctx.session.pairs

        var index = pairs.indexOf(state.pair);

        if (index !== -1) {
            pairs[index] = pair;

            await updatePairs(ctx, pairs)

            strMessage.set(ctx, `Пару ${state.pair} перейменовано на ${pair}`)
            await strMessage.clear(ctx)
            ctx.scene.leave()
        }
    },
    async callbackQueryEditExistingPair(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            const { data } = ctx.update.callback_query

            if (ctx.session.pairs.includes(data)) {
                ctx.scene.state.pair = data

                strMessage.set(ctx, `Напишіть нову назву для пари ${data}`)
            }
        })
    },

    async enterRemovePair(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            strMessage.set(ctx)

            await strMessage.set(
                ctx,
                'Оберіть пару яку бажаєте видалити',
                {
                    parse_mode: 'Markdown',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                            ...buttons.pairs(ctx),
                            buttons.getButtons(['cancel'])
                        ]
                    })
                }
            )
        })
    },
    async callbackQueryRemovePair(ctx) {
        await alowCallbackQueryScene(ctx, async () => {
            const { data: pair } = ctx.update.callback_query

            var index = ctx.session.pairs.indexOf(pair);

            if (index !== -1) {
                ctx.session.pairs.splice(index, 1);
                await updatePairs(ctx, ctx.session.pairs)

                strMessage.set(ctx, `Пару ${pair} видалено`)
                await strMessage.clear(ctx)
                ctx.scene.leave()
            }
        })
    }
}

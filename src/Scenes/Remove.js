import { BaseScene } from 'telegraf/scenes'
import strMessage from '../ClearMessage.js'
import alowCallbackQueryScene from '../methods/alowCallbackQueryScene.js'
import { removeRow } from '../notion/index.js'

export default class RemovePosition {
    init() {
        const removePosition = new BaseScene('removePosition')

        removePosition.enter(async (ctx) => {
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
        })

        removePosition.on('callback_query', async (ctx) => {
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
        })

        return removePosition
    }
}

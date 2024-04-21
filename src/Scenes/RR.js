import { BaseScene } from 'telegraf/scenes'
import strMessage from '../ClearMessage.js'
import alowCallbackQueryScene from '../methods/alowCallbackQueryScene.js'

export default class RRGenerator {
    init () {
        const rr = new BaseScene('editRR')

        rr.enter(async (ctx) => {
            await alowCallbackQueryScene(ctx, async () => {
                strMessage.set(ctx)
                await strMessage.set(ctx, 'Введіть RR:', { reply_to_message_id: ctx.scene.state.messageId })
            })
        })

        rr.on('text', async (ctx) => {
            strMessage.set(ctx)
            const currRR = Number(ctx.message.text)

            if (currRR && currRR > 0) {
                ctx.scene.state.rr = currRR;

                strMessage.set(ctx, 'RR відредаговано')
                await strMessage.clear(ctx)
                ctx.scene.leave()
            } else {
                strMessage.set(ctx, 'Потрібно ввести кількість RR')
                ctx.scene.reenter()
            }
        })

        rr.on('callback_query', alowCallbackQueryScene)

        return rr
    }
}

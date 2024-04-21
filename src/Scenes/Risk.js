import { BaseScene } from 'telegraf/scenes'
import strMessage from '../ClearMessage.js'
import alowCallbackQueryScene from '../methods/alowCallbackQueryScene.js'

export default class RRGenerator {
    init () {
        const risk = new BaseScene('editRisk')

        risk.enter(async (ctx) => {
            await alowCallbackQueryScene(ctx, async () => {
                strMessage.set(ctx)
                await strMessage.set(ctx, 'Введіть ризик в %:', { reply_to_message_id: ctx.scene.state.messageId })
            })
        })

        risk.on('text', async (ctx) => {
            strMessage.set(ctx)
            const currRisk = Number(ctx.message.text)

            if (currRisk && currRisk > 0) {
                ctx.scene.state.risk = currRisk;

                strMessage.set(ctx, 'Ризик відредаговано')
                await strMessage.clear(ctx)
                ctx.scene.leave()
            } else {
                strMessage.set(ctx, 'Потрібно ввести кількість RR')
                ctx.scene.reenter()
            }
        })

        risk.on('callback_query', alowCallbackQueryScene)

        return risk
    }
}

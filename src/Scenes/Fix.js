import { WizardScene } from 'telegraf/scenes'
import strMessage from '../ClearMessage.js'
import alowCallbackQueryScene from '../methods/alowCallbackQueryScene.js'

import buttons from '../message/options.js'

const FixStart = async (ctx) => {
    await alowCallbackQueryScene(ctx, async () => {
        strMessage.set(ctx)
        strMessage.set(ctx, 'Введіть % зафіксованої позиції', { reply_to_message_id: ctx.scene.state.messageId })

        await ctx.wizard.next()
    })
}

const FixPercent = async (ctx) => {
    await strMessage.set(ctx)
    const currPercentFix = Number(ctx.message?.text)

    if (currPercentFix && currPercentFix > 0 && currPercentFix <= 100) {
        ctx.scene.state.percent = currPercentFix;
        strMessage.set(ctx, 'Введіть кількість RR')
        return await ctx.wizard.next()
    } else {
        strMessage.set(ctx, 'Потрібно ввести процент фіксації від 0 до 100')
        return await ctx.wizard.back()
    }
}

const FixRR = async (ctx) => {
    await strMessage.set(ctx)

    const currRR = Number(ctx.message?.text)

    if (currRR && currRR > 0) {
        ctx.scene.state.rr = currRR;

        await strMessage.clear(ctx)
        strMessage.set(ctx, 'Фіксасія збережена')
        return await ctx.scene.leave()
    } else {
        strMessage.set(ctx, 'Потрібно ввести кількість RR')
        return await ctx.wizard.back()
    }
}

export default class FixGenerator {
    init () {
        const percent = new WizardScene('fix', FixStart, FixPercent, FixRR)
        percent.on('callback_query', FixStart)

        return percent
    }
}

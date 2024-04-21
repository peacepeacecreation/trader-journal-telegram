import { BaseScene } from 'telegraf/scenes'
import strMessage from './ClearMessage.js'
import Auth from './Auth/index.js'

export default class ConnectDBGenerator {
    GenSecretKey () {
        const secretKey = new BaseScene('create-secret-key')
        secretKey.enter(async ctx => {
            strMessage.set(ctx)
            strMessage.set(ctx, 'Для реєстрації створіть secret key з [notion](https://www.notion.so/my-integrations) або надішліть існуючий', { parse_mode: 'Markdown' })
        })

        secretKey.on('text', async ctx => {
            strMessage.set(ctx)

            const value = ctx.message.text
            const { valid, errMessage } = await Auth.createSecretKey(ctx, value)

            if (valid) {
                await strMessage.set(ctx, `${ctx.message.from.first_name}, Secret Key збережено.`)
                const { messages } = ctx.scene.state

                await ctx.scene.leave()
                ctx.scene.enter('create-trader-journal', { messages })
            } else {
                strMessage.set(ctx, errMessage)
                //return ctx.wizard.back()
            }
        })

        return secretKey
    }
    GenTraderJournal() {
        const traderJournal = new BaseScene('create-trader-journal')
        traderJournal.enter(async ctx => {
            if (!ctx.scene.state.messages)
                strMessage.set(ctx)

            strMessage.set(ctx, 'Надішліть DB ID')
        })

        traderJournal.on('text', async ctx => {
            strMessage.set(ctx)

            const value = ctx.message.text
            const { valid, errMessage } = await Auth.createTraderJournal(ctx, value)

            if (valid) {
                await strMessage.set(ctx, `Вітаю. Ви успішно зєднались з базою даних ноушен. Спробуйте внести першу свою позицію та вдалого користування.`)
                ctx.scene.leave(await strMessage.clear(ctx))
            } else {
                await strMessage.set(ctx, errMessage)
                ctx.scene.reenter()
            }
        })

        return traderJournal
    }
}




//percent.on('message', ctx => ctx.reply('Потрібно ввести процент фіксації від 0 до 100'))

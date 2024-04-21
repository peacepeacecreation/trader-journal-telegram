import { message } from 'telegraf/filters'
import position from './position.js'
import callbackQuery from './callbackQuery.js'

function init(bot) {
    bot.on('callback_query', async (ctx) => {
        //ctx.answerCallbackQuery()

        await callbackQuery(ctx)
    })

    bot.on(message('photo'), async (ctx) => {
        await position.init(ctx)
    })


    bot.on(message('text'), async (ctx) => {
        console.log(ctx)
        if (ctx.wizard) {
            console.log(ctx.wizard)
        }
        // console.log('message text')
        // ctx.reply('text')
    })
}

export default { init }

import { message } from 'telegraf/filters'
import position from './position.js'
import callbackQuery from './callbackQuery.js'

function init(bot) {

    bot.command('edit_existing_pair', async (ctx) => {
        ctx.scene.enter('editExistingPair', ctx.state)
    })

    bot.command('add_new_pair', async (ctx) => {
        ctx.scene.enter('addNewPair', ctx.state)
    })

    bot.command('remove_pair', async (ctx) => {
        ctx.scene.enter('removePair', ctx.state)
    })

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

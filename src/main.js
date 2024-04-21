import { Telegraf, session, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
//import SceneGenerator from './Scenes.js'
import { Stage } from 'telegraf/scenes'
import App from './app.js'

import ConnectDBGenerator from './ConnectDatabase.js'
import FixGenerator from './Scenes/Fix.js'
import RiskGenerator from './Scenes/Risk.js'
import RRGenerator from './Scenes/RR.js'

import Auth from './Auth/index.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'), {
    handlerTimeout: Infinity,
})

const connectDB = new ConnectDBGenerator()
const fixScene = new FixGenerator()
const riskScene = new RiskGenerator()
const rrScene = new RRGenerator()

const stage = new Stage([
    connectDB.GenSecretKey(),
    connectDB.GenTraderJournal(),
    fixScene.init(),
    riskScene.init(),
    rrScene.init()
])

bot.use(session())
bot.use(stage.middleware())

bot.use(async (ctx, next) => {
    const state = await Auth.hasSigned(ctx)
    if (state.traderJournalId) {
        ctx.state = state
        await next()
    }
})

App.init(bot)

// bot.command('scenes', async (ctx) => {
//     ctx.scene.enter('fix')
// })


// bot.on(message('text'), async (ctx) => {
//     //ctx.reply(`trader journal id: ${ctx.state.traderJournalId}\nsecret key: ${ctx.state.secretKey}`)
// })

// bot.on(message('photo'), async (ctx))

bot.launch()

import { BaseScene } from 'telegraf/scenes'

export default class SceneGenerator {
    GenAgeScene () {
        const age = new BaseScene('age')
        age.enter(async ctx => {
            await ctx.reply('Get scene')
        })

        age.on('text', async (ctx) => {
            const currAge = Number(ctx.message.text)
            if (currAge && currAge > 0) {
                await ctx.reply('Thanks')
                ctx.scene.leave()
                ctx.scene.enter('name')
            } else {
                await ctx.reply('Not thanks')
                ctx.scene.reenter()
            }
        })

        age.on('message', ctx => ctx.reply('Давай лучше возраст'))
        return age
    }

    GenNameScene() {
        const name = new BaseScene('name')
        name.enter((ctx) => ctx.reply('Now you scene Name'))
        name.on('text', async ctx => {
            const name = ctx.message.text
            if (name) {
                await ctx.reply(`Hi ${name}`)
                await ctx.scene.leave()
            } else {
                await ctx.reply('Я так и не понял')
            }
        })


        name.on('message', ctx => ctx.reply('This is not имя'))
        return name
    }
}

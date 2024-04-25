import { BaseScene } from 'telegraf/scenes'
import mRisk from './risk/index.js'
import alowCallbackQueryScene from '../methods/alowCallbackQueryScene.js'

export default class RRGenerator {
    init () {
        const risk = new BaseScene('editRisk')

        risk.enter(mRisk.enter)
        risk.on('text', mRisk.text)
        risk.on('callback_query', mRisk.callbackQuery)

        return risk
    }
}

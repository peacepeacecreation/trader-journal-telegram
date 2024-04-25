import { BaseScene } from 'telegraf/scenes'
import mRR from './rr/index.js'

export default class RRGenerator {
    init () {
        const rr = new BaseScene('editRR')

        rr.enter(mRR.enter)
        rr.on('text', mRR.text)
        rr.on('callback_query', mRR.callbackQuery)

        return rr
    }
}

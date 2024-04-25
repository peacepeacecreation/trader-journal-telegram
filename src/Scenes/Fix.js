import { WizardScene } from 'telegraf/scenes'
import mFix from './fix/index.js'

import buttons from '../message/options.js'


export default class FixGenerator {
    init () {
        const fix = new WizardScene('fix', mFix.init, mFix.percent, mFix.rr)
        fix.on('callback_query', mFix.init)

        return fix
    }
}

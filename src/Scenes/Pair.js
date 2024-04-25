import { BaseScene } from 'telegraf/scenes'
import alowCallbackQueryScene from '../methods/alowCallbackQueryScene.js'
import mPair from './pair/index.js'

export default class PairGenerator {
    init() {
        const pair = new BaseScene('editPair')

        pair.enter(mPair.enter)
        pair.on('callback_query', mPair.callbackQuery)

        return pair
    }

    addNewPair() {
        const newPair = new BaseScene('addNewPair')

        newPair.enter(mPair.enterAddNewPair)
        newPair.on('text', mPair.textAddNewPair)
        newPair.on('callback_query', alowCallbackQueryScene)

        return newPair
    }

    editExistingPair() {
        const editPair = new BaseScene('editExistingPair')

        editPair.enter(mPair.enterEditExistingPair)
        editPair.on('text', mPair.textEditExistingPair)
        editPair.on('callback_query', mPair.callbackQueryEditExistingPair)

        return editPair
    }

    removePair() {
        const removePair = new BaseScene('removePair')

        removePair.enter(mPair.enterRemovePair)
        removePair.on('callback_query', mPair.callbackQueryRemovePair)

        return removePair
    }
}

import { WizardScene, BaseScene } from 'telegraf/scenes'
import mPosition from './position/index.js'


export default class PositionGenerator {
    create() {
        const createPosition = new WizardScene(
            'createPosition',
            mPosition.initCreatePosition,
            mPosition.pairCreatePosition,
            mPosition.positionCreatePosition,
        )

        return createPosition
    }

    remove() {
        const removePosition = new BaseScene('removePosition')

        removePosition.enter(mPosition.enterRemovePosition)
        removePosition.on('callback_query', mPosition.callbackQueryRemovePosition)

        return removePosition
    }
}
